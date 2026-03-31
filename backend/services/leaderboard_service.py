"""Leaderboard Service — rank computation and caching."""

from datetime import date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from models.farmer import FarmerGamification
from models.leaderboard import LeaderboardSnapshot, LeaderboardScope, LeaderboardPeriod


class LeaderboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def refresh_village_leaderboards(self):
        """Recalculate village-level leaderboards for all villages."""
        villages = await self.db.execute(
            select(FarmerGamification.village).distinct()
        )
        for (village,) in villages.all():
            await self._snapshot_scope(LeaderboardScope.VILLAGE, village)

    async def refresh_district_leaderboards(self):
        """Recalculate district-level leaderboards."""
        districts = await self.db.execute(
            select(FarmerGamification.district).distinct()
        )
        for (district,) in districts.all():
            await self._snapshot_scope(LeaderboardScope.DISTRICT, district)

    async def refresh_state_leaderboards(self):
        """Recalculate state-level leaderboards."""
        states = await self.db.execute(
            select(FarmerGamification.state).distinct()
        )
        for (state,) in states.all():
            await self._snapshot_scope(LeaderboardScope.STATE, state)

    async def _snapshot_scope(self, scope: LeaderboardScope, scope_value: str):
        """Create a leaderboard snapshot for a given scope."""
        scope_filters = {
            LeaderboardScope.VILLAGE: FarmerGamification.village,
            LeaderboardScope.BLOCK: FarmerGamification.block,
            LeaderboardScope.DISTRICT: FarmerGamification.district,
            LeaderboardScope.STATE: FarmerGamification.state,
        }

        column = scope_filters.get(scope)
        if not column:
            return

        farmers = await self.db.execute(
            select(FarmerGamification)
            .where(column == scope_value)
            .order_by(desc(FarmerGamification.total_xp))
        )
        today = date.today()

        for rank, farmer in enumerate(farmers.scalars().all(), start=1):
            snapshot = LeaderboardSnapshot(
                scope=scope,
                scope_value=scope_value,
                farmer_id=farmer.id,
                rank=rank,
                total_xp=farmer.total_xp,
                sustainability_score=farmer.sustainability_score,
                snapshot_date=today,
                period=LeaderboardPeriod.MONTHLY,
            )
            self.db.add(snapshot)

        await self.db.flush()
