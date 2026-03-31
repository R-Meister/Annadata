"""Image verification stub — verify quest proof photos."""

import logging

logger = logging.getLogger(__name__)


async def verify_quest_proof(image_urls: list[str], quest_category: str) -> float:
    """Verify uploaded proof images using AI.

    Returns a confidence score 0.0 to 1.0.
    Currently a stub — will integrate with Gemini Vision API.
    """
    if not image_urls:
        return 0.0

    # TODO: Integrate Gemini Vision API for real image verification
    # For now, accept all submissions with 0.8 confidence
    logger.info(f"Verifying {len(image_urls)} images for category '{quest_category}' — stub returning 0.8")
    return 0.8
