"""Leaderboard routes."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from database import get_db
from models.farmer import FarmerGamification
from models.leaderboard import LeaderboardScope
from schemas.leaderboard import LeaderboardEntryResponse, LeaderboardResponse

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("/{scope}", response_model=LeaderboardResponse)
async def get_leaderboard(
    scope: LeaderboardScope,
    scope_value: str = Query(..., description="Village, block, district, or state name"),
    farmer_id: UUID | None = None,
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Get leaderboard by scope — returns ranked farmers."""
    # Build filter based on scope
    scope_filters = {
        LeaderboardScope.VILLAGE: FarmerGamification.village,
        LeaderboardScope.BLOCK: FarmerGamification.block,
        LeaderboardScope.DISTRICT: FarmerGamification.district,
        LeaderboardScope.STATE: FarmerGamification.state,
    }

    query = select(FarmerGamification).order_by(desc(FarmerGamification.total_xp))

    if scope != LeaderboardScope.NATIONAL:
        column = scope_filters[scope]
        query = query.where(column == scope_value)

    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    farmers = result.scalars().all()

    # Count total in scope
    count_query = select(func.count()).select_from(FarmerGamification)
    if scope != LeaderboardScope.NATIONAL:
        column = scope_filters[scope]
        count_query = count_query.where(column == scope_value)
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    entries = []
    for i, f in enumerate(farmers, start=offset + 1):
        entries.append(
            LeaderboardEntryResponse(
                rank=i,
                farmer_id=f.id,
                display_name=f.display_name,
                village=f.village,
                district=f.district,
                total_xp=f.total_xp,
                sustainability_score=f.sustainability_score,
                current_level=f.current_level,
                level_name=f.level_name,
                avatar_url=f.avatar_url,
                is_self=(farmer_id is not None and f.id == farmer_id),
            )
        )

    # Find requesting farmer's rank
    my_rank = None
    if farmer_id:
        for entry in entries:
            if entry.is_self:
                my_rank = entry.rank
                break

    return LeaderboardResponse(
        scope=scope.value,
        scope_value=scope_value,
        entries=entries,
        total_count=total,
        farmer_rank=my_rank,
    )


@router.get("/rank/me")
async def get_my_ranks(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get farmer's rank across all scopes."""
    result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    async def get_rank(column, value):
        rank_query = (
            select(func.count())
            .select_from(FarmerGamification)
            .where(column == value)
            .where(FarmerGamification.total_xp > farmer.total_xp)
        )
        r = await db.execute(rank_query)
        return (r.scalar() or 0) + 1

    return {
        "village": {"scope_value": farmer.village, "rank": await get_rank(FarmerGamification.village, farmer.village)},
        "district": {"scope_value": farmer.district, "rank": await get_rank(FarmerGamification.district, farmer.district)},
        "state": {"scope_value": farmer.state, "rank": await get_rank(FarmerGamification.state, farmer.state)},
    }
