"""Scoring Engine — XP calculation, level progression, sustainability score."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from models.farmer import FarmerGamification

# Level thresholds: level → minimum XP required
LEVEL_THRESHOLDS = {
    1: 0,
    2: 500,
    3: 1500,
    4: 3500,
    5: 7000,
    6: 12000,
    7: 20000,
    8: 35000,
    9: 55000,
    10: 100000,
}

# Sustainability score weights
SUSTAINABILITY_WEIGHTS = {
    "water": 0.20,
    "soil": 0.20,
    "organic": 0.20,
    "biodiversity": 0.15,
    "knowledge": 0.10,
    "community": 0.15,
}


class ScoringEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def award_xp(self, farmer_id, xp_amount: int, bonus_multiplier: float = 1.0):
        """Award XP to a farmer and handle level-ups."""
        result = await self.db.execute(
            select(FarmerGamification).where(FarmerGamification.id == farmer_id)
        )
        farmer = result.scalar_one_or_none()
        if not farmer:
            return

        total_xp = int(xp_amount * bonus_multiplier)
        farmer.total_xp += total_xp

        # Check for level up
        new_level = self._calculate_level(farmer.total_xp)
        if new_level > farmer.current_level:
            farmer.current_level = new_level

        await self.db.flush()
        return {"xp_awarded": total_xp, "new_total": farmer.total_xp, "level": farmer.current_level}

    def _calculate_level(self, total_xp: int) -> int:
        """Determine level based on total XP."""
        level = 1
        for lvl, threshold in sorted(LEVEL_THRESHOLDS.items()):
            if total_xp >= threshold:
                level = lvl
        return min(level, 10)

    def xp_to_next_level(self, current_level: int, current_xp: int) -> int:
        """Calculate XP remaining to reach the next level."""
        if current_level >= 10:
            return 0
        next_threshold = LEVEL_THRESHOLDS.get(current_level + 1, 100000)
        return max(0, next_threshold - current_xp)

    async def calculate_sustainability_score(self, farmer_id) -> int:
        """Calculate sustainability score (0-1000) based on quest completions by category."""
        from models.quest import FarmerQuest, Quest, QuestStatus
        from sqlalchemy import func, and_

        result = await self.db.execute(
            select(Quest.category, func.count())
            .join(FarmerQuest, FarmerQuest.quest_id == Quest.id)
            .where(
                and_(
                    FarmerQuest.farmer_id == farmer_id,
                    FarmerQuest.status == QuestStatus.COMPLETED,
                )
            )
            .group_by(Quest.category)
        )
        category_counts = {row[0].value: row[1] for row in result.all()}

        # Calculate weighted score (max 1000)
        score = 0
        for category, weight in SUSTAINABILITY_WEIGHTS.items():
            count = category_counts.get(category, 0)
            # Each quest in a category contributes up to the category's max (proportional)
            category_score = min(count * 50, 1000 * weight)  # cap per category
            score += category_score

        score = min(int(score), 1000)

        # Update farmer's score
        farmer_result = await self.db.execute(
            select(FarmerGamification).where(FarmerGamification.id == farmer_id)
        )
        farmer = farmer_result.scalar_one_or_none()
        if farmer:
            farmer.sustainability_score = score
            await self.db.flush()

        return score
