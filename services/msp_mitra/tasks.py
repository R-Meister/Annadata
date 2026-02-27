"""
MSP Mitra — Celery background tasks.

These tasks are auto-discovered by the shared Celery app
(see services.shared.celery_app.app) and can be triggered
from any service or from the API layer.
"""

import logging
from typing import Any, Dict, Optional

from services.shared.celery_app.app import celery_app

logger = logging.getLogger("services.msp_mitra.tasks")


@celery_app.task(
    name="msp_mitra.train_price_model",
    bind=True,
    max_retries=2,
    default_retry_delay=30,
    acks_late=True,
)
def train_price_model(
    self,
    commodity: str,
    state: str,
    market: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Train (or retrain) the ensemble price-prediction model in the background.

    This is the async counterpart to the synchronous ``POST /train`` endpoint.
    Useful for scheduled retraining or bulk model refresh jobs where you do
    not want to block an HTTP request.

    Parameters
    ----------
    commodity : str
        Commodity name, e.g. "Wheat".
    state : str
        State name, e.g. "Punjab".
    market : str | None
        Specific market name, or None for all markets in the state.

    Returns
    -------
    dict
        Training result summary including status, data_points used, etc.
    """
    import sys
    from pathlib import Path

    # Ensure the legacy backend is importable
    backend_dir = str(
        Path(__file__).resolve().parent.parent.parent / "msp_mitra" / "backend"
    )
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    from data_loader import get_price_loader
    from price_predictor_enhanced import get_enhanced_predictor

    logger.info(
        "Task train_price_model: commodity=%s state=%s market=%s",
        commodity,
        state,
        market,
    )

    try:
        price_loader = get_price_loader()
        predictor = get_enhanced_predictor()

        df = price_loader.get_price_for_prediction(commodity, state, market)

        if df.empty:
            return {
                "status": "error",
                "detail": f"No data found for {commodity} in {state}",
            }

        if len(df) < 30:
            return {
                "status": "error",
                "detail": f"Insufficient data. Need >=30 records, got {len(df)}",
            }

        success = predictor.train(df, commodity, state, market)

        if not success:
            raise RuntimeError("predictor.train() returned False")

        result = {
            "status": "success",
            "commodity": commodity,
            "state": state,
            "market": market or "All markets",
            "data_points": len(df),
        }
        logger.info("Task train_price_model completed: %s", result)
        return result

    except Exception as exc:
        logger.exception("Task train_price_model failed")
        raise self.retry(exc=exc)


@celery_app.task(
    name="msp_mitra.generate_market_report",
    bind=True,
    max_retries=1,
    default_retry_delay=60,
    acks_late=True,
)
def generate_market_report(
    self,
    commodity: str,
    state: str,
    days: int = 30,
) -> Dict[str, Any]:
    """
    Generate a comprehensive market report in the background.

    Combines volatility, trends, seasonal patterns, and AI-generated
    insights into a single report payload.  Results are stored in the
    Celery result backend (Redis) and can be polled by the caller.

    Parameters
    ----------
    commodity : str
        Commodity name.
    state : str
        State name.
    days : int
        Look-back window in days (default 30).

    Returns
    -------
    dict
        Full market report with analytics and insights.
    """
    import sys
    from pathlib import Path

    backend_dir = str(
        Path(__file__).resolve().parent.parent.parent / "msp_mitra" / "backend"
    )
    if backend_dir not in sys.path:
        sys.path.insert(0, backend_dir)

    from market_analytics import get_analytics_engine
    from insights_engine import get_insights_engine

    logger.info(
        "Task generate_market_report: commodity=%s state=%s days=%d",
        commodity,
        state,
        days,
    )

    try:
        analytics_engine = get_analytics_engine()
        insights_engine = get_insights_engine()

        market_data = analytics_engine.get_market_insights(commodity, state, days)
        insight_texts = insights_engine.generate_comprehensive_insights(
            commodity, state, market_data
        )

        report = {
            "status": "success",
            "commodity": commodity,
            "state": state,
            "days_analyzed": days,
            "insights": insight_texts,
            "market_health": market_data.get("market_health"),
            "volatility": market_data.get("volatility"),
            "trends": market_data.get("trends"),
            "seasonal_patterns": market_data.get("seasonal_patterns"),
            "anomalies": market_data.get("anomalies", [])[:5],
            "top_markets": market_data.get("market_comparison", [])[:5],
        }
        logger.info(
            "Task generate_market_report completed for %s / %s", commodity, state
        )
        return report

    except Exception as exc:
        logger.exception("Task generate_market_report failed")
        raise self.retry(exc=exc)
