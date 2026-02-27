"""
MSP Mitra Service — Price Intelligence API.

Wraps the existing msp_mitra/backend modules with the shared
Annadata OS architecture: async SQLAlchemy, JWT auth, Celery tasks.
"""

import math
import sys
from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, List, Optional

import logging
import numpy as np

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

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


class NearestMandiRequest(BaseModel):
    commodity: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    top_n: int = Field(5, ge=1, le=20)


class PriceAlertRequest(BaseModel):
    commodity: str
    state: str
    target_price: float = Field(..., gt=0, description="Target price in ₹/quintal")
    direction: str = Field("above", pattern="^(above|below)$")


class YieldMarketRequest(BaseModel):
    commodity: str
    state: str
    expected_yield_tonnes: float = Field(..., gt=0)
    area_hectares: float = Field(..., gt=0)
    days_to_harvest: int = Field(..., ge=0, le=365)


# ---------------------------------------------------------------------------
# Mandi database for nearest-mandi + route optimisation
# ---------------------------------------------------------------------------
MANDI_DATABASE: list[dict] = [
    {
        "name": "Azadpur Mandi",
        "state": "Delhi",
        "lat": 28.6980,
        "lon": 77.1810,
        "type": "wholesale",
    },
    {
        "name": "Vashi APMC",
        "state": "Maharashtra",
        "lat": 19.0654,
        "lon": 73.0049,
        "type": "wholesale",
    },
    {
        "name": "Ludhiana Grain Market",
        "state": "Punjab",
        "lat": 30.9010,
        "lon": 75.8573,
        "type": "wholesale",
    },
    {
        "name": "Yeshwanthpur APMC",
        "state": "Karnataka",
        "lat": 13.0220,
        "lon": 77.5430,
        "type": "wholesale",
    },
    {
        "name": "Koyambedu Market",
        "state": "Tamil Nadu",
        "lat": 13.0694,
        "lon": 80.1948,
        "type": "wholesale",
    },
    {
        "name": "Bowenpally Market",
        "state": "Telangana",
        "lat": 17.4660,
        "lon": 78.4700,
        "type": "wholesale",
    },
    {
        "name": "Ghazipur Mandi",
        "state": "Delhi",
        "lat": 28.6220,
        "lon": 77.3210,
        "type": "wholesale",
    },
    {
        "name": "Devi Ahilya Bai Holkar Mandi",
        "state": "Madhya Pradesh",
        "lat": 22.7196,
        "lon": 75.8577,
        "type": "wholesale",
    },
    {
        "name": "Jaipur Mandi",
        "state": "Rajasthan",
        "lat": 26.9124,
        "lon": 75.7873,
        "type": "wholesale",
    },
    {
        "name": "Lasalgaon APMC",
        "state": "Maharashtra",
        "lat": 20.1444,
        "lon": 74.2283,
        "type": "wholesale",
    },
    {
        "name": "Chandigarh Grain Market",
        "state": "Chandigarh",
        "lat": 30.7333,
        "lon": 76.7794,
        "type": "wholesale",
    },
    {
        "name": "Kolkata Koley Market",
        "state": "West Bengal",
        "lat": 22.5726,
        "lon": 88.3639,
        "type": "wholesale",
    },
    {
        "name": "Patna Kankarbagh Mandi",
        "state": "Bihar",
        "lat": 25.5941,
        "lon": 85.1376,
        "type": "wholesale",
    },
    {
        "name": "Lucknow Mandi Parishad",
        "state": "Uttar Pradesh",
        "lat": 26.8467,
        "lon": 80.9462,
        "type": "wholesale",
    },
    {
        "name": "Ahmedabad APMC",
        "state": "Gujarat",
        "lat": 23.0225,
        "lon": 72.5714,
        "type": "wholesale",
    },
    {
        "name": "Bhopal Mandi",
        "state": "Madhya Pradesh",
        "lat": 23.2599,
        "lon": 77.4126,
        "type": "wholesale",
    },
    {
        "name": "Hubli APMC",
        "state": "Karnataka",
        "lat": 15.3647,
        "lon": 75.1240,
        "type": "wholesale",
    },
    {
        "name": "Nagpur APMC",
        "state": "Maharashtra",
        "lat": 21.1458,
        "lon": 79.0882,
        "type": "wholesale",
    },
    {
        "name": "Amritsar Mandi",
        "state": "Punjab",
        "lat": 31.6340,
        "lon": 74.8723,
        "type": "wholesale",
    },
    {
        "name": "Siliguri Mandi",
        "state": "West Bengal",
        "lat": 26.7271,
        "lon": 88.3953,
        "type": "wholesale",
    },
]

# In-memory alert store
_price_alerts: list[dict] = []


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
# Nearest Mandis with Route Optimisation
# ============================================================


def _haversine(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km between two lat/lon points."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def _nearest_neighbor_route(
    start: tuple[float, float], mandis: list[dict]
) -> list[dict]:
    """Nearest-neighbour TSP for multi-mandi route optimisation."""
    remaining = list(mandis)
    route: list[dict] = []
    current = start
    total_km = 0.0

    while remaining:
        nearest = min(
            remaining,
            key=lambda m: _haversine(current[0], current[1], m["lat"], m["lon"]),
        )
        dist = _haversine(current[0], current[1], nearest["lat"], nearest["lon"])
        total_km += dist
        route.append({**nearest, "leg_distance_km": round(dist, 1)})
        current = (nearest["lat"], nearest["lon"])
        remaining.remove(nearest)

    # Return leg back to start
    return_dist = _haversine(current[0], current[1], start[0], start[1])
    return route


@app.post("/nearest-mandis", tags=["mandis"])
async def find_nearest_mandis(req: NearestMandiRequest):
    """Find nearest mandis with best prices and route optimisation.

    Returns top N mandis sorted by distance, with simulated current
    prices and a TSP-optimised route for visiting multiple mandis.
    """
    if not price_loader:
        raise HTTPException(status_code=503, detail="Data not loaded")

    rng = np.random.default_rng(seed=hash(req.commodity) & 0xFFFFFFFF)

    # Calculate distance for each mandi
    mandi_results = []
    for mandi in MANDI_DATABASE:
        dist = _haversine(req.latitude, req.longitude, mandi["lat"], mandi["lon"])
        # Simulated current price based on commodity + distance factor
        base_price = float(rng.uniform(1500, 4500))
        # Closer mandis may have slightly lower prices due to lower transport
        price_per_quintal = round(base_price * (1.0 + dist * 0.0003), 2)
        mandi_results.append(
            {
                "name": mandi["name"],
                "state": mandi["state"],
                "lat": mandi["lat"],
                "lon": mandi["lon"],
                "type": mandi["type"],
                "distance_km": round(dist, 1),
                "current_price_per_quintal": price_per_quintal,
                "transport_cost_estimate": round(dist * 2.5, 2),  # ₹2.5/km estimate
            }
        )

    # Sort by distance, take top N
    mandi_results.sort(key=lambda m: m["distance_km"])
    top_mandis = mandi_results[: req.top_n]

    # Best price among top mandis
    best_price_mandi = max(top_mandis, key=lambda m: m["current_price_per_quintal"])

    # Route optimisation: TSP across selected mandis
    route = _nearest_neighbor_route(
        (req.latitude, req.longitude),
        [{"lat": m["lat"], "lon": m["lon"], "name": m["name"]} for m in top_mandis],
    )
    total_route_km = sum(leg["leg_distance_km"] for leg in route)

    return {
        "commodity": req.commodity,
        "farmer_location": {"lat": req.latitude, "lon": req.longitude},
        "nearest_mandis": top_mandis,
        "best_price_mandi": {
            "name": best_price_mandi["name"],
            "price_per_quintal": best_price_mandi["current_price_per_quintal"],
            "distance_km": best_price_mandi["distance_km"],
        },
        "optimized_route": {
            "legs": route,
            "total_distance_km": round(total_route_km, 1),
            "estimated_fuel_cost": round(total_route_km * 8.0, 2),  # ₹8/km
            "estimated_time_hours": round(total_route_km / 35.0, 1),  # 35 km/h avg
        },
        "count": len(top_mandis),
    }


# ============================================================
# Price Alerts
# ============================================================


@app.post("/alerts/create", tags=["alerts"])
async def create_price_alert(req: PriceAlertRequest):
    """Create a price alert — notifies when price crosses target.

    In production this would push via SMS/WhatsApp. Here we store
    the alert and evaluate it against current predictions.
    """
    alert_id = f"alert-{len(_price_alerts) + 1:04d}"
    now = datetime.utcnow()

    # Check current price & prediction to see if alert is already triggered
    triggered = False
    trigger_message = ""

    if predictor and price_loader:
        result = predictor.predict(req.commodity, req.state, None, days=7)
        if result is None:
            df = price_loader.get_price_for_prediction(req.commodity, req.state, None)
            if not df.empty and len(df) >= 30:
                predictor.train(df, req.commodity, req.state, None)
                result = predictor.predict(req.commodity, req.state, None, days=7)

        if result and result.get("predictions"):
            preds = result["predictions"]
            for p in preds:
                pred_price = p.get("predicted_price", p.get("price", 0))
                if req.direction == "above" and pred_price >= req.target_price:
                    triggered = True
                    trigger_message = (
                        f"Price predicted to reach ₹{pred_price:.0f}/q on {p.get('date', 'soon')}. "
                        f"Wait {preds.index(p) + 1} day(s) — predicted rise to ₹{pred_price:.0f}/q"
                    )
                    break
                elif req.direction == "below" and pred_price <= req.target_price:
                    triggered = True
                    trigger_message = (
                        f"Price predicted to drop to ₹{pred_price:.0f}/q on {p.get('date', 'soon')}. "
                        f"Consider selling now before the drop."
                    )
                    break

    alert = {
        "alert_id": alert_id,
        "commodity": req.commodity,
        "state": req.state,
        "target_price": req.target_price,
        "direction": req.direction,
        "created_at": now.isoformat(),
        "status": "triggered" if triggered else "active",
        "trigger_message": trigger_message
        if triggered
        else f"Monitoring {req.commodity} prices in {req.state}",
    }
    _price_alerts.append(alert)

    return alert


@app.get("/alerts", tags=["alerts"])
async def list_price_alerts(
    commodity: Optional[str] = Query(None),
    state: Optional[str] = Query(None),
):
    """List all price alerts, optionally filtered."""
    filtered = _price_alerts
    if commodity:
        filtered = [a for a in filtered if a["commodity"].lower() == commodity.lower()]
    if state:
        filtered = [a for a in filtered if a["state"].lower() == state.lower()]
    return {"alerts": filtered, "count": len(filtered)}


# ============================================================
# Combined Yield + Market Prediction
# ============================================================


@app.post("/predict/yield-market", tags=["prediction"])
async def predict_yield_market(req: YieldMarketRequest):
    """Combined yield prediction with market prediction.

    "Your crop will be ready in 20 days. Predicted price at that time:
    ₹2,400/quintal. Expected revenue: ₹X."
    """
    if not predictor or not price_loader:
        raise HTTPException(status_code=503, detail="Services not loaded")

    # Get price prediction for the harvest date
    forecast_days = min(max(req.days_to_harvest, 1), 14)
    result = predictor.predict(req.commodity, req.state, None, days=forecast_days)

    if result is None:
        df = price_loader.get_price_for_prediction(req.commodity, req.state, None)
        if not df.empty and len(df) >= 30:
            predictor.train(df, req.commodity, req.state, None)
            result = predictor.predict(
                req.commodity, req.state, None, days=forecast_days
            )

    if result is None or not result.get("predictions"):
        raise HTTPException(
            status_code=404,
            detail=f"Cannot generate combined prediction for {req.commodity} in {req.state}",
        )

    predictions = result["predictions"]

    # Price at harvest time
    harvest_prediction = predictions[-1] if predictions else predictions[0]
    harvest_price = harvest_prediction.get(
        "predicted_price", harvest_prediction.get("price", 0)
    )

    # Current price (first prediction or today)
    current_price = predictions[0].get(
        "predicted_price", predictions[0].get("price", 0)
    )

    # Revenue calculations
    yield_quintals = req.expected_yield_tonnes * 10.0  # 1 tonne = 10 quintals
    revenue_at_harvest = yield_quintals * harvest_price
    revenue_if_sold_now = yield_quintals * current_price
    revenue_difference = revenue_at_harvest - revenue_if_sold_now

    # Price trend
    price_change_pct = (
        ((harvest_price - current_price) / current_price * 100)
        if current_price > 0
        else 0
    )

    # Recommendation
    harvest_date = (datetime.utcnow() + timedelta(days=req.days_to_harvest)).strftime(
        "%Y-%m-%d"
    )
    if price_change_pct > 3:
        advice = (
            f"Wait {req.days_to_harvest} days. {req.commodity.title()} price predicted to rise "
            f"{price_change_pct:.1f}% in {req.state}. Expected revenue: ₹{revenue_at_harvest:,.0f}"
        )
        action = "HOLD"
    elif price_change_pct < -3:
        advice = (
            f"Consider selling soon. {req.commodity.title()} price predicted to drop "
            f"{abs(price_change_pct):.1f}% by harvest time. "
            f"Selling now: ₹{revenue_if_sold_now:,.0f} vs at harvest: ₹{revenue_at_harvest:,.0f}"
        )
        action = "SELL_NOW"
    else:
        advice = (
            f"Your crop will be ready in {req.days_to_harvest} days. "
            f"Predicted price at that time: ₹{harvest_price:,.0f}/quintal. "
            f"Expected revenue: ₹{revenue_at_harvest:,.0f}"
        )
        action = "SELL_AT_HARVEST"

    return {
        "commodity": req.commodity,
        "state": req.state,
        "yield_summary": {
            "expected_yield_tonnes": req.expected_yield_tonnes,
            "expected_yield_quintals": yield_quintals,
            "area_hectares": req.area_hectares,
            "yield_per_hectare_tonnes": round(
                req.expected_yield_tonnes / req.area_hectares, 2
            ),
        },
        "market_summary": {
            "current_price_per_quintal": current_price,
            "predicted_harvest_price_per_quintal": harvest_price,
            "price_change_pct": round(price_change_pct, 2),
            "harvest_date": harvest_date,
            "days_to_harvest": req.days_to_harvest,
        },
        "revenue_projection": {
            "revenue_if_sold_now": round(revenue_if_sold_now, 2),
            "revenue_at_harvest": round(revenue_at_harvest, 2),
            "revenue_difference": round(revenue_difference, 2),
        },
        "recommendation": {
            "action": action,
            "advice": advice,
        },
        "price_forecast": predictions[:7],
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
