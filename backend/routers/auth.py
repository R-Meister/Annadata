"""Auth & farmer profile routes."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models.farmer import FarmerGamification
from schemas.farmer import FarmerCreate, FarmerUpdate, FarmerProfileResponse

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.post("/register", response_model=FarmerProfileResponse, status_code=status.HTTP_201_CREATED)
async def register_farmer(data: FarmerCreate, db: AsyncSession = Depends(get_db)):
    """Register a new farmer for the gamification platform."""
    existing = await db.execute(select(FarmerGamification).where(FarmerGamification.phone == data.phone))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Phone number already registered")

    farmer = FarmerGamification(**data.model_dump())
    db.add(farmer)
    await db.flush()
    await db.refresh(farmer)
    return FarmerProfileResponse.model_validate(farmer)


@router.get("/{farmer_id}", response_model=FarmerProfileResponse)
async def get_profile(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Get farmer gamification profile."""
    result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    return FarmerProfileResponse.model_validate(farmer)


@router.put("/{farmer_id}", response_model=FarmerProfileResponse)
async def update_profile(farmer_id: UUID, data: FarmerUpdate, db: AsyncSession = Depends(get_db)):
    """Update farmer profile fields."""
    result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(farmer, key, value)

    await db.flush()
    await db.refresh(farmer)
    return FarmerProfileResponse.model_validate(farmer)


@router.post("/{farmer_id}/onboard", response_model=FarmerProfileResponse)
async def complete_onboarding(farmer_id: UUID, db: AsyncSession = Depends(get_db)):
    """Mark farmer as onboarded after completing tutorial."""
    result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farmer.is_onboarded = True
    await db.flush()
    await db.refresh(farmer)
    return FarmerProfileResponse.model_validate(farmer)
