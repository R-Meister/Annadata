"""Pydantic schemas for the Gamified Platform API."""

from .farmer import (
    FarmerCreate,
    FarmerUpdate,
    FarmerProfileResponse,
    FarmerStatsResponse,
)
from .quest import (
    QuestResponse,
    QuestDetailResponse,
    QuestAcceptRequest,
    QuestSubmitRequest,
    FarmerQuestResponse,
)
from .badge import BadgeResponse, AllBadgesResponse
from .leaderboard import LeaderboardEntryResponse, LeaderboardResponse
from .reward import RewardResponse, RewardRedeemRequest, RedemptionResponse

__all__ = [
    "FarmerCreate", "FarmerUpdate", "FarmerProfileResponse", "FarmerStatsResponse",
    "QuestResponse", "QuestDetailResponse", "QuestAcceptRequest", "QuestSubmitRequest", "FarmerQuestResponse",
    "BadgeResponse", "AllBadgesResponse",
    "LeaderboardEntryResponse", "LeaderboardResponse",
    "RewardResponse", "RewardRedeemRequest", "RedemptionResponse",
]
