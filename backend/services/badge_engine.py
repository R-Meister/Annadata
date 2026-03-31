"""Badge Engine — unlock conditions and badge awarding."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from models.farmer import FarmerGamification
from models.quest import FarmerQuest, Quest, QuestStatus, QuestCategory
from models.badge import FarmerBadge
from models.activity import ActivityFeed, ActivityType

# Badge unlock conditions
BADGE_DEFINITIONS = {
    "first_seed": {
        "name": "First Seed",
        "description": "Complete your first mission",
        "icon_url": "/assets/gamification/badges/badge_first_seed.svg",
        "check": "completed_quests >= 1",
    },
    "water_warrior": {
        "name": "Water Warrior",
        "description": "Complete 5 water conservation quests",
        "icon_url": "/assets/gamification/badges/badge_water_warrior.svg",
        "check": "water_quests >= 5",
    },
    "pest_prodigy": {
        "name": "Pest Prodigy",
        "description": "Complete 5 bio-pest management quests",
        "icon_url": "/assets/gamification/badges/badge_pest_prodigy.svg",
        "check": "pest_quests >= 5",
    },
    "soil_scientist": {
        "name": "Soil Scientist",
        "description": "Complete 3 soil health quests",
        "icon_url": "/assets/gamification/badges/badge_soil_scientist.svg",
        "check": "soil_quests >= 3",
    },
    "organic_pioneer": {
        "name": "Organic Pioneer",
        "description": "Complete 5 organic farming quests",
        "icon_url": "/assets/gamification/badges/badge_organic_pioneer.svg",
        "check": "organic_quests >= 5",
    },
    "community_champion": {
        "name": "Community Champion",
        "description": "Complete 3 community quests",
        "icon_url": "/assets/gamification/badges/badge_community_champion.svg",
        "check": "community_quests >= 3",
    },
    "knowledge_keeper": {
        "name": "Knowledge Keeper",
        "description": "Complete 10 quests total",
        "icon_url": "/assets/gamification/badges/badge_knowledge_keeper.svg",
        "check": "completed_quests >= 10",
    },
    "streak_master": {
        "name": "Streak Master",
        "description": "Maintain a 30-day engagement streak",
        "icon_url": "/assets/gamification/badges/badge_streak_master.svg",
        "check": "longest_streak >= 30",
    },
    "eco_warrior": {
        "name": "Eco Warrior",
        "description": "Achieve sustainability score above 800",
        "icon_url": "/assets/gamification/badges/badge_eco_warrior.svg",
        "check": "sustainability_score >= 800",
    },
}


class BadgeEngine:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def check_and_award(self, farmer_id) -> list[str]:
        """Check all badge unlock conditions and award any newly earned badges."""
        # Get farmer stats
        f_result = await self.db.execute(
            select(FarmerGamification).where(FarmerGamification.id == farmer_id)
        )
        farmer = f_result.scalar_one_or_none()
        if not farmer:
            return []

        # Get already earned badges
        earned_result = await self.db.execute(
            select(FarmerBadge.badge_type).where(FarmerBadge.farmer_id == farmer_id)
        )
        earned_types = {row[0] for row in earned_result.all()}

        # Get quest completion stats by category
        stats = await self._get_quest_stats(farmer_id)
        stats["longest_streak"] = farmer.longest_streak
        stats["sustainability_score"] = farmer.sustainability_score

        newly_earned = []
        for badge_type, badge_def in BADGE_DEFINITIONS.items():
            if badge_type in earned_types:
                continue

            if self._check_condition(badge_def["check"], stats):
                # Award badge
                badge = FarmerBadge(
                    farmer_id=farmer_id,
                    badge_type=badge_type,
                    badge_name=badge_def["name"],
                    badge_description=badge_def["description"],
                    icon_url=badge_def["icon_url"],
                )
                self.db.add(badge)

                # Create activity feed entry
                activity = ActivityFeed(
                    farmer_id=farmer_id,
                    activity_type=ActivityType.BADGE_EARN,
                    content={
                        "badge_type": badge_type,
                        "badge_name": badge_def["name"],
                        "badge_description": badge_def["description"],
                    },
                )
                self.db.add(activity)

                newly_earned.append(badge_type)

        if newly_earned:
            await self.db.flush()

        return newly_earned

    async def _get_quest_stats(self, farmer_id) -> dict:
        """Get quest completion counts by category."""
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

        total = sum(category_counts.values())
        return {
            "completed_quests": total,
            "water_quests": category_counts.get("water", 0),
            "soil_quests": category_counts.get("soil", 0),
            "organic_quests": category_counts.get("organic", 0),
            "biodiversity_quests": category_counts.get("biodiversity", 0),
            "pest_quests": category_counts.get("pest", 0),
            "rotation_quests": category_counts.get("rotation", 0),
            "community_quests": category_counts.get("community", 0),
        }

    def _check_condition(self, condition: str, stats: dict) -> bool:
        """Evaluate a badge condition string against farmer stats."""
        try:
            parts = condition.split()
            if len(parts) != 3:
                return False
            key, op, value = parts[0], parts[1], int(parts[2])
            actual = stats.get(key, 0)
            if op == ">=":
                return actual >= value
            if op == ">":
                return actual > value
            if op == "==":
                return actual == value
            return False
        except (ValueError, KeyError):
            return False
