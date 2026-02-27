"""
MSP Mitra Service — Price Intelligence API.

Wraps the existing msp_mitra/backend modules with the shared
Annadata OS architecture: async SQLAlchemy, JWT auth, Celery tasks.
"""

import sys
from contextlib import asynccontextmanager
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional

import logging

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from services.shared.auth.router import router as auth_router
from services.shared.config import settings
from services.shared.db.session import init_db, close_db

# ---------------------------------------------------------------------------
# Ensure the legacy backend package is importable.
# msp_mitra/backend/ uses bare imports like ``from data_loader import ...``,
# so we add that directory to sys.path once.
# ---------------------------------------------------------------------------
_BACKEND_DIR = str(
    Path(__file__).resolve().parent.parent.parent / "msp_mitra" / "backend"
)
if _BACKEND_DIR not in sys.path:
    sys.path.insert(0, _BACKEND_DIR)

from data_loader import get_price_loader  # noqa: E402
from price_predictor_enhanced import get_enhanced_predictor  # noqa: E402
from market_analytics import get_analytics_engine  # noqa: E402
from insights_engine import get_insights_engine  # noqa: E402

logger = logging.getLogger("services.msp_mitra")

# ---------------------------------------------------------------------------
# Module-level singletons (initialised during lifespan startup)
# ---------------------------------------------------------------------------
price_loader = None
predictor = None
analytics = None
insights = None


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern FastAPI lifespan context manager."""
    global price_loader, predictor, analytics, insights

    # --- startup ---
    logger.info("MSP Mitra: initialising database...")
    await init_db()

    logger.info("MSP Mitra: loading data & ML engines...")
    price_loader = get_price_loader()
    predictor = get_enhanced_predictor()
    analytics = get_analytics_engine()
    insights = get_insights_engine()
    logger.info("MSP Mitra: ready.")

    yield

    # --- shutdown ---
    logger.info("MSP Mitra: shutting down database...")
    await close_db()


# ---------------------------------------------------------------------------
# Application
# ---------------------------------------------------------------------------

app = FastAPI(
    title="MSP Mitra — Price Intelligence API",
    description="Advanced Agricultural Price Analytics & Predictions for Indian Farmers",
    version="2.0.0",
    lifespan=lifespan,
)

# CORS — permissive for dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount shared auth router (/auth/register, /auth/login, /auth/me)
app.include_router(auth_router)


# ============================================================
# Request / Response Schemas
# ============================================================


class TrainRequest(BaseModel):
    commodity: str
    state: str
    market: Optional[str] = None


# ============================================================
# Health
# ============================================================


@app.get("/health", tags=["system"])
async def health():
    """Liveness / readiness probe."""
    return {
        "service": "msp_mitra",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "data_loaded": price_loader is not None
        and getattr(price_loader, "df", None) is not None,
        "records_count": len(price_loader.df)
        if price_loader and getattr(price_loader, "df", None) is not None
        else 0,
        "components": {
            "price_loader": price_loader is not None,
            "predictor": predictor is not None,
            "analytics": analytics is not None,
            "insights": insights is not None,
        },
    }


# ============================================================
# Core Endpoints
# ============================================================


@app.get("/", tags=["system"])
async def root():
    """API information."""
    return {
        "service": "MSP Mitra — Price Intelligence System",
        "version": "2.0.0",
        "status": "running",
        "features": [
            "Historical Price Data (1.1M+ records)",
            "Multi-Model Price Predictions",
            "Market Analytics & Insights",
            "Volatility Detection",
            "Trend Analysis",
            "Seasonal Pattern Recognition",
            "Smart Sell Recommendations",
        ],
    }


@app.get("/commodities", tags=["prices"])
async def get_commodities():
    """List all available commodities."""
    if not price_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")

    commodities = price_loader.get_commodities_list()
    return {
        "commodities": commodities,
        "count": len(commodities),
        "sample": commodities[:10] if len(commodities) > 10 else commodities,
    }


@app.get("/states", tags=["prices"])
async def get_states():
    """List all states."""
    if not price_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")

    return {
        "states": price_loader.get_states_list(),
        "count": len(price_loader.states),
    }


@app.get("/markets/{state}", tags=["prices"])
async def get_markets(state: str):
    """List markets in a state."""
    if not price_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")

    markets = price_loader.get_markets_by_state(state)
    if not markets:
        raise HTTPException(
            status_code=404, detail=f"No markets found for state: {state}"
        )

    return {"state": state, "markets": markets, "count": len(markets)}


@app.get("/prices/{commodity}/{state}", tags=["prices"])
async def get_prices(
    commodity: str,
    state: str,
    limit: int = Query(20, ge=1, le=100),
):
    """Latest prices for a commodity in a state."""
    if not price_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")

    prices = price_loader.get_latest_prices(commodity, state, limit)
    if not prices:
        raise HTTPException(
            status_code=404, detail=f"No prices found for {commodity} in {state}"
        )

    all_prices = [p["modal_price"] for p in prices]
    avg_price = sum(all_prices) / len(all_prices)

    return {
        "commodity": commodity,
        "state": state,
        "prices": prices,
        "stats": {
            "average_price": round(avg_price, 2),
            "min_price": min(all_prices),
            "max_price": max(all_prices),
            "markets_count": len(prices),
        },
    }


@app.get("/prices/history/{commodity}", tags=["prices"])
async def get_price_history(
    commodity: str,
    state: Optional[str] = Query(None),
    days: int = Query(90, ge=7, le=365),
):
    """Historical prices for charting."""
    if not price_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")

    df = price_loader.get_price_for_prediction(commodity, state or "", None)
    if df.empty:
        raise HTTPException(
            status_code=404, detail=f"No historical data found for {commodity}"
        )

    df = df.tail(days)
    history = [
        {"date": row["ds"].strftime("%Y-%m-%d"), "price": round(row["y"], 2)}
        for _, row in df.iterrows()
    ]

    return {
        "commodity": commodity,
        "state": state,
        "history": history,
        "days": len(history),
    }


# ============================================================
# Training & Prediction
# ============================================================


@app.post("/train", tags=["prediction"])
async def train_model(request: TrainRequest):
    """Train price prediction models."""
    if not price_loader or not predictor:
        raise HTTPException(status_code=503, detail="Services not loaded")

    df = price_loader.get_price_for_prediction(
        request.commodity, request.state, request.market
    )
    if df.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No data found for {request.commodity} in {request.state}",
        )
    if len(df) < 30:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient data. Need >=30 records, got {len(df)}",
        )

    success = predictor.train(df, request.commodity, request.state, request.market)
    if not success:
        raise HTTPException(status_code=500, detail="Model training failed")

    return {
        "status": "success",
        "message": f"Ensemble models trained for {request.commodity} in {request.state}",
        "data_points": len(df),
        "market": request.market or "All markets",
    }


@app.get("/predict/{commodity}/{state}", tags=["prediction"])
async def predict_prices(
    commodity: str,
    state: str,
    market: Optional[str] = Query(None),
    days: int = Query(7, ge=1, le=14),
):
    """Price predictions using multi-model ensemble."""
    if not predictor:
        raise HTTPException(status_code=503, detail="Predictor not loaded")

    result = predictor.predict(commodity, state, market, days)

    if result is None:
        # Auto-train on first request
        df = price_loader.get_price_for_prediction(commodity, state, market)
        if not df.empty and len(df) >= 30:
            predictor.train(df, commodity, state, market)
            result = predictor.predict(commodity, state, market, days)

    if result is None:
        raise HTTPException(
            status_code=404,
            detail=f"No model for {commodity} in {state}. Train first via POST /train",
        )

    return result


@app.get("/recommend/{commodity}/{state}", tags=["prediction"])
async def get_recommendation(
    commodity: str,
    state: str,
    current_price: float = Query(...),
    msp: Optional[float] = Query(None),
):
    """Smart sell recommendation."""
    if not predictor or not price_loader:
        raise HTTPException(status_code=503, detail="Services not loaded")

    result = predictor.predict(commodity, state, None, days=7)
    if result is None:
        df = price_loader.get_price_for_prediction(commodity, state, None)
        if not df.empty and len(df) >= 30:
            predictor.train(df, commodity, state, None)
            result = predictor.predict(commodity, state, None, days=7)

    if result is None or not result.get("predictions"):
        raise HTTPException(
            status_code=404,
            detail=f"Cannot generate recommendation for {commodity} in {state}",
        )

    volatility = price_loader.get_price_volatility(commodity, state, days=30)
    recommendation = predictor.get_sell_recommendation(
        current_price, result["predictions"], volatility, msp
    )

    return {
        "commodity": commodity,
        "state": state,
        "current_price": current_price,
        "msp": msp,
        **recommendation,
        "forecast": result["predictions"][:5],
    }


# ============================================================
# Analytics Endpoints
# ============================================================


@app.get("/analytics/volatility/{commodity}/{state}", tags=["analytics"])
async def get_volatility(
    commodity: str,
    state: str,
    days: int = Query(30, ge=7, le=90),
):
    """Price volatility analysis."""
    if not analytics:
        raise HTTPException(status_code=503, detail="Analytics not loaded")

    result = analytics.calculate_volatility(commodity, state, days)
    return {"commodity": commodity, "state": state, "days_analyzed": days, **result}


@app.get("/analytics/trends/{commodity}/{state}", tags=["analytics"])
async def get_trends(
    commodity: str,
    state: str,
    days: int = Query(30, ge=7, le=90),
):
    """Trend analysis."""
    if not analytics:
        raise HTTPException(status_code=503, detail="Analytics not loaded")

    result = analytics.detect_trends(commodity, state, days)
    return {"commodity": commodity, "state": state, "days_analyzed": days, **result}


@app.get("/analytics/seasonal/{commodity}", tags=["analytics"])
async def get_seasonal(
    commodity: str,
    state: Optional[str] = Query(None),
):
    """Seasonal pattern analysis."""
    if not analytics:
        raise HTTPException(status_code=503, detail="Analytics not loaded")

    result = analytics.find_seasonal_patterns(commodity, state)
    return {"commodity": commodity, "state": state, **result}


@app.get("/analytics/market-comparison/{commodity}/{state}", tags=["analytics"])
async def get_market_comparison(
    commodity: str,
    state: str,
    top_n: int = Query(5, ge=3, le=10),
):
    """Compare prices across markets."""
    if not price_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")

    result = price_loader.get_market_comparison(commodity, state, top_n)
    return {
        "commodity": commodity,
        "state": state,
        "markets": result,
        "count": len(result),
    }


@app.get("/analytics/top-performers/{state}", tags=["analytics"])
async def get_top_performers(
    state: str,
    days: int = Query(30, ge=7, le=90),
    top_n: int = Query(5, ge=3, le=10),
):
    """Best and worst performing commodities."""
    if not price_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")

    result = price_loader.get_top_performers(state, days, top_n)
    return {"state": state, "days_analyzed": days, **result}


@app.get("/analytics/insights/{commodity}/{state}", tags=["analytics"])
async def get_insights(
    commodity: str,
    state: str,
    days: int = Query(30, ge=7, le=90),
):
    """Comprehensive AI-generated market insights."""
    if not analytics or not insights:
        raise HTTPException(status_code=503, detail="Services not loaded")

    market_data = analytics.get_market_insights(commodity, state, days)
    insight_texts = insights.generate_comprehensive_insights(
        commodity, state, market_data
    )

    return {
        "commodity": commodity,
        "state": state,
        "insights": insight_texts,
        "market_health": market_data.get("market_health"),
        "detailed_analytics": {
            "volatility": market_data.get("volatility"),
            "trends": market_data.get("trends"),
            "seasonal_patterns": market_data.get("seasonal_patterns"),
            "anomalies": market_data.get("anomalies", [])[:3],
            "top_markets": market_data.get("market_comparison", [])[:3],
        },
    }


# ============================================================
# Entrypoint
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "services.msp_mitra.app:app",
        host="0.0.0.0",
        port=8001,
        reload=settings.DEBUG,
    )
