"""Gamification data routes — scores, badges, streaks, XP history."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from database import get_db
from models.farmer import FarmerGamification
from models.quest import FarmerQuest, QuestStatus
from models.badge import FarmerBadge
from schemas.farmer import FarmerStatsResponse
from schemas.badge import BadgeResponse, AllBadgesResponse
from services.scoring_engine import ScoringEngine

router = APIRouter(prefix="/stats", tags=["Gamification"])

# All available badge definitions
ALL_BADGES = [
    {"badge_type": "first_seed", "badge_name": "First Seed", "badge_description": "Complete your first mission", "icon_url": "/assets/gamification/badges/badge_first_seed.svg"},
    {"badge_type": "water_warrior", "badge_name": "Water Warrior", "badge_description": "Save 10,000L water via efficient irrigation", "icon_url": "/assets/gamification/badges/badge_water_warrior.svg"},
    {"badge_type": "pest_prodigy", "badge_name": "Pest Prodigy", "badge_description": "Complete 5 bio-pest management quests", "icon_url": "/assets/gamification/badges/badge_pest_prodigy.svg"},
    {"badge_type": "soil_scientist", "badge_name": "Soil Scientist", "badge_description": "Upload 3 soil test reports", "icon_url": "/assets/gamification/badges/badge_soil_scientist.svg"},
    {"badge_type": "organic_pioneer", "badge_name": "Organic Pioneer", "badge_description": "Complete 1 full organic season", "icon_url": "/assets/gamification/badges/badge_organic_pioneer.svg"},
    {"badge_type": "community_champion", "badge_name": "Community Champion", "badge_description": "Help 10 farmers complete quests", "icon_url": "/assets/gamification/badges/badge_community_champion.svg"},
    {"badge_type": "knowledge_keeper", "badge_name": "Knowledge Keeper", "badge_description": "Pass 20 knowledge quizzes", "icon_url": "/assets/gamification/badges/badge_knowledge_keeper.svg"},
    {"badge_type": "streak_master", "badge_name": "Streak Master", "badge_description": "Maintain 30-day engagement streak", "icon_url": "/assets/gamification/badges/badge_streak_master.svg"},
    {"badge_type": "panchayat_pride", "badge_name": "Panchayat Pride", "badge_description": "Reach #1 on village leaderboard", "icon_url": "/assets/gamification/badges/badge_panchayat_pride.svg"},
    {"badge_type": "eco_warrior", "badge_name": "Eco Warrior", "badge_description": "Achieve sustainability score > 800", "icon_url": "/assets/gamification/badges/badge_eco_warrior.svg"},
]


@router.get("/{farmer_id}", response_model=FarmerStatsResponse)
async def get_farmer_stats(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get comprehensive farmer gamification stats."""
    result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Count quests
    completed_count = await db.execute(
        select(func.count()).where(and_(FarmerQuest.farmer_id == farmer_id, FarmerQuest.status == QuestStatus.COMPLETED))
    )
    active_count = await db.execute(
        select(func.count()).where(and_(FarmerQuest.farmer_id == farmer_id, FarmerQuest.status == QuestStatus.ACTIVE))
    )
    badge_count = await db.execute(
        select(func.count()).where(FarmerBadge.farmer_id == farmer_id)
    )

    scoring = ScoringEngine(db)
    xp_to_next = scoring.xp_to_next_level(farmer.current_level, farmer.total_xp)

    return FarmerStatsResponse(
        total_xp=farmer.total_xp,
        current_level=farmer.current_level,
        level_name=farmer.level_name,
        sustainability_score=farmer.sustainability_score,
        current_streak=farmer.current_streak,
        longest_streak=farmer.longest_streak,
        quests_completed=completed_count.scalar() or 0,
        quests_active=active_count.scalar() or 0,
        badges_earned=badge_count.scalar() or 0,
        xp_to_next_level=xp_to_next,
    )


@router.get("/{farmer_id}/badges", response_model=AllBadgesResponse)
async def get_all_badges(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get all badges — earned and locked."""
    result = await db.execute(select(FarmerBadge).where(FarmerBadge.farmer_id == farmer_id))
    earned_badges = result.scalars().all()
    earned_types = {b.badge_type for b in earned_badges}

    earned = [
        BadgeResponse(
            badge_type=b.badge_type,
            badge_name=b.badge_name,
            badge_description=b.badge_description,
            icon_url=b.icon_url,
            earned=True,
            earned_at=b.earned_at,
        )
        for b in earned_badges
    ]

    locked = [
        BadgeResponse(
            badge_type=b["badge_type"],
            badge_name=b["badge_name"],
            badge_description=b["badge_description"],
            icon_url="/assets/gamification/badges/badge_locked.svg",
            earned=False,
        )
        for b in ALL_BADGES
        if b["badge_type"] not in earned_types
    ]

    return AllBadgesResponse(
        earned=earned,
        locked=locked,
        total_earned=len(earned),
        total_available=len(ALL_BADGES),
    )


@router.get("/{farmer_id}/streaks")
async def get_streak_data(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get streak information."""
    result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    return {
        "current_streak": farmer.current_streak,
        "longest_streak": farmer.longest_streak,
        "last_active_date": farmer.last_active_date,
    }


@router.get("/{farmer_id}/xp-history")
async def get_xp_history(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get XP timeline — earned per quest with timestamps."""
    result = await db.execute(
        select(FarmerQuest)
        .where(and_(FarmerQuest.farmer_id == farmer_id, FarmerQuest.status == QuestStatus.COMPLETED))
        .order_by(FarmerQuest.completed_at.asc())
    )
    quests = result.scalars().all()

    timeline = []
    cumulative_xp = 0
    for fq in quests:
        cumulative_xp += fq.xp_awarded
        timeline.append({
            "date": fq.completed_at.isoformat() if fq.completed_at else None,
            "xp_earned": fq.xp_awarded,
            "cumulative_xp": cumulative_xp,
            "quest_id": str(fq.quest_id),
        })

    return {"timeline": timeline, "total_xp": cumulative_xp}
