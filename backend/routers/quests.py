"""Quest management routes."""

from uuid import UUID
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from database import get_db
from models.farmer import FarmerGamification
from models.quest import Quest, FarmerQuest, QuestStatus, QuestCategory, QuestType
from schemas.quest import (
    QuestResponse,
    QuestDetailResponse,
    QuestSubmitRequest,
    FarmerQuestResponse,
)
from services.quest_engine import QuestEngine
from services.scoring_engine import ScoringEngine
from services.badge_engine import BadgeEngine

router = APIRouter(prefix="/quests", tags=["Quests"])


@router.get("/", response_model=list[QuestResponse])
async def list_quests(
    category: QuestCategory | None = None,
    quest_type: QuestType | None = None,
    difficulty: int | None = Query(None, ge=1, le=5),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """List available quests with optional filters."""
    query = select(Quest).where(Quest.is_active == True)  # noqa: E712

    if category:
        query = query.where(Quest.category == category)
    if quest_type:
        query = query.where(Quest.quest_type == quest_type)
    if difficulty:
        query = query.where(Quest.difficulty == difficulty)

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    quests = result.scalars().all()
    return [QuestResponse.model_validate(q) for q in quests]


@router.get("/recommended", response_model=list[QuestResponse])
async def get_recommended_quests(
    farmer_id: UUID,
    limit: int = Query(5, ge=1, le=20),
    db: AsyncSession = Depends(get_db),
):
    """Get AI-personalized quest recommendations for a farmer."""
    result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    quest_engine = QuestEngine(db)
    recommended = await quest_engine.get_recommendations(farmer, limit)
    return [QuestResponse.model_validate(q) for q in recommended]


@router.get("/active", response_model=list[FarmerQuestResponse])
async def get_active_quests(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get farmer's currently active quests."""
    result = await db.execute(
        select(FarmerQuest)
        .where(and_(FarmerQuest.farmer_id == farmer_id, FarmerQuest.status == QuestStatus.ACTIVE))
        .order_by(FarmerQuest.accepted_at.desc())
    )
    farmer_quests = result.scalars().all()
    return [FarmerQuestResponse.model_validate(fq) for fq in farmer_quests]


@router.get("/history", response_model=list[FarmerQuestResponse])
async def get_quest_history(
    farmer_id: UUID,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Get farmer's completed quest history."""
    result = await db.execute(
        select(FarmerQuest)
        .where(and_(FarmerQuest.farmer_id == farmer_id, FarmerQuest.status == QuestStatus.COMPLETED))
        .order_by(FarmerQuest.completed_at.desc())
        .offset(offset)
        .limit(limit)
    )
    farmer_quests = result.scalars().all()
    return [FarmerQuestResponse.model_validate(fq) for fq in farmer_quests]


@router.get("/{quest_id}", response_model=QuestDetailResponse)
async def get_quest_detail(quest_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get full quest detail with tutorial content and steps."""
    result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = result.scalar_one_or_none()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    return QuestDetailResponse.model_validate(quest)


@router.post("/{quest_id}/accept", response_model=FarmerQuestResponse)
async def accept_quest(quest_id: UUID, farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Accept a quest — creates FarmerQuest record."""
    # Validate quest exists
    q_result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = q_result.scalar_one_or_none()
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")

    # Check farmer exists
    f_result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = f_result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Check not already accepted
    existing = await db.execute(
        select(FarmerQuest).where(
            and_(FarmerQuest.farmer_id == farmer_id, FarmerQuest.quest_id == quest_id, FarmerQuest.status == QuestStatus.ACTIVE)
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Quest already active")

    farmer_quest = FarmerQuest(
        farmer_id=farmer_id,
        quest_id=quest_id,
        deadline=datetime.utcnow() + timedelta(days=quest.duration_days),
    )
    db.add(farmer_quest)
    await db.flush()
    await db.refresh(farmer_quest)
    return FarmerQuestResponse.model_validate(farmer_quest)


@router.post("/{quest_id}/submit", response_model=FarmerQuestResponse)
async def submit_quest(
    quest_id: UUID,
    farmer_id: UUID,
    data: QuestSubmitRequest,
    db: AsyncSession = Depends(get_db),
):
    """Submit quest completion proof."""
    result = await db.execute(
        select(FarmerQuest).where(
            and_(FarmerQuest.farmer_id == farmer_id, FarmerQuest.quest_id == quest_id, FarmerQuest.status == QuestStatus.ACTIVE)
        )
    )
    farmer_quest = result.scalar_one_or_none()
    if not farmer_quest:
        raise HTTPException(status_code=404, detail="Active quest not found")

    # Load the quest for XP reward
    q_result = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = q_result.scalar_one_or_none()

    farmer_quest.proof_urls = data.proof_urls
    farmer_quest.steps_completed = data.steps_completed
    farmer_quest.status = QuestStatus.COMPLETED
    farmer_quest.completed_at = datetime.utcnow()
    farmer_quest.xp_awarded = quest.xp_reward

    # Award XP
    scoring = ScoringEngine(db)
    await scoring.award_xp(farmer_id, quest.xp_reward)

    # Check badge unlocks
    badge_engine = BadgeEngine(db)
    await badge_engine.check_and_award(farmer_id)

    await db.flush()
    await db.refresh(farmer_quest)
    return FarmerQuestResponse.model_validate(farmer_quest)
