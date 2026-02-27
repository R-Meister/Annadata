"""SoilScan AI - AI-powered soil analysis service."""

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
    title="SoilScan AI",
    description="Analyzes soil health using satellite imagery and sensor data",
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
        "service": "soilscan_ai",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "SoilScan AI",
        "version": "1.0.0",
        "features": [
            "Satellite imagery-based soil analysis",
            "IoT sensor data integration",
            "Soil nutrient profiling and recommendations",
            "Historical soil health trend tracking",
        ],
    }


@app.post("/analyze")
async def analyze_soil():
    """Analyze soil sample from satellite imagery or sensor data."""
    return {
        "analysis_id": "sa-20260227-001",
        "status": "completed",
        "soil_type": "alluvial",
        "ph_level": 6.8,
        "organic_carbon_pct": 0.65,
        "nitrogen_kg_per_ha": 280.5,
        "phosphorus_kg_per_ha": 22.3,
        "potassium_kg_per_ha": 185.0,
        "moisture_pct": 32.1,
        "health_score": 72,
        "recommendations": [
            "Apply nitrogen-rich fertilizer to boost yield",
            "Consider crop rotation with legumes next season",
        ],
        "analyzed_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/report/{analysis_id}")
async def get_report(analysis_id: str):
    """Retrieve a soil analysis report by ID."""
    return {
        "analysis_id": analysis_id,
        "status": "completed",
        "report_url": f"https://storage.annadata.io/reports/{analysis_id}.pdf",
        "summary": "Soil health is moderate. Nitrogen levels are below optimal range.",
        "generated_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/history")
async def get_analysis_history():
    """Get historical soil analysis data for a plot."""
    return {
        "plot_id": "plot-maharashtra-001",
        "analyses": [
            {
                "analysis_id": "sa-20260201-001",
                "date": "2026-02-01",
                "health_score": 68,
            },
            {
                "analysis_id": "sa-20260115-001",
                "date": "2026-01-15",
                "health_score": 65,
            },
        ],
        "trend": "improving",
    }


if __name__ == "__main__":
    uvicorn.run("services.soilscan_ai.app:app", host="0.0.0.0", port=8002, reload=True)
