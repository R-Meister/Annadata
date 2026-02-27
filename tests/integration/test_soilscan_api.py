"""
Integration tests for the SoilScan AI service.

These tests use httpx.ASGITransport to test the FastAPI app directly
without needing a running server or database. The SoilScan service's
lifespan (init_db/close_db) is overridden with a no-op since we don't
need a real PostgreSQL instance — the endpoints return hardcoded stubs.
"""

from contextlib import asynccontextmanager
from unittest.mock import AsyncMock, patch

import httpx
import pytest
from fastapi import FastAPI


@pytest.fixture()
def soilscan_app():
    """Create the SoilScan app with DB lifecycle mocked out."""
    # We need to build a minimal app that mirrors the real one but
    # skips the DB lifecycle. Easiest: import the app module and
    # create a fresh FastAPI with the same routes but a no-op lifespan.
    from services.soilscan_ai import app as soilscan_module

    @asynccontextmanager
    async def noop_lifespan(app):
        yield

    # Create a fresh app with the same routes but no DB lifecycle
    test_app = FastAPI(lifespan=noop_lifespan)

    # Copy all routes from the real app
    for route in soilscan_module.app.routes:
        test_app.routes.append(route)

    return test_app


@pytest.fixture()
async def client(soilscan_app):
    """Async httpx client for the test app."""
    transport = httpx.ASGITransport(app=soilscan_app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_health_check(client):
    """Health endpoint returns service name and healthy status."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "soilscan_ai"
    assert data["status"] == "healthy"
    assert "timestamp" in data


@pytest.mark.asyncio
async def test_root_endpoint(client):
    """Root endpoint returns service info and features list."""
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "SoilScan AI"
    assert data["version"] == "1.0.0"
    assert isinstance(data["features"], list)
    assert len(data["features"]) > 0


@pytest.mark.asyncio
async def test_analyze_soil(client):
    """POST /analyze returns a mock soil analysis result."""
    response = await client.post("/analyze")
    assert response.status_code == 200
    data = response.json()
    assert "analysis_id" in data
    assert data["status"] == "completed"
    assert data["soil_type"] == "alluvial"
    assert isinstance(data["ph_level"], (int, float))
    assert 0 <= data["ph_level"] <= 14
    assert isinstance(data["health_score"], int)
    assert 0 <= data["health_score"] <= 100
    assert isinstance(data["recommendations"], list)


@pytest.mark.asyncio
async def test_get_report(client):
    """GET /report/{id} returns a report for the given analysis ID."""
    analysis_id = "sa-test-001"
    response = await client.get(f"/report/{analysis_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_id"] == analysis_id
    assert data["status"] == "completed"
    assert analysis_id in data["report_url"]
    assert "summary" in data


@pytest.mark.asyncio
async def test_get_analysis_history(client):
    """GET /history returns historical analysis data."""
    response = await client.get("/history")
    assert response.status_code == 200
    data = response.json()
    assert "plot_id" in data
    assert isinstance(data["analyses"], list)
    assert len(data["analyses"]) > 0
    assert "trend" in data
    # Each analysis entry has expected keys
    for entry in data["analyses"]:
        assert "analysis_id" in entry
        assert "date" in entry
        assert "health_score" in entry
