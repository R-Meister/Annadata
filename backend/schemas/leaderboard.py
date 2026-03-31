"""Leaderboard schemas."""

from pydantic import BaseModel
from uuid import UUID
from datetime import date


class LeaderboardEntryResponse(BaseModel):
    rank: int
    farmer_id: UUID
    display_name: str
    village: str
    district: str
    total_xp: int
    sustainability_score: int
    current_level: int
    level_name: str
    avatar_url: str
    is_self: bool = False


class LeaderboardResponse(BaseModel):
    scope: str
    scope_value: str
    entries: list[LeaderboardEntryResponse]
    total_count: int
    farmer_rank: int | None = None
    snapshot_date: date | None = None
