"""Jal Shakti - Smart irrigation and water resource management service.

Implements:
- Penman-Monteith reference evapotranspiration (ET0) calculation
- Crop water requirement estimation with crop coefficients (Kc)
- 7-day irrigation scheduling per plot
- Water usage analytics with efficiency metrics
- Simulated sensor readings with realistic distributions
- In-memory plot registration
"""

from contextlib import asynccontextmanager
from datetime import datetime, date, timedelta, timezone
from enum import Enum
from typing import Optional
from uuid import uuid4

import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.shared.auth.router import router as auth_router
from services.shared.db.session import close_db, init_db

# ============================================================
# Constants & Crop Database
# ============================================================

CROP_WATER_REQUIREMENTS: dict[str, dict] = {
    "rice": {
        "kc_initial": 1.05,
        "kc_mid": 1.20,
        "kc_late": 0.75,
        "total_water_mm": 1200,
        "critical_stages": ["transplanting", "flowering"],
    },
    "wheat": {
        "kc_initial": 0.35,
        "kc_mid": 1.15,
        "kc_late": 0.25,
        "total_water_mm": 450,
        "critical_stages": ["crown_root_initiation", "flowering", "grain_filling"],
    },
    "cotton": {
        "kc_initial": 0.35,
        "kc_mid": 1.15,
        "kc_late": 0.70,
        "total_water_mm": 700,
        "critical_stages": ["flowering", "boll_formation"],
    },
    "maize": {
        "kc_initial": 0.30,
        "kc_mid": 1.20,
        "kc_late": 0.35,
        "total_water_mm": 500,
        "critical_stages": ["tasseling", "grain_filling"],
    },
    "sugarcane": {
        "kc_initial": 0.40,
        "kc_mid": 1.25,
        "kc_late": 0.75,
        "total_water_mm": 1500,
        "critical_stages": ["tillering", "grand_growth"],
    },
}

# Irrigation method efficiency (fraction of applied water that reaches roots)
IRRIGATION_EFFICIENCY: dict[str, float] = {
    "drip": 0.90,
    "sprinkler": 0.75,
    "flood": 0.60,
}

# Typical flow rates by method (litres per minute per hectare)
FLOW_RATES: dict[str, float] = {
    "drip": 40.0,
    "sprinkler": 80.0,
    "flood": 200.0,
}

# Soil field capacity and wilting point (volumetric %) by soil type
SOIL_PROPERTIES: dict[str, dict[str, float]] = {
    "clay": {"field_capacity": 42.0, "wilting_point": 22.0},
    "clay_loam": {"field_capacity": 36.0, "wilting_point": 18.0},
    "loam": {"field_capacity": 30.0, "wilting_point": 12.0},
    "sandy_loam": {"field_capacity": 22.0, "wilting_point": 8.0},
    "sand": {"field_capacity": 12.0, "wilting_point": 4.0},
}

# Monthly average climate defaults for a generic North-Indian plain region
# (temperature °C, humidity %, wind speed m/s, solar radiation MJ/m²/day)
MONTHLY_CLIMATE: dict[int, dict[str, float]] = {
    1: {"temp": 14.0, "humidity": 70.0, "wind": 1.2, "radiation": 10.5},
    2: {"temp": 17.0, "humidity": 60.0, "wind": 1.5, "radiation": 13.0},
    3: {"temp": 23.0, "humidity": 45.0, "wind": 1.8, "radiation": 17.0},
    4: {"temp": 30.0, "humidity": 30.0, "wind": 2.0, "radiation": 21.0},
    5: {"temp": 35.0, "humidity": 25.0, "wind": 2.5, "radiation": 23.0},
    6: {"temp": 34.0, "humidity": 55.0, "wind": 2.8, "radiation": 20.0},
    7: {"temp": 31.0, "humidity": 75.0, "wind": 2.2, "radiation": 16.0},
    8: {"temp": 30.0, "humidity": 80.0, "wind": 1.8, "radiation": 15.0},
    9: {"temp": 29.0, "humidity": 72.0, "wind": 1.5, "radiation": 17.0},
    10: {"temp": 26.0, "humidity": 55.0, "wind": 1.2, "radiation": 16.0},
    11: {"temp": 20.0, "humidity": 55.0, "wind": 1.0, "radiation": 12.5},
    12: {"temp": 15.0, "humidity": 65.0, "wind": 1.0, "radiation": 10.0},
}

# Monthly average effective rainfall (mm/day) – rough estimate
MONTHLY_EFFECTIVE_RAINFALL_MM_PER_DAY: dict[int, float] = {
    1: 0.5,
    2: 0.8,
    3: 0.4,
    4: 0.2,
    5: 0.3,
    6: 3.5,
    7: 7.0,
    8: 6.5,
    9: 4.0,
    10: 1.0,
    11: 0.2,
    12: 0.3,
}

# ============================================================
# In-memory stores
# ============================================================

# Registered plots keyed by plot_id
_plots: dict[str, dict] = {}

# Irrigation event log: list of dicts with plot_id, farm_id, date, water_mm, method
_irrigation_events: list[dict] = []

# ============================================================
# Enums
# ============================================================


class GrowthStage(str, Enum):
    initial = "initial"
    mid = "mid"
    late = "late"


class IrrigationMethod(str, Enum):
    drip = "drip"
    sprinkler = "sprinkler"
    flood = "flood"


class SoilType(str, Enum):
    clay = "clay"
    clay_loam = "clay_loam"
    loam = "loam"
    sandy_loam = "sandy_loam"
    sand = "sand"


# ============================================================
# Pydantic Models
# ============================================================


class PlotRegistration(BaseModel):
    """Body for POST /register-plot."""

    farm_id: str = Field(..., description="Farm identifier")
    crop: str = Field(..., description="Crop name (e.g. rice, wheat)")
    area_hectares: float = Field(..., gt=0, description="Plot area in hectares")
    soil_type: SoilType = Field(default=SoilType.loam, description="Soil type")
    irrigation_method: IrrigationMethod = Field(
        default=IrrigationMethod.flood, description="Irrigation method"
    )
    current_moisture_pct: float = Field(
        default=25.0, ge=0, le=100, description="Current soil moisture %"
    )
    latitude: Optional[float] = Field(
        default=28.6, description="Latitude (default: Delhi)"
    )
    longitude: Optional[float] = Field(
        default=77.2, description="Longitude (default: Delhi)"
    )


class PlotResponse(BaseModel):
    plot_id: str
    farm_id: str
    crop: str
    area_hectares: float
    soil_type: str
    irrigation_method: str
    current_moisture_pct: float
    registered_at: str


class ScheduleEntry(BaseModel):
    date: str
    time: str
    duration_minutes: float
    water_volume_liters: float
    water_depth_mm: float
    method: str
    is_critical: bool = False
    note: str = ""


class ScheduleResponse(BaseModel):
    plot_id: str
    crop: str
    growth_stage: str
    irrigation_method: str
    area_hectares: float
    et0_mm_per_day: float
    crop_coefficient_kc: float
    etc_mm_per_day: float
    effective_rainfall_mm_per_day: float
    net_irrigation_requirement_mm_per_day: float
    gross_irrigation_requirement_mm_per_day: float
    efficiency_pct: float
    schedule: list[ScheduleEntry]
    generated_at: str


class UsageByCrop(BaseModel):
    crop: str
    usage_liters: float
    area_hectares: float
    efficiency_pct: float


class UsageResponse(BaseModel):
    farm_id: str
    period_days: int
    total_usage_liters: float
    daily_average_liters: float
    efficiency_score: float
    savings_vs_flood_irrigation_pct: float
    breakdown_by_crop: list[UsageByCrop]
    event_count: int
    generated_at: str


class SensorReading(BaseModel):
    sensor_id: str
    type: str
    value: float
    unit: str
    status: str


class SensorResponse(BaseModel):
    plot_id: str
    sensors: list[SensorReading]
    irrigation_active: bool
    last_updated: str


# ============================================================
# Core: Penman-Monteith ET0 (FAO-56 simplified)
# ============================================================


def compute_et0(
    temp_c: float,
    humidity_pct: float,
    wind_speed_m_s: float,
    solar_radiation_mj: float,
    elevation_m: float = 200.0,
) -> float:
    """Compute reference evapotranspiration (ET0) in mm/day using the
    FAO-56 Penman-Monteith equation (simplified form).

    Parameters
    ----------
    temp_c : float
        Mean daily air temperature (°C).
    humidity_pct : float
        Mean daily relative humidity (%).
    wind_speed_m_s : float
        Wind speed at 2 m height (m/s).
    solar_radiation_mj : float
        Incoming solar radiation (MJ/m²/day).
    elevation_m : float
        Station elevation above sea level (m), default 200 m.

    Returns
    -------
    float
        Reference ET in mm/day.

    References
    ----------
    Allen, R.G. et al. (1998). FAO Irrigation and Drainage Paper 56.
    """
    T = float(temp_c)
    RH = float(humidity_pct)
    u2 = float(wind_speed_m_s)
    Rs = float(solar_radiation_mj)

    # Psychrometric constant (kPa/°C)
    # P ≈ 101.3 * ((293 - 0.0065*z) / 293)^5.26
    P = 101.3 * ((293.0 - 0.0065 * elevation_m) / 293.0) ** 5.26
    gamma = 0.000665 * P  # kPa/°C

    # Saturation vapour pressure (kPa)
    es = 0.6108 * np.exp((17.27 * T) / (T + 237.3))
    # Actual vapour pressure
    ea = es * (RH / 100.0)

    # Slope of saturation vapour pressure curve (kPa/°C)
    delta = (4098.0 * es) / ((T + 237.3) ** 2)

    # Net radiation approximation
    # Assume albedo = 0.23, and estimate net long-wave from Stefan-Boltzmann
    Rns = (1.0 - 0.23) * Rs  # net short-wave

    # Clear-sky solar radiation (approx.)
    Rso = (0.75 + 2e-5 * elevation_m) * _extraterrestrial_radiation(T)
    Rso = max(Rso, 0.1)  # safety

    # Net outgoing long-wave radiation (MJ/m²/day)
    sigma = 4.903e-9  # Stefan-Boltzmann constant (MJ/m²/day/K⁴)
    T_K = T + 273.16
    Rnl = (
        sigma
        * (T_K**4)
        * (0.34 - 0.14 * np.sqrt(ea))
        * (1.35 * min(Rs / Rso, 1.0) - 0.35)
    )

    Rn = Rns - Rnl  # net radiation (MJ/m²/day)

    # Soil heat flux ≈ 0 for daily time steps
    G = 0.0

    # FAO-56 Penman-Monteith equation
    numerator = 0.408 * delta * (Rn - G) + gamma * (900.0 / (T + 273.0)) * u2 * (
        es - ea
    )
    denominator = delta + gamma * (1.0 + 0.34 * u2)

    et0 = numerator / denominator
    return float(max(et0, 0.0))


def _extraterrestrial_radiation(temp_c: float) -> float:
    """Rough estimate of daily extraterrestrial radiation (Ra) in MJ/m²/day
    based on temperature proxy (Hargreaves approach placeholder).

    For a full implementation one would use Julian day + latitude.
    Here we use a simplified seasonal proxy.
    """
    # Approximate Ra between 15 and 40 MJ/m²/day linearly with temperature
    # (warmer months → higher Ra). This is a simplification.
    ra = np.interp(temp_c, [5.0, 45.0], [18.0, 42.0])
    return float(ra)


def get_crop_kc(crop: str, stage: GrowthStage) -> float:
    """Return the crop coefficient Kc for the given crop and growth stage."""
    crop_lower = crop.lower()
    if crop_lower not in CROP_WATER_REQUIREMENTS:
        # Fallback: generic crop
        mapping = {"initial": 0.40, "mid": 1.10, "late": 0.50}
        return mapping.get(stage.value, 1.0)
    info = CROP_WATER_REQUIREMENTS[crop_lower]
    key = f"kc_{stage.value}"
    return info.get(key, 1.0)


# ============================================================
# FastAPI Application
# ============================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize and cleanup resources."""
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Jal Shakti",
    description="Smart irrigation and water resource management",
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

# Auth router already declares prefix="/auth" internally — do NOT add prefix again.
app.include_router(auth_router)


# ============================================================
# Health & Root
# ============================================================


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "service": "jal_shakti",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "Jal Shakti",
        "version": "1.0.0",
        "features": [
            "Penman-Monteith ET0 evapotranspiration model",
            "Crop-coefficient-based irrigation scheduling",
            "Water usage analytics and efficiency metrics",
            "Simulated soil-moisture and flow sensors",
            "In-memory plot registration",
        ],
    }


# ============================================================
# POST /register-plot
# ============================================================


@app.post(
    "/register-plot", response_model=PlotResponse, status_code=status.HTTP_201_CREATED
)
async def register_plot(body: PlotRegistration):
    """Register a new plot so that schedule and sensor endpoints have context."""
    plot_id = f"plot-{uuid4().hex[:8]}"
    now = datetime.now(timezone.utc)
    record = {
        "plot_id": plot_id,
        "farm_id": body.farm_id,
        "crop": body.crop.lower(),
        "area_hectares": body.area_hectares,
        "soil_type": body.soil_type.value,
        "irrigation_method": body.irrigation_method.value,
        "current_moisture_pct": body.current_moisture_pct,
        "latitude": body.latitude,
        "longitude": body.longitude,
        "registered_at": now.isoformat(),
        "irrigation_active": False,
    }
    _plots[plot_id] = record
    return PlotResponse(**{k: record[k] for k in PlotResponse.model_fields})


# ============================================================
# GET /schedule/{plot_id}
# ============================================================


@app.get("/schedule/{plot_id}", response_model=ScheduleResponse)
async def get_irrigation_schedule(
    plot_id: str,
    crop: Optional[str] = Query(default=None, description="Override crop name"),
    area_hectares: Optional[float] = Query(
        default=None, gt=0, description="Override area (ha)"
    ),
    current_moisture_pct: Optional[float] = Query(
        default=None, ge=0, le=100, description="Current soil moisture %"
    ),
    growth_stage: GrowthStage = Query(
        default=GrowthStage.mid, description="Crop growth stage"
    ),
    method: IrrigationMethod = Query(
        default=IrrigationMethod.flood, description="Irrigation method"
    ),
):
    """Compute a 7-day irrigation schedule for a plot.

    If the plot has been registered via POST /register-plot, its stored
    attributes are used as defaults. Query parameters override stored values.
    """
    # Resolve plot context
    plot = _plots.get(plot_id)
    effective_crop = (crop or (plot["crop"] if plot else None) or "wheat").lower()
    effective_area = area_hectares or (plot["area_hectares"] if plot else 1.0)
    effective_moisture = (
        current_moisture_pct
        if current_moisture_pct is not None
        else (plot["current_moisture_pct"] if plot else 25.0)
    )
    effective_method = (
        method.value
        if crop is not None
        else (plot["irrigation_method"] if plot else method.value)
    )
    # Ensure method is valid
    if effective_method not in IRRIGATION_EFFICIENCY:
        effective_method = method.value

    now = datetime.now(timezone.utc)
    month = now.month

    # ---------- ET0 ----------
    climate = MONTHLY_CLIMATE.get(month, MONTHLY_CLIMATE[6])
    et0 = compute_et0(
        temp_c=climate["temp"],
        humidity_pct=climate["humidity"],
        wind_speed_m_s=climate["wind"],
        solar_radiation_mj=climate["radiation"],
    )

    # ---------- Crop coefficient ----------
    kc = get_crop_kc(effective_crop, growth_stage)

    # ETc = ET0 * Kc
    etc = et0 * kc

    # ---------- Effective rainfall ----------
    eff_rain = MONTHLY_EFFECTIVE_RAINFALL_MM_PER_DAY.get(month, 1.0)

    # ---------- Net & gross irrigation requirement ----------
    net_irr = max(etc - eff_rain, 0.0)  # mm/day
    efficiency = IRRIGATION_EFFICIENCY[effective_method]
    gross_irr = net_irr / efficiency if efficiency > 0 else net_irr  # mm/day

    # ---------- Soil moisture deficit adjustment ----------
    # If current moisture is far below field capacity, front-load water
    soil_props = SOIL_PROPERTIES.get(
        plot["soil_type"] if plot else "loam", SOIL_PROPERTIES["loam"]
    )
    fc = soil_props["field_capacity"]
    deficit_mm = (
        max(fc - effective_moisture, 0.0) * 10.0 * effective_area
    )  # rough mm across area

    # ---------- Generate 7-day schedule ----------
    crop_info = CROP_WATER_REQUIREMENTS.get(effective_crop, {})
    critical_stages = crop_info.get("critical_stages", [])
    is_critical = growth_stage.value in ("mid",) or any(
        s in effective_crop for s in critical_stages
    )

    area_m2 = effective_area * 10_000  # 1 ha = 10,000 m²
    flow_rate = FLOW_RATES.get(effective_method, 80.0)  # L/min/ha

    schedule: list[ScheduleEntry] = []
    rng = np.random.default_rng(seed=hash(plot_id) % (2**31))

    for day_offset in range(7):
        day_date = (now + timedelta(days=day_offset)).date()

        # Small daily variation (±10 %)
        daily_factor = float(rng.uniform(0.90, 1.10))

        # Day-0: add deficit recovery portion (spread over first 3 days)
        deficit_extra_mm = 0.0
        if day_offset < 3 and deficit_mm > 0:
            deficit_extra_mm = (
                deficit_mm / 3.0
            ) / area_m2  # mm (very small unless huge deficit)

        day_gross_mm = gross_irr * daily_factor + deficit_extra_mm
        if day_gross_mm < 0.5:
            day_gross_mm = 0.0  # skip trivial amounts

        # Water volume in litres: depth_mm * area_m² / 1000 * 1000 = depth_mm * area_m²
        # Actually: 1 mm on 1 m² = 1 litre
        water_liters = day_gross_mm * area_m2  # litres
        # Duration in minutes
        duration_min = (
            water_liters / (flow_rate * effective_area) if flow_rate > 0 else 0.0
        )

        # Preferred irrigation time: early morning or late evening
        start_time = "05:30" if day_offset % 2 == 0 else "17:30"

        note = ""
        entry_critical = False
        if is_critical and day_offset in (0, 3, 6):
            entry_critical = True
            note = "Critical growth stage — do not skip"

        schedule.append(
            ScheduleEntry(
                date=day_date.isoformat(),
                time=start_time,
                duration_minutes=round(duration_min, 1),
                water_volume_liters=round(water_liters, 1),
                water_depth_mm=round(day_gross_mm, 2),
                method=effective_method,
                is_critical=entry_critical,
                note=note,
            )
        )

    # Record synthetic irrigation events for the usage endpoint
    for entry in schedule:
        if entry.water_volume_liters > 0:
            _irrigation_events.append(
                {
                    "plot_id": plot_id,
                    "farm_id": plot["farm_id"] if plot else "unknown",
                    "crop": effective_crop,
                    "area_hectares": effective_area,
                    "date": entry.date,
                    "water_liters": entry.water_volume_liters,
                    "water_mm": entry.water_depth_mm,
                    "method": effective_method,
                }
            )

    # Update stored moisture (optimistic: assume irrigation brings it toward FC)
    if plot:
        avg_applied_mm = float(np.mean([e.water_depth_mm for e in schedule]))
        plot["current_moisture_pct"] = min(
            fc, effective_moisture + avg_applied_mm * 0.3
        )

    return ScheduleResponse(
        plot_id=plot_id,
        crop=effective_crop,
        growth_stage=growth_stage.value,
        irrigation_method=effective_method,
        area_hectares=effective_area,
        et0_mm_per_day=round(et0, 2),
        crop_coefficient_kc=round(kc, 2),
        etc_mm_per_day=round(etc, 2),
        effective_rainfall_mm_per_day=round(eff_rain, 2),
        net_irrigation_requirement_mm_per_day=round(net_irr, 2),
        gross_irrigation_requirement_mm_per_day=round(gross_irr, 2),
        efficiency_pct=round(efficiency * 100, 1),
        schedule=schedule,
        generated_at=now.isoformat(),
    )


# ============================================================
# GET /usage
# ============================================================


@app.get("/usage", response_model=UsageResponse)
async def get_water_usage(
    farm_id: Optional[str] = Query(default=None, description="Filter by farm ID"),
    days: int = Query(default=30, ge=1, le=365, description="Look-back period in days"),
):
    """Compute water usage analytics from recorded irrigation events.

    Events are recorded whenever the /schedule endpoint is called.
    """
    now = datetime.now(timezone.utc)
    cutoff = (now - timedelta(days=days)).date().isoformat()

    # Filter events
    events = [
        e
        for e in _irrigation_events
        if e["date"] >= cutoff and (farm_id is None or e["farm_id"] == farm_id)
    ]

    if not events:
        # Return zero-usage response rather than 404 — farm may simply have no events yet
        return UsageResponse(
            farm_id=farm_id or "all",
            period_days=days,
            total_usage_liters=0.0,
            daily_average_liters=0.0,
            efficiency_score=0.0,
            savings_vs_flood_irrigation_pct=0.0,
            breakdown_by_crop=[],
            event_count=0,
            generated_at=now.isoformat(),
        )

    total_liters = sum(e["water_liters"] for e in events)
    daily_avg = total_liters / days

    # Breakdown by crop
    crops: dict[str, dict] = {}
    for e in events:
        c = e["crop"]
        if c not in crops:
            crops[c] = {"liters": 0.0, "area": e["area_hectares"], "methods": []}
        crops[c]["liters"] += e["water_liters"]
        crops[c]["methods"].append(e["method"])

    breakdown: list[UsageByCrop] = []
    weighted_efficiency_sum = 0.0
    total_area = 0.0
    for crop_name, info in crops.items():
        # Dominant method for this crop
        from collections import Counter

        method_counts = Counter(info["methods"])
        dominant_method = method_counts.most_common(1)[0][0]
        eff = IRRIGATION_EFFICIENCY.get(dominant_method, 0.60)
        breakdown.append(
            UsageByCrop(
                crop=crop_name,
                usage_liters=round(info["liters"], 1),
                area_hectares=info["area"],
                efficiency_pct=round(eff * 100, 1),
            )
        )
        weighted_efficiency_sum += eff * info["area"]
        total_area += info["area"]

    overall_efficiency = (
        (weighted_efficiency_sum / total_area * 100) if total_area > 0 else 0.0
    )

    # Savings vs flood baseline: if everything were flood (60 %), how much more water?
    flood_eff = IRRIGATION_EFFICIENCY["flood"]
    if overall_efficiency > 0:
        flood_equivalent_liters = (
            total_liters * (overall_efficiency / 100.0) / flood_eff
        )
        savings_pct = max((1.0 - total_liters / flood_equivalent_liters) * 100, 0.0)
    else:
        savings_pct = 0.0

    return UsageResponse(
        farm_id=farm_id or "all",
        period_days=days,
        total_usage_liters=round(total_liters, 1),
        daily_average_liters=round(daily_avg, 1),
        efficiency_score=round(overall_efficiency, 1),
        savings_vs_flood_irrigation_pct=round(savings_pct, 1),
        breakdown_by_crop=breakdown,
        event_count=len(events),
        generated_at=now.isoformat(),
    )


# ============================================================
# GET /sensors/{plot_id}
# ============================================================


@app.get("/sensors/{plot_id}", response_model=SensorResponse)
async def get_sensor_data(plot_id: str):
    """Return simulated sensor readings with realistic distributions.

    Uses numpy random seeded by plot_id + current hour so values are
    stable within the same hour but change naturally over time.
    """
    now = datetime.now(timezone.utc)
    month = now.month
    hour = now.hour

    # Seed with plot_id hash + hour so readings are stable per hour
    seed = (hash(plot_id) + now.year * 10000 + now.timetuple().tm_yday * 100 + hour) % (
        2**31
    )
    rng = np.random.default_rng(seed=seed)

    plot = _plots.get(plot_id)
    climate = MONTHLY_CLIMATE.get(month, MONTHLY_CLIMATE[6])

    # --- Soil moisture ---
    base_moisture = plot["current_moisture_pct"] if plot else 25.0
    # Normal distribution around base moisture, σ = 3%
    soil_moisture = float(np.clip(rng.normal(base_moisture, 3.0), 2.0, 95.0))

    # --- Soil temperature (related to air temp, typically a few degrees warmer) ---
    air_temp_base = climate["temp"]
    # Diurnal variation: warmer midday, cooler at night
    diurnal_offset = 5.0 * np.sin(np.pi * (hour - 6) / 12) if 6 <= hour <= 18 else -3.0
    soil_temp = float(rng.normal(air_temp_base + 2.0 + diurnal_offset, 1.5))

    # --- Air humidity ---
    humidity = float(np.clip(rng.normal(climate["humidity"], 5.0), 10.0, 100.0))

    # --- Water flow rate ---
    # If we have a plot and irrigation is "active" (simple heuristic: first few hours after schedule)
    irrigation_active = False
    if plot:
        # Check if any recent event is for today
        today_str = now.date().isoformat()
        recent_events = [
            e
            for e in _irrigation_events
            if e["plot_id"] == plot_id and e["date"] == today_str
        ]
        if recent_events and 5 <= hour <= 8:
            irrigation_active = True

    if irrigation_active:
        method = plot["irrigation_method"] if plot else "flood"
        base_flow = FLOW_RATES.get(method, 80.0)
        flow_rate = float(
            np.clip(rng.normal(base_flow, base_flow * 0.05), 0.0, base_flow * 1.5)
        )
    else:
        flow_rate = float(rng.exponential(0.1))  # near-zero residual flow

    # --- Battery level (sensor health proxy) ---
    battery_pct = float(np.clip(rng.normal(85.0, 8.0), 10.0, 100.0))

    # Determine sensor health
    def _status(battery: float) -> str:
        if battery < 20:
            return "critical"
        if battery < 40:
            return "warning"
        return "normal"

    sensors = [
        SensorReading(
            sensor_id=f"sm-{plot_id[-4:] if len(plot_id) >= 4 else plot_id}",
            type="soil_moisture",
            value=round(soil_moisture, 1),
            unit="percent",
            status=_status(battery_pct),
        ),
        SensorReading(
            sensor_id=f"st-{plot_id[-4:] if len(plot_id) >= 4 else plot_id}",
            type="soil_temperature",
            value=round(soil_temp, 1),
            unit="celsius",
            status=_status(battery_pct),
        ),
        SensorReading(
            sensor_id=f"ah-{plot_id[-4:] if len(plot_id) >= 4 else plot_id}",
            type="air_humidity",
            value=round(humidity, 1),
            unit="percent",
            status=_status(battery_pct),
        ),
        SensorReading(
            sensor_id=f"wf-{plot_id[-4:] if len(plot_id) >= 4 else plot_id}",
            type="water_flow",
            value=round(flow_rate, 2),
            unit="liters_per_minute",
            status="active" if irrigation_active else "idle",
        ),
        SensorReading(
            sensor_id=f"bt-{plot_id[-4:] if len(plot_id) >= 4 else plot_id}",
            type="battery",
            value=round(battery_pct, 1),
            unit="percent",
            status=_status(battery_pct),
        ),
    ]

    return SensorResponse(
        plot_id=plot_id,
        sensors=sensors,
        irrigation_active=irrigation_active,
        last_updated=now.isoformat(),
    )


# ============================================================
# Entry point
# ============================================================

if __name__ == "__main__":
    uvicorn.run("services.jal_shakti.app:app", host="0.0.0.0", port=8004, reload=True)
