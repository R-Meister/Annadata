"""FarmerBadge model."""

import uuid
from datetime import datetime

from sqlalchemy import String, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class FarmerBadge(Base):
    __tablename__ = "farmer_badges"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers_gamification.id"), index=True)
    badge_type: Mapped[str] = mapped_column(String(50), index=True)
    badge_name: Mapped[str] = mapped_column(String(100), default="")
    badge_description: Mapped[str] = mapped_column(String(500), default="")
    icon_url: Mapped[str] = mapped_column(String(500), default="")
    quest_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("quests.id"), nullable=True)
    earned_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # Relationships
    farmer = relationship("FarmerGamification", back_populates="badges")
