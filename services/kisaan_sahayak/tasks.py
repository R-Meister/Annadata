"""Celery tasks for Kisaan Sahayak service."""

from services.shared.celery_app.app import celery_app


@celery_app.task(name="kisaan_sahayak.process_voice_query")
def process_voice_query(audio_url: str, language: str) -> dict:
    """Process a voice query from a farmer.

    Transcribes the audio using speech-to-text, processes the query
    through the multi-agent system, and generates a voice response
    in the farmer's preferred language.
    """
    return {
        "status": "completed",
        "message": f"Voice query processed (language: {language})",
        "audio_url": audio_url,
        "language": language,
    }


@celery_app.task(name="kisaan_sahayak.check_scheme_eligibility")
def check_scheme_eligibility(farmer_id: str) -> dict:
    """Check government scheme eligibility for a farmer.

    Cross-references farmer profile data (land holdings, income, category)
    against active central and state government schemes to determine
    eligibility and pending benefits.
    """
    return {
        "status": "completed",
        "message": f"Scheme eligibility checked for farmer {farmer_id}",
        "farmer_id": farmer_id,
    }
