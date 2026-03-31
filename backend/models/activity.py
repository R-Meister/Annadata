"""ActivityFeed model."""

import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB

from database import Base


class ActivityType(str, PyEnum):
    QUEST_COMPLETE = "quest_complete"
    BADGE_EARN = "badge_earn"
    LEVEL_UP = "level_up"
    COMMENT = "comment"
    PHOTO_STORY = "photo_story"
    MENTOR = "mentor"
    SHOUTOUT = "shoutout"


class ActivityFeed(Base):
    __tablename__ = "activity_feed"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers_gamification.id"), index=True)
    activity_type: Mapped[ActivityType] = mapped_column(Enum(ActivityType), index=True)
    content: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    farmer = relationship("FarmerGamification", back_populates="activities")
