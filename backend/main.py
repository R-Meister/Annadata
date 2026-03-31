"""FastAPI entry point for the Gamified Platform."""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import get_settings
from database import init_db
from routers import (
    auth_router,
    quests_router,
    gamification_router,
    leaderboard_router,
    community_router,
    rewards_router,
)

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup/shutdown lifecycle."""
    logger.info("🌾 Gamified Platform starting up...")
    await init_db()
    logger.info("✅ Database tables created / verified")
    yield
    logger.info("🛑 Gamified Platform shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Gamified Platform to Promote Sustainable Farming Practices — Annadata",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
import os
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
prefix = settings.API_PREFIX
app.include_router(auth_router, prefix=prefix)
app.include_router(quests_router, prefix=prefix)
app.include_router(gamification_router, prefix=prefix)
app.include_router(leaderboard_router, prefix=prefix)
app.include_router(community_router, prefix=prefix)
app.include_router(rewards_router, prefix=prefix)


@app.get("/")
async def root():
    return {
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8011, reload=True)
