"""RewardRedemption model."""

import uuid
from datetime import datetime
from enum import Enum as PyEnum

from sqlalchemy import String, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class RewardTier(str, PyEnum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    PLATINUM = "platinum"
    DIAMOND = "diamond"
    LEGEND = "legend"


class RewardStatus(str, PyEnum):
    PENDING = "pending"
    APPROVED = "approved"
    FULFILLED = "fulfilled"
    EXPIRED = "expired"


class RewardRedemption(Base):
    __tablename__ = "reward_redemptions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers_gamification.id"), index=True)
    reward_type: Mapped[str] = mapped_column(String(50))
    reward_name: Mapped[str] = mapped_column(String(200), default="")
    reward_description: Mapped[str] = mapped_column(String(500), default="")
    reward_tier: Mapped[RewardTier] = mapped_column(Enum(RewardTier))
    xp_cost: Mapped[int] = mapped_column(Integer, default=0)
    redeemed_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    status: Mapped[RewardStatus] = mapped_column(Enum(RewardStatus), default=RewardStatus.PENDING)

    # Relationships
    farmer = relationship("FarmerGamification", back_populates="redemptions")
