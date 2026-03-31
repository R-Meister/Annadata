"""Rewards routes — list available rewards, redeem, history."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc

from database import get_db
from models.farmer import FarmerGamification
from models.reward import RewardRedemption, RewardTier, RewardStatus
from schemas.reward import RewardResponse, RewardRedeemRequest, RedemptionResponse

router = APIRouter(prefix="/rewards", tags=["Rewards"])

# Available rewards catalog
REWARDS_CATALOG = [
    {"reward_type": "soil_testing_voucher", "reward_name": "Free Soil Testing Voucher", "reward_description": "Get one free soil test at any government lab", "reward_tier": "bronze", "xp_cost": 500},
    {"reward_type": "training_credits", "reward_name": "Training Workshop Credits", "reward_description": "Attend a sustainable farming workshop for free", "reward_tier": "silver", "xp_cost": 1500},
    {"reward_type": "scheme_eligibility", "reward_name": "Scheme Eligibility Points", "reward_description": "Boost your points for PM-KISAN and other schemes", "reward_tier": "gold", "xp_cost": 3000},
    {"reward_type": "public_recognition", "reward_name": "Gram Sabha Recognition", "reward_description": "Public recognition and certificate at Gram Sabha", "reward_tier": "platinum", "xp_cost": 6000},
    {"reward_type": "subsidized_access", "reward_name": "Priority Equipment Access", "reward_description": "Priority access to subsidized seeds and equipment", "reward_tier": "diamond", "xp_cost": 10000},
    {"reward_type": "featured_farmer", "reward_name": "Featured Farmer Profile", "reward_description": "Featured profile with media coverage opportunity", "reward_tier": "legend", "xp_cost": 25000},
]


@router.get("/", response_model=list[RewardResponse])
async def list_rewards(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """List available rewards with availability based on farmer's XP."""
    f_res = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = f_res.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    return [
        RewardResponse(
            reward_type=r["reward_type"],
            reward_name=r["reward_name"],
            reward_description=r["reward_description"],
            reward_tier=r["reward_tier"],
            xp_cost=r["xp_cost"],
            is_available=farmer.total_xp >= r["xp_cost"],
        )
        for r in REWARDS_CATALOG
    ]


@router.post("/redeem", response_model=RedemptionResponse)
async def redeem_reward(data: RewardRedeemRequest, farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Redeem a reward using XP."""
    f_res = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = f_res.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Find the reward in catalog
    reward = next((r for r in REWARDS_CATALOG if r["reward_type"] == data.reward_type and r["reward_tier"] == data.reward_tier), None)
    if not reward:
        raise HTTPException(status_code=404, detail="Reward not found")

    if farmer.total_xp < reward["xp_cost"]:
        raise HTTPException(status_code=400, detail=f"Not enough XP. Need {reward['xp_cost']}, have {farmer.total_xp}")

    redemption = RewardRedemption(
        farmer_id=farmer_id,
        reward_type=reward["reward_type"],
        reward_name=reward["reward_name"],
        reward_description=reward["reward_description"],
        reward_tier=RewardTier(reward["reward_tier"]),
        xp_cost=reward["xp_cost"],
    )
    db.add(redemption)
    await db.flush()
    await db.refresh(redemption)
    return RedemptionResponse.model_validate(redemption)


@router.get("/history", response_model=list[RedemptionResponse])
async def redemption_history(
    farmer_id: UUID,
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """Get farmer's reward redemption history."""
    result = await db.execute(
        select(RewardRedemption)
        .where(RewardRedemption.farmer_id == farmer_id)
        .order_by(desc(RewardRedemption.redeemed_at))
        .limit(limit)
    )
    redemptions = result.scalars().all()
    return [RedemptionResponse.model_validate(r) for r in redemptions]
