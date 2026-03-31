"""Background task: Check and update daily streaks."""

import logging
from datetime import date, timedelta
from sqlalchemy import select
from database import AsyncSessionLocal
from models.farmer import FarmerGamification

logger = logging.getLogger(__name__)


async def check_streaks():
    """Run daily to update streaks — increment active, reset broken."""
    async with AsyncSessionLocal() as db:
        try:
            today = date.today()
            yesterday = today - timedelta(days=1)

            result = await db.execute(select(FarmerGamification))
            farmers = result.scalars().all()

            for farmer in farmers:
                if farmer.last_active_date == today:
                    # Already active today — streak maintained
                    continue
                elif farmer.last_active_date == yesterday:
                    # Was active yesterday but not today yet — streak still valid
                    continue
                else:
                    # Streak broken
                    if farmer.current_streak > 0:
                        farmer.current_streak = 0
                        logger.info(f"Streak reset for farmer {farmer.id}")

            await db.commit()
            logger.info(f"Streak check completed for {len(farmers)} farmers.")
        except Exception as e:
            await db.rollback()
            logger.error(f"Streak check failed: {e}")
