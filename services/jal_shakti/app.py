"""Jal Shakti - Smart irrigation and water resource management service."""

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
    title="Jal Shakti",
    description="Smart irrigation and water resource management",
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
        "service": "jal_shakti",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "Jal Shakti",
        "version": "1.0.0",
        "features": [
            "AI-driven irrigation scheduling",
            "Soil moisture monitoring and forecasting",
            "Water usage analytics and optimization",
            "Weather-integrated water management",
        ],
    }


@app.get("/schedule/{plot_id}")
async def get_irrigation_schedule(plot_id: str):
    """Get the recommended irrigation schedule for a plot."""
    return {
        "plot_id": plot_id,
        "crop": "rice",
        "current_moisture_pct": 28.5,
        "optimal_moisture_pct": 40.0,
        "schedule": [
            {
                "date": "2026-02-28",
                "time": "06:00",
                "duration_minutes": 45,
                "water_volume_liters": 1200,
                "method": "drip",
            },
            {
                "date": "2026-03-02",
                "time": "06:00",
                "duration_minutes": 30,
                "water_volume_liters": 800,
                "method": "drip",
            },
        ],
        "weather_forecast": "No rain expected in next 5 days",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/usage")
async def get_water_usage():
    """Get water usage analytics for the farm."""
    return {
        "farm_id": "farm-rajasthan-042",
        "period": "2026-02",
        "total_usage_liters": 45000,
        "daily_average_liters": 1607,
        "efficiency_score": 78,
        "savings_vs_flood_irrigation_pct": 42,
        "breakdown_by_crop": [
            {"crop": "wheat", "usage_liters": 28000, "area_hectares": 2.5},
            {"crop": "mustard", "usage_liters": 17000, "area_hectares": 1.8},
        ],
    }


@app.get("/sensors/{plot_id}")
async def get_sensor_data(plot_id: str):
    """Get real-time sensor readings for a plot."""
    return {
        "plot_id": plot_id,
        "sensors": [
            {
                "sensor_id": "sm-001",
                "type": "soil_moisture",
                "value": 31.2,
                "unit": "percent",
                "status": "normal",
            },
            {
                "sensor_id": "wf-001",
                "type": "water_flow",
                "value": 2.4,
                "unit": "liters_per_minute",
                "status": "active",
            },
            {
                "sensor_id": "rg-001",
                "type": "rain_gauge",
                "value": 0.0,
                "unit": "mm",
                "status": "normal",
            },
        ],
        "last_updated": datetime.now(timezone.utc).isoformat(),
    }


if __name__ == "__main__":
    uvicorn.run("services.jal_shakti.app:app", host="0.0.0.0", port=8004, reload=True)
