"""Quest and FarmerQuest models."""

import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import String, Integer, Text, DateTime, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY

from database import Base


class QuestCategory(str, PyEnum):
    WATER = "water"
    SOIL = "soil"
    ORGANIC = "organic"
    BIODIVERSITY = "biodiversity"
    PEST = "pest"
    ROTATION = "rotation"
    ENERGY = "energy"
    COMMUNITY = "community"


class QuestType(str, PyEnum):
    DAILY = "daily"
    WEEKLY = "weekly"
    SEASONAL = "seasonal"
    EPIC = "epic"
    COMMUNITY = "community"


class QuestStatus(str, PyEnum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    ABANDONED = "abandoned"


class VerificationType(str, PyEnum):
    PHOTO = "photo"
    SENSOR = "sensor"
    SELF_REPORT = "self_report"
    COMMUNITY_VERIFY = "community_verify"


class Quest(Base):
    __tablename__ = "quests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(200))
    title_hi: Mapped[str] = mapped_column(String(200), default="")
    description: Mapped[str] = mapped_column(Text)
    description_hi: Mapped[str] = mapped_column(Text, default="")
    category: Mapped[QuestCategory] = mapped_column(Enum(QuestCategory), index=True)
    quest_type: Mapped[QuestType] = mapped_column(Enum(QuestType), index=True)
    difficulty: Mapped[int] = mapped_column(Integer, default=1)  # 1-5
    xp_reward: Mapped[int] = mapped_column(Integer, default=100)
    duration_days: Mapped[int] = mapped_column(Integer, default=7)
    required_crops: Mapped[list | None] = mapped_column(ARRAY(String), nullable=True)
    required_states: Mapped[list | None] = mapped_column(ARRAY(String), nullable=True)
    min_farm_size: Mapped[float | None] = mapped_column(Float, nullable=True)
    max_farm_size: Mapped[float | None] = mapped_column(Float, nullable=True)
    steps: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    tutorial_content: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    verification_type: Mapped[VerificationType] = mapped_column(
        Enum(VerificationType), default=VerificationType.SELF_REPORT
    )
    icon_url: Mapped[str] = mapped_column(String(500), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer_quests = relationship("FarmerQuest", back_populates="quest", lazy="selectin")


class FarmerQuest(Base):
    __tablename__ = "farmer_quests"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers_gamification.id"), index=True)
    quest_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("quests.id"), index=True)
    status: Mapped[QuestStatus] = mapped_column(Enum(QuestStatus), default=QuestStatus.ACTIVE, index=True)
    accepted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    deadline: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    proof_urls: Mapped[list | None] = mapped_column(ARRAY(String), nullable=True)
    ai_verification_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    steps_completed: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    xp_awarded: Mapped[int] = mapped_column(Integer, default=0)

    # Relationships
    farmer = relationship("FarmerGamification", back_populates="quests")
    quest = relationship("Quest", back_populates="farmer_quests")
