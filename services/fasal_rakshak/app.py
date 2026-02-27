"""Fasal Rakshak - Crop protection and disease detection service."""

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
    title="Fasal Rakshak",
    description="Crop disease detection and pest management recommendations",
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
        "service": "fasal_rakshak",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "Fasal Rakshak",
        "version": "1.0.0",
        "features": [
            "Image-based crop disease detection",
            "Pest identification and severity assessment",
            "Treatment and pesticide recommendations",
        ],
    }


@app.post("/detect")
async def detect_disease():
    """Detect crop disease from an uploaded image."""
    return {
        "detection_id": "det-20260227-001",
        "status": "completed",
        "crop": "wheat",
        "disease_detected": True,
        "disease_name": "Leaf Rust (Puccinia triticina)",
        "confidence": 0.92,
        "severity": "moderate",
        "affected_area_pct": 35.0,
        "treatment": {
            "chemical": "Propiconazole 25% EC @ 0.1%",
            "organic": "Neem oil spray at 5ml/L",
            "preventive": "Use resistant varieties like HD-3226",
        },
        "detected_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/recommendations/{crop}")
async def get_recommendations(crop: str):
    """Get pest management recommendations for a specific crop."""
    return {
        "crop": crop,
        "season": "rabi",
        "common_diseases": [
            {"name": "Leaf Rust", "risk_level": "high", "peak_month": "February"},
            {"name": "Powdery Mildew", "risk_level": "medium", "peak_month": "January"},
        ],
        "common_pests": [
            {"name": "Aphids", "risk_level": "medium"},
            {"name": "Army Worm", "risk_level": "low"},
        ],
        "preventive_measures": [
            "Seed treatment with Thiram @ 2.5g/kg",
            "Balanced fertilizer application",
            "Regular field scouting every 7 days",
        ],
    }


@app.get("/alerts")
async def get_pest_alerts():
    """Get active pest and disease alerts for the region."""
    return {
        "region": "Punjab",
        "active_alerts": [
            {
                "alert_id": "alert-001",
                "type": "disease",
                "name": "Yellow Rust",
                "severity": "high",
                "affected_crops": ["wheat"],
                "issued_at": "2026-02-25T10:00:00Z",
            },
            {
                "alert_id": "alert-002",
                "type": "pest",
                "name": "Pink Bollworm",
                "severity": "medium",
                "affected_crops": ["cotton"],
                "issued_at": "2026-02-24T08:30:00Z",
            },
        ],
    }


if __name__ == "__main__":
    uvicorn.run(
        "services.fasal_rakshak.app:app", host="0.0.0.0", port=8003, reload=True
    )
