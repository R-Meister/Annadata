"""Farmer profile schemas."""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime, date


class FarmerCreate(BaseModel):
    display_name: str = Field(..., min_length=2, max_length=100)
    phone: str = Field(..., min_length=10, max_length=15)
    village: str
    block: str = ""
    district: str
    state: str
    primary_crop: str
    farm_size_acres: float = Field(ge=0)
    preferred_language: str = "hi"


class FarmerUpdate(BaseModel):
    display_name: str | None = None
    village: str | None = None
    block: str | None = None
    district: str | None = None
    state: str | None = None
    primary_crop: str | None = None
    farm_size_acres: float | None = None
    preferred_language: str | None = None
    avatar_url: str | None = None


class FarmerProfileResponse(BaseModel):
    id: UUID
    display_name: str
    phone: str
    village: str
    block: str
    district: str
    state: str
    primary_crop: str
    farm_size_acres: float
    total_xp: int
    current_level: int
    level_name: str
    sustainability_score: int
    current_streak: int
    longest_streak: int
    last_active_date: date | None
    preferred_language: str
    avatar_url: str
    is_onboarded: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class FarmerStatsResponse(BaseModel):
    total_xp: int
    current_level: int
    level_name: str
    sustainability_score: int
    current_streak: int
    longest_streak: int
    quests_completed: int
    quests_active: int
    badges_earned: int
    rank_village: int | None = None
    rank_district: int | None = None
    rank_state: int | None = None
    xp_to_next_level: int

    model_config = {"from_attributes": True}
