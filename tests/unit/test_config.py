"""
Unit tests for services.shared.config — SharedSettings configuration.
"""

import os

import pytest


class TestSharedSettings:
    """Tests for the SharedSettings configuration class."""

    def test_settings_loads_defaults(self):
        from services.shared.config import settings

        assert settings.APP_NAME == "Annadata"
        assert settings.JWT_ALGORITHM == "HS256"
        assert settings.REDIS_PORT == 6379
        assert settings.ACCESS_TOKEN_EXPIRE_MINUTES == 30  # overridden in conftest

    def test_database_url_property(self):
        from services.shared.config import settings

        url = settings.DATABASE_URL
        assert url.startswith("postgresql+asyncpg://")
        assert settings.POSTGRES_USER in url
        assert settings.POSTGRES_DB in url

    def test_sync_database_url_property(self):
        from services.shared.config import settings

        url = settings.SYNC_DATABASE_URL
        assert url.startswith("postgresql://")
        assert "asyncpg" not in url

    def test_redis_url_property(self):
        from services.shared.config import settings

        url = settings.REDIS_URL
        assert url.startswith("redis://")
        assert str(settings.REDIS_PORT) in url

    def test_celery_broker_url_equals_redis_url(self):
        from services.shared.config import settings

        assert settings.CELERY_BROKER_URL == settings.REDIS_URL

    def test_celery_result_backend_equals_redis_url(self):
        from services.shared.config import settings

        assert settings.CELERY_RESULT_BACKEND == settings.REDIS_URL

    def test_env_override(self):
        """Verify conftest.py environment overrides are loaded."""
        from services.shared.config import settings

        assert settings.APP_ENV == "test"
        assert settings.JWT_SECRET_KEY == "test-secret-key-do-not-use-in-production"

    def test_cors_origins_is_list(self):
        from services.shared.config import settings

        assert isinstance(settings.BACKEND_CORS_ORIGINS, list)
