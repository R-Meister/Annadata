"""Farmer gamification profile model."""

import uuid
from datetime import datetime, date

from sqlalchemy import String, Integer, Numeric, Date, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from database import Base


class FarmerGamification(Base):
    __tablename__ = "farmers_gamification"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    annadata_user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), unique=True, nullable=True)
    display_name: Mapped[str] = mapped_column(String(100))
    phone: Mapped[str] = mapped_column(String(15), unique=True, index=True)
    village: Mapped[str] = mapped_column(String(100), index=True)
    block: Mapped[str] = mapped_column(String(100), default="")
    district: Mapped[str] = mapped_column(String(100), index=True)
    state: Mapped[str] = mapped_column(String(50), index=True)
    primary_crop: Mapped[str] = mapped_column(String(50))
    farm_size_acres: Mapped[float] = mapped_column(Numeric(8, 2), default=0)
    total_xp: Mapped[int] = mapped_column(Integer, default=0, index=True)
    current_level: Mapped[int] = mapped_column(Integer, default=1)
    sustainability_score: Mapped[int] = mapped_column(Integer, default=0)
    current_streak: Mapped[int] = mapped_column(Integer, default=0)
    longest_streak: Mapped[int] = mapped_column(Integer, default=0)
    last_active_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    preferred_language: Mapped[str] = mapped_column(String(10), default="hi")
    avatar_url: Mapped[str] = mapped_column(String(500), default="")
    is_onboarded: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    quests = relationship("FarmerQuest", back_populates="farmer", lazy="selectin")
    badges = relationship("FarmerBadge", back_populates="farmer", lazy="selectin")
    activities = relationship("ActivityFeed", back_populates="farmer", lazy="selectin")
    redemptions = relationship("RewardRedemption", back_populates="farmer", lazy="selectin")

    @property
    def level_name(self) -> str:
        level_names = {
            1: "Seedling", 2: "Sprout", 3: "Sapling", 4: "Young Tree",
            5: "Mature Tree", 6: "Banyan", 7: "Forest", 8: "Ecosystem",
            9: "Watershed", 10: "Legend",
        }
        return level_names.get(self.current_level, "Seedling")
