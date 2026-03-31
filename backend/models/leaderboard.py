"""LeaderboardSnapshot model — materialized leaderboard for fast queries."""

import uuid
from datetime import date

from sqlalchemy import String, Integer, Date, Enum, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.dialects.postgresql import UUID
from enum import Enum as PyEnum

from database import Base


class LeaderboardScope(str, PyEnum):
    VILLAGE = "village"
    BLOCK = "block"
    DISTRICT = "district"
    STATE = "state"
    NATIONAL = "national"


class LeaderboardPeriod(str, PyEnum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEASONAL = "seasonal"
    YEARLY = "yearly"


class LeaderboardSnapshot(Base):
    __tablename__ = "leaderboard_snapshots"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scope: Mapped[LeaderboardScope] = mapped_column(Enum(LeaderboardScope), index=True)
    scope_value: Mapped[str] = mapped_column(String(100), index=True)
    farmer_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("farmers_gamification.id"), index=True)
    rank: Mapped[int] = mapped_column(Integer)
    total_xp: Mapped[int] = mapped_column(Integer)
    sustainability_score: Mapped[int] = mapped_column(Integer, default=0)
    snapshot_date: Mapped[date] = mapped_column(Date, index=True)
    period: Mapped[LeaderboardPeriod] = mapped_column(Enum(LeaderboardPeriod))
