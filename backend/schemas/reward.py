"""Reward schemas."""

from pydantic import BaseModel
from uuid import UUID
from datetime import datetime


class RewardResponse(BaseModel):
    reward_type: str
    reward_name: str
    reward_description: str
    reward_tier: str
    xp_cost: int
    is_available: bool = True


class RewardRedeemRequest(BaseModel):
    reward_type: str
    reward_tier: str


class RedemptionResponse(BaseModel):
    id: UUID
    reward_type: str
    reward_name: str
    reward_tier: str
    xp_cost: int
    redeemed_at: datetime
    status: str

    model_config = {"from_attributes": True}
