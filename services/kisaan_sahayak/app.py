"""Kisaan Sahayak - Multi-agent AI assistant for farmers."""

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
    title="Kisaan Sahayak",
    description="Multi-agent AI assistant for farmers",
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
        "service": "kisaan_sahayak",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "Kisaan Sahayak",
        "version": "1.0.0",
        "features": [
            "Natural language farming Q&A in multiple Indian languages",
            "Government scheme eligibility and application assistance",
            "Personalized crop calendar and task reminders",
        ],
    }


@app.post("/chat")
async def chat():
    """Send a message to the AI farming assistant."""
    return {
        "session_id": "sess-20260227-001",
        "response": "Based on your soil report, I recommend applying DAP fertilizer at 50kg/acre before the next irrigation. The current moisture level is adequate for wheat at the tillering stage.",
        "language": "en",
        "sources": [
            {"type": "knowledge_base", "topic": "wheat_fertilizer_schedule"},
            {"type": "soil_report", "id": "sa-20260227-001"},
        ],
        "suggested_actions": [
            "View fertilizer schedule",
            "Check weather forecast",
            "Contact nearest agri-input dealer",
        ],
        "responded_at": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/schemes")
async def get_government_schemes():
    """Get relevant government schemes for the farmer."""
    return {
        "farmer_category": "small_marginal",
        "state": "Madhya Pradesh",
        "eligible_schemes": [
            {
                "scheme_id": "pm-kisan",
                "name": "PM-KISAN Samman Nidhi",
                "benefit": "Rs 6,000/year in 3 installments",
                "status": "eligible",
                "next_installment": "2026-04-01",
            },
            {
                "scheme_id": "pmfby",
                "name": "Pradhan Mantri Fasal Bima Yojana",
                "benefit": "Crop insurance at subsidized premium",
                "status": "enrollment_open",
                "deadline": "2026-03-15",
            },
            {
                "scheme_id": "soil-health-card",
                "name": "Soil Health Card Scheme",
                "benefit": "Free soil testing and recommendations",
                "status": "available",
                "deadline": None,
            },
        ],
    }


@app.get("/calendar/{crop}")
async def get_crop_calendar(crop: str):
    """Get a personalized crop calendar with upcoming tasks."""
    return {
        "crop": crop,
        "season": "rabi",
        "region": "central_india",
        "upcoming_tasks": [
            {
                "task": "Third irrigation",
                "due_date": "2026-03-01",
                "priority": "high",
                "notes": "Critical for grain filling stage",
            },
            {
                "task": "Foliar spray of micronutrients",
                "due_date": "2026-03-05",
                "priority": "medium",
                "notes": "Zinc sulphate @ 0.5% recommended",
            },
            {
                "task": "Field scouting for rust",
                "due_date": "2026-03-07",
                "priority": "medium",
                "notes": "Check lower leaves for orange pustules",
            },
        ],
    }


if __name__ == "__main__":
    uvicorn.run(
        "services.kisaan_sahayak.app:app", host="0.0.0.0", port=8006, reload=True
    )
