"""Quest Engine — matching, recommendations, and quest lifecycle management."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, not_

from models.farmer import FarmerGamification
from models.quest import Quest, FarmerQuest, QuestStatus


class QuestEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_recommendations(self, farmer: FarmerGamification, limit: int = 5) -> list[Quest]:
        """Get personalized quest recommendations based on farmer profile."""
        # Get IDs of quests farmer already has active or completed
        existing = await self.db.execute(
            select(FarmerQuest.quest_id).where(
                and_(
                    FarmerQuest.farmer_id == farmer.id,
                    FarmerQuest.status.in_([QuestStatus.ACTIVE, QuestStatus.COMPLETED]),
                )
            )
        )
        existing_quest_ids = [row[0] for row in existing.all()]

        # Build query for matching quests
        query = select(Quest).where(
            and_(
                Quest.is_active == True,  # noqa: E712
                ~Quest.id.in_(existing_quest_ids) if existing_quest_ids else True,
            )
        )

        # Filter by crop if quest has required_crops
        # Quests with NULL required_crops apply to all crops
        result = await self.db.execute(query.limit(limit * 3))
        all_quests = result.scalars().all()

        scored = []
        for quest in all_quests:
            score = self._relevance_score(quest, farmer)
            scored.append((score, quest))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [q for _, q in scored[:limit]]

    def _relevance_score(self, quest: Quest, farmer: FarmerGamification) -> float:
        """Calculate how relevant a quest is to a farmer."""
        score = 50.0  # base

        # Crop match boost
        if quest.required_crops and farmer.primary_crop:
            if farmer.primary_crop.lower() in [c.lower() for c in quest.required_crops]:
                score += 30

        # State match boost
        if quest.required_states and farmer.state:
            if farmer.state.lower() in [s.lower() for s in quest.required_states]:
                score += 20

        # Farm size compatibility
        if quest.min_farm_size and farmer.farm_size_acres < quest.min_farm_size:
            score -= 40
        if quest.max_farm_size and farmer.farm_size_acres > quest.max_farm_size:
            score -= 40

        # Difficulty vs level match (prefer quests near farmer's level)
        level_diff = abs(quest.difficulty - farmer.current_level)
        if level_diff <= 1:
            score += 15
        elif level_diff >= 3:
            score -= 10

        # Boost daily quests for low-level farmers (ease them in)
        if farmer.current_level <= 2 and quest.quest_type.value == "daily":
            score += 10

        return max(0, score)

    async def get_available_quests(
        self,
        farmer_id,
        category=None,
        quest_type=None,
        difficulty=None,
        limit=20,
        offset=0,
    ) -> list[Quest]:
        """Get all available quests with filters."""
        query = select(Quest).where(Quest.is_active == True)  # noqa: E712

        if category:
            query = query.where(Quest.category == category)
        if quest_type:
            query = query.where(Quest.quest_type == quest_type)
        if difficulty:
            query = query.where(Quest.difficulty == difficulty)

        query = query.offset(offset).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())
