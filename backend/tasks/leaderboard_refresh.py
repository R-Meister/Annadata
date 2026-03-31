"""Background task: Refresh leaderboard snapshots periodically."""

import asyncio
import logging
from database import AsyncSessionLocal
from services.leaderboard_service import LeaderboardService

logger = logging.getLogger(__name__)


async def refresh_all_leaderboards():
    """Recalculate leaderboards at all scopes. Call from scheduler."""
    async with AsyncSessionLocal() as db:
        service = LeaderboardService(db)
        try:
            logger.info("Refreshing village leaderboards...")
            await service.refresh_village_leaderboards()
            logger.info("Refreshing district leaderboards...")
            await service.refresh_district_leaderboards()
            logger.info("Refreshing state leaderboards...")
            await service.refresh_state_leaderboards()
            await db.commit()
            logger.info("All leaderboards refreshed successfully.")
        except Exception as e:
            await db.rollback()
            logger.error(f"Leaderboard refresh failed: {e}")
