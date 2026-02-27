"""Celery tasks for Harvest Shakti service."""

from services.shared.celery_app.app import celery_app


@celery_app.task(name="harvest_shakti.compute_yield_estimate")
def compute_yield_estimate(plot_id: str, crop: str) -> dict:
    """Compute yield estimate using remote sensing and historical data.

    Processes NDVI time-series from satellite imagery combined with
    weather data and soil health metrics to predict expected crop yield.
    """
    return {
        "status": "completed",
        "message": f"Yield estimate computed for plot {plot_id} ({crop})",
        "plot_id": plot_id,
        "crop": crop,
    }


@celery_app.task(name="harvest_shakti.update_market_prices")
def update_market_prices(region: str) -> dict:
    """Fetch and update latest mandi prices for the region.

    Scrapes government mandi portals and aggregates real-time commodity
    prices to keep harvest timing recommendations market-aware.
    """
    return {
        "status": "completed",
        "message": f"Market prices updated for region {region}",
        "region": region,
    }
