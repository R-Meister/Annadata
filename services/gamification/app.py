"""
Gamification Service - Duolingo-style farming education and engagement.

Provides:
- XP tracking and level progression
- Daily check-in with streak management
- Daily/weekly quests
- Subscription tier management
- Service access control (freemium model)
"""

import logging
import uuid
from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
from typing import Any, Dict, List, Optional

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from services.shared.auth.router import router as auth_router, setup_rate_limiting
from services.shared.config import settings
from services.shared.db.session import init_db, close_db, get_db
from services.shared.db.models import (
    UserProgress,
    XPEvent,
    UserQuest,
    SubscriptionTier,
    QuestStatus,
    User,
)

logger = logging.getLogger("services.gamification")

# ============================================================
# Level System Configuration
# ============================================================

LEVELS = [
    {
        "level": 1,
        "xp": 0,
        "title": "Naya Kisan",
        "title_hi": "नया किसान",
        "badge": "🌱",
    },
    {
        "level": 5,
        "xp": 500,
        "title": "Sikhta Kisan",
        "title_hi": "सीखता किसान",
        "badge": "🌿",
    },
    {
        "level": 10,
        "xp": 1500,
        "title": "Samajhdar Kisan",
        "title_hi": "समझदार किसान",
        "badge": "🌾",
    },
    {
        "level": 20,
        "xp": 5000,
        "title": "Anubhavi Kisan",
        "title_hi": "अनुभवी किसान",
        "badge": "🏆",
    },
    {
        "level": 35,
        "xp": 15000,
        "title": "Krishi Guru",
        "title_hi": "कृषि गुरु",
        "badge": "👑",
    },
    {
        "level": 50,
        "xp": 30000,
        "title": "Annadata",
        "title_hi": "अन्नदाता",
        "badge": "✨",
    },
]

# XP rewards by action type
XP_REWARDS = {
    "daily_checkin": 10,
    "weather_check": 5,
    "market_check": 10,
    "disease_scan": 25,
    "chat_query": 15,
    "quest_complete": 25,
    "weekly_challenge": 100,
    "streak_7_day": 100,
    "streak_30_day": 500,
    "referral": 200,
    "premium_upgrade": 1000,
    "soil_scan": 20,
    "irrigation_check": 15,
    "harvest_plan": 20,
}

# Service access by subscription tier
SERVICE_ACCESS = {
    "free": ["msp_mitra", "mausam_chakra", "fasal_rakshak"],
    "premium": [
        "soilscan_ai",
        "jal_shakti",
        "harvest_shakti",
        "kisan_credit",
        "kisaan_sahayak",
    ],
    "enterprise": [
        "digital_twin",
        "protein_engineering",
        "beej_suraksha",
        "harvest_to_cart",
    ],
}

# Daily quest definitions (in-memory)
DAILY_QUESTS = [
    {
        "id": "weather_watcher",
        "title": "Weather Watcher",
        "title_hi": "मौसम निगरानी",
        "description": "Check today's weather forecast",
        "description_hi": "आज का मौसम पूर्वानुमान देखें",
        "xp_reward": 25,
        "action_required": "weather_check",
    },
    {
        "id": "market_scout",
        "title": "Market Scout",
        "title_hi": "बाजार स्काउट",
        "description": "Check MSP for any 2 crops",
        "description_hi": "किन्हीं 2 फसलों के लिए MSP देखें",
        "xp_reward": 25,
        "action_required": "market_check",
    },
    {
        "id": "crop_doctor",
        "title": "Crop Doctor",
        "title_hi": "फसल डॉक्टर",
        "description": "Scan one crop for diseases",
        "description_hi": "एक फसल की बीमारी जांच करें",
        "xp_reward": 25,
        "action_required": "disease_scan",
    },
    {
        "id": "knowledge_seeker",
        "title": "Knowledge Seeker",
        "title_hi": "ज्ञान साधक",
        "description": "Ask Kisaan Sahayak one question",
        "description_hi": "किसान सहायक से एक सवाल पूछें",
        "xp_reward": 20,
        "action_required": "chat_query",
    },
    {
        "id": "price_tracker",
        "title": "Price Tracker",
        "title_hi": "मूल्य ट्रैकर",
        "description": "Compare prices across 3 mandis",
        "description_hi": "3 मंडियों में कीमतों की तुलना करें",
        "xp_reward": 30,
        "action_required": "price_comparison",
    },
]

# Weekly challenge definitions
WEEKLY_CHALLENGES = [
    {
        "id": "streak_master",
        "title": "Streak Master",
        "title_hi": "स्ट्रीक मास्टर",
        "description": "Log in 7 consecutive days",
        "description_hi": "लगातार 7 दिन लॉगिन करें",
        "xp_reward": 100,
        "action_required": "streak_7",
    },
    {
        "id": "market_expert",
        "title": "Market Expert",
        "title_hi": "बाजार विशेषज्ञ",
        "description": "Check prices for 5 different crops",
        "description_hi": "5 अलग-अलग फसलों की कीमतें देखें",
        "xp_reward": 75,
        "action_required": "market_check_5",
    },
    {
        "id": "health_check",
        "title": "Health Check",
        "title_hi": "स्वास्थ्य जांच",
        "description": "Complete 3 disease scans",
        "description_hi": "3 बीमारी जांच पूरी करें",
        "xp_reward": 75,
        "action_required": "disease_scan_3",
    },
]


# ============================================================
# Helper Functions
# ============================================================


def get_level_info(xp: int) -> Dict[str, Any]:
    """Calculate level information from total XP.

    Returns current level, title, badge, and XP needed for next level.
    """
    current = LEVELS[0]
    next_level = None

    for i, level in enumerate(LEVELS):
        if xp >= level["xp"]:
            current = level
            if i + 1 < len(LEVELS):
                next_level = LEVELS[i + 1]
        else:
            break

    # Calculate XP to next level
    if next_level:
        xp_to_next = next_level["xp"] - xp
    else:
        # Max level reached
        xp_to_next = 0

    # Calculate progress percentage to next level
    if next_level:
        level_start = current["xp"]
        level_end = next_level["xp"]
        progress_pct = ((xp - level_start) / (level_end - level_start)) * 100
    else:
        progress_pct = 100.0

    return {
        "level": current["level"],
        "title": current["title"],
        "title_hi": current["title_hi"],
        "badge": current["badge"],
        "xp_to_next": xp_to_next,
        "progress_pct": round(progress_pct, 1),
        "next_level": next_level["level"] if next_level else None,
        "next_level_xp": next_level["xp"] if next_level else None,
    }


def get_daily_quest_ids(user_id: str, today: date) -> List[str]:
    """Get 3 daily quests for a user.

    Uses a deterministic selection based on user_id and date
    to ensure consistent quests per user per day.
    """
    # Create a seed from user_id and date for reproducible selection
    seed = hash(f"{user_id}_{today.isoformat()}") % 1000000

    # Select 3 quests from the pool
    import random

    rng = random.Random(seed)
    selected = rng.sample(DAILY_QUESTS, min(3, len(DAILY_QUESTS)))
    return [q["id"] for q in selected]


# ============================================================
# Pydantic Schemas
# ============================================================


class UserProgressResponse(BaseModel):
    """Response schema for user progress."""

    user_id: str
    current_xp: int
    current_level: int
    xp_to_next_level: int
    progress_pct: float
    level_title: str
    level_title_hi: str
    level_badge: str
    current_streak: int
    longest_streak: int
    subscription_tier: str
    next_level: Optional[int] = None


class EarnXPRequest(BaseModel):
    """Request schema for earning XP."""

    action: str = Field(..., description="Action type that earned XP")
    metadata: Optional[Dict[str, Any]] = Field(
        None, description="Additional context about the action"
    )


class EarnXPResponse(BaseModel):
    """Response schema for XP earning."""

    xp_earned: int
    total_xp: int
    level_up: bool
    new_level: Optional[int] = None
    new_title: Optional[str] = None
    new_badge: Optional[str] = None


class CheckinResponse(BaseModel):
    """Response schema for daily check-in."""

    message: str
    xp_earned: int
    streak: int
    streak_bonus: int = 0
    already_checked_in: bool = False


class QuestResponse(BaseModel):
    """Response schema for a quest."""

    id: str
    title: str
    title_hi: str
    description: str
    description_hi: str
    xp_reward: int
    status: str
    action_required: str


class SubscriptionResponse(BaseModel):
    """Response schema for subscription info."""

    tier: str
    free_services: List[str]
    premium_services: List[str]
    enterprise_services: List[str]
    accessible_services: List[str]


class XPHistoryResponse(BaseModel):
    """Response schema for XP history."""

    events: List[Dict[str, Any]]
    total_count: int


# ============================================================
# Lifespan
# ============================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Modern FastAPI lifespan context manager."""
    # Startup
    logger.info("Gamification Service: initialising database...")
    await init_db()
    logger.info("Gamification Service: ready.")

    yield

    # Shutdown
    logger.info("Gamification Service: shutting down...")
    await close_db()


# ============================================================
# Application
# ============================================================

app = FastAPI(
    title="Gamification Service",
    description="Duolingo-style gamification for Annadata OS farming platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount shared auth router
app.include_router(auth_router)
setup_rate_limiting(app)


# ============================================================
# Health Endpoint
# ============================================================


@app.get("/health", tags=["system"])
async def health():
    """Liveness / readiness probe."""
    return {
        "service": "gamification",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "version": "1.0.0",
        "levels_configured": len(LEVELS),
        "actions_configured": len(XP_REWARDS),
        "quests_configured": len(DAILY_QUESTS),
    }


@app.get("/", tags=["system"])
async def root():
    """API information."""
    return {
        "service": "Gamification Service",
        "version": "1.0.0",
        "description": "Duolingo-style gamification for farmers",
        "features": [
            "XP tracking and level progression",
            "Daily check-in with streaks",
            "Daily and weekly quests",
            "Freemium subscription tiers",
            "Service access control",
        ],
    }


# ============================================================
# Progress Endpoints
# ============================================================


@app.get("/progress/{user_id}", response_model=UserProgressResponse, tags=["progress"])
async def get_progress(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user's gamification progress.

    Returns XP, level, streak, and subscription info.
    Creates a new progress record if user doesn't exist.
    """
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    # Get or create user progress
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_uuid)
    )
    progress = result.scalar_one_or_none()

    if not progress:
        # Create new progress record
        progress = UserProgress(
            user_id=user_uuid,
            current_xp=0,
            current_level=1,
            total_xp_earned=0,
            current_streak=0,
            longest_streak=0,
            subscription_tier=SubscriptionTier.FREE,
        )
        db.add(progress)
        await db.flush()

    # Calculate level info
    level_info = get_level_info(progress.current_xp)

    return UserProgressResponse(
        user_id=str(progress.user_id),
        current_xp=progress.current_xp,
        current_level=level_info["level"],
        xp_to_next_level=level_info["xp_to_next"],
        progress_pct=level_info["progress_pct"],
        level_title=level_info["title"],
        level_title_hi=level_info["title_hi"],
        level_badge=level_info["badge"],
        current_streak=progress.current_streak,
        longest_streak=progress.longest_streak,
        subscription_tier=progress.subscription_tier.value
        if progress.subscription_tier
        else "free",
        next_level=level_info["next_level"],
    )


# ============================================================
# XP Endpoints
# ============================================================


@app.post("/xp/earn", response_model=EarnXPResponse, tags=["xp"])
async def earn_xp(
    request: EarnXPRequest,
    user_id: str = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db),
):
    """Award XP for a completed action.

    Tracks the XP event and updates user progress.
    Returns whether the user leveled up.
    """
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    # Get XP amount for action
    xp_amount = XP_REWARDS.get(request.action, 5)

    # Get or create user progress
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_uuid)
    )
    progress = result.scalar_one_or_none()

    if not progress:
        progress = UserProgress(
            user_id=user_uuid,
            current_xp=0,
            current_level=1,
            total_xp_earned=0,
            current_streak=0,
            longest_streak=0,
            subscription_tier=SubscriptionTier.FREE,
        )
        db.add(progress)

    # Calculate old level
    old_level_info = get_level_info(progress.current_xp)
    old_level = old_level_info["level"]

    # Update XP
    progress.current_xp += xp_amount
    progress.total_xp_earned += xp_amount

    # Calculate new level
    new_level_info = get_level_info(progress.current_xp)
    new_level = new_level_info["level"]

    # Update level if changed
    progress.current_level = new_level

    # Log XP event
    xp_event = XPEvent(
        user_id=user_uuid,
        action_type=request.action,
        xp_earned=xp_amount,
        event_data=request.metadata,
    )
    db.add(xp_event)

    await db.flush()

    # Check for level up
    level_up = new_level > old_level

    return EarnXPResponse(
        xp_earned=xp_amount,
        total_xp=progress.current_xp,
        level_up=level_up,
        new_level=new_level if level_up else None,
        new_title=new_level_info["title"] if level_up else None,
        new_badge=new_level_info["badge"] if level_up else None,
    )


@app.get("/xp/history/{user_id}", response_model=XPHistoryResponse, tags=["xp"])
async def get_xp_history(
    user_id: str,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get recent XP events for a user."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    result = await db.execute(
        select(XPEvent)
        .where(XPEvent.user_id == user_uuid)
        .order_by(XPEvent.created_at.desc())
        .limit(limit)
    )
    events = result.scalars().all()

    return XPHistoryResponse(
        events=[e.to_dict() for e in events],
        total_count=len(events),
    )


# ============================================================
# Check-in Endpoint
# ============================================================


@app.post("/checkin/{user_id}", response_model=CheckinResponse, tags=["streaks"])
async def daily_checkin(user_id: str, db: AsyncSession = Depends(get_db)):
    """Process daily check-in.

    Awards check-in XP and updates streak.
    Gives bonus XP for 7-day and 30-day streaks.
    """
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    today = date.today()

    # Get or create user progress
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_uuid)
    )
    progress = result.scalar_one_or_none()

    if not progress:
        progress = UserProgress(
            user_id=user_uuid,
            current_xp=0,
            current_level=1,
            total_xp_earned=0,
            current_streak=0,
            longest_streak=0,
            subscription_tier=SubscriptionTier.FREE,
        )
        db.add(progress)

    # Check if already checked in today
    if progress.last_active_date == today:
        return CheckinResponse(
            message="Already checked in today!",
            xp_earned=0,
            streak=progress.current_streak,
            already_checked_in=True,
        )

    # Update streak
    yesterday = today - timedelta(days=1)
    if progress.last_active_date == yesterday:
        # Consecutive day - increment streak
        progress.current_streak += 1
    elif progress.last_active_date is None or progress.last_active_date < yesterday:
        # Streak broken - reset to 1
        progress.current_streak = 1

    # Update longest streak
    if progress.current_streak > progress.longest_streak:
        progress.longest_streak = progress.current_streak

    # Update last active date
    progress.last_active_date = today

    # Award XP
    xp_earned = XP_REWARDS["daily_checkin"]
    streak_bonus = 0

    # Check for streak bonuses
    if progress.current_streak == 7:
        streak_bonus = XP_REWARDS["streak_7_day"]
    elif progress.current_streak == 30:
        streak_bonus = XP_REWARDS["streak_30_day"]
    elif progress.current_streak > 0 and progress.current_streak % 7 == 0:
        # Bonus every 7 days
        streak_bonus = 50

    total_xp = xp_earned + streak_bonus
    progress.current_xp += total_xp
    progress.total_xp_earned += total_xp

    # Update level
    level_info = get_level_info(progress.current_xp)
    progress.current_level = level_info["level"]

    # Log XP event
    xp_event = XPEvent(
        user_id=user_uuid,
        action_type="daily_checkin",
        xp_earned=total_xp,
        event_data={
            "streak": progress.current_streak,
            "streak_bonus": streak_bonus,
        },
    )
    db.add(xp_event)

    await db.flush()

    # Build message
    if streak_bonus > 0:
        message = f"Check-in successful! {progress.current_streak}-day streak bonus: +{streak_bonus} XP!"
    else:
        message = f"Check-in successful! Keep it up!"

    return CheckinResponse(
        message=message,
        xp_earned=total_xp,
        streak=progress.current_streak,
        streak_bonus=streak_bonus,
        already_checked_in=False,
    )


# ============================================================
# Quest Endpoints
# ============================================================


@app.get("/quests/daily/{user_id}", response_model=List[QuestResponse], tags=["quests"])
async def get_daily_quests(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get today's daily quests for a user.

    Assigns quests if not already assigned today.
    Returns quest status (pending/completed).
    """
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    today = date.today()

    # Get quest IDs for today
    quest_ids = get_daily_quest_ids(user_id, today)

    # Check existing assignments for today
    result = await db.execute(
        select(UserQuest).where(
            and_(
                UserQuest.user_id == user_uuid,
                UserQuest.assigned_date == today,
                UserQuest.quest_type == "daily",
            )
        )
    )
    existing_quests = {q.quest_id: q for q in result.scalars().all()}

    # Build response with quest definitions and status
    responses = []
    for quest_id in quest_ids:
        # Find quest definition
        quest_def = next((q for q in DAILY_QUESTS if q["id"] == quest_id), None)
        if not quest_def:
            continue

        # Get or create user quest record
        if quest_id in existing_quests:
            status = existing_quests[quest_id].status.value
        else:
            # Create new assignment
            user_quest = UserQuest(
                user_id=user_uuid,
                quest_type="daily",
                quest_id=quest_id,
                status=QuestStatus.PENDING,
                assigned_date=today,
            )
            db.add(user_quest)
            status = "pending"

        responses.append(
            QuestResponse(
                id=quest_def["id"],
                title=quest_def["title"],
                title_hi=quest_def["title_hi"],
                description=quest_def["description"],
                description_hi=quest_def.get(
                    "description_hi", quest_def["description"]
                ),
                xp_reward=quest_def["xp_reward"],
                status=status,
                action_required=quest_def["action_required"],
            )
        )

    await db.flush()
    return responses


@app.post("/quests/{quest_id}/complete", tags=["quests"])
async def complete_quest(
    quest_id: str,
    user_id: str = Query(..., description="User ID"),
    db: AsyncSession = Depends(get_db),
):
    """Mark a quest as completed and award XP."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    today = date.today()

    # Find the quest assignment
    result = await db.execute(
        select(UserQuest).where(
            and_(
                UserQuest.user_id == user_uuid,
                UserQuest.quest_id == quest_id,
                UserQuest.assigned_date == today,
            )
        )
    )
    user_quest = result.scalar_one_or_none()

    if not user_quest:
        raise HTTPException(status_code=404, detail="Quest not found or not assigned")

    if user_quest.status == QuestStatus.COMPLETED:
        return {
            "message": "Quest already completed",
            "xp_earned": 0,
            "quest_id": quest_id,
        }

    # Find quest definition for XP reward
    quest_def = next((q for q in DAILY_QUESTS if q["id"] == quest_id), None)
    if not quest_def:
        quest_def = next((q for q in WEEKLY_CHALLENGES if q["id"] == quest_id), None)

    xp_reward = quest_def["xp_reward"] if quest_def else XP_REWARDS["quest_complete"]

    # Mark as completed
    user_quest.status = QuestStatus.COMPLETED
    user_quest.completed_at = datetime.now(timezone.utc)

    # Award XP
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_uuid)
    )
    progress = result.scalar_one_or_none()

    if progress:
        progress.current_xp += xp_reward
        progress.total_xp_earned += xp_reward
        level_info = get_level_info(progress.current_xp)
        progress.current_level = level_info["level"]

    # Log XP event
    xp_event = XPEvent(
        user_id=user_uuid,
        action_type="quest_complete",
        xp_earned=xp_reward,
        event_data={"quest_id": quest_id},
    )
    db.add(xp_event)

    await db.flush()

    return {
        "message": f"Quest completed! +{xp_reward} XP",
        "xp_earned": xp_reward,
        "quest_id": quest_id,
    }


# ============================================================
# Subscription Endpoints
# ============================================================


@app.get(
    "/subscription/{user_id}",
    response_model=SubscriptionResponse,
    tags=["subscription"],
)
async def get_subscription(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user's subscription tier and accessible services."""
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    # Get user progress
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_uuid)
    )
    progress = result.scalar_one_or_none()

    tier = progress.subscription_tier.value if progress else "free"

    # Determine accessible services based on tier
    accessible = list(SERVICE_ACCESS["free"])  # Everyone gets free services
    if tier in ("premium", "enterprise"):
        accessible.extend(SERVICE_ACCESS["premium"])
    if tier == "enterprise":
        accessible.extend(SERVICE_ACCESS["enterprise"])

    return SubscriptionResponse(
        tier=tier,
        free_services=SERVICE_ACCESS["free"],
        premium_services=SERVICE_ACCESS["premium"],
        enterprise_services=SERVICE_ACCESS["enterprise"],
        accessible_services=accessible,
    )


@app.post("/subscription/upgrade", tags=["subscription"])
async def upgrade_subscription(
    user_id: str = Query(..., description="User ID"),
    new_tier: str = Query(..., description="Target tier: premium or enterprise"),
    db: AsyncSession = Depends(get_db),
):
    """Upgrade user subscription tier.

    In production, this would integrate with payment gateway.
    For demo, it directly upgrades and awards bonus XP.
    """
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_id format")

    if new_tier not in ("premium", "enterprise"):
        raise HTTPException(
            status_code=400, detail="Invalid tier. Must be 'premium' or 'enterprise'"
        )

    # Get or create user progress
    result = await db.execute(
        select(UserProgress).where(UserProgress.user_id == user_uuid)
    )
    progress = result.scalar_one_or_none()

    if not progress:
        progress = UserProgress(
            user_id=user_uuid,
            current_xp=0,
            current_level=1,
            total_xp_earned=0,
            current_streak=0,
            longest_streak=0,
            subscription_tier=SubscriptionTier.FREE,
        )
        db.add(progress)

    # Update tier
    progress.subscription_tier = SubscriptionTier(new_tier)
    progress.subscription_expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    # Award upgrade bonus XP
    bonus_xp = XP_REWARDS["premium_upgrade"]
    progress.current_xp += bonus_xp
    progress.total_xp_earned += bonus_xp

    # Log XP event
    xp_event = XPEvent(
        user_id=user_uuid,
        action_type="premium_upgrade",
        xp_earned=bonus_xp,
        event_data={"new_tier": new_tier},
    )
    db.add(xp_event)

    await db.flush()

    return {
        "message": f"Successfully upgraded to {new_tier}!",
        "tier": new_tier,
        "bonus_xp": bonus_xp,
        "expires_at": progress.subscription_expires_at.isoformat(),
    }


# ============================================================
# Leaderboard Endpoint (Optional)
# ============================================================


@app.get("/leaderboard", tags=["leaderboard"])
async def get_leaderboard(
    limit: int = Query(10, ge=1, le=50),
    db: AsyncSession = Depends(get_db),
):
    """Get top users by XP.

    Returns leaderboard with anonymized user info.
    """
    result = await db.execute(
        select(UserProgress).order_by(UserProgress.total_xp_earned.desc()).limit(limit)
    )
    leaders = result.scalars().all()

    leaderboard = []
    for i, progress in enumerate(leaders, 1):
        level_info = get_level_info(progress.current_xp)
        leaderboard.append(
            {
                "rank": i,
                "user_id": str(progress.user_id)[:8] + "...",  # Anonymize
                "total_xp": progress.total_xp_earned,
                "level": level_info["level"],
                "title": level_info["title"],
                "badge": level_info["badge"],
                "streak": progress.current_streak,
            }
        )

    return {"leaderboard": leaderboard, "count": len(leaderboard)}


# ============================================================
# Configuration Endpoints (for frontend)
# ============================================================


@app.get("/config/levels", tags=["config"])
async def get_levels_config():
    """Get level configuration for frontend display."""
    return {"levels": LEVELS}


@app.get("/config/rewards", tags=["config"])
async def get_rewards_config():
    """Get XP rewards configuration."""
    return {"rewards": XP_REWARDS}


@app.get("/config/services", tags=["config"])
async def get_services_config():
    """Get service access configuration by tier."""
    return {"service_access": SERVICE_ACCESS}


# ============================================================
# Entrypoint
# ============================================================

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "services.gamification.app:app",
        host="0.0.0.0",
        port=8012,
        reload=settings.DEBUG,
    )
