"""
Integration tests for the SoilScan AI service.

These tests use httpx.ASGITransport to test the FastAPI app directly
without needing a running server or database. The SoilScan service uses
an in-memory store, so we can exercise the real endpoint logic.
"""

from contextlib import asynccontextmanager

import httpx
import pytest
from fastapi import FastAPI


# ---------------------------------------------------------------------------
# Sample payload matching SoilSampleRequest
# ---------------------------------------------------------------------------
SAMPLE_SOIL_REQUEST = {
    "plot_id": "test-plot-001",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "nitrogen_ppm": 45.0,
    "phosphorus_ppm": 22.0,
    "potassium_ppm": 180.0,
    "ph_level": 6.8,
    "organic_carbon_pct": 0.65,
    "moisture_pct": 35.0,
    "soil_type": "alluvial",
}


@pytest.fixture()
def soilscan_app():
    """Create the SoilScan app with DB lifecycle mocked out."""
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


# ---------------------------------------------------------------------------
# Tests
# ---------------------------------------------------------------------------


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
    """POST /analyze accepts a SoilSampleRequest and returns analysis."""
    response = await client.post("/analyze", json=SAMPLE_SOIL_REQUEST)
    assert response.status_code == 201
    data = response.json()
    assert "analysis_id" in data
    assert data["plot_id"] == "test-plot-001"
    assert data["soil_type"] == "alluvial"
    assert isinstance(data["ph_level"], (int, float))
    assert 0 <= data["ph_level"] <= 14
    assert isinstance(data["health_score"], (int, float))
    assert 0 <= data["health_score"] <= 100
    assert isinstance(data["recommendations"], list)
    assert len(data["recommendations"]) > 0


@pytest.mark.asyncio
async def test_analyze_soil_missing_body_returns_422(client):
    """POST /analyze without a body returns 422 Unprocessable Entity."""
    response = await client.post("/analyze")
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_get_report(client):
    """GET /report/{id} returns the analysis for an ID that exists."""
    # First, create an analysis so the in-memory store has data
    create_resp = await client.post("/analyze", json=SAMPLE_SOIL_REQUEST)
    assert create_resp.status_code == 201
    analysis_id = create_resp.json()["analysis_id"]

    # Now retrieve the report
    response = await client.get(f"/report/{analysis_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["analysis_id"] == analysis_id
    assert data["plot_id"] == "test-plot-001"
    assert isinstance(data["health_score"], (int, float))
    assert isinstance(data["recommendations"], list)


@pytest.mark.asyncio
async def test_get_report_not_found(client):
    """GET /report/{id} returns 404 for a non-existent analysis ID."""
    response = await client.get("/report/nonexistent-id")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_get_analysis_history(client):
    """GET /history returns historical analyses for a plot."""
    # Create two analyses for the same plot to populate the store
    await client.post("/analyze", json=SAMPLE_SOIL_REQUEST)
    await client.post("/analyze", json=SAMPLE_SOIL_REQUEST)

    response = await client.get("/history", params={"plot_id": "test-plot-001"})
    assert response.status_code == 200
    data = response.json()
    assert data["plot_id"] == "test-plot-001"
    assert isinstance(data["analyses"], list)
    assert len(data["analyses"]) >= 2
    assert "trend" in data
    # Each analysis entry has expected keys
    for entry in data["analyses"]:
        assert "analysis_id" in entry
        assert "date" in entry
        assert "health_score" in entry


@pytest.mark.asyncio
async def test_get_analysis_history_missing_plot_id_returns_422(client):
    """GET /history without plot_id query param returns 422."""
    response = await client.get("/history")
    assert response.status_code == 422
