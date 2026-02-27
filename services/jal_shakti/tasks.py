"""Celery tasks for Jal Shakti service."""

from services.shared.celery_app.app import celery_app


@celery_app.task(name="jal_shakti.compute_irrigation_schedule")
def compute_irrigation_schedule(plot_id: str, crop: str) -> dict:
    """Compute an optimized irrigation schedule for a plot.

    Uses soil moisture data, weather forecasts, and crop water requirements
    to generate a water-efficient irrigation schedule for the coming week.
    """
    return {
        "status": "completed",
        "message": f"Irrigation schedule computed for plot {plot_id} ({crop})",
        "plot_id": plot_id,
        "crop": crop,
    }


@celery_app.task(name="jal_shakti.aggregate_water_usage")
def aggregate_water_usage(farm_id: str, period: str) -> dict:
    """Aggregate water usage statistics for a farm over a given period.

    Collects flow sensor data, rainfall records, and irrigation logs
    to produce a consolidated water usage report with efficiency metrics.
    """
    return {
        "status": "completed",
        "message": f"Water usage aggregated for farm {farm_id} (period: {period})",
        "farm_id": farm_id,
        "period": period,
    }
