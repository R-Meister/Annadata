"""AI Quest Generator — uses Google Gemini to generate personalized quests."""

import json
import logging

from config import get_settings

logger = logging.getLogger(__name__)


class AIQuestGenerator:
    def __init__(self):
        self.settings = get_settings()
        self._client = None

    def _get_client(self):
        if not self._client and self.settings.GEMINI_API_KEY:
            import google.generativeai as genai
            genai.configure(api_key=self.settings.GEMINI_API_KEY)
            self._client = genai.GenerativeModel("gemini-1.5-flash")
        return self._client

    async def generate_personalized_quests(
        self,
        crop: str,
        location: str,
        farm_size: float,
        current_level: int,
        season: str = "Kharif",
        count: int = 3,
    ) -> list[dict]:
        """Generate personalized quest suggestions using Gemini."""
        client = self._get_client()
        if not client:
            return self._fallback_quests(crop, current_level)

        prompt = f"""You are a sustainable farming advisor. Generate {count} personalized farming quests/challenges.

Farmer Profile:
- Crop: {crop}
- Location: {location}
- Farm Size: {farm_size} acres
- Experience Level: {current_level}/10
- Current Season: {season}

Generate quests in this JSON format:
[
  {{
    "title": "Quest title",
    "title_hi": "Hindi title",
    "description": "Detailed description of what farmer needs to do",
    "category": "one of: water, soil, organic, biodiversity, pest, rotation, energy, community",
    "difficulty": 1-5,
    "xp_reward": 100-500,
    "duration_days": 1-180,
    "steps": [
      {{"step": 1, "action": "Step description"}},
      {{"step": 2, "action": "Step description"}}
    ]
  }}
]

Focus on practical, achievable sustainable farming practices appropriate for the farmer's crop, region, and experience. Return ONLY the JSON array."""

        try:
            response = await client.generate_content_async(prompt)
            text = response.text.strip()
            # Clean markdown code blocks if present
            if text.startswith("```"):
                text = text.split("\n", 1)[1].rsplit("```", 1)[0]
            quests = json.loads(text)
            return quests if isinstance(quests, list) else [quests]
        except Exception as e:
            logger.error(f"Gemini quest generation failed: {e}")
            return self._fallback_quests(crop, current_level)

    async def generate_daily_tip(self, crop: str, season: str = "Kharif") -> str:
        """Generate a daily sustainable farming tip."""
        client = self._get_client()
        if not client:
            return f"Tip: Monitor your {crop} fields for pests regularly. Early detection saves crops!"

        prompt = f"Give one short, actionable sustainable farming tip for a {crop} farmer in {season} season in India. Keep it under 2 sentences."

        try:
            response = await client.generate_content_async(prompt)
            return response.text.strip()
        except Exception as e:
            logger.error(f"Gemini tip generation failed: {e}")
            return f"Tip: Monitor your {crop} fields daily. Healthy observation leads to healthy harvests!"

    def _fallback_quests(self, crop: str, level: int) -> list[dict]:
        """Return hardcoded quests when AI is unavailable."""
        return [
            {
                "title": f"Apply organic compost to your {crop} field",
                "title_hi": f"अपने {crop} खेत में जैविक खाद डालें",
                "description": f"Replace chemical fertilizer with compost for your {crop} crop this cycle.",
                "category": "organic",
                "difficulty": min(level, 3),
                "xp_reward": 150,
                "duration_days": 14,
                "steps": [
                    {"step": 1, "action": "Prepare compost from farm waste"},
                    {"step": 2, "action": "Apply evenly across the field"},
                    {"step": 3, "action": "Take a photo of the applied field"},
                ],
            },
            {
                "title": "Install a moisture sensor in your field",
                "title_hi": "खेत में नमी सेंसर लगाएं",
                "description": "Set up a simple moisture probe to optimize irrigation timing.",
                "category": "water",
                "difficulty": 2,
                "xp_reward": 200,
                "duration_days": 7,
                "steps": [
                    {"step": 1, "action": "Get a soil moisture sensor"},
                    {"step": 2, "action": "Install at root zone depth"},
                    {"step": 3, "action": "Record 3 days of readings"},
                ],
            },
            {
                "title": "Scout your field for beneficial insects",
                "title_hi": "खेत में लाभकारी कीड़ों की खोज करें",
                "description": "Identify and catalog at least 3 types of beneficial insects in your field.",
                "category": "biodiversity",
                "difficulty": 1,
                "xp_reward": 100,
                "duration_days": 3,
                "steps": [
                    {"step": 1, "action": "Walk through field early morning"},
                    {"step": 2, "action": "Photograph any insects found"},
                    {"step": 3, "action": "Identify at least 3 beneficial species"},
                ],
            },
        ]
