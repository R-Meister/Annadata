"""Community routes — activity feed, stories, shout-outs."""

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_

from database import get_db
from models.farmer import FarmerGamification
from models.activity import ActivityFeed, ActivityType

router = APIRouter(prefix="/community", tags=["Community"])


@router.get("/feed")
async def get_feed(
    farmer_id: UUID,
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    """Get community activity feed for farmer's village/region."""
    # Get farmer to know their village
    f_result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = f_result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    # Get all farmer IDs in same village and district
    village_farmers = await db.execute(
        select(FarmerGamification.id).where(
            or_(
                FarmerGamification.village == farmer.village,
                FarmerGamification.district == farmer.district,
            )
        )
    )
    farmer_ids = [row[0] for row in village_farmers.all()]

    # Fetch activities
    activities = await db.execute(
        select(ActivityFeed)
        .where(ActivityFeed.farmer_id.in_(farmer_ids))
        .order_by(desc(ActivityFeed.created_at))
        .offset(offset)
        .limit(limit)
    )
    items = activities.scalars().all()

    feed = []
    for item in items:
        # Fetch farmer name for each activity
        fr = await db.execute(select(FarmerGamification).where(FarmerGamification.id == item.farmer_id))
        activity_farmer = fr.scalar_one_or_none()
        feed.append({
            "id": str(item.id),
            "farmer_id": str(item.farmer_id),
            "farmer_name": activity_farmer.display_name if activity_farmer else "Unknown",
            "farmer_avatar": activity_farmer.avatar_url if activity_farmer else "",
            "farmer_level": activity_farmer.current_level if activity_farmer else 1,
            "activity_type": item.activity_type.value,
            "content": item.content,
            "created_at": item.created_at.isoformat(),
        })

    return {"feed": feed, "total": len(feed)}


@router.post("/story")
async def post_story(
    farmer_id: UUID,
    title: str,
    description: str = "",
    image_urls: list[str] = [],
    db: AsyncSession = Depends(get_db),
):
    """Post a photo story to the community feed."""
    f_result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == farmer_id))
    farmer = f_result.scalar_one_or_none()
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    activity = ActivityFeed(
        farmer_id=farmer_id,
        activity_type=ActivityType.PHOTO_STORY,
        content={
            "title": title,
            "description": description,
            "image_urls": image_urls,
        },
    )
    db.add(activity)
    await db.flush()
    return {"message": "Story posted", "activity_id": str(activity.id)}


@router.post("/shoutout")
async def send_shoutout(
    from_farmer_id: UUID,
    to_farmer_id: UUID,
    message: str = "Great work! 🎉",
    db: AsyncSession = Depends(get_db),
):
    """Send a shout-out to another farmer."""
    # Validate both farmers exist
    from_result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == from_farmer_id))
    from_farmer = from_result.scalar_one_or_none()
    to_result = await db.execute(select(FarmerGamification).where(FarmerGamification.id == to_farmer_id))
    to_farmer = to_result.scalar_one_or_none()

    if not from_farmer or not to_farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    activity = ActivityFeed(
        farmer_id=to_farmer_id,
        activity_type=ActivityType.SHOUTOUT,
        content={
            "from_farmer_id": str(from_farmer_id),
            "from_farmer_name": from_farmer.display_name,
            "message": message,
        },
    )
    db.add(activity)
    await db.flush()
    return {"message": "Shout-out sent!", "activity_id": str(activity.id)}
