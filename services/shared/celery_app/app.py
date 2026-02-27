"""
Celery application for Annadata OS.
Used for background ML tasks, long-running predictions, model training, etc.
"""

from celery import Celery

from services.shared.config import settings


celery_app = Celery(
    "annadata",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=600,  # 10 minutes max per task
    task_soft_time_limit=540,  # soft limit at 9 minutes
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=50,
)

# Auto-discover tasks from all services
celery_app.autodiscover_tasks(
    [
        "services.msp_mitra",
        "services.soilscan_ai",
        "services.fasal_rakshak",
        "services.jal_shakti",
        "services.harvest_shakti",
        "services.kisaan_sahayak",
        "services.protein_engineering",
        "services.kisan_credit",
        "services.harvest_to_cart",
        "services.beej_suraksha",
        "services.mausam_chakra",
    ]
)
