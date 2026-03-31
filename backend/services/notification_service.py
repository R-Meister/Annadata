"""Notification service — push notifications and reminders."""

import logging

logger = logging.getLogger(__name__)


class NotificationService:
    """Handles sending notifications to farmers.

    Currently a placeholder — integrate with Firebase Cloud Messaging,
    SMS gateways (Twilio/MSG91), or WhatsApp Business API.
    """

    async def send_quest_reminder(self, farmer_id: str, quest_title: str, days_remaining: int):
        """Remind farmer about an upcoming quest deadline."""
        logger.info(f"[NOTIFICATION] Farmer {farmer_id}: Quest '{quest_title}' — {days_remaining} days remaining")
        # TODO: Integrate FCM / SMS

    async def send_badge_earned(self, farmer_id: str, badge_name: str):
        """Notify farmer of a newly earned badge."""
        logger.info(f"[NOTIFICATION] Farmer {farmer_id}: Badge earned — {badge_name} 🎉")

    async def send_level_up(self, farmer_id: str, new_level: int, level_name: str):
        """Notify farmer of a level up."""
        logger.info(f"[NOTIFICATION] Farmer {farmer_id}: Level up to {new_level} ({level_name}) 🎊")

    async def send_streak_warning(self, farmer_id: str, current_streak: int):
        """Warn farmer that their streak might break."""
        logger.info(f"[NOTIFICATION] Farmer {farmer_id}: Streak at {current_streak} days — don't let it break!")

    async def send_leaderboard_update(self, farmer_id: str, scope: str, new_rank: int):
        """Notify farmer of leaderboard position change."""
        logger.info(f"[NOTIFICATION] Farmer {farmer_id}: New rank #{new_rank} on {scope} leaderboard")
