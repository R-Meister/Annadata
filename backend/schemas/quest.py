"""Quest schemas."""

from pydantic import BaseModel, Field
from uuid import UUID
from datetime import datetime


class QuestResponse(BaseModel):
    id: UUID
    title: str
    title_hi: str
    description: str
    category: str
    quest_type: str
    difficulty: int
    xp_reward: int
    duration_days: int
    verification_type: str
    icon_url: str
    is_active: bool

    model_config = {"from_attributes": True}


class QuestDetailResponse(QuestResponse):
    description_hi: str
    required_crops: list[str] | None = None
    required_states: list[str] | None = None
    min_farm_size: float | None = None
    max_farm_size: float | None = None
    steps: dict | None = None
    tutorial_content: dict | None = None
    created_at: datetime


class QuestAcceptRequest(BaseModel):
    quest_id: UUID


class QuestSubmitRequest(BaseModel):
    proof_urls: list[str] = Field(default_factory=list)
    steps_completed: dict | None = None
    notes: str = ""


class FarmerQuestResponse(BaseModel):
    id: UUID
    quest: QuestResponse
    status: str
    accepted_at: datetime
    deadline: datetime | None = None
    completed_at: datetime | None = None
    proof_urls: list[str] | None = None
    ai_verification_score: float | None = None
    steps_completed: dict | None = None
    xp_awarded: int

    model_config = {"from_attributes": True}
