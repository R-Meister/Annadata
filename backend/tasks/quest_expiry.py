"""Background task: Mark expired quests as failed."""

import logging
from datetime import datetime
from sqlalchemy import select, and_
from database import AsyncSessionLocal
from models.quest import FarmerQuest, QuestStatus

logger = logging.getLogger(__name__)


async def expire_quests():
    """Mark active quests past their deadline as failed."""
    async with AsyncSessionLocal() as db:
        try:
            now = datetime.utcnow()
            result = await db.execute(
                select(FarmerQuest).where(
                    and_(
                        FarmerQuest.status == QuestStatus.ACTIVE,
                        FarmerQuest.deadline < now,
                        FarmerQuest.deadline.isnot(None),
                    )
                )
            )
            expired = result.scalars().all()

            for fq in expired:
                fq.status = QuestStatus.FAILED
                logger.info(f"Quest {fq.quest_id} expired for farmer {fq.farmer_id}")

            await db.commit()
            logger.info(f"Expired {len(expired)} quests.")
        except Exception as e:
            await db.rollback()
            logger.error(f"Quest expiry task failed: {e}")
