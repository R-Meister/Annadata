"""Badge schemas."""

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class BadgeResponse(BaseModel):
    badge_type: str
    badge_name: str
    badge_description: str
    icon_url: str
    earned: bool = True
    earned_at: datetime | None = None

    model_config = {"from_attributes": True}


class AllBadgesResponse(BaseModel):
    earned: list[BadgeResponse]
    locked: list[BadgeResponse]
    total_earned: int
    total_available: int
