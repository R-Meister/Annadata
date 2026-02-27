"""Harvest Shakti - Harvest timing optimization and yield estimation service."""

from contextlib import asynccontextmanager
from datetime import datetime, timezone

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.shared.auth.router import router as auth_router
from services.shared.db.session import close_db, init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize and cleanup resources."""
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Harvest Shakti",
    description="Harvest timing optimization and yield estimation",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth", tags=["auth"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "service": "harvest_shakti",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "Harvest Shakti",
        "version": "1.0.0",
        "features": [
            "Optimal harvest window prediction",
            "Yield estimation using remote sensing",
            "Post-harvest loss risk assessment",
            "Market-aware harvest scheduling",
        ],
    }


@app.get("/yield-estimate/{plot_id}")
async def estimate_yield(plot_id: str):
    """Estimate crop yield for a given plot."""
    return {
        "plot_id": plot_id,
        "crop": "wheat",
        "variety": "HD-3226",
        "area_hectares": 3.2,
        "estimated_yield_tonnes": 14.08,
        "yield_per_hectare_tonnes": 4.4,
        "confidence_interval": {"low": 12.8, "high": 15.4},
        "factors": {
            "weather_impact": "favorable",
            "soil_health_score": 72,
            "pest_pressure": "low",
        },
        "estimated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/harvest-window/{plot_id}")
async def get_harvest_window(plot_id: str):
    """Get the optimal harvest window for a plot."""
    return {
        "plot_id": plot_id,
        "crop": "wheat",
        "current_stage": "grain_filling",
        "days_to_maturity": 12,
        "optimal_harvest_window": {
            "start": "2026-03-11",
            "end": "2026-03-18",
            "best_date": "2026-03-14",
        },
        "weather_risk": {
            "rain_probability_pct": 15,
            "heatwave_risk": "low",
        },
        "recommendation": "Plan harvest around March 14. Arrange labor and machinery by March 10.",
    }


@app.get("/market-timing")
async def get_market_timing():
    """Get market-aware harvest and sell timing recommendations."""
    return {
        "crop": "wheat",
        "current_msp_per_quintal": 2275,
        "current_market_price_per_quintal": 2450,
        "price_trend": "rising",
        "recommendation": "sell",
        "nearby_mandis": [
            {"name": "Karnal Mandi", "price_per_quintal": 2480, "distance_km": 15},
            {"name": "Panipat Mandi", "price_per_quintal": 2430, "distance_km": 32},
        ],
        "storage_advisory": "Prices expected to peak in mid-March. Consider storing if harvest is early.",
    }


if __name__ == "__main__":
    uvicorn.run(
        "services.harvest_shakti.app:app", host="0.0.0.0", port=8005, reload=True
    )
