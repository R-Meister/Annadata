"""Fasal Rakshak - Crop protection and disease detection service."""

from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Optional
import uuid

import uvicorn
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.shared.auth.router import router as auth_router
from services.shared.db.session import close_db, init_db

# ============================================================
# Knowledge Base
# ============================================================

CROP_DISEASES: dict[str, list[dict]] = {
    "wheat": [
        {
            "name": "Leaf Rust",
            "scientific_name": "Puccinia triticina",
            "symptoms": [
                "orange pustules on leaves",
                "yellowing of leaves",
                "small round orange spots",
                "reduced grain filling",
            ],
            "severity_factors": {"temperature_range": (15, 25), "humidity_min": 70},
            "favorable_months": [1, 2, 3, 11, 12],
            "growth_stages": ["vegetative", "flowering", "maturity"],
            "treatment": {
                "chemical": "Propiconazole 25% EC @ 0.1% (1 mL/L water), spray at first appearance",
                "organic": "Neem oil spray at 5 mL/L water; remove and destroy infected leaves",
                "preventive": "Use resistant varieties (HD-3226, DBW-187); avoid late sowing; balanced N fertilization",
            },
            "season": ["rabi"],
        },
        {
            "name": "Powdery Mildew",
            "scientific_name": "Blumeria graminis f. sp. tritici",
            "symptoms": [
                "white powdery patches on leaves",
                "white fungal growth on stems",
                "curling of leaves",
                "stunted growth",
            ],
            "severity_factors": {"temperature_range": (15, 22), "humidity_min": 60},
            "favorable_months": [12, 1, 2],
            "growth_stages": ["vegetative", "flowering"],
            "treatment": {
                "chemical": "Sulfur 80% WP @ 2.5 g/L or Karathane 0.05% spray",
                "organic": "Baking soda solution (5 g/L); milk spray (1:9 dilution); improve air circulation",
                "preventive": "Avoid excess nitrogen; ensure proper spacing; grow resistant varieties",
            },
            "season": ["rabi"],
        },
        {
            "name": "Yellow Rust",
            "scientific_name": "Puccinia striiformis",
            "symptoms": [
                "yellow stripes on leaves",
                "linear rows of yellow pustules",
                "premature leaf drying",
                "reduced tillering",
            ],
            "severity_factors": {"temperature_range": (10, 18), "humidity_min": 80},
            "favorable_months": [12, 1, 2, 3],
            "growth_stages": ["seedling", "vegetative", "flowering"],
            "treatment": {
                "chemical": "Tilt (Propiconazole) 25 EC @ 0.1% or Bayleton (Triadimefon) 25 WP @ 0.1%",
                "organic": "Trichoderma-based bioagent spray; neem cake application in soil",
                "preventive": "Timely sowing; use resistant varieties (PBW-343, WH-1105); destroy volunteer plants",
            },
            "season": ["rabi"],
        },
        {
            "name": "Karnal Bunt",
            "scientific_name": "Tilletia indica",
            "symptoms": [
                "black powdery mass in grain",
                "fishy smell from grains",
                "partially converted kernels",
                "dark discoloration of seeds",
            ],
            "severity_factors": {"temperature_range": (18, 24), "humidity_min": 70},
            "favorable_months": [2, 3, 4],
            "growth_stages": ["flowering", "maturity"],
            "treatment": {
                "chemical": "Seed treatment with Thiram 75% WP @ 2.5 g/kg or Vitavax @ 2 g/kg seed",
                "organic": "Hot water seed treatment at 52°C for 10 min; Trichoderma viride seed treatment",
                "preventive": "Use certified disease-free seed; avoid irrigation during anthesis; early sowing",
            },
            "season": ["rabi"],
        },
    ],
    "rice": [
        {
            "name": "Blast",
            "scientific_name": "Magnaporthe oryzae",
            "symptoms": [
                "diamond shaped spots on leaves",
                "grey center lesions with brown margin",
                "neck rot at panicle base",
                "whitehead formation",
            ],
            "severity_factors": {"temperature_range": (24, 30), "humidity_min": 85},
            "favorable_months": [7, 8, 9, 10],
            "growth_stages": ["seedling", "vegetative", "flowering"],
            "treatment": {
                "chemical": "Tricyclazole 75% WP @ 0.6 g/L or Isoprothiolane 40 EC @ 1.5 mL/L",
                "organic": "Pseudomonas fluorescens spray @ 5 g/L; silicon amendment in soil",
                "preventive": "Avoid excess nitrogen; use resistant varieties (Tetep, CO-39); maintain proper water management",
            },
            "season": ["kharif"],
        },
        {
            "name": "Bacterial Leaf Blight",
            "scientific_name": "Xanthomonas oryzae pv. oryzae",
            "symptoms": [
                "water soaked lesions on leaf margins",
                "yellow to white lesions along veins",
                "wilting of seedlings",
                "milky ooze from cut lesions",
            ],
            "severity_factors": {"temperature_range": (25, 34), "humidity_min": 80},
            "favorable_months": [7, 8, 9],
            "growth_stages": ["vegetative", "flowering"],
            "treatment": {
                "chemical": "Streptomycin sulphate + Tetracycline (Plantomycin) @ 1 g/L; Copper oxychloride @ 2.5 g/L",
                "organic": "Neem oil 3% spray; proper drainage to reduce humidity",
                "preventive": "Avoid clipping of seedling tips during transplanting; balanced fertilization; field sanitation",
            },
            "season": ["kharif"],
        },
        {
            "name": "Sheath Blight",
            "scientific_name": "Rhizoctonia solani",
            "symptoms": [
                "oval or irregular greenish grey lesions on sheath",
                "banding pattern on leaf sheath",
                "lodging in severe cases",
                "sclerotia on infected tissue",
            ],
            "severity_factors": {"temperature_range": (28, 35), "humidity_min": 85},
            "favorable_months": [8, 9, 10],
            "growth_stages": ["vegetative", "flowering", "maturity"],
            "treatment": {
                "chemical": "Hexaconazole 5% EC @ 2 mL/L or Validamycin 3% SL @ 2.5 mL/L",
                "organic": "Trichoderma harzianum @ 5 g/L spray; avoid excess organic matter",
                "preventive": "Avoid dense planting; proper water management; remove sclerotia from field",
            },
            "season": ["kharif"],
        },
        {
            "name": "Brown Spot",
            "scientific_name": "Bipolaris oryzae",
            "symptoms": [
                "brown oval spots on leaves",
                "dark brown lesions on glumes",
                "seedling blight",
                "poor grain filling",
            ],
            "severity_factors": {"temperature_range": (25, 30), "humidity_min": 80},
            "favorable_months": [8, 9, 10, 11],
            "growth_stages": ["seedling", "vegetative", "flowering", "maturity"],
            "treatment": {
                "chemical": "Mancozeb 75% WP @ 2.5 g/L or Edifenphos 50 EC @ 1 mL/L",
                "organic": "Pseudomonas fluorescens seed treatment @ 10 g/kg seed; potash application",
                "preventive": "Balanced fertilization especially potash; seed treatment before sowing; proper field drainage",
            },
            "season": ["kharif"],
        },
    ],
    "cotton": [
        {
            "name": "Bacterial Blight",
            "scientific_name": "Xanthomonas citri subsp. malvacearum",
            "symptoms": [
                "angular water soaked spots on leaves",
                "black arm on stems",
                "boll rot",
                "vein blackening",
            ],
            "severity_factors": {"temperature_range": (25, 35), "humidity_min": 80},
            "favorable_months": [7, 8, 9, 10],
            "growth_stages": ["seedling", "vegetative", "flowering"],
            "treatment": {
                "chemical": "Streptocycline @ 1 g/10L + Copper oxychloride @ 2.5 g/L spray",
                "organic": "Neem seed kernel extract 5%; Pseudomonas fluorescens spray",
                "preventive": "Use acid-delinted certified seed; seed treatment with Carboxin; avoid overhead irrigation",
            },
            "season": ["kharif"],
        },
        {
            "name": "Fusarium Wilt",
            "scientific_name": "Fusarium oxysporum f. sp. vasinfectum",
            "symptoms": [
                "yellowing of leaves from bottom",
                "wilting of plants",
                "vascular browning in stem",
                "stunted growth",
            ],
            "severity_factors": {"temperature_range": (25, 33), "humidity_min": 60},
            "favorable_months": [6, 7, 8, 9],
            "growth_stages": ["vegetative", "flowering"],
            "treatment": {
                "chemical": "Carbendazim 50% WP @ 2 g/L soil drenching; Thiophanate-methyl seed treatment",
                "organic": "Trichoderma viride soil application @ 5 kg/ha; neem cake @ 150 kg/ha",
                "preventive": "Grow resistant varieties; crop rotation with non-host crops; proper drainage",
            },
            "season": ["kharif"],
        },
        {
            "name": "Grey Mildew",
            "scientific_name": "Ramularia areola",
            "symptoms": [
                "angular pale translucent spots on leaves",
                "white powdery growth on lower leaf surface",
                "premature defoliation",
                "reduced boll size",
            ],
            "severity_factors": {"temperature_range": (25, 30), "humidity_min": 70},
            "favorable_months": [9, 10, 11],
            "growth_stages": ["vegetative", "flowering", "maturity"],
            "treatment": {
                "chemical": "Carbendazim 50% WP @ 1 g/L or Mancozeb 75% WP @ 2.5 g/L foliar spray",
                "organic": "Sulfur dust application; improve air circulation by wider spacing",
                "preventive": "Remove and destroy infected plant debris; avoid excessive nitrogen; proper plant spacing",
            },
            "season": ["kharif"],
        },
    ],
    "maize": [
        {
            "name": "Northern Leaf Blight",
            "scientific_name": "Exserohilum turcicum",
            "symptoms": [
                "long elliptical grey-green lesions on leaves",
                "cigar shaped spots",
                "lesions turning tan to brown",
                "premature leaf senescence",
            ],
            "severity_factors": {"temperature_range": (18, 27), "humidity_min": 75},
            "favorable_months": [7, 8, 9],
            "growth_stages": ["vegetative", "flowering"],
            "treatment": {
                "chemical": "Mancozeb 75% WP @ 2.5 g/L or Zineb 75% WP @ 2 g/L at 10-day intervals",
                "organic": "Trichoderma viride foliar spray; neem oil 2% spray",
                "preventive": "Use resistant hybrids; crop rotation; destroy crop residues after harvest",
            },
            "season": ["kharif", "rabi"],
        },
        {
            "name": "Maydis Leaf Blight",
            "scientific_name": "Bipolaris maydis",
            "symptoms": [
                "small diamond shaped tan lesions",
                "elongated buff to brown spots",
                "lesions parallel to leaf veins",
                "extensive leaf blighting",
            ],
            "severity_factors": {"temperature_range": (20, 32), "humidity_min": 80},
            "favorable_months": [7, 8, 9, 10],
            "growth_stages": ["vegetative", "flowering", "maturity"],
            "treatment": {
                "chemical": "Zineb 75 WP @ 2 g/L or Dithane M-45 @ 2.5 g/L at weekly intervals",
                "organic": "Trichoderma-based foliar spray; improve field ventilation",
                "preventive": "Use tolerant varieties; avoid monocropping; remove infected debris",
            },
            "season": ["kharif"],
        },
        {
            "name": "Downy Mildew",
            "scientific_name": "Peronosclerospora sorghi",
            "symptoms": [
                "chlorotic streaks on leaves",
                "white downy growth on lower leaf surface",
                "stunted plants with excessive tillering",
                "leaf shredding into fine strips",
            ],
            "severity_factors": {"temperature_range": (20, 25), "humidity_min": 90},
            "favorable_months": [7, 8],
            "growth_stages": ["seedling", "vegetative"],
            "treatment": {
                "chemical": "Metalaxyl 35% WS seed treatment @ 3 g/kg seed; Ridomil MZ @ 2.5 g/L spray",
                "organic": "Remove and destroy infected plants immediately; improve drainage",
                "preventive": "Seed treatment with Metalaxyl; avoid late sowing; use resistant hybrids",
            },
            "season": ["kharif"],
        },
        {
            "name": "Stalk Rot",
            "scientific_name": "Fusarium verticillioides",
            "symptoms": [
                "rotting at the base of stalk",
                "shredded stalk pith",
                "premature drying of plants",
                "lodging of mature plants",
            ],
            "severity_factors": {"temperature_range": (26, 34), "humidity_min": 70},
            "favorable_months": [8, 9, 10],
            "growth_stages": ["flowering", "maturity"],
            "treatment": {
                "chemical": "Carbendazim 50% WP @ 2 g/L basal drench; avoid water stress during grain filling",
                "organic": "Trichoderma viride soil application; adequate potash fertilization",
                "preventive": "Balanced fertilization; avoid water logging; harvest at physiological maturity",
            },
            "season": ["kharif"],
        },
    ],
    "sugarcane": [
        {
            "name": "Red Rot",
            "scientific_name": "Colletotrichum falcatum",
            "symptoms": [
                "red discoloration of internal stalk tissue",
                "white patches interspersed with red areas",
                "withering and drying of crown leaves",
                "alcoholic smell from split cane",
            ],
            "severity_factors": {"temperature_range": (25, 32), "humidity_min": 80},
            "favorable_months": [7, 8, 9, 10],
            "growth_stages": ["vegetative", "maturity"],
            "treatment": {
                "chemical": "Sett treatment with Carbendazim 50% WP @ 2 g/L for 15 min before planting",
                "organic": "Trichoderma viride sett treatment; bioagent soil application",
                "preventive": "Use disease-free seed cane; grow resistant varieties (Co-0238); remove and destroy infected stools",
            },
            "season": ["kharif"],
        },
        {
            "name": "Smut",
            "scientific_name": "Sporisorium scitamineum",
            "symptoms": [
                "black whip-like structure from growing point",
                "thin tillers with grassy appearance",
                "excessive sprouting of side buds",
                "stunted cane growth",
            ],
            "severity_factors": {"temperature_range": (25, 35), "humidity_min": 60},
            "favorable_months": [4, 5, 6, 7],
            "growth_stages": ["vegetative", "flowering"],
            "treatment": {
                "chemical": "Sett treatment with Triadimefon 25% WP @ 2 g/L for 15 min",
                "organic": "Hot water treatment of setts at 52°C for 30 min; Trichoderma application",
                "preventive": "Use smut-free seed material; rogue out smutted clumps before whip opening; grow resistant varieties",
            },
            "season": ["kharif", "rabi"],
        },
        {
            "name": "Wilt",
            "scientific_name": "Fusarium sacchari",
            "symptoms": [
                "gradual yellowing and drying of leaves",
                "purplish red discoloration of internal tissue",
                "cavity formation in stalks",
                "pith turning brown and hollow",
            ],
            "severity_factors": {"temperature_range": (28, 36), "humidity_min": 70},
            "favorable_months": [6, 7, 8, 9, 10],
            "growth_stages": ["vegetative", "maturity"],
            "treatment": {
                "chemical": "Carbendazim 50% WP sett dip @ 2 g/L; soil drenching with Copper oxychloride",
                "organic": "Trichoderma viride soil application @ 5 kg/ha with FYM; organic amendments",
                "preventive": "Avoid waterlogging; use resistant varieties; remove infected stools; practice crop rotation",
            },
            "season": ["kharif"],
        },
    ],
}

# Season-to-month mapping
SEASON_MONTHS: dict[str, list[int]] = {
    "kharif": [6, 7, 8, 9, 10],
    "rabi": [10, 11, 12, 1, 2, 3],
    "zaid": [3, 4, 5, 6],
}

# Region-specific risk factors (higher multiplier = more risk)
REGION_RISK: dict[str, dict[str, float]] = {
    "punjab": {
        "wheat": 1.3,
        "rice": 1.2,
        "cotton": 1.1,
        "maize": 1.0,
        "sugarcane": 1.1,
    },
    "haryana": {
        "wheat": 1.2,
        "rice": 1.1,
        "cotton": 1.2,
        "maize": 1.0,
        "sugarcane": 1.0,
    },
    "uttar pradesh": {
        "wheat": 1.2,
        "rice": 1.1,
        "cotton": 0.8,
        "maize": 1.0,
        "sugarcane": 1.4,
    },
    "madhya pradesh": {
        "wheat": 1.3,
        "rice": 0.9,
        "cotton": 1.1,
        "maize": 1.1,
        "sugarcane": 0.9,
    },
    "maharashtra": {
        "wheat": 0.8,
        "rice": 0.9,
        "cotton": 1.4,
        "maize": 1.0,
        "sugarcane": 1.3,
    },
    "karnataka": {
        "wheat": 0.6,
        "rice": 1.1,
        "cotton": 1.0,
        "maize": 1.2,
        "sugarcane": 1.2,
    },
    "andhra pradesh": {
        "wheat": 0.5,
        "rice": 1.3,
        "cotton": 1.2,
        "maize": 1.0,
        "sugarcane": 1.0,
    },
    "tamil nadu": {
        "wheat": 0.3,
        "rice": 1.3,
        "cotton": 1.0,
        "maize": 1.1,
        "sugarcane": 1.2,
    },
    "west bengal": {
        "wheat": 0.7,
        "rice": 1.4,
        "cotton": 0.5,
        "maize": 0.9,
        "sugarcane": 0.8,
    },
    "gujarat": {
        "wheat": 1.0,
        "rice": 0.8,
        "cotton": 1.3,
        "maize": 1.0,
        "sugarcane": 1.1,
    },
    "rajasthan": {
        "wheat": 1.1,
        "rice": 0.5,
        "cotton": 1.0,
        "maize": 1.0,
        "sugarcane": 0.6,
    },
    "bihar": {"wheat": 1.1, "rice": 1.2, "cotton": 0.5, "maize": 1.3, "sugarcane": 1.0},
}

# ============================================================
# In-memory detection history
# ============================================================

detection_history: list[dict] = []

# ============================================================
# Pydantic Models
# ============================================================


class DiseaseDetectionRequest(BaseModel):
    crop: str = Field(
        ..., description="Crop name (e.g. wheat, rice, cotton, maize, sugarcane)"
    )
    symptoms: list[str] = Field(
        ..., min_length=1, description="List of observed symptoms"
    )
    temperature_celsius: Optional[float] = Field(
        None, description="Current temperature in Celsius"
    )
    humidity_pct: Optional[float] = Field(
        None, ge=0, le=100, description="Current relative humidity %"
    )
    region: Optional[str] = Field(None, description="Region/state name")
    growth_stage: Optional[str] = Field(
        None, description="Growth stage: seedling, vegetative, flowering, or maturity"
    )


class TreatmentResponse(BaseModel):
    chemical: str
    organic: str
    preventive: str


class DiseaseMatch(BaseModel):
    name: str
    scientific_name: str
    confidence: float = Field(..., ge=0, le=1, description="Confidence score 0-1")
    matched_symptoms: list[str]
    severity_assessment: str
    treatment: TreatmentResponse


class DetectionResponse(BaseModel):
    detection_id: str
    status: str
    crop: str
    disease_detected: bool
    top_matches: list[DiseaseMatch]
    environmental_note: Optional[str] = None
    detected_at: str


class RecommendationDisease(BaseModel):
    name: str
    scientific_name: str
    risk_level: str
    peak_months: list[str]
    key_symptoms: list[str]
    treatment: TreatmentResponse


class RecommendationResponse(BaseModel):
    crop: str
    season: str
    region: Optional[str]
    diseases: list[RecommendationDisease]
    general_preventive_measures: list[str]


class AlertItem(BaseModel):
    alert_id: str
    severity: str
    crop: str
    disease_name: str
    risk_score: float
    advisory: str
    issued_at: str


class AlertsResponse(BaseModel):
    region: str
    season: str
    current_month: str
    alerts: list[AlertItem]


class HistoryEntry(BaseModel):
    detection_id: str
    crop: str
    top_disease: Optional[str]
    confidence: Optional[float]
    detected_at: str


class HistoryResponse(BaseModel):
    count: int
    detections: list[HistoryEntry]


# ============================================================
# Helper functions
# ============================================================

MONTH_NAMES = [
    "",
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
]


def _current_month() -> int:
    return datetime.now(timezone.utc).month


def _current_season() -> str:
    month = _current_month()
    if month in SEASON_MONTHS["kharif"]:
        return "kharif"
    if month in SEASON_MONTHS["rabi"]:
        return "rabi"
    return "zaid"


def _symptom_score(
    disease_symptoms: list[str], reported_symptoms: list[str]
) -> tuple[float, list[str]]:
    """Score how well reported symptoms match a disease.

    Uses keyword overlap: each reported symptom is checked against each disease
    symptom for common significant words (length > 3 to skip articles/prepositions).
    Returns (score 0-1, list of matched disease symptoms).
    """
    matched: list[str] = []
    for ds in disease_symptoms:
        ds_words = {w.lower() for w in ds.split() if len(w) > 3}
        for rs in reported_symptoms:
            rs_words = {w.lower() for w in rs.split() if len(w) > 3}
            overlap = ds_words & rs_words
            if overlap:
                matched.append(ds)
                break
    if not disease_symptoms:
        return 0.0, matched
    return len(matched) / len(disease_symptoms), matched


def _environmental_factor(
    disease: dict,
    temperature: Optional[float],
    humidity: Optional[float],
) -> float:
    """Return a multiplier (0.5 - 1.5) based on how favourable the environment is."""
    factor = 1.0
    sf = disease.get("severity_factors", {})
    temp_range = sf.get("temperature_range")
    hum_min = sf.get("humidity_min")

    if temperature is not None and temp_range:
        lo, hi = temp_range
        if lo <= temperature <= hi:
            factor += 0.25  # ideal range
        elif abs(temperature - lo) <= 5 or abs(temperature - hi) <= 5:
            factor += 0.0  # near range, neutral
        else:
            factor -= 0.25  # far from ideal

    if humidity is not None and hum_min is not None:
        if humidity >= hum_min:
            factor += 0.20
        elif humidity >= hum_min - 15:
            factor += 0.0
        else:
            factor -= 0.20

    return max(0.1, min(factor, 1.5))


def _growth_stage_factor(disease: dict, stage: Optional[str]) -> float:
    """Return multiplier based on growth stage relevance."""
    if stage is None:
        return 1.0
    stages = disease.get("growth_stages", [])
    if not stages:
        return 1.0
    if stage.lower() in [s.lower() for s in stages]:
        return 1.15
    return 0.85


def _severity_label(confidence: float) -> str:
    if confidence >= 0.75:
        return "high"
    if confidence >= 0.45:
        return "moderate"
    if confidence >= 0.20:
        return "low"
    return "minimal"


def _month_factor(disease: dict) -> float:
    """Boost if current month is in the disease's favourable months."""
    favourable = disease.get("favorable_months", [])
    if not favourable:
        return 1.0
    if _current_month() in favourable:
        return 1.15
    return 0.90


# ============================================================
# Lifespan
# ============================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize and cleanup resources."""
    await init_db()
    yield
    await close_db()


# ============================================================
# App setup
# ============================================================

app = FastAPI(
    title="Fasal Rakshak",
    description="Crop disease detection and pest management recommendations",
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

# Auth router already has prefix="/auth" — do NOT add prefix again
app.include_router(auth_router)


# ============================================================
# Endpoints
# ============================================================


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "service": "fasal_rakshak",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "Fasal Rakshak",
        "version": "1.0.0",
        "features": [
            "Symptom-based crop disease detection",
            "Environmental condition analysis",
            "Treatment and pesticide recommendations",
            "Region-specific pest alerts",
        ],
    }


@app.post("/detect", response_model=DetectionResponse)
async def detect_disease(req: DiseaseDetectionRequest):
    """Detect crop disease from reported symptoms and environmental data."""
    crop_key = req.crop.strip().lower()
    diseases = CROP_DISEASES.get(crop_key)
    if diseases is None:
        supported = ", ".join(sorted(CROP_DISEASES.keys()))
        raise HTTPException(
            status_code=400,
            detail=f"Crop '{req.crop}' not found in knowledge base. Supported crops: {supported}",
        )

    scored: list[tuple[float, dict, list[str]]] = []
    for disease in diseases:
        sym_score, matched_syms = _symptom_score(disease["symptoms"], req.symptoms)
        env_factor = _environmental_factor(
            disease, req.temperature_celsius, req.humidity_pct
        )
        stage_factor = _growth_stage_factor(disease, req.growth_stage)
        month_factor = _month_factor(disease)

        raw_confidence = sym_score * env_factor * stage_factor * month_factor

        # Apply region factor
        if req.region:
            region_key = req.region.strip().lower()
            region_factors = REGION_RISK.get(region_key, {})
            region_mult = region_factors.get(crop_key, 1.0)
            raw_confidence *= region_mult

        # Clamp to [0, 1]
        confidence = max(0.0, min(round(raw_confidence, 4), 1.0))
        scored.append((confidence, disease, matched_syms))

    scored.sort(key=lambda x: x[0], reverse=True)
    top = scored[:3]

    # Build environmental note
    env_notes: list[str] = []
    if req.temperature_celsius is not None:
        env_notes.append(f"Temperature {req.temperature_celsius}°C")
    if req.humidity_pct is not None:
        env_notes.append(f"Humidity {req.humidity_pct}%")
    if req.growth_stage:
        env_notes.append(f"Growth stage: {req.growth_stage}")
    env_note = "; ".join(env_notes) if env_notes else None

    disease_detected = len(top) > 0 and top[0][0] > 0.0

    matches = [
        DiseaseMatch(
            name=d["name"],
            scientific_name=d["scientific_name"],
            confidence=conf,
            matched_symptoms=msyms,
            severity_assessment=_severity_label(conf),
            treatment=TreatmentResponse(**d["treatment"]),
        )
        for conf, d, msyms in top
    ]

    detection_id = f"det-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
    detected_at = datetime.now(timezone.utc).isoformat()

    # Store in history
    detection_history.append(
        {
            "detection_id": detection_id,
            "crop": crop_key,
            "top_disease": matches[0].name
            if matches and matches[0].confidence > 0
            else None,
            "confidence": matches[0].confidence if matches else None,
            "detected_at": detected_at,
        }
    )

    return DetectionResponse(
        detection_id=detection_id,
        status="completed",
        crop=crop_key,
        disease_detected=disease_detected,
        top_matches=matches,
        environmental_note=env_note,
        detected_at=detected_at,
    )


@app.get("/recommendations/{crop}", response_model=RecommendationResponse)
async def get_recommendations(
    crop: str,
    season: str = Query("kharif", description="Season: kharif, rabi, or zaid"),
    region: Optional[str] = Query(None, description="Region/state name"),
):
    """Get pest management recommendations for a specific crop and season."""
    crop_key = crop.strip().lower()
    diseases = CROP_DISEASES.get(crop_key)
    if diseases is None:
        supported = ", ".join(sorted(CROP_DISEASES.keys()))
        raise HTTPException(
            status_code=400,
            detail=f"Crop '{crop}' not found in knowledge base. Supported crops: {supported}",
        )

    season_key = season.strip().lower()
    if season_key not in SEASON_MONTHS:
        raise HTTPException(
            status_code=400, detail="Season must be one of: kharif, rabi, zaid"
        )

    season_months = SEASON_MONTHS[season_key]

    # Filter diseases relevant to the season
    relevant = []
    for d in diseases:
        d_seasons = d.get("season", [])
        if season_key in d_seasons or not d_seasons:
            relevant.append(d)

    # Score and sort by risk
    rec_diseases: list[RecommendationDisease] = []
    for d in relevant:
        favourable = d.get("favorable_months", [])
        overlap_months = [m for m in favourable if m in season_months]
        if overlap_months:
            risk = "high" if len(overlap_months) >= 3 else "medium"
        else:
            risk = "low"

        # Boost risk if region is a major grower
        if region:
            region_key = region.strip().lower()
            rm = REGION_RISK.get(region_key, {}).get(crop_key, 1.0)
            if rm >= 1.3 and risk == "medium":
                risk = "high"

        rec_diseases.append(
            RecommendationDisease(
                name=d["name"],
                scientific_name=d["scientific_name"],
                risk_level=risk,
                peak_months=[
                    MONTH_NAMES[m]
                    for m in d.get("favorable_months", [])
                    if 1 <= m <= 12
                ],
                key_symptoms=d["symptoms"][:3],
                treatment=TreatmentResponse(**d["treatment"]),
            )
        )

    # Sort: high > medium > low
    risk_order = {"high": 0, "medium": 1, "low": 2}
    rec_diseases.sort(key=lambda x: risk_order.get(x.risk_level, 3))

    general_measures = [
        f"Use certified disease-free seeds for {crop_key}",
        "Practice crop rotation with non-host crops (2-3 year cycle)",
        "Maintain balanced fertilization — avoid excess nitrogen",
        "Ensure proper field drainage to reduce humidity buildup",
        "Scout fields regularly (weekly) and report early symptoms",
        "Remove and destroy crop residues after harvest",
    ]

    return RecommendationResponse(
        crop=crop_key,
        season=season_key,
        region=region.strip().lower() if region else None,
        diseases=rec_diseases,
        general_preventive_measures=general_measures,
    )


@app.get("/alerts", response_model=AlertsResponse)
async def get_pest_alerts(
    region: str = Query(..., description="Region/state name (required)"),
    crop: Optional[str] = Query(None, description="Filter alerts by crop"),
):
    """Get active pest and disease alerts for a region based on current conditions."""
    region_key = region.strip().lower()
    month = _current_month()
    season = _current_season()

    # Determine which crops to scan
    if crop:
        crop_key = crop.strip().lower()
        if crop_key not in CROP_DISEASES:
            supported = ", ".join(sorted(CROP_DISEASES.keys()))
            raise HTTPException(
                status_code=400,
                detail=f"Crop '{crop}' not found. Supported: {supported}",
            )
        crops_to_check = {crop_key: CROP_DISEASES[crop_key]}
    else:
        crops_to_check = CROP_DISEASES

    alerts: list[AlertItem] = []
    now_iso = datetime.now(timezone.utc).isoformat()

    for c_name, diseases in crops_to_check.items():
        for d in diseases:
            # Check if disease is relevant this month
            favourable = d.get("favorable_months", [])
            if month not in favourable:
                continue

            # Base risk from month relevance
            risk = 0.5

            # Boost by region factor
            region_factors = REGION_RISK.get(region_key, {})
            region_mult = region_factors.get(c_name, 1.0)
            risk *= region_mult

            # Boost if current season matches disease season
            d_seasons = d.get("season", [])
            if season in d_seasons:
                risk *= 1.2

            risk = round(min(risk, 1.0), 2)

            if risk < 0.25:
                continue

            severity = (
                "critical" if risk >= 0.70 else "high" if risk >= 0.50 else "moderate"
            )

            treatment = d["treatment"]
            advisory = f"{severity.capitalize()} risk of {d['name']} in {c_name}. "
            advisory += f"Preventive: {treatment['preventive'][:120]}"

            alerts.append(
                AlertItem(
                    alert_id=f"alert-{c_name[:3]}-{d['name'][:3].lower()}-{uuid.uuid4().hex[:4]}",
                    severity=severity,
                    crop=c_name,
                    disease_name=d["name"],
                    risk_score=risk,
                    advisory=advisory,
                    issued_at=now_iso,
                )
            )

    # Sort by risk score descending
    alerts.sort(key=lambda a: a.risk_score, reverse=True)

    return AlertsResponse(
        region=region_key,
        season=season,
        current_month=MONTH_NAMES[month],
        alerts=alerts,
    )


@app.get("/history", response_model=HistoryResponse)
async def get_detection_history(
    crop: Optional[str] = Query(None, description="Filter by crop name"),
):
    """Return detection history from in-memory store, optionally filtered by crop."""
    entries = detection_history
    if crop:
        crop_key = crop.strip().lower()
        entries = [e for e in entries if e["crop"] == crop_key]

    detections = [
        HistoryEntry(
            detection_id=e["detection_id"],
            crop=e["crop"],
            top_disease=e.get("top_disease"),
            confidence=e.get("confidence"),
            detected_at=e["detected_at"],
        )
        for e in reversed(entries)  # newest first
    ]

    return HistoryResponse(count=len(detections), detections=detections)


if __name__ == "__main__":
    uvicorn.run(
        "services.fasal_rakshak.app:app", host="0.0.0.0", port=8003, reload=True
    )
