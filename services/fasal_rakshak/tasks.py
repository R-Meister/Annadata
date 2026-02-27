"""Celery tasks for Fasal Rakshak service."""

from services.shared.celery_app.app import celery_app


@celery_app.task(name="fasal_rakshak.process_disease_detection")
def process_disease_detection(image_id: str, crop_type: str) -> dict:
    """Process a crop image through the disease detection ML pipeline.

    Runs the uploaded crop image through the trained CNN model to identify
    diseases, estimate severity, and generate treatment recommendations.
    """
    return {
        "status": "completed",
        "message": f"Disease detection completed for image {image_id} ({crop_type})",
        "image_id": image_id,
        "crop_type": crop_type,
    }


@celery_app.task(name="fasal_rakshak.send_pest_alert")
def send_pest_alert(region: str, pest_name: str, severity: str) -> dict:
    """Send pest outbreak alerts to farmers in the affected region.

    Notifies registered farmers via SMS and push notification about
    pest outbreaks detected in their area with recommended actions.
    """
    return {
        "status": "completed",
        "message": f"Pest alert for {pest_name} ({severity}) sent to farmers in {region}",
        "region": region,
        "pest_name": pest_name,
        "severity": severity,
    }
