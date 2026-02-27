"""Harvest Shakti - Harvest timing optimization and yield estimation service."""

from contextlib import asynccontextmanager
from datetime import date, datetime, timedelta, timezone
from enum import Enum
from typing import Optional

import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.shared.auth.router import router as auth_router
from services.shared.db.session import close_db, init_db

# ---------------------------------------------------------------------------
# Crop yield reference database
# ---------------------------------------------------------------------------

CROP_YIELD_DATA: dict[str, dict] = {
    "wheat": {
        "avg_yield_tonnes_per_ha": 3.5,
        "max_yield_tonnes_per_ha": 6.0,
        "growth_duration_days": 120,
        "optimal_temp_range": (15, 25),
        "water_requirement_mm": 450,
        "msp_per_quintal": 2275,
        "stages": {
            "sowing": 0,
            "tillering": 25,
            "jointing": 50,
            "heading": 70,
            "grain_filling": 90,
            "maturity": 115,
        },
    },
    "rice": {
        "avg_yield_tonnes_per_ha": 4.0,
        "max_yield_tonnes_per_ha": 7.5,
        "growth_duration_days": 130,
        "optimal_temp_range": (22, 32),
        "water_requirement_mm": 1200,
        "msp_per_quintal": 2183,
        "stages": {
            "sowing": 0,
            "seedling": 20,
            "tillering": 40,
            "panicle_initiation": 65,
            "flowering": 90,
            "grain_filling": 105,
            "maturity": 125,
        },
    },
    "cotton": {
        "avg_yield_tonnes_per_ha": 1.8,
        "max_yield_tonnes_per_ha": 3.5,
        "growth_duration_days": 180,
        "optimal_temp_range": (21, 30),
        "water_requirement_mm": 700,
        "msp_per_quintal": 6620,
        "stages": {
            "sowing": 0,
            "emergence": 10,
            "squaring": 45,
            "flowering": 70,
            "boll_development": 100,
            "boll_opening": 140,
            "maturity": 175,
        },
    },
    "maize": {
        "avg_yield_tonnes_per_ha": 3.0,
        "max_yield_tonnes_per_ha": 5.5,
        "growth_duration_days": 100,
        "optimal_temp_range": (18, 27),
        "water_requirement_mm": 500,
        "msp_per_quintal": 2090,
        "stages": {
            "sowing": 0,
            "emergence": 7,
            "vegetative": 25,
            "tasseling": 55,
            "silking": 60,
            "grain_filling": 75,
            "maturity": 95,
        },
    },
    "sugarcane": {
        "avg_yield_tonnes_per_ha": 70.0,
        "max_yield_tonnes_per_ha": 120.0,
        "growth_duration_days": 360,
        "optimal_temp_range": (20, 35),
        "water_requirement_mm": 2000,
        "msp_per_quintal": 315,
        "stages": {
            "sowing": 0,
            "germination": 30,
            "tillering": 90,
            "grand_growth": 180,
            "maturity_phase": 300,
            "maturity": 355,
        },
    },
}

# ---------------------------------------------------------------------------
# Enums & Pydantic models
# ---------------------------------------------------------------------------


class IrrigationType(str, Enum):
    drip = "drip"
    sprinkler = "sprinkler"
    flood = "flood"
    rainfed = "rainfed"


class PestPressure(str, Enum):
    none = "none"
    low = "low"
    medium = "medium"
    high = "high"


# --- Request bodies / query helpers ---


class PlotRegistration(BaseModel):
    plot_id: str = Field(..., description="Unique identifier for the plot")
    crop: str = Field(
        ..., description="Crop name (wheat, rice, cotton, maize, sugarcane)"
    )
    variety: str = Field("", description="Crop variety")
    area_hectares: float = Field(..., gt=0, description="Plot area in hectares")
    sowing_date: date = Field(..., description="Date of sowing (YYYY-MM-DD)")
    soil_health_score: float = Field(
        75.0, ge=0, le=100, description="Soil health score (0-100)"
    )
    irrigation_type: IrrigationType = Field(
        IrrigationType.flood, description="Type of irrigation"
    )
    region: str = Field("", description="Region / district name")


# --- Response models ---


class ConfidenceInterval(BaseModel):
    low_tonnes: float
    high_tonnes: float


class YieldFactors(BaseModel):
    soil_health_factor: float
    weather_factor: float
    irrigation_factor: float
    pest_factor: float
    combined_factor: float


class YieldEstimateResponse(BaseModel):
    plot_id: str
    crop: str
    variety: str
    area_hectares: float
    base_yield_tonnes: float
    estimated_yield_tonnes: float
    yield_per_hectare_tonnes: float
    confidence_interval: ConfidenceInterval
    factors: YieldFactors
    weather_score: float
    pest_pressure: str
    estimated_at: str


class HarvestWindowDetail(BaseModel):
    start: str
    end: str
    best_date: str


class WeatherRisk(BaseModel):
    rain_probability_pct: float
    heatwave_risk: str
    frost_risk: str


class HarvestWindowResponse(BaseModel):
    plot_id: str
    crop: str
    sowing_date: str
    expected_maturity_date: str
    days_to_maturity: int
    current_growth_stage: str
    growth_progress_pct: float
    optimal_harvest_window: HarvestWindowDetail
    weather_risk: WeatherRisk
    recommendation: str


class MandiInfo(BaseModel):
    name: str
    price_per_quintal: float
    distance_km: float


class MarketTimingResponse(BaseModel):
    crop: str
    region: str
    current_msp_per_quintal: float
    current_market_price_per_quintal: float
    price_trend: str
    price_trend_pct: float
    recommendation: str
    nearby_mandis: list[MandiInfo]
    storage_advisory: str
    generated_at: str


class PlotRegistrationResponse(BaseModel):
    message: str
    plot_id: str
    crop: str
    area_hectares: float
    expected_maturity_date: str


# ---------------------------------------------------------------------------
# In-memory plot store
# ---------------------------------------------------------------------------

_plot_store: dict[str, PlotRegistration] = {}

# ---------------------------------------------------------------------------
# Irrigation & pest multiplier look-ups
# ---------------------------------------------------------------------------

IRRIGATION_FACTOR: dict[str, float] = {
    "drip": 1.15,
    "sprinkler": 1.05,
    "flood": 0.90,
    "rainfed": 0.80,
}

PEST_FACTOR: dict[str, float] = {
    "none": 1.0,
    "low": 0.95,
    "medium": 0.85,
    "high": 0.65,
}

# Seasonal monthly heuristics (index 0 = Jan, 11 = Dec)
MONTHLY_RAIN_PROB: list[float] = [10, 12, 18, 25, 35, 55, 75, 72, 55, 30, 12, 8]
MONTHLY_HEATWAVE_RISK: list[str] = [
    "low",
    "low",
    "medium",
    "high",
    "high",
    "high",
    "medium",
    "medium",
    "low",
    "low",
    "low",
    "low",
]
MONTHLY_FROST_RISK: list[str] = [
    "high",
    "medium",
    "low",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "none",
    "low",
    "high",
]
# Price seasonality factor by month (rough heuristic)
MONTHLY_PRICE_FACTOR: list[float] = [
    1.02,
    1.00,
    0.97,
    0.95,
    0.96,
    0.98,
    1.00,
    1.02,
    1.04,
    1.05,
    1.06,
    1.04,
]

# Regional mandi templates (used for generating nearby mandis)
REGION_MANDIS: dict[str, list[str]] = {
    "default": ["District Mandi", "Taluka Mandi", "APMC Yard", "State Mandi"],
    "punjab": ["Khanna Mandi", "Ludhiana Mandi", "Amritsar Mandi", "Jalandhar Mandi"],
    "haryana": ["Karnal Mandi", "Panipat Mandi", "Hisar Mandi", "Sirsa Mandi"],
    "uttar pradesh": ["Lucknow Mandi", "Agra Mandi", "Kanpur Mandi", "Meerut Mandi"],
    "maharashtra": ["Pune Mandi", "Nagpur Mandi", "Nashik Mandi", "Aurangabad Mandi"],
    "madhya pradesh": [
        "Indore Mandi",
        "Bhopal Mandi",
        "Jabalpur Mandi",
        "Ujjain Mandi",
    ],
}


# ---------------------------------------------------------------------------
# Helper utilities
# ---------------------------------------------------------------------------


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def _get_current_stage(crop_data: dict, days_since_sowing: int) -> str:
    """Return the growth stage the crop is currently in."""
    stages = crop_data["stages"]
    current_stage = "sowing"
    for stage_name, start_day in sorted(stages.items(), key=lambda x: x[1]):
        if days_since_sowing >= start_day:
            current_stage = stage_name
    return current_stage


def _get_mandis_for_region(region: str) -> list[str]:
    """Return mandi names for a region (case-insensitive), fallback to default."""
    key = region.lower().strip()
    for region_key, mandis in REGION_MANDIS.items():
        if region_key in key or key in region_key:
            return mandis
    return REGION_MANDIS["default"]


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize and cleanup resources."""
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Harvest Shakti",
    description="Harvest timing optimization and yield estimation",
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

# Router already carries prefix="/auth" — do NOT add prefix again.
app.include_router(auth_router)


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "service": "harvest_shakti",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "Harvest Shakti",
        "version": "1.0.0",
        "features": [
            "Optimal harvest window prediction",
            "Yield estimation using remote sensing",
            "Post-harvest loss risk assessment",
            "Market-aware harvest scheduling",
        ],
    }


# ---- Register Plot -------------------------------------------------------


@app.post(
    "/register-plot",
    response_model=PlotRegistrationResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register_plot(body: PlotRegistration):
    """Register a new agricultural plot for tracking."""
    crop_key = body.crop.lower().strip()
    if crop_key not in CROP_YIELD_DATA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported crop '{body.crop}'. Supported: {list(CROP_YIELD_DATA.keys())}",
        )

    # Normalise crop name before storing
    stored = body.model_copy(update={"crop": crop_key})
    _plot_store[body.plot_id] = stored

    crop_data = CROP_YIELD_DATA[crop_key]
    maturity_date = body.sowing_date + timedelta(days=crop_data["growth_duration_days"])

    return PlotRegistrationResponse(
        message="Plot registered successfully",
        plot_id=body.plot_id,
        crop=crop_key,
        area_hectares=body.area_hectares,
        expected_maturity_date=maturity_date.isoformat(),
    )


# ---- Yield Estimate -------------------------------------------------------


@app.get("/yield-estimate/{plot_id}", response_model=YieldEstimateResponse)
async def estimate_yield(
    plot_id: str,
    weather_score: float = Query(
        default=70.0, ge=0, le=100, description="Weather favorability score (0-100)"
    ),
    pest_pressure: PestPressure = Query(
        default=PestPressure.none, description="Pest pressure level"
    ),
):
    """Estimate crop yield for a registered plot with real computation."""
    if plot_id not in _plot_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plot '{plot_id}' not found. Register it first via POST /register-plot.",
        )

    plot = _plot_store[plot_id]
    crop_data = CROP_YIELD_DATA[plot.crop]

    # Base yield
    avg_yield = crop_data["avg_yield_tonnes_per_ha"]
    base_yield = avg_yield * plot.area_hectares

    # Multipliers
    soil_factor = _clamp(plot.soil_health_score / 75.0, 0.6, 1.3)
    weather_factor = _clamp(weather_score / 75.0, 0.5, 1.2)
    irr_factor = IRRIGATION_FACTOR.get(plot.irrigation_type.value, 0.90)
    pest_factor = PEST_FACTOR.get(pest_pressure.value, 1.0)

    combined = soil_factor * weather_factor * irr_factor * pest_factor
    estimated_yield = base_yield * combined
    yield_per_ha = estimated_yield / plot.area_hectares if plot.area_hectares else 0.0

    # Confidence interval: use numpy normal approximation (±12 % at 90 % CI)
    rng = np.random.default_rng(seed=hash(plot_id) & 0xFFFFFFFF)
    cv = 0.12  # coefficient of variation
    std_dev = estimated_yield * cv
    z_90 = 1.645  # z-score for 90 % CI
    noise = rng.normal(0, std_dev * 0.05)  # tiny stochastic nudge
    low = round(max(0.0, estimated_yield - z_90 * std_dev + noise), 2)
    high = round(estimated_yield + z_90 * std_dev + noise, 2)

    return YieldEstimateResponse(
        plot_id=plot_id,
        crop=plot.crop,
        variety=plot.variety,
        area_hectares=plot.area_hectares,
        base_yield_tonnes=round(base_yield, 2),
        estimated_yield_tonnes=round(estimated_yield, 2),
        yield_per_hectare_tonnes=round(yield_per_ha, 2),
        confidence_interval=ConfidenceInterval(low_tonnes=low, high_tonnes=high),
        factors=YieldFactors(
            soil_health_factor=round(soil_factor, 4),
            weather_factor=round(weather_factor, 4),
            irrigation_factor=round(irr_factor, 4),
            pest_factor=round(pest_factor, 4),
            combined_factor=round(combined, 4),
        ),
        weather_score=weather_score,
        pest_pressure=pest_pressure.value,
        estimated_at=datetime.now(timezone.utc).isoformat(),
    )


# ---- Harvest Window -------------------------------------------------------


@app.get("/harvest-window/{plot_id}", response_model=HarvestWindowResponse)
async def get_harvest_window(plot_id: str):
    """Compute the optimal harvest window for a registered plot."""
    if plot_id not in _plot_store:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Plot '{plot_id}' not found. Register it first via POST /register-plot.",
        )

    plot = _plot_store[plot_id]
    crop_data = CROP_YIELD_DATA[plot.crop]
    growth_days = crop_data["growth_duration_days"]

    today = date.today()
    days_since_sowing = (today - plot.sowing_date).days
    expected_maturity = plot.sowing_date + timedelta(days=growth_days)
    days_to_maturity = (expected_maturity - today).days

    # Current growth stage
    current_stage = _get_current_stage(crop_data, days_since_sowing)
    progress_pct = _clamp((days_since_sowing / growth_days) * 100, 0, 100)

    # Harvest window: a range around the maturity date
    window_half = 3  # ±3 days
    window_start = expected_maturity - timedelta(days=window_half)
    window_end = expected_maturity + timedelta(days=window_half + 1)
    best_date = expected_maturity

    # Weather risk heuristic based on the expected maturity month
    mat_month_idx = expected_maturity.month - 1  # 0-indexed
    rain_prob = MONTHLY_RAIN_PROB[mat_month_idx]
    heatwave = MONTHLY_HEATWAVE_RISK[mat_month_idx]
    frost = MONTHLY_FROST_RISK[mat_month_idx]

    # Build recommendation
    parts: list[str] = []
    if days_to_maturity > 0:
        parts.append(
            f"Crop is in the '{current_stage}' stage with ~{days_to_maturity} days to maturity."
        )
        parts.append(
            f"Plan harvest around {best_date.isoformat()}. "
            f"Arrange labor and machinery by {(window_start - timedelta(days=3)).isoformat()}."
        )
    elif days_to_maturity <= 0:
        parts.append("Crop has reached or passed maturity — harvest immediately.")

    if rain_prob > 40:
        parts.append(
            f"High rain probability ({rain_prob}%) around harvest. Consider early harvest to avoid losses."
        )
    if heatwave in ("high",):
        parts.append(
            "Heatwave risk is high — harvest in early morning or late evening."
        )
    if frost in ("high", "medium"):
        parts.append("Frost risk detected — monitor night temperatures closely.")

    return HarvestWindowResponse(
        plot_id=plot_id,
        crop=plot.crop,
        sowing_date=plot.sowing_date.isoformat(),
        expected_maturity_date=expected_maturity.isoformat(),
        days_to_maturity=days_to_maturity,
        current_growth_stage=current_stage,
        growth_progress_pct=round(progress_pct, 1),
        optimal_harvest_window=HarvestWindowDetail(
            start=window_start.isoformat(),
            end=window_end.isoformat(),
            best_date=best_date.isoformat(),
        ),
        weather_risk=WeatherRisk(
            rain_probability_pct=rain_prob,
            heatwave_risk=heatwave,
            frost_risk=frost,
        ),
        recommendation=" ".join(parts),
    )


# ---- Market Timing --------------------------------------------------------


@app.get("/market-timing", response_model=MarketTimingResponse)
async def get_market_timing(
    crop: str = Query(..., description="Crop name"),
    region: Optional[str] = Query(default="", description="Region or state name"),
):
    """Return market intelligence with simulated pricing data."""
    crop_key = crop.lower().strip()
    if crop_key not in CROP_YIELD_DATA:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported crop '{crop}'. Supported: {list(CROP_YIELD_DATA.keys())}",
        )

    crop_data = CROP_YIELD_DATA[crop_key]
    msp = crop_data["msp_per_quintal"]

    # Deterministic-ish random based on crop + current month for reproducibility
    today = date.today()
    seed = hash((crop_key, today.year, today.month)) & 0xFFFFFFFF
    rng = np.random.default_rng(seed=seed)

    # Simulate market price: MSP * random factor [0.95, 1.25]
    price_factor = float(rng.uniform(0.95, 1.25))
    market_price = round(msp * price_factor, 2)

    # Seasonal price trend
    month_idx = today.month - 1
    seasonal_factor = MONTHLY_PRICE_FACTOR[month_idx]
    prev_month_factor = MONTHLY_PRICE_FACTOR[(month_idx - 1) % 12]
    trend_pct = round(
        (seasonal_factor - prev_month_factor) / prev_month_factor * 100, 2
    )

    if trend_pct > 1.0:
        price_trend = "rising"
    elif trend_pct < -1.0:
        price_trend = "falling"
    else:
        price_trend = "stable"

    # Recommendation
    if price_trend == "rising" and market_price > msp:
        recommendation = "hold"
        storage_advisory = (
            f"Prices are trending upward ({trend_pct:+.1f}% month-over-month). "
            "Consider storing for 2-4 weeks for better returns if storage is available."
        )
    elif market_price < msp:
        recommendation = "hold"
        storage_advisory = (
            f"Market price (₹{market_price}/q) is below MSP (₹{msp}/q). "
            "Sell at government procurement centers or store until prices recover."
        )
    else:
        recommendation = "sell"
        storage_advisory = (
            f"Market price (₹{market_price}/q) is above MSP. "
            "Good time to sell. Avoid prolonged storage to reduce post-harvest losses."
        )

    # Nearby mandis
    region_str = region or ""
    mandi_names = _get_mandis_for_region(region_str)
    mandis: list[MandiInfo] = []
    for i, name in enumerate(mandi_names):
        mandi_price = round(float(market_price * rng.uniform(0.96, 1.04)), 2)
        distance = round(float(rng.uniform(8, 60)), 1)
        mandis.append(
            MandiInfo(name=name, price_per_quintal=mandi_price, distance_km=distance)
        )

    # Sort mandis by price descending so best price is first
    mandis.sort(key=lambda m: m.price_per_quintal, reverse=True)

    return MarketTimingResponse(
        crop=crop_key,
        region=region_str,
        current_msp_per_quintal=msp,
        current_market_price_per_quintal=market_price,
        price_trend=price_trend,
        price_trend_pct=trend_pct,
        recommendation=recommendation,
        nearby_mandis=mandis,
        storage_advisory=storage_advisory,
        generated_at=datetime.now(timezone.utc).isoformat(),
    )


# ---------------------------------------------------------------------------
# Dev entry-point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    uvicorn.run(
        "services.harvest_shakti.app:app", host="0.0.0.0", port=8005, reload=True
    )
