"""Routers package."""

from .auth import router as auth_router
from .quests import router as quests_router
from .gamification import router as gamification_router
from .leaderboard import router as leaderboard_router
from .community import router as community_router
from .rewards import router as rewards_router

__all__ = [
    "auth_router",
    "quests_router",
    "gamification_router",
    "leaderboard_router",
    "community_router",
    "rewards_router",
]
