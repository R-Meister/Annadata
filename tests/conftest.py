"""
Root test configuration for Annadata OS.
Sets up fixtures shared across all test modules.
"""

import os
import sys
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

# Ensure project root is on sys.path so "services.shared..." imports resolve
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Set test environment variables BEFORE any service module is imported
os.environ.update(
    {
        "APP_ENV": "test",
        "DEBUG": "false",
        "JWT_SECRET_KEY": "test-secret-key-do-not-use-in-production",
        "JWT_ALGORITHM": "HS256",
        "ACCESS_TOKEN_EXPIRE_MINUTES": "30",
        "POSTGRES_SERVER": "localhost",
        "POSTGRES_USER": "test",
        "POSTGRES_PASSWORD": "test",
        "POSTGRES_DB": "annadata_test",
        "POSTGRES_PORT": "5432",
        "REDIS_HOST": "localhost",
        "REDIS_PORT": "6379",
    }
)
