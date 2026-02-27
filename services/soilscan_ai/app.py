"""
SoilScan AI - AI-powered soil analysis service.

Provides real-time soil health scoring, nutrient deficiency analysis,
and fertilizer recommendations based on NPK levels, pH, organic carbon,
and moisture readings.  All scoring uses numpy for vectorised math.
Results are stored in-memory so that reports and history can be retrieved
without an external database.
"""

from __future__ import annotations

import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Literal

import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.shared.auth.router import router as auth_router
from services.shared.db.session import close_db, init_db

# ---------------------------------------------------------------------------
# In-memory analysis store
# ---------------------------------------------------------------------------
# Keyed by analysis_id (str) → SoilAnalysisResult dict.
# Thread-safe for the single-process uvicorn case; for multi-worker
# deployments swap this out for Redis / a database table.
_analysis_store: dict[str, dict] = {}

# ---------------------------------------------------------------------------
# Optimal ranges & weights for soil health scoring
# ---------------------------------------------------------------------------
# Each tuple is (low, high) of the ideal range.
_OPTIMAL_RANGES: dict[str, tuple[float, float]] = {
    "ph": (6.5, 7.0),
    "nitrogen_ppm": (250.0, 500.0),
    "phosphorus_ppm": (15.0, 30.0),
    "potassium_ppm": (120.0, 250.0),
    "organic_carbon_pct": (0.75, 1.5),
    "moisture_pct": (20.0, 40.0),
}

_WEIGHTS: dict[str, float] = {
    "ph": 0.15,
    "nitrogen_ppm": 0.20,
    "phosphorus_ppm": 0.15,
    "potassium_ppm": 0.15,
    "organic_carbon_pct": 0.20,
    "moisture_pct": 0.15,
}

# Fertility classification thresholds
_FERTILITY_THRESHOLDS: list[tuple[float, str]] = [
    (80.0, "excellent"),
    (65.0, "good"),
    (40.0, "moderate"),
    (0.0, "poor"),
]


# ===================================================================
# Pydantic request / response schemas
# ===================================================================


class SoilSampleRequest(BaseModel):
    """Input payload for a single soil sample analysis."""

    plot_id: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    nitrogen_ppm: float = Field(ge=0, description="Nitrogen in parts per million")
    phosphorus_ppm: float = Field(ge=0, description="Phosphorus in parts per million")
    potassium_ppm: float = Field(ge=0, description="Potassium in parts per million")
    ph_level: float = Field(ge=0, le=14, description="Soil pH level")
    organic_carbon_pct: float = Field(
        ge=0, le=100, description="Organic carbon percentage"
    )
    moisture_pct: float = Field(ge=0, le=100, description="Soil moisture percentage")
    temperature_celsius: float | None = None
    soil_type: str | None = None  # e.g. "alluvial", "black", "red", "laterite"


class Recommendation(BaseModel):
    """A single actionable recommendation."""

    nutrient: str
    status: Literal["deficient", "optimal", "excess"]
    message: str


class SoilAnalysisResponse(BaseModel):
    """Full result returned after analysis."""

    analysis_id: str
    plot_id: str
    latitude: float
    longitude: float
    soil_type: str | None
    temperature_celsius: float | None

    # Raw readings echoed back for convenience
    nitrogen_ppm: float
    phosphorus_ppm: float
    potassium_ppm: float
    ph_level: float
    organic_carbon_pct: float
    moisture_pct: float

    # Computed scores (each 0-100)
    ph_score: float
    nitrogen_score: float
    phosphorus_score: float
    potassium_score: float
    organic_carbon_score: float
    moisture_score: float

    # Aggregate
    health_score: float
    fertility_class: Literal["poor", "moderate", "good", "excellent"]

    recommendations: list[Recommendation]
    analyzed_at: str  # ISO-8601 timestamp


class HistoryEntry(BaseModel):
    """Condensed view of a past analysis for the history endpoint."""

    analysis_id: str
    date: str
    health_score: float
    fertility_class: str


class HistoryResponse(BaseModel):
    """Response for the GET /history endpoint."""

    plot_id: str
    analyses: list[HistoryEntry]
    trend: Literal["improving", "stable", "declining", "insufficient_data"]


class BatchAnalyzeRequest(BaseModel):
    """Wrapper for batch analysis."""

    samples: list[SoilSampleRequest]


class BatchAnalyzeResponse(BaseModel):
    """Wrapper for batch analysis results."""

    results: list[SoilAnalysisResponse]
    count: int


# ===================================================================
# Scoring helpers (numpy-based)
# ===================================================================


def _range_score(value: float, low: float, high: float) -> float:
    """
    Score a value against an optimal [low, high] range.

    Returns 100 when the value sits inside the range.  Outside the
    range the score decays following a Gaussian-like curve so that
    values far from optimal score close to 0.

    The decay width (sigma) is set to half the range width, giving a
    reasonable falloff for agricultural metrics.
    """
    if low <= value <= high:
        return 100.0

    midpoint = (low + high) / 2.0
    sigma = max((high - low) / 2.0, 1e-6)  # avoid division by zero

    # Distance from nearest edge of the optimal range
    if value < low:
        distance = low - value
    else:
        distance = value - high

    # Gaussian decay from 100
    score = float(100.0 * np.exp(-0.5 * (distance / sigma) ** 2))
    return round(score, 2)


def _classify_fertility(score: float) -> str:
    """Map a 0-100 health score to a fertility class string."""
    for threshold, label in _FERTILITY_THRESHOLDS:
        if score >= threshold:
            return label
    return "poor"  # fallback


def _nutrient_status(
    value: float, low: float, high: float
) -> Literal["deficient", "optimal", "excess"]:
    """Classify a nutrient value relative to its optimal range."""
    if value < low:
        return "deficient"
    if value > high:
        return "excess"
    return "optimal"


def _build_recommendations(sample: SoilSampleRequest) -> list[Recommendation]:
    """Generate actionable recommendations from nutrient readings."""
    recs: list[Recommendation] = []

    # --- Nitrogen ---
    n_status = _nutrient_status(sample.nitrogen_ppm, 250.0, 500.0)
    if n_status == "deficient":
        recs.append(
            Recommendation(
                nutrient="nitrogen",
                status="deficient",
                message=(
                    f"Nitrogen is low at {sample.nitrogen_ppm:.1f} ppm (optimal 250-500 ppm). "
                    "Apply urea or ammonium sulphate, or rotate with nitrogen-fixing legumes."
                ),
            )
        )
    elif n_status == "excess":
        recs.append(
            Recommendation(
                nutrient="nitrogen",
                status="excess",
                message=(
                    f"Nitrogen is high at {sample.nitrogen_ppm:.1f} ppm. "
                    "Reduce nitrogenous fertilizer to avoid leaf burn and groundwater contamination."
                ),
            )
        )
    else:
        recs.append(
            Recommendation(
                nutrient="nitrogen",
                status="optimal",
                message="Nitrogen levels are within the optimal range.",
            )
        )

    # --- Phosphorus ---
    p_status = _nutrient_status(sample.phosphorus_ppm, 15.0, 30.0)
    if p_status == "deficient":
        recs.append(
            Recommendation(
                nutrient="phosphorus",
                status="deficient",
                message=(
                    f"Phosphorus is low at {sample.phosphorus_ppm:.1f} ppm (optimal 15-30 ppm). "
                    "Apply single super phosphate (SSP) or DAP."
                ),
            )
        )
    elif p_status == "excess":
        recs.append(
            Recommendation(
                nutrient="phosphorus",
                status="excess",
                message=(
                    f"Phosphorus is high at {sample.phosphorus_ppm:.1f} ppm. "
                    "Avoid further phosphatic fertilizer to prevent nutrient lock-out."
                ),
            )
        )
    else:
        recs.append(
            Recommendation(
                nutrient="phosphorus",
                status="optimal",
                message="Phosphorus levels are within the optimal range.",
            )
        )

    # --- Potassium ---
    k_status = _nutrient_status(sample.potassium_ppm, 120.0, 250.0)
    if k_status == "deficient":
        recs.append(
            Recommendation(
                nutrient="potassium",
                status="deficient",
                message=(
                    f"Potassium is low at {sample.potassium_ppm:.1f} ppm (optimal 120-250 ppm). "
                    "Apply muriate of potash (MOP) or sulphate of potash."
                ),
            )
        )
    elif k_status == "excess":
        recs.append(
            Recommendation(
                nutrient="potassium",
                status="excess",
                message=(
                    f"Potassium is high at {sample.potassium_ppm:.1f} ppm. "
                    "Reduce potassium inputs; excess K can inhibit magnesium uptake."
                ),
            )
        )
    else:
        recs.append(
            Recommendation(
                nutrient="potassium",
                status="optimal",
                message="Potassium levels are within the optimal range.",
            )
        )

    # --- pH ---
    if sample.ph_level < 6.5:
        recs.append(
            Recommendation(
                nutrient="ph",
                status="deficient",
                message=(
                    f"Soil pH is acidic at {sample.ph_level:.1f} (optimal 6.5-7.0). "
                    "Apply agricultural lime to raise pH."
                ),
            )
        )
    elif sample.ph_level > 7.0:
        recs.append(
            Recommendation(
                nutrient="ph",
                status="excess",
                message=(
                    f"Soil pH is alkaline at {sample.ph_level:.1f} (optimal 6.5-7.0). "
                    "Apply gypsum or sulphur to lower pH."
                ),
            )
        )
    else:
        recs.append(
            Recommendation(
                nutrient="ph",
                status="optimal",
                message="Soil pH is within the ideal range.",
            )
        )

    # --- Organic carbon ---
    if sample.organic_carbon_pct < 0.75:
        recs.append(
            Recommendation(
                nutrient="organic_carbon",
                status="deficient",
                message=(
                    f"Organic carbon is low at {sample.organic_carbon_pct:.2f}% (target ≥0.75%). "
                    "Incorporate compost, green manure, or crop residues."
                ),
            )
        )
    else:
        recs.append(
            Recommendation(
                nutrient="organic_carbon",
                status="optimal",
                message="Organic carbon levels are adequate.",
            )
        )

    # --- Moisture ---
    if sample.moisture_pct < 20.0:
        recs.append(
            Recommendation(
                nutrient="moisture",
                status="deficient",
                message=(
                    f"Soil moisture is low at {sample.moisture_pct:.1f}% (optimal 20-40%). "
                    "Increase irrigation frequency or apply mulch to retain moisture."
                ),
            )
        )
    elif sample.moisture_pct > 40.0:
        recs.append(
            Recommendation(
                nutrient="moisture",
                status="excess",
                message=(
                    f"Soil moisture is high at {sample.moisture_pct:.1f}% (optimal 20-40%). "
                    "Improve drainage to prevent waterlogging and root rot."
                ),
            )
        )
    else:
        recs.append(
            Recommendation(
                nutrient="moisture",
                status="optimal",
                message="Soil moisture is within the optimal range.",
            )
        )

    return recs


def _run_analysis(sample: SoilSampleRequest) -> SoilAnalysisResponse:
    """
    Core analysis pipeline.

    1. Compute individual metric scores using numpy.
    2. Compute weighted aggregate health score.
    3. Classify fertility.
    4. Generate recommendations.
    5. Persist in the in-memory store.
    """
    analysis_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # --- Individual scores ---
    values = np.array(
        [
            sample.ph_level,
            sample.nitrogen_ppm,
            sample.phosphorus_ppm,
            sample.potassium_ppm,
            sample.organic_carbon_pct,
            sample.moisture_pct,
        ]
    )

    keys = [
        "ph",
        "nitrogen_ppm",
        "phosphorus_ppm",
        "potassium_ppm",
        "organic_carbon_pct",
        "moisture_pct",
    ]

    scores: dict[str, float] = {}
    for key, val in zip(keys, values):
        low, high = _OPTIMAL_RANGES[key]
        scores[key] = _range_score(float(val), low, high)

    # --- Weighted aggregate ---
    weights = np.array([_WEIGHTS[k] for k in keys])
    score_arr = np.array([scores[k] for k in keys])
    health_score = float(np.dot(weights, score_arr))
    health_score = round(np.clip(health_score, 0.0, 100.0), 2)

    fertility_class = _classify_fertility(health_score)
    recommendations = _build_recommendations(sample)

    result = SoilAnalysisResponse(
        analysis_id=analysis_id,
        plot_id=sample.plot_id,
        latitude=sample.latitude,
        longitude=sample.longitude,
        soil_type=sample.soil_type,
        temperature_celsius=sample.temperature_celsius,
        nitrogen_ppm=sample.nitrogen_ppm,
        phosphorus_ppm=sample.phosphorus_ppm,
        potassium_ppm=sample.potassium_ppm,
        ph_level=sample.ph_level,
        organic_carbon_pct=sample.organic_carbon_pct,
        moisture_pct=sample.moisture_pct,
        ph_score=scores["ph"],
        nitrogen_score=scores["nitrogen_ppm"],
        phosphorus_score=scores["phosphorus_ppm"],
        potassium_score=scores["potassium_ppm"],
        organic_carbon_score=scores["organic_carbon_pct"],
        moisture_score=scores["moisture_pct"],
        health_score=health_score,
        fertility_class=fertility_class,
        recommendations=recommendations,
        analyzed_at=now,
    )

    # Persist for later retrieval via /report and /history
    _analysis_store[analysis_id] = result.model_dump()

    return result


# ===================================================================
# Trend calculation
# ===================================================================


def _compute_trend(scores: list[float]) -> str:
    """
    Determine the health-score trend for a series of analyses.

    Uses numpy linear regression (polyfit degree 1) on the score
    sequence.  A positive slope > 1 → improving, negative slope < -1
    → declining, otherwise stable.  Requires at least 2 data points.
    """
    if len(scores) < 2:
        return "insufficient_data"

    x = np.arange(len(scores), dtype=np.float64)
    y = np.array(scores, dtype=np.float64)
    slope, _ = np.polyfit(x, y, 1)

    if slope > 1.0:
        return "improving"
    if slope < -1.0:
        return "declining"
    return "stable"


# ===================================================================
# FastAPI application
# ===================================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize and cleanup resources."""
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="SoilScan AI",
    description="Analyzes soil health using satellite imagery and sensor data",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# The auth router already declares prefix="/auth" internally,
# so we include it WITHOUT an additional prefix to avoid /auth/auth.
app.include_router(auth_router, tags=["auth"])


# -------------------------------------------------------------------
# Health & root
# -------------------------------------------------------------------


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "service": "soilscan_ai",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "SoilScan AI",
        "version": "1.0.0",
        "features": [
            "Satellite imagery-based soil analysis",
            "IoT sensor data integration",
            "Soil nutrient profiling and recommendations",
            "Historical soil health trend tracking",
            "Batch analysis for multi-plot fields",
        ],
    }


# -------------------------------------------------------------------
# Analysis endpoints
# -------------------------------------------------------------------


@app.post(
    "/analyze", response_model=SoilAnalysisResponse, status_code=status.HTTP_201_CREATED
)
async def analyze_soil(sample: SoilSampleRequest):
    """
    Analyze a single soil sample.

    Computes a health score (0-100) from pH, NPK, organic carbon, and
    moisture readings, classifies fertility, and returns actionable
    recommendations.  The result is persisted in-memory so it can be
    retrieved later via ``GET /report/{analysis_id}``.
    """
    return _run_analysis(sample)


@app.post(
    "/batch-analyze",
    response_model=BatchAnalyzeResponse,
    status_code=status.HTTP_201_CREATED,
)
async def batch_analyze(body: BatchAnalyzeRequest):
    """
    Analyze multiple soil samples in one request.

    Useful for field-level analysis across several plots or grid
    points.  Each sample is processed independently and stored.
    """
    if not body.samples:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="At least one sample is required.",
        )

    results = [_run_analysis(s) for s in body.samples]
    return BatchAnalyzeResponse(results=results, count=len(results))


@app.get("/report/{analysis_id}", response_model=SoilAnalysisResponse)
async def get_report(analysis_id: str):
    """
    Retrieve a previously computed soil analysis report by its ID.

    Returns 404 if the analysis_id is not found in the in-memory store.
    """
    record = _analysis_store.get(analysis_id)
    if record is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis '{analysis_id}' not found.",
        )
    return record


@app.get("/history", response_model=HistoryResponse)
async def get_analysis_history(
    plot_id: str = Query(..., description="Plot ID to retrieve history for"),
):
    """
    Return all analyses for a given plot, sorted by timestamp descending.

    Also computes a trend indicator (improving / stable / declining)
    based on the health-score trajectory across analyses, using numpy
    linear regression.
    """
    # Collect all analyses matching this plot_id
    matching = [v for v in _analysis_store.values() if v["plot_id"] == plot_id]

    # Sort by analyzed_at descending (most recent first)
    matching.sort(key=lambda r: r["analyzed_at"], reverse=True)

    entries = [
        HistoryEntry(
            analysis_id=r["analysis_id"],
            date=r["analyzed_at"][:10],  # YYYY-MM-DD portion
            health_score=r["health_score"],
            fertility_class=r["fertility_class"],
        )
        for r in matching
    ]

    # Trend is computed on chronological order (oldest → newest)
    chronological_scores = [r["health_score"] for r in reversed(matching)]
    trend = _compute_trend(chronological_scores)

    return HistoryResponse(
        plot_id=plot_id,
        analyses=entries,
        trend=trend,
    )


# -------------------------------------------------------------------
# Entrypoint
# -------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run("services.soilscan_ai.app:app", host="0.0.0.0", port=8002, reload=True)
