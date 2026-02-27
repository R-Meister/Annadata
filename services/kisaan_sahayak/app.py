"""Kisaan Sahayak - Rule-based agricultural knowledge assistant for farmers."""

from __future__ import annotations

import re
import uuid
from collections import defaultdict
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import Any

import uvicorn
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from services.shared.auth.router import router as auth_router
from services.shared.db.session import close_db, init_db

# ============================================================
# Knowledge Base
# ============================================================

FARMING_KNOWLEDGE: dict[str, dict[str, Any]] = {
    "fertilizer": {
        "wheat": {
            "urea": "120 kg/ha — apply 60 kg at sowing and 60 kg at first irrigation (CRI stage, 21 DAS)",
            "dap": "60 kg/ha at sowing as basal dose; provides 27 kg N + 30 kg P₂O₅",
            "mop": "40 kg/ha at sowing for potassium on deficient soils",
            "zinc_sulphate": "25 kg/ha at sowing if Zn < 0.6 ppm in soil",
            "total_npk": "120:60:40 kg NPK/ha recommended for irrigated timely-sown wheat",
            "schedule": [
                "At sowing: full P, full K, half N (60 kg urea + 60 kg DAP + 40 kg MOP)",
                "At CRI (21 DAS): remaining half N (60 kg urea) with first irrigation",
                "Foliar ZnSO₄ 0.5% spray at tillering if deficiency symptoms appear",
            ],
        },
        "rice": {
            "urea": "130 kg/ha — split into 3 doses: 1/3 basal, 1/3 at tillering, 1/3 at panicle initiation",
            "dap": "65 kg/ha as basal dose at transplanting",
            "mop": "50 kg/ha — half basal, half at panicle initiation",
            "zinc_sulphate": "25 kg/ha at last puddling for zinc-deficient soils",
            "total_npk": "120:60:60 kg NPK/ha recommended for irrigated transplanted rice",
            "schedule": [
                "Basal (at transplanting): 1/3 N + full P + half K (43 kg urea + 65 kg DAP + 25 kg MOP)",
                "At tillering (21 DAT): 1/3 N (43 kg urea)",
                "At panicle initiation (45 DAT): 1/3 N + remaining K (43 kg urea + 25 kg MOP)",
            ],
        },
        "maize": {
            "urea": "175 kg/ha — split: 1/3 basal, 1/3 at knee-high, 1/3 at tasseling",
            "dap": "75 kg/ha as basal dose",
            "mop": "50 kg/ha at sowing",
            "total_npk": "150:60:60 kg NPK/ha for hybrid irrigated maize",
            "schedule": [
                "At sowing: 1/3 N + full P + full K",
                "At knee-high (30 DAS): 1/3 N with earthing up",
                "At tasseling (50 DAS): remaining 1/3 N",
            ],
        },
        "sugarcane": {
            "urea": "350 kg/ha — split into 3 equal doses at 30, 60, and 90 days after planting",
            "dap": "85 kg/ha at planting in furrows",
            "mop": "80 kg/ha at planting",
            "total_npk": "250:60:60 kg NPK/ha for plant crop",
            "schedule": [
                "At planting: full P + full K in furrows",
                "30 DAP: 1/3 N (115 kg urea) with first earthing up",
                "60 DAP: 1/3 N (115 kg urea) with second earthing up",
                "90 DAP: 1/3 N (120 kg urea) with final earthing up",
            ],
        },
        "mustard": {
            "urea": "85 kg/ha — half at sowing, half at first irrigation",
            "dap": "50 kg/ha at sowing",
            "sulphur": "20 kg S/ha through gypsum or SSP",
            "total_npk": "80:40:0 kg NPK/ha with 20 kg S/ha",
            "schedule": [
                "At sowing: half N + full P + sulphur",
                "At first irrigation (25–30 DAS): remaining half N",
            ],
        },
        "cotton": {
            "urea": "200 kg/ha — split into 4 equal doses",
            "dap": "60 kg/ha at sowing",
            "mop": "50 kg/ha — half basal, half at squaring",
            "total_npk": "150:60:60 kg NPK/ha for irrigated Bt cotton",
            "schedule": [
                "At sowing: 1/4 N + full P + half K",
                "At squaring (40 DAS): 1/4 N + remaining K",
                "At flowering (65 DAS): 1/4 N",
                "At boll formation (85 DAS): 1/4 N",
            ],
        },
        "potato": {
            "urea": "170 kg/ha — 2/3 at planting, 1/3 at earthing up (30 DAP)",
            "dap": "125 kg/ha at planting",
            "mop": "100 kg/ha at planting",
            "total_npk": "150:80:100 kg NPK/ha for irrigated potato",
            "schedule": [
                "At planting: 2/3 N + full P + full K in furrows",
                "At earthing up (30 DAP): remaining 1/3 N",
            ],
        },
    },
    "irrigation": {
        "wheat": {
            "total": "5–6 irrigations of 6 cm depth each",
            "critical_stages": "Crown Root Initiation (CRI, 21 DAS), tillering, jointing, flowering, milk/dough stage",
            "schedule": [
                {
                    "stage": "CRI (21 DAS)",
                    "priority": "critical",
                    "note": "Most critical; skipping causes 30–40% yield loss",
                },
                {
                    "stage": "Tillering (40-45 DAS)",
                    "priority": "high",
                    "note": "Promotes tiller survival",
                },
                {
                    "stage": "Jointing (60-65 DAS)",
                    "priority": "high",
                    "note": "Determines spike length",
                },
                {
                    "stage": "Flowering (80-85 DAS)",
                    "priority": "critical",
                    "note": "Critical for grain set",
                },
                {
                    "stage": "Milk stage (95-100 DAS)",
                    "priority": "medium",
                    "note": "For grain filling",
                },
                {
                    "stage": "Dough stage (110-115 DAS)",
                    "priority": "low",
                    "note": "Light irrigation if dry spell",
                },
            ],
            "note": "If only 1 irrigation possible, irrigate at CRI. If 2, irrigate at CRI + flowering.",
        },
        "rice": {
            "total": "Continuous submergence with intermittent drying during vegetative phase saves 20-25% water",
            "critical_stages": "Transplanting, tillering, panicle initiation, flowering, grain filling",
            "schedule": [
                {
                    "stage": "Transplanting to tillering",
                    "priority": "critical",
                    "note": "Maintain 2–5 cm standing water",
                },
                {
                    "stage": "Mid-tillering",
                    "priority": "medium",
                    "note": "Drain for 2–3 days to control unproductive tillers",
                },
                {
                    "stage": "Panicle initiation",
                    "priority": "critical",
                    "note": "Maintain 5 cm standing water",
                },
                {
                    "stage": "Flowering",
                    "priority": "critical",
                    "note": "Water stress causes sterility; maintain 5 cm",
                },
                {
                    "stage": "Grain filling to maturity",
                    "priority": "high",
                    "note": "Gradually reduce; drain 15 days before harvest",
                },
            ],
            "note": "Alternate wetting and drying (AWD) technique can save 20–25% irrigation water.",
        },
        "maize": {
            "total": "6–8 irrigations depending on season and soil type",
            "critical_stages": "Knee-high, tasseling, silking, grain filling",
            "schedule": [
                {
                    "stage": "Knee-high (25–30 DAS)",
                    "priority": "high",
                    "note": "Promotes root development",
                },
                {
                    "stage": "Tasseling (50 DAS)",
                    "priority": "critical",
                    "note": "Most critical; 2–3 day stress reduces yield 20%",
                },
                {
                    "stage": "Silking (55-60 DAS)",
                    "priority": "critical",
                    "note": "Required for pollination and grain set",
                },
                {
                    "stage": "Grain filling (75-85 DAS)",
                    "priority": "high",
                    "note": "For proper kernel development",
                },
            ],
            "note": "Avoid waterlogging — maize is very sensitive to excess moisture.",
        },
        "sugarcane": {
            "total": "18–28 irrigations depending on soil and climate; 1500–2500 mm total water",
            "critical_stages": "Germination, tillering, grand growth, maturity",
            "schedule": [
                {
                    "stage": "Germination (0–30 DAP)",
                    "priority": "critical",
                    "note": "Light frequent irrigation every 7 days",
                },
                {
                    "stage": "Tillering (30–120 DAP)",
                    "priority": "high",
                    "note": "Irrigate every 10–15 days",
                },
                {
                    "stage": "Grand growth (120–270 DAP)",
                    "priority": "critical",
                    "note": "Maximum water need; irrigate every 7–10 days",
                },
                {
                    "stage": "Maturity (270+ DAP)",
                    "priority": "low",
                    "note": "Withhold irrigation 15–20 days before harvest",
                },
            ],
            "note": "Drip irrigation at 80% ET can save 30–40% water and increase yield by 20%.",
        },
        "mustard": {
            "total": "1–2 irrigations; mustard is drought-tolerant",
            "critical_stages": "Pre-flowering (40–45 DAS), pod filling (70–75 DAS)",
            "schedule": [
                {
                    "stage": "Pre-flowering (40-45 DAS)",
                    "priority": "critical",
                    "note": "Only critical irrigation",
                },
                {
                    "stage": "Pod filling (70-75 DAS)",
                    "priority": "medium",
                    "note": "If soil is very dry",
                },
            ],
            "note": "Excess irrigation promotes vegetative growth and aphid infestation. Avoid waterlogging.",
        },
        "cotton": {
            "total": "6–8 irrigations depending on monsoon and soil type",
            "critical_stages": "Squaring, flowering, boll development",
            "schedule": [
                {
                    "stage": "First irrigation (20–25 DAS)",
                    "priority": "high",
                    "note": "For root establishment",
                },
                {
                    "stage": "Squaring (40 DAS)",
                    "priority": "critical",
                    "note": "Promotes flower bud development",
                },
                {
                    "stage": "Flowering (60-80 DAS)",
                    "priority": "critical",
                    "note": "Most sensitive period",
                },
                {
                    "stage": "Boll development (80-120 DAS)",
                    "priority": "high",
                    "note": "For boll weight and fiber quality",
                },
            ],
            "note": "Drip irrigation with fertigation increases yield by 25–30% and saves 40% water.",
        },
        "potato": {
            "total": "8–12 irrigations at 7–10 day intervals",
            "critical_stages": "Stolon formation, tuber initiation, tuber bulking",
            "schedule": [
                {
                    "stage": "After planting (3–4 DAP)",
                    "priority": "high",
                    "note": "Light irrigation for germination",
                },
                {
                    "stage": "Stolon formation (25-30 DAP)",
                    "priority": "critical",
                    "note": "Determines number of tubers",
                },
                {
                    "stage": "Tuber initiation (35-45 DAP)",
                    "priority": "critical",
                    "note": "Moisture stress causes misshapen tubers",
                },
                {
                    "stage": "Tuber bulking (45-80 DAP)",
                    "priority": "critical",
                    "note": "Regular irrigation for uniform growth",
                },
                {
                    "stage": "Maturity (80-90 DAP)",
                    "priority": "low",
                    "note": "Reduce irrigation; stop 10 days before harvest",
                },
            ],
            "note": "Maintain soil moisture at 70–80% field capacity. Ridges help manage drainage.",
        },
    },
    "pest_management": {
        "wheat": {
            "yellow_rust": {
                "symptoms": "Yellow-orange powdery pustules in stripes on leaves",
                "conditions": "Cool (10–15°C), humid weather; appears in Jan–Feb in North India",
                "control": "Spray Propiconazole 25 EC @ 0.1% (1 ml/L) or Tebuconazole 250 EC @ 1 ml/L. Repeat after 15 days if needed.",
                "prevention": "Use resistant varieties (HD 3226, PBW 826). Early sowing reduces risk.",
            },
            "brown_rust": {
                "symptoms": "Small, round, orange-brown pustules scattered on leaves",
                "conditions": "Moderate temperatures (15–25°C) with high humidity",
                "control": "Same as yellow rust — spray Propiconazole @ 0.1%",
                "prevention": "Resistant varieties and timely sowing",
            },
            "aphids": {
                "symptoms": "Colonies of small green/black insects on leaves and ears; honeydew secretion",
                "conditions": "Warm, dry weather in Feb–Mar",
                "control": "Spray Imidacloprid 17.8 SL @ 0.5 ml/L or Thiamethoxam 25 WG @ 0.3 g/L",
                "prevention": "Avoid excess nitrogen. Use yellow sticky traps for early monitoring.",
            },
            "termites": {
                "symptoms": "Plants dry up in patches; roots hollowed out and filled with soil",
                "conditions": "Sandy and light-textured soils with low organic matter",
                "control": "Soil application of Chlorpyrifos 20 EC @ 5 L/ha with irrigation water",
                "prevention": "Use well-decomposed FYM. Treat seed with Chlorpyrifos @ 4 ml/kg.",
            },
        },
        "rice": {
            "stem_borer": {
                "symptoms": "Dead hearts in vegetative stage; white ears in reproductive stage",
                "conditions": "Warm, humid weather; staggered planting favors infestation",
                "control": "Apply Cartap hydrochloride 4G @ 25 kg/ha or spray Chlorantraniliprole 18.5 SC @ 0.3 ml/L",
                "prevention": "Remove stubbles after harvest. Clip seedling tips before transplanting. Use pheromone traps.",
            },
            "bph": {
                "symptoms": "Hopperburn — circular patches of dried plants in field",
                "conditions": "High humidity, dense canopy, excess nitrogen",
                "control": "Spray Pymetrozine 50 WG @ 0.6 g/L or Dinotefuran 20 SG @ 0.5 g/L at base of plants",
                "prevention": "Do not apply excess nitrogen. Drain field for 3–4 days. Avoid broad-spectrum insecticides.",
            },
            "blast": {
                "symptoms": "Diamond-shaped spots on leaves with grey center; neck blast causes broken panicle",
                "conditions": "Cool nights (20–26°C), high humidity, excess nitrogen",
                "control": "Spray Tricyclazole 75 WP @ 0.6 g/L or Isoprothiolane 40 EC @ 1.5 ml/L",
                "prevention": "Use resistant varieties (Pusa Basmati 1847). Balanced fertilization.",
            },
            "sheath_blight": {
                "symptoms": "Oval, greenish-grey lesions on leaf sheath near water line",
                "conditions": "High plant density, high nitrogen, warm humid weather",
                "control": "Spray Hexaconazole 5 EC @ 2 ml/L or Validamycin 3 L @ 2.5 ml/L",
                "prevention": "Avoid excessive close spacing. Balanced N application.",
            },
        },
        "cotton": {
            "bollworm": {
                "symptoms": "Bore holes in bolls with frass; damaged bolls rot or produce low quality lint",
                "conditions": "Warm humid weather; non-Bt cotton highly susceptible",
                "control": "Spray Emamectin benzoate 5 SG @ 0.4 g/L or Chlorantraniliprole @ 0.3 ml/L",
                "prevention": "Plant Bt cotton hybrids. Maintain 20% non-Bt refuge. Use pheromone traps.",
            },
            "whitefly": {
                "symptoms": "Sooty mould on leaves; sticky honeydew; cotton leaf curl virus transmission",
                "conditions": "Hot, dry weather; July–September peak",
                "control": "Spray Diafenthiuron 50 WP @ 1 g/L or Pyriproxyfen 10 EC @ 1 ml/L",
                "prevention": "Remove alternate host weeds. Avoid excess N. Use yellow sticky traps.",
            },
        },
        "maize": {
            "fall_armyworm": {
                "symptoms": "Irregular holes in leaves; large caterpillars with inverted Y-mark on head",
                "conditions": "Warm humid conditions; year-round in peninsular India",
                "control": "Spray Spinetoram 11.7 SC @ 0.5 ml/L or Emamectin benzoate 5 SG @ 0.4 g/L into whorl",
                "prevention": "Apply Trichogramma egg parasitoid cards (1 lakh eggs/ha). Scout weekly from emergence.",
            },
            "stem_borer": {
                "symptoms": "Shot holes on leaves; dead hearts; stems broken at node",
                "conditions": "Late-sown crops more susceptible",
                "control": "Apply Carbofuran 3G granules in whorl @ 8–10 kg/ha",
                "prevention": "Timely sowing. Destroy stubbles after harvest.",
            },
        },
        "potato": {
            "late_blight": {
                "symptoms": "Dark, water-soaked spots on leaves and stems; white fungal growth on underside",
                "conditions": "Cool (10–20°C), foggy, humid weather; Dec–Jan in North India",
                "control": "Spray Mancozeb 75 WP @ 2.5 g/L preventively. For curative, use Cymoxanil + Mancozeb @ 3 g/L.",
                "prevention": "Use resistant varieties (Kufri Badshah). Certified disease-free seed. Spray prophylactically.",
            },
            "aphids": {
                "symptoms": "Curling of leaves; transmission of potato viruses (PVY, PLRV)",
                "conditions": "Warm, dry weather; Feb–Mar",
                "control": "Spray Imidacloprid 17.8 SL @ 0.5 ml/L or Thiamethoxam 25 WG @ 0.3 g/L",
                "prevention": "Dehaulm (cut haulms) by end of January in seed crop areas.",
            },
        },
    },
    "sowing": {
        "wheat": {
            "rabi": {
                "optimal_date_range": "November 1 – November 25",
                "late_sowing_range": "November 25 – December 25 (increase seed rate by 25%)",
                "seed_rate": "100–125 kg/ha (timely); 125–150 kg/ha (late sown)",
                "seed_treatment": "Carboxin + Thiram (Vitavax Power) @ 2.5 g/kg seed for smut and root rot",
                "spacing": "Row-to-row: 20–22.5 cm; seed depth 4–5 cm",
                "soil_preparation": "2–3 deep ploughings + planking; pre-sowing irrigation (rauni/palewa) 3–4 days before",
                "varieties": {
                    "north_india": ["HD 3226", "PBW 826", "DBW 327", "WH 1270"],
                    "central_india": ["HI 1634", "MP 3336", "JW 3382"],
                    "peninsular": ["NI 5439", "NIAW 3170"],
                },
            },
        },
        "rice": {
            "kharif": {
                "optimal_date_range": "June 15 – July 15 (transplanting)",
                "nursery_sowing": "May 15 – June 15 (25-30 day old seedlings for transplanting)",
                "seed_rate": "20–25 kg/ha (transplanted); 30–40 kg/ha (direct seeded)",
                "seed_treatment": "Carbendazim 50 WP @ 2 g/kg seed for blast prevention",
                "spacing": "20 × 15 cm (fine grain); 20 × 20 cm (coarse grain)",
                "soil_preparation": "2 dry ploughings in summer, puddling in standing water; level field for uniform water",
                "varieties": {
                    "north_india": [
                        "Pusa Basmati 1847",
                        "PB 1509",
                        "PR 126",
                        "Pusa 44",
                    ],
                    "east_india": ["Swarna", "Rajendra Mahsuri", "Sahbhagi Dhan"],
                    "south_india": ["BPT 5204 (Samba Mahsuri)", "ADT 45", "CO 51"],
                },
            },
        },
        "maize": {
            "kharif": {
                "optimal_date_range": "June 15 – July 15",
                "seed_rate": "20–25 kg/ha for hybrids",
                "seed_treatment": "Thiram @ 3 g/kg seed",
                "spacing": "60 × 20 cm (30,000–35,000 plants/ha)",
                "varieties": {
                    "north_india": ["PMH 1", "HQPM 1", "DHM 121"],
                    "peninsular": ["NK 6240", "DKC 9164", "900M Gold"],
                },
            },
            "rabi": {
                "optimal_date_range": "October 15 – November 15",
                "seed_rate": "20 kg/ha",
                "spacing": "60 × 20 cm",
                "note": "Winter maize grown mainly in Bihar, West Bengal, and peninsular India",
            },
        },
        "mustard": {
            "rabi": {
                "optimal_date_range": "October 5 – October 25",
                "seed_rate": "3–5 kg/ha",
                "seed_treatment": "Metalaxyl 35 SD @ 6 g/kg seed for white rust",
                "spacing": "30 × 10 cm (row × plant); 45 × 15 cm for irrigated",
                "varieties": {
                    "north_india": ["Pusa Bold", "RH 749", "NRCHB 101"],
                    "rajasthan": ["RH 725", "Pusa Tarak", "NRCDR 2"],
                },
            },
        },
        "potato": {
            "rabi": {
                "optimal_date_range": "October 15 – November 10 (plains); March – April (hills)",
                "seed_rate": "20–25 quintals/ha (25–50 g tubers)",
                "seed_treatment": "Dip in Mancozeb 0.25% solution for 10 min; shade dry before planting",
                "spacing": "60 × 20 cm on ridges; 4–5 cm depth",
                "varieties": {
                    "north_india": ["Kufri Pukhraj", "Kufri Badshah", "Kufri Jyoti"],
                    "processing": ["Kufri Chipsona 1", "Kufri Chipsona 3", "Atlantic"],
                },
            },
        },
        "cotton": {
            "kharif": {
                "optimal_date_range": "April 15 – May 15 (irrigated); June with onset of monsoon (rainfed)",
                "seed_rate": "2.5 kg/ha (Bt hybrids, 450 g packets for 1 acre)",
                "spacing": "90–100 × 60–90 cm for Bt hybrids",
                "varieties": {
                    "north_india": ["RCH 773 BGII", "MRC 7361 BGII", "Ankur 3244 BGII"],
                    "central_india": ["Ajeet 199", "Jadoo BGII"],
                    "note": "Always maintain 20% non-Bt refuge (5 rows of non-Bt for every 20 rows of Bt)",
                },
            },
        },
        "sugarcane": {
            "spring": {
                "optimal_date_range": "February 15 – March 15",
                "seed_rate": "40,000–45,000 three-budded setts/ha (75–80 quintals/ha)",
                "seed_treatment": "Dip setts in Carbendazim 0.1% + Malathion 0.1% for 10 min",
                "spacing": "75–90 cm row-to-row; setts placed end-to-end in furrows",
                "varieties": {
                    "north_india": ["CoS 767", "Co 0238", "CoLk 94184", "CoPk 05191"],
                    "peninsular": ["Co 86032", "CoC 671", "CoM 0265"],
                },
            },
            "autumn": {
                "optimal_date_range": "October 1 – October 31",
                "seed_rate": "Same as spring planting",
                "note": "Autumn planting gives 15–20% higher yield than spring; mainly in subtropical India.",
            },
        },
    },
    "harvest": {
        "wheat": {
            "timing": "Grain moisture content 12–14%; golden yellow colour; grain hard when pressed",
            "duration": "135–150 days after sowing (mid-March to mid-April in North India)",
            "method": "Combine harvester preferred; manual harvesting 3–5 cm above ground",
            "post_harvest": "Thresh within 3–4 days of cutting. Sun-dry to 12% moisture for safe storage.",
            "yield": "40–55 quintals/ha (irrigated, timely sown); 25–35 quintals/ha (late sown)",
        },
        "rice": {
            "timing": "80% grains in panicle are golden yellow; moisture 20–22% at harvest",
            "duration": "120–150 days after transplanting (October–November for kharif)",
            "method": "Combine harvester or manual harvesting; drain field 10–15 days before",
            "post_harvest": "Dry paddy to 14% moisture. Avoid drying on road — causes grain breakage.",
            "yield": "45–60 quintals/ha (irrigated hybrid); 30–40 quintals/ha (traditional)",
        },
        "maize": {
            "timing": "Husk turns brown and dry; black layer visible at base of kernel",
            "duration": "90–110 days after sowing",
            "method": "Cobs picked by hand; kernels separated after drying",
            "post_harvest": "Dry kernels to 12% moisture. Store in airtight containers to prevent aflatoxin.",
            "yield": "60–80 quintals/ha (hybrid irrigated); 25–40 quintals/ha (rainfed)",
        },
        "sugarcane": {
            "timing": "Brix value > 20% on hand refractometer; 10–12 months after planting",
            "duration": "February – April (spring planted); December – February (autumn planted)",
            "method": "Cut at ground level with sharp billhook; remove green tops",
            "post_harvest": "Crush within 24–48 hours of harvest for maximum sugar recovery.",
            "yield": "700–1000 quintals/ha (plant crop); 600–800 quintals/ha (ratoon)",
        },
        "mustard": {
            "timing": "Pods turn yellowish-brown; seeds become brown and hard",
            "duration": "120–140 days after sowing (February–March)",
            "method": "Harvest in morning hours to prevent shattering; dry in shade for 4–5 days",
            "post_harvest": "Thresh with sticks. Clean and dry to 8% moisture for safe storage.",
            "yield": "15–20 quintals/ha (irrigated); 8–12 quintals/ha (rainfed)",
        },
        "cotton": {
            "timing": "Bolls burst open and lint is fluffy white",
            "duration": "150–180 days; 3–4 pickings at 15-day intervals from September onwards",
            "method": "Hand-pick only fully opened bolls in dry conditions. Avoid mixing with trash.",
            "post_harvest": "Sun-dry picked cotton to reduce moisture. Grade before selling.",
            "yield": "20–25 quintals seed cotton/ha (Bt irrigated); 10–15 quintals/ha (rainfed)",
        },
        "potato": {
            "timing": "Haulms turn yellow and dry; skin of tuber doesn't peel off easily",
            "duration": "75–100 days after planting (January–February in plains)",
            "method": "Cut haulms 10 days before digging. Use potato digger or spade carefully.",
            "post_harvest": "Cure at 15–20°C for 10 days. Cold store at 2–4°C for table purpose, 10–12°C for processing.",
            "yield": "250–350 quintals/ha",
        },
    },
    "market_info": {
        "wheat": {
            "msp_2025_26": "Rs 2,425 per quintal",
            "procurement": "FCI and state agencies at MSP during April–June",
            "tips": "Register on e-NAM (National Agriculture Market) for better price discovery.",
        },
        "rice": {
            "msp_2025_26": "Rs 2,300 per quintal (Common); Rs 2,320 per quintal (Grade A)",
            "procurement": "Government procurement during October–January",
            "tips": "Paddy should have max 17% moisture for procurement. Grade A fetches premium.",
        },
        "maize": {
            "msp_2025_26": "Rs 2,090 per quintal",
            "procurement": "State agencies in select states; limited government procurement",
            "tips": "Poultry feed industry is a major buyer; contract farming can ensure better prices.",
        },
        "sugarcane": {
            "frp_2025_26": "Rs 340 per quintal (at 10.25% basic recovery rate)",
            "sap_note": "State Advised Price (SAP) varies: UP Rs 380/qtl, Haryana Rs 400/qtl (approx.)",
            "tips": "Higher sugar recovery in your cane means premium; maintain quality for bonus.",
        },
        "mustard": {
            "msp_2025_26": "Rs 5,950 per quintal",
            "procurement": "NAFED as central agency; limited procurement in Rajasthan, MP, Haryana",
            "tips": "Clean, well-dried mustard with low moisture fetches better rates at mandis.",
        },
        "cotton": {
            "msp_2025_26": "Rs 7,521 per quintal (medium staple); Rs 7,921 per quintal (long staple)",
            "procurement": "CCI as central agency; state cooperatives",
            "tips": "Staple length and trash content determine grade and price. Pick clean.",
        },
        "potato": {
            "note": "No MSP for potato; market-driven pricing",
            "average_price": "Rs 800–1,500 per quintal depending on season and supply",
            "tips": "Store in cold storage for off-season sale at premium. Contract farming with chip companies.",
        },
    },
}

GOVERNMENT_SCHEMES: list[dict[str, Any]] = [
    {
        "id": "pm-kisan",
        "name": "PM-KISAN Samman Nidhi",
        "description": "Direct income support of Rs 6,000 per year to all landholding farmer families across the country.",
        "benefit": "Rs 6,000/year in 3 installments of Rs 2,000 each",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": "Institutional landholders, income tax payers, government servants, pensioners (>Rs 10,000/month)",
        },
        "application_url": "https://pmkisan.gov.in",
        "documents_required": [
            "Aadhaar card",
            "Bank account (Aadhaar-linked)",
            "Land records",
        ],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "income_support",
    },
    {
        "id": "pmfby",
        "name": "Pradhan Mantri Fasal Bima Yojana",
        "description": "Comprehensive crop insurance scheme providing financial support to farmers in case of crop loss due to natural calamities, pests, and diseases.",
        "benefit": "Crop insurance at subsidized premium — 2% for kharif, 1.5% for rabi, 5% for commercial/horticultural crops",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "https://pmfby.gov.in",
        "documents_required": [
            "Aadhaar card",
            "Bank account",
            "Land records / Tenancy agreement",
            "Sowing certificate",
        ],
        "applicable_states": "all",
        "crop_specific": True,
        "category": "insurance",
    },
    {
        "id": "soil-health-card",
        "name": "Soil Health Card Scheme",
        "description": "Government provides soil health cards to farmers with crop-wise nutrient recommendations based on soil testing.",
        "benefit": "Free soil testing and customized fertilizer recommendation every 2 years",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "https://soilhealth.dac.gov.in",
        "documents_required": ["Aadhaar card", "Land details"],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "soil_health",
    },
    {
        "id": "kcc",
        "name": "Kisan Credit Card",
        "description": "Provides short-term credit to farmers for crop production, post-harvest, and maintenance of farm assets at subsidized 4% interest rate.",
        "benefit": "Credit limit up to Rs 3 lakh at 4% interest (with prompt repayment subvention); Rs 1.6 lakh without collateral",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "Apply at any commercial/cooperative/regional rural bank",
        "documents_required": [
            "Aadhaar card",
            "PAN card",
            "Land records",
            "Passport photo",
            "Bank application form",
        ],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "credit",
    },
    {
        "id": "pm-kusum",
        "name": "PM-KUSUM (Kisan Urja Suraksha evam Utthaan Mahabhiyan)",
        "description": "Promotes solar energy in agriculture: solar pumps, grid-connected solar plants, and solarization of existing pumps.",
        "benefit": "60% subsidy on solar pumps (30% central + 30% state); up to 7.5 HP solar pump; extra income from surplus solar power",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "https://pmkusum.mnre.gov.in",
        "documents_required": [
            "Aadhaar card",
            "Land records",
            "Bank account",
            "Electricity connection details (if solarizing)",
        ],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "infrastructure",
    },
    {
        "id": "pkvy",
        "name": "Paramparagat Krishi Vikas Yojana (PKVY)",
        "description": "Promotes organic farming through cluster approach with financial assistance for conversion to organic.",
        "benefit": "Rs 50,000/ha over 3 years (Rs 31,000 to farmer for inputs, Rs 8,800 for value addition and marketing)",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": "Must form cluster of 20+ hectares with 50+ farmers",
        },
        "application_url": "Apply through District Agriculture Office or https://pgsindia-ncof.gov.in",
        "documents_required": [
            "Aadhaar card",
            "Land records",
            "Cluster formation documents",
        ],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "organic_farming",
    },
    {
        "id": "nmsa",
        "name": "National Mission for Sustainable Agriculture (NMSA)",
        "description": "Promotes sustainable agriculture through soil health management, rainfed area development, and climate change adaptation.",
        "benefit": "50% subsidy on micro-irrigation (drip/sprinkler); assistance for water harvesting structures",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "Apply through District Agriculture Office",
        "documents_required": ["Aadhaar card", "Land records", "Bank account"],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "sustainability",
    },
    {
        "id": "smam",
        "name": "Sub-Mission on Agricultural Mechanization (SMAM)",
        "description": "Provides subsidies for purchase of agricultural machinery and equipment and establishment of custom hiring centres.",
        "benefit": "40–50% subsidy on farm machinery for small/marginal farmers; 25–40% for others",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "https://agrimachinery.nic.in",
        "documents_required": [
            "Aadhaar card",
            "Land records",
            "Bank account",
            "Caste certificate (if SC/ST)",
        ],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "mechanization",
    },
    {
        "id": "rkvy",
        "name": "Rashtriya Krishi Vikas Yojana (RKVY-RAFTAAR)",
        "description": "Supports state-specific agricultural development projects including agri-infrastructure, value addition, and agri-entrepreneurship.",
        "benefit": "Varies by project — grants for agri-startups (up to Rs 25 lakh), infrastructure projects funded up to 100%",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "https://rkvy.nic.in",
        "documents_required": ["Varies by state and project type"],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "agri_startup",
    },
    {
        "id": "enam",
        "name": "e-NAM (National Agriculture Market)",
        "description": "Online trading platform for agricultural commodities connecting APMC mandis across states for transparent price discovery.",
        "benefit": "Access to buyers across India; transparent bidding; direct payment to bank account; reduced intermediary costs",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "https://enam.gov.in",
        "documents_required": [
            "Aadhaar card",
            "Bank account",
            "Mandi license (or apply through FPO)",
        ],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "market_access",
    },
    {
        "id": "pmksy",
        "name": "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
        "description": "Ensures access to irrigation ('Har Khet Ko Paani') and promotes micro-irrigation ('Per Drop More Crop').",
        "benefit": "55% subsidy on micro-irrigation for small/marginal farmers (45% for others); support for water harvesting",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "Apply through District Agriculture/Horticulture Office or https://pmksy.gov.in",
        "documents_required": [
            "Aadhaar card",
            "Land records",
            "Bank account",
            "Quotation from drip/sprinkler supplier",
        ],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "irrigation",
    },
    {
        "id": "agri-infra-fund",
        "name": "Agriculture Infrastructure Fund (AIF)",
        "description": "Rs 1 lakh crore financing facility for post-harvest management and community farming assets.",
        "benefit": "3% interest subvention on loans up to Rs 2 crore; credit guarantee under CGTMSE",
        "eligibility": {
            "land_holding_max_ha": None,
            "category": ["small_marginal", "medium", "large"],
            "exclusions": None,
        },
        "application_url": "https://agriinfra.dac.gov.in",
        "documents_required": [
            "Project report",
            "Aadhaar card",
            "Bank account",
            "Land/rental documents",
        ],
        "applicable_states": "all",
        "crop_specific": False,
        "category": "infrastructure",
    },
]

CROP_CALENDAR: dict[str, dict[str, list[dict[str, Any]]]] = {
    "wheat": {
        "rabi": [
            {
                "week": 1,
                "month": "October",
                "start_day": 15,
                "task": "Field preparation — 2-3 deep ploughings followed by planking to level field",
                "details": "Incorporate 10-12 tonnes FYM/ha during last ploughing. Get soil tested.",
                "priority": "high",
            },
            {
                "week": 2,
                "month": "October",
                "start_day": 22,
                "task": "Pre-sowing irrigation (rauni/palewa)",
                "details": "Give a heavy irrigation 3-4 days before sowing for optimum moisture at sowing.",
                "priority": "high",
            },
            {
                "week": 3,
                "month": "November",
                "start_day": 1,
                "task": "Sowing with basal fertilizer application",
                "details": "Sow at 100-125 kg/ha seed rate with full DAP + MOP + half urea as basal. Row spacing 20-22.5 cm.",
                "priority": "critical",
            },
            {
                "week": 4,
                "month": "November",
                "start_day": 15,
                "task": "Herbicide application (if needed)",
                "details": "Spray Sulfosulfuron 75 WG @ 25 g/ha or Clodinafop + Metsulfuron at 21-25 DAS for weeds.",
                "priority": "medium",
            },
            {
                "week": 5,
                "month": "November",
                "start_day": 22,
                "task": "First irrigation at Crown Root Initiation (CRI)",
                "details": "Most critical irrigation at 21 DAS. Apply remaining half urea (60 kg/ha) with this irrigation.",
                "priority": "critical",
            },
            {
                "week": 6,
                "month": "December",
                "start_day": 10,
                "task": "Second irrigation at tillering",
                "details": "Irrigate at 40-45 DAS. Scout for aphids and yellow rust symptoms.",
                "priority": "high",
            },
            {
                "week": 7,
                "month": "January",
                "start_day": 1,
                "task": "Third irrigation at jointing + field scouting",
                "details": "Irrigate at 60-65 DAS. Watch for yellow rust (orange stripes on leaves).",
                "priority": "high",
            },
            {
                "week": 8,
                "month": "January",
                "start_day": 15,
                "task": "Disease management spray (if needed)",
                "details": "If rust observed, spray Propiconazole 25 EC @ 1 ml/L. Repeat after 15 days if needed.",
                "priority": "medium",
            },
            {
                "week": 9,
                "month": "February",
                "start_day": 1,
                "task": "Fourth irrigation at flowering",
                "details": "Critical for grain set. Spray Imidacloprid if aphid colonies visible on ears.",
                "priority": "critical",
            },
            {
                "week": 10,
                "month": "February",
                "start_day": 15,
                "task": "Fifth irrigation at milk stage",
                "details": "Important for grain filling. Avoid water stress.",
                "priority": "high",
            },
            {
                "week": 11,
                "month": "March",
                "start_day": 1,
                "task": "Sixth irrigation at dough stage (if needed)",
                "details": "Light irrigation if hot winds prevail. No more irrigation after this.",
                "priority": "medium",
            },
            {
                "week": 12,
                "month": "March",
                "start_day": 20,
                "task": "Arrange for harvesting",
                "details": "Book combine harvester. Harvest when grain is hard, golden yellow, 12-14% moisture.",
                "priority": "high",
            },
            {
                "week": 13,
                "month": "April",
                "start_day": 1,
                "task": "Harvesting, threshing, and storage",
                "details": "Harvest, thresh within 3-4 days. Sun-dry to 12% moisture. Store in clean, dry godowns.",
                "priority": "critical",
            },
        ],
    },
    "rice": {
        "kharif": [
            {
                "week": 1,
                "month": "May",
                "start_day": 15,
                "task": "Nursery preparation and seed sowing",
                "details": "Prepare raised nursery beds. Sow pre-germinated seeds at 20-25 kg/ha. Keep moist.",
                "priority": "high",
            },
            {
                "week": 2,
                "month": "June",
                "start_day": 1,
                "task": "Main field preparation — ploughing and puddling",
                "details": "2 dry ploughings + 2-3 puddlings in standing water. Apply FYM @ 10 t/ha. Level field.",
                "priority": "high",
            },
            {
                "week": 3,
                "month": "June",
                "start_day": 15,
                "task": "Transplanting with basal fertilizer",
                "details": "Transplant 25-30 day old seedlings at 20x15 cm. Apply full DAP + half MOP as basal.",
                "priority": "critical",
            },
            {
                "week": 4,
                "month": "July",
                "start_day": 1,
                "task": "Gap filling and weed management",
                "details": "Fill gaps within 7-10 days. Apply Bispyribac Na @ 25 g/ha for weed control.",
                "priority": "high",
            },
            {
                "week": 5,
                "month": "July",
                "start_day": 7,
                "task": "First top-dressing of nitrogen",
                "details": "Apply 1/3 urea (43 kg/ha) at 21 DAT during tillering. Maintain 2-5 cm standing water.",
                "priority": "critical",
            },
            {
                "week": 6,
                "month": "July",
                "start_day": 21,
                "task": "Field scouting for stem borer, BPH",
                "details": "Check for dead hearts. Install pheromone traps. Drain field for 2-3 days to control tillers.",
                "priority": "medium",
            },
            {
                "week": 7,
                "month": "August",
                "start_day": 1,
                "task": "Second top-dressing at panicle initiation",
                "details": "Apply 1/3 urea + remaining MOP at 45 DAT. Maintain 5 cm standing water.",
                "priority": "critical",
            },
            {
                "week": 8,
                "month": "August",
                "start_day": 15,
                "task": "Pest and disease management",
                "details": "Spray for blast if symptoms appear (Tricyclazole @ 0.6 g/L). Check for BPH at base.",
                "priority": "high",
            },
            {
                "week": 9,
                "month": "September",
                "start_day": 1,
                "task": "Flowering stage care",
                "details": "Maintain 5 cm water. Do not spray insecticides during flowering to protect pollinators.",
                "priority": "high",
            },
            {
                "week": 10,
                "month": "September",
                "start_day": 15,
                "task": "Grain filling — maintain water and scout",
                "details": "Monitor for neck blast and sheath blight. Gradually reduce water.",
                "priority": "medium",
            },
            {
                "week": 11,
                "month": "October",
                "start_day": 1,
                "task": "Drain field before harvest",
                "details": "Stop irrigation 15 days before expected harvest. Field should be dry at harvest.",
                "priority": "high",
            },
            {
                "week": 12,
                "month": "October",
                "start_day": 15,
                "task": "Harvesting and post-harvest",
                "details": "Harvest when 80% grains are golden. Dry to 14% moisture. Do not burn stubble.",
                "priority": "critical",
            },
        ],
    },
    "maize": {
        "kharif": [
            {
                "week": 1,
                "month": "June",
                "start_day": 1,
                "task": "Field preparation",
                "details": "2-3 ploughings. Apply 10 t/ha FYM. Prepare ridges and furrows at 60 cm spacing.",
                "priority": "high",
            },
            {
                "week": 2,
                "month": "June",
                "start_day": 15,
                "task": "Sowing with basal fertilizer",
                "details": "Sow at 60x20 cm. Apply 1/3 N + full P + full K as basal. Treat seed with Thiram.",
                "priority": "critical",
            },
            {
                "week": 3,
                "month": "July",
                "start_day": 1,
                "task": "Thinning and gap filling",
                "details": "Maintain one plant per hill at 20 cm. Remove extra seedlings at 10-12 DAS.",
                "priority": "medium",
            },
            {
                "week": 4,
                "month": "July",
                "start_day": 15,
                "task": "First top-dressing + earthing up",
                "details": "Apply 1/3 N at knee-high (30 DAS). Earth up soil to base of plants for support.",
                "priority": "critical",
            },
            {
                "week": 5,
                "month": "July",
                "start_day": 25,
                "task": "Scout for fall armyworm",
                "details": "Check whorls for caterpillars. Apply Spinetoram if > 10% plants infested.",
                "priority": "high",
            },
            {
                "week": 6,
                "month": "August",
                "start_day": 5,
                "task": "Second top-dressing at tasseling",
                "details": "Apply remaining 1/3 N at 50 DAS. Irrigate if dry spell during tasseling-silking.",
                "priority": "critical",
            },
            {
                "week": 7,
                "month": "August",
                "start_day": 20,
                "task": "Irrigation at grain filling",
                "details": "Ensure moisture during grain filling. Avoid waterlogging.",
                "priority": "high",
            },
            {
                "week": 8,
                "month": "September",
                "start_day": 10,
                "task": "Harvest and post-harvest",
                "details": "Harvest when husk is brown and dry. Dry kernels to 12% moisture. Store airtight.",
                "priority": "critical",
            },
        ],
    },
    "mustard": {
        "rabi": [
            {
                "week": 1,
                "month": "September",
                "start_day": 25,
                "task": "Field preparation",
                "details": "2-3 ploughings to get fine tilth. Apply FYM @ 8-10 t/ha.",
                "priority": "high",
            },
            {
                "week": 2,
                "month": "October",
                "start_day": 10,
                "task": "Sowing with basal fertilizer",
                "details": "Sow at 3-5 kg/ha, 30x10 cm spacing. Apply half N + full P + sulphur as basal.",
                "priority": "critical",
            },
            {
                "week": 3,
                "month": "October",
                "start_day": 25,
                "task": "Thinning",
                "details": "Thin to one plant every 10-15 cm at 15-20 DAS.",
                "priority": "medium",
            },
            {
                "week": 4,
                "month": "November",
                "start_day": 10,
                "task": "First irrigation + top-dressing",
                "details": "Apply remaining N with first irrigation at 25-30 DAS.",
                "priority": "critical",
            },
            {
                "week": 5,
                "month": "December",
                "start_day": 1,
                "task": "Aphid monitoring",
                "details": "Check for mustard aphid on leaves and stems. Spray Imidacloprid if heavy infestation.",
                "priority": "high",
            },
            {
                "week": 6,
                "month": "December",
                "start_day": 15,
                "task": "White rust and Alternaria check",
                "details": "Spray Mancozeb @ 2.5 g/L if white pustules or dark spots seen on leaves.",
                "priority": "medium",
            },
            {
                "week": 7,
                "month": "January",
                "start_day": 5,
                "task": "Second irrigation at pod filling",
                "details": "Light irrigation at 70-75 DAS if soil is dry. Avoid excess water.",
                "priority": "medium",
            },
            {
                "week": 8,
                "month": "February",
                "start_day": 15,
                "task": "Harvesting",
                "details": "Harvest when 75% pods turn yellow-brown. Harvest in morning to prevent shattering. Dry in shade.",
                "priority": "critical",
            },
        ],
    },
    "cotton": {
        "kharif": [
            {
                "week": 1,
                "month": "April",
                "start_day": 1,
                "task": "Field preparation",
                "details": "Deep ploughing + 2-3 harrowings. Apply FYM @ 10 t/ha. Form ridges at 90-100 cm.",
                "priority": "high",
            },
            {
                "week": 2,
                "month": "April",
                "start_day": 20,
                "task": "Sowing",
                "details": "Dibble Bt hybrid seeds at 90x60 cm. One seed per hill. Sow 20% non-Bt refuge on border.",
                "priority": "critical",
            },
            {
                "week": 3,
                "month": "May",
                "start_day": 15,
                "task": "Gap filling and first irrigation",
                "details": "Fill gaps at 10-15 DAS. First irrigation if no rain for support of young plants.",
                "priority": "high",
            },
            {
                "week": 4,
                "month": "June",
                "start_day": 1,
                "task": "First top-dressing + hoeing",
                "details": "Apply 1/4 N at 20-25 DAS. Interculture with hoe for weed control.",
                "priority": "high",
            },
            {
                "week": 5,
                "month": "June",
                "start_day": 20,
                "task": "Second top-dressing at squaring",
                "details": "Apply 1/4 N + remaining K at 40 DAS. Earth up for support.",
                "priority": "critical",
            },
            {
                "week": 6,
                "month": "July",
                "start_day": 10,
                "task": "Sucking pest management",
                "details": "Monitor for whitefly, jassids, thrips. Spray if threshold crossed. Avoid broad-spectrum.",
                "priority": "high",
            },
            {
                "week": 7,
                "month": "August",
                "start_day": 1,
                "task": "Third top-dressing + bollworm scout",
                "details": "Apply 1/4 N at flowering (65 DAS). Check for bollworm entry holes in squares/bolls.",
                "priority": "critical",
            },
            {
                "week": 8,
                "month": "August",
                "start_day": 20,
                "task": "Fourth top-dressing + boll care",
                "details": "Apply remaining 1/4 N at 85 DAS. Spray for bollworm if needed.",
                "priority": "high",
            },
            {
                "week": 9,
                "month": "September",
                "start_day": 15,
                "task": "First picking",
                "details": "Pick only fully opened bolls. Pick in dry conditions. Separate good and stained cotton.",
                "priority": "high",
            },
            {
                "week": 10,
                "month": "October",
                "start_day": 1,
                "task": "Subsequent pickings (2nd-4th)",
                "details": "Pick every 15-20 days. Continue till December for late bolls.",
                "priority": "high",
            },
        ],
    },
    "potato": {
        "rabi": [
            {
                "week": 1,
                "month": "October",
                "start_day": 1,
                "task": "Field preparation",
                "details": "Deep ploughing + 2-3 harrowings. Apply FYM @ 25 t/ha. Make ridges at 60 cm.",
                "priority": "high",
            },
            {
                "week": 2,
                "month": "October",
                "start_day": 15,
                "task": "Seed tuber preparation and planting",
                "details": "Plant 25-50 g tubers at 60x20 cm on ridges. Apply 2/3 N + full P + full K as basal.",
                "priority": "critical",
            },
            {
                "week": 3,
                "month": "November",
                "start_day": 1,
                "task": "First irrigation + weed management",
                "details": "Light irrigation at 3-4 DAP. Spray Metribuzin @ 1 g/L pre-emergence for weeds.",
                "priority": "high",
            },
            {
                "week": 4,
                "month": "November",
                "start_day": 15,
                "task": "Earthing up + top-dressing",
                "details": "Earth up at 30 DAP. Apply remaining 1/3 N. Cover tubers completely to prevent greening.",
                "priority": "critical",
            },
            {
                "week": 5,
                "month": "December",
                "start_day": 1,
                "task": "Late blight prevention spray",
                "details": "Prophylactic spray of Mancozeb @ 2.5 g/L every 10-12 days during foggy weather.",
                "priority": "high",
            },
            {
                "week": 6,
                "month": "December",
                "start_day": 15,
                "task": "Tuber bulking — regular irrigation",
                "details": "Irrigate every 7-10 days. Maintain 70-80% field capacity. Scout for late blight.",
                "priority": "critical",
            },
            {
                "week": 7,
                "month": "January",
                "start_day": 5,
                "task": "Aphid monitoring and dehaulming (for seed crop)",
                "details": "Check for aphids. Cut haulms by Jan end for seed crop to prevent virus spread.",
                "priority": "high",
            },
            {
                "week": 8,
                "month": "January",
                "start_day": 25,
                "task": "Harvesting",
                "details": "Harvest when haulms dry and skin doesn't peel. Cure at 15-20°C for 10 days before storage.",
                "priority": "critical",
            },
        ],
    },
    "sugarcane": {
        "spring": [
            {
                "week": 1,
                "month": "February",
                "start_day": 1,
                "task": "Field preparation",
                "details": "Deep ploughing + 2-3 harrowings. Open furrows at 75-90 cm. Apply FYM @ 25 t/ha.",
                "priority": "high",
            },
            {
                "week": 2,
                "month": "February",
                "start_day": 20,
                "task": "Planting setts with basal fertilizer",
                "details": "Plant 3-bud setts end-to-end in furrows. Apply full P + full K in furrows. Irrigate immediately.",
                "priority": "critical",
            },
            {
                "week": 3,
                "month": "March",
                "start_day": 10,
                "task": "Gap filling and light irrigation",
                "details": "Fill gaps at 30 DAP with pre-germinated setts. Irrigate every 7 days.",
                "priority": "high",
            },
            {
                "week": 4,
                "month": "March",
                "start_day": 25,
                "task": "First top-dressing + earthing up",
                "details": "Apply 1/3 N (115 kg urea/ha) at 30 DAP with first earthing up.",
                "priority": "critical",
            },
            {
                "week": 5,
                "month": "April",
                "start_day": 20,
                "task": "Second top-dressing + earthing up",
                "details": "Apply 1/3 N at 60 DAP with second earthing up. Interculture for weeds.",
                "priority": "critical",
            },
            {
                "week": 6,
                "month": "May",
                "start_day": 15,
                "task": "Third top-dressing + trash mulching",
                "details": "Apply remaining 1/3 N at 90 DAP. Final earthing up. Mulch with dry leaves in furrows.",
                "priority": "high",
            },
            {
                "week": 7,
                "month": "June",
                "start_day": 1,
                "task": "Grand growth phase — regular irrigation",
                "details": "Maximum water requirement period. Irrigate every 7-10 days. Tie canes if lodging.",
                "priority": "critical",
            },
            {
                "week": 8,
                "month": "July",
                "start_day": 1,
                "task": "Pest scouting (borer, pyrilla)",
                "details": "Release Trichogramma cards for borer. Check for pyrilla (leaf hopper).",
                "priority": "medium",
            },
            {
                "week": 9,
                "month": "September",
                "start_day": 1,
                "task": "Tying and propping",
                "details": "Tie canes to prevent lodging during monsoon winds. Remove dried leaves.",
                "priority": "medium",
            },
            {
                "week": 10,
                "month": "December",
                "start_day": 1,
                "task": "Withhold irrigation before harvest",
                "details": "Stop irrigation 15-20 days before harvest to increase sugar content.",
                "priority": "high",
            },
            {
                "week": 11,
                "month": "January",
                "start_day": 1,
                "task": "Harvesting",
                "details": "Cut at ground level. Remove green tops. Crush within 24-48 hours for best recovery.",
                "priority": "critical",
            },
        ],
    },
}

FAQ_DATA: list[dict[str, Any]] = [
    {
        "id": 1,
        "topic": "soil_health",
        "question": "How often should I get my soil tested?",
        "answer": "Get your soil tested every 2 years before the sowing season. Under the Soil Health Card scheme, the government provides free testing. Collect samples from 6-8 spots at 15 cm depth, mix them, and send 500 g to the nearest soil testing lab. This helps optimize fertilizer use and can save Rs 2,000-3,000/ha.",
    },
    {
        "id": 2,
        "topic": "fertilizer",
        "question": "How much urea should I apply to wheat?",
        "answer": "For irrigated timely-sown wheat, the total nitrogen recommendation is 120 kg N/ha (about 260 kg urea/ha). Apply in 2 splits: half at sowing as basal and half at the first irrigation (CRI stage, 21 days after sowing). Never apply all urea at once — it causes lodging and is inefficient.",
    },
    {
        "id": 3,
        "topic": "irrigation",
        "question": "Which is the most critical irrigation for wheat?",
        "answer": "The Crown Root Initiation (CRI) stage irrigation at 21 days after sowing is the most critical. Skipping this single irrigation can reduce yield by 30-40%. If you can only irrigate once, always irrigate at CRI. The second most important is at flowering (80-85 DAS).",
    },
    {
        "id": 4,
        "topic": "pest_management",
        "question": "How do I identify and control yellow rust in wheat?",
        "answer": "Yellow rust appears as yellow-orange powdery stripes on the upper surface of leaves, usually during January-February when temperatures are 10-15°C with high humidity. Spray Propiconazole 25 EC @ 1 ml/L or Tebuconazole 250 EC @ 1 ml/L. Use 500 L water per hectare. Repeat after 15 days if needed. Prevention: sow resistant varieties like HD 3226 or PBW 826.",
    },
    {
        "id": 5,
        "topic": "schemes",
        "question": "How can I apply for PM-KISAN?",
        "answer": "Visit pmkisan.gov.in or your village panchayat/Common Service Centre. You need: Aadhaar card, Aadhaar-linked bank account, and land records (khatauni). The scheme gives Rs 6,000/year in 3 installments of Rs 2,000 each directly to your bank account. All landholding families are eligible except income tax payers and government employees.",
    },
    {
        "id": 6,
        "topic": "schemes",
        "question": "What is the benefit of Kisan Credit Card?",
        "answer": "KCC provides short-term crop loans at just 4% interest (with prompt repayment subvention) against the normal 7-9%. You get a credit limit up to Rs 3 lakh without collateral. It can be used for crop production costs, post-harvest expenses, and even allied activities like dairy. Apply at any bank branch with your Aadhaar, land records, and passport photo.",
    },
    {
        "id": 7,
        "topic": "market_info",
        "question": "What is MSP and how do I sell at MSP?",
        "answer": "MSP (Minimum Support Price) is the guaranteed minimum price at which the government buys your produce. To sell at MSP: 1) Register on your state's procurement portal before the season. 2) Bring your produce to the designated APMC mandi or procurement centre. 3) Ensure quality standards are met (moisture content, foreign matter). FCI buys wheat and rice; NAFED buys pulses and oilseeds.",
    },
    {
        "id": 8,
        "topic": "organic_farming",
        "question": "How can I start organic farming?",
        "answer": "Start the transition: 1) Get soil tested. 2) Prepare compost (NADEP/vermi) — you need 5-8 tonnes/ha. 3) Replace chemical fertilizers gradually with FYM, vermicompost, Jeevamrut, and Panchagavya. 4) Use neem-based pesticides and bio-agents (Trichoderma, Pseudomonas). 5) Register under Paramparagat Krishi Vikas Yojana (PKVY) for Rs 50,000/ha assistance over 3 years. Full conversion takes 3 years for organic certification.",
    },
    {
        "id": 9,
        "topic": "irrigation",
        "question": "What are the benefits of drip irrigation?",
        "answer": "Drip irrigation saves 30-50% water compared to flood irrigation, increases yield by 20-30%, reduces fertilizer use (with fertigation), and decreases weed growth. It is especially beneficial for sugarcane, cotton, vegetables, and fruits. Under PM Krishi Sinchayee Yojana, small/marginal farmers get 55% subsidy on drip systems. Apply through your District Agriculture/Horticulture Office.",
    },
    {
        "id": 10,
        "topic": "general",
        "question": "How do I register on e-NAM?",
        "answer": "Register on enam.gov.in or through the e-NAM mobile app. You need: Aadhaar card, bank account details, and a mandi license (or register through your Farmer Producer Organization). e-NAM allows you to see real-time prices across mandis in India, get competitive bids for your produce, and receive payment directly to your bank account. Over 1,000 mandis across 18 states are connected.",
    },
    {
        "id": 11,
        "topic": "pest_management",
        "question": "How to control fall armyworm in maize?",
        "answer": "Identify: Large caterpillar with inverted Y-mark on head, feeding inside the whorl. Control: Spray Spinetoram 11.7 SC @ 0.5 ml/L or Emamectin benzoate 5 SG @ 0.4 g/L directly into the whorl. For biological control, release Trichogramma chilonis egg parasitoid cards at 1 lakh eggs/ha. Scout weekly from crop emergence. Use pheromone traps (5/ha) for adult monitoring.",
    },
    {
        "id": 12,
        "topic": "sowing",
        "question": "What is the best time to sow wheat in North India?",
        "answer": "The optimal sowing window for wheat in North India is November 1-25. Timely sowing yields 40-55 q/ha. Late sowing (after Nov 25) reduces yield by 30-40 kg/ha for each week of delay. For late sowing, use short-duration varieties (HD 3059, PBW 771) and increase seed rate by 25% (125-150 kg/ha). Very late sowing beyond December 25 is not recommended.",
    },
]

# ============================================================
# Intent Detection
# ============================================================

_INTENT_KEYWORDS: dict[str, list[str]] = {
    "fertilizer_advice": [
        "fertilizer",
        "fertiliser",
        "urea",
        "dap",
        "npk",
        "mop",
        "potash",
        "khad",
        "khaad",
        "nitrogen",
        "phosphorus",
        "phosphorous",
        "manure",
        "compost",
        "nutrient",
        "zinc",
        "sulphur",
        "micronutrient",
        "top dressing",
        "top-dressing",
        "basal dose",
    ],
    "irrigation_advice": [
        "irrigation",
        "irrigate",
        "water",
        "watering",
        "paani",
        "pani",
        "sinchai",
        "drip",
        "sprinkler",
        "flood",
        "moisture",
        "dry",
        "drought",
        "submergence",
        "waterlogging",
        "rauni",
        "palewa",
    ],
    "pest_management": [
        "pest",
        "insect",
        "disease",
        "fungus",
        "fungal",
        "virus",
        "bacteria",
        "rog",
        "keeda",
        "kida",
        "kira",
        "bimari",
        "rust",
        "blight",
        "wilt",
        "aphid",
        "borer",
        "armyworm",
        "whitefly",
        "bollworm",
        "mite",
        "yellowing",
        "spots",
        "pustules",
        "caterpillar",
        "sundi",
        "makor",
        "spray",
        "pesticide",
        "fungicide",
        "insecticide",
        "dawai",
        "dawa",
    ],
    "government_schemes": [
        "scheme",
        "yojana",
        "yojna",
        "subsidy",
        "sarkari",
        "government",
        "pm-kisan",
        "pmkisan",
        "fasal bima",
        "pmfby",
        "kusum",
        "kcc",
        "credit card",
        "insurance",
        "bima",
        "loan",
        "rin",
        "sahayata",
        "anudaan",
        "grant",
        "benefit",
        "apply",
        "registration",
    ],
    "sowing_advice": [
        "sow",
        "sowing",
        "seed",
        "plant",
        "planting",
        "biyaj",
        "beej",
        "variety",
        "varieties",
        "kiasm",
        "spacing",
        "depth",
        "nursery",
        "transplant",
        "transplanting",
        "seed rate",
        "seed treatment",
        "when to sow",
        "kab bona",
        "kab lagana",
        "rogai",
    ],
    "harvest_advice": [
        "harvest",
        "harvesting",
        "katai",
        "cutting",
        "reaping",
        "yield",
        "upaj",
        "paidawar",
        "threshing",
        "storage",
        "post-harvest",
        "combine",
        "post harvest",
        "store",
        "godown",
    ],
    "market_info": [
        "price",
        "mandi",
        "market",
        "msp",
        "sell",
        "selling",
        "rate",
        "bhav",
        "daam",
        "dam",
        "procurement",
        "enam",
        "e-nam",
        "frp",
        "buyers",
        "buyer",
        "trade",
        "trading",
        "auction",
    ],
}

KNOWN_CROPS: list[str] = [
    "wheat",
    "rice",
    "paddy",
    "maize",
    "corn",
    "sugarcane",
    "ganna",
    "mustard",
    "sarson",
    "cotton",
    "kapas",
    "potato",
    "aloo",
    "soybean",
    "pulses",
    "chana",
    "dal",
    "moong",
    "tur",
    "arhar",
    "bajra",
    "jowar",
    "ragi",
    "barley",
    "jau",
    "groundnut",
    "mungfali",
    "sunflower",
    "til",
    "sesame",
]

# Canonical name mapping for aliases
_CROP_ALIASES: dict[str, str] = {
    "paddy": "rice",
    "chawal": "rice",
    "dhan": "rice",
    "gehun": "wheat",
    "gehu": "wheat",
    "corn": "maize",
    "makka": "maize",
    "makki": "maize",
    "bhutta": "maize",
    "ganna": "sugarcane",
    "ikshu": "sugarcane",
    "sarson": "mustard",
    "rai": "mustard",
    "kapas": "cotton",
    "rui": "cotton",
    "aloo": "potato",
    "batata": "potato",
    "jau": "barley",
    "mungfali": "groundnut",
    "moongfali": "groundnut",
    "til": "sesame",
}


def _detect_intent(message: str) -> str:
    """Detect the user's intent from their message using keyword matching."""
    msg = message.lower()
    scores: dict[str, int] = defaultdict(int)
    for intent, keywords in _INTENT_KEYWORDS.items():
        for kw in keywords:
            if kw in msg:
                scores[intent] += 1
    if not scores:
        return "general"
    return max(scores, key=scores.get)  # type: ignore[arg-type]


def _extract_crop(message: str, context: dict[str, Any] | None = None) -> str | None:
    """Extract a crop name from the message or context."""
    msg = message.lower()

    # Check context first
    if context and context.get("crop"):
        crop = context["crop"].lower()
        return _CROP_ALIASES.get(crop, crop)

    # Search for crop names in the message
    for crop in KNOWN_CROPS:
        # Word boundary match to avoid partial matches
        if re.search(rf"\b{re.escape(crop)}\b", msg):
            return _CROP_ALIASES.get(crop, crop)

    # Check aliases
    for alias, canonical in _CROP_ALIASES.items():
        if re.search(rf"\b{re.escape(alias)}\b", msg):
            return canonical

    return None


# ============================================================
# Response Formatters
# ============================================================


def _format_fertilizer(crop: str) -> dict[str, Any]:
    data = FARMING_KNOWLEDGE["fertilizer"].get(crop)
    if not data:
        return {
            "text": f"Detailed fertilizer recommendations for '{crop}' are not yet in our database. "
            f"General guideline: get a soil test done under the Soil Health Card scheme and follow "
            f"the crop-wise nutrient recommendations on your card.",
            "sources": [{"type": "knowledge_base", "topic": "general_fertilizer"}],
            "actions": ["Get soil test done", "Visit Soil Health Card portal"],
        }

    lines = [f"Fertilizer recommendation for {crop.title()}:"]
    lines.append(f"  Total NPK: {data.get('total_npk', 'N/A')}")
    if "schedule" in data:
        lines.append("  Application schedule:")
        for step in data["schedule"]:
            lines.append(f"    - {step}")

    return {
        "text": "\n".join(lines),
        "sources": [{"type": "knowledge_base", "topic": f"{crop}_fertilizer"}],
        "actions": [
            "Get soil tested for customized recommendation",
            f"View full {crop.title()} crop calendar",
            "Check fertilizer prices at nearest dealer",
        ],
    }


def _format_irrigation(crop: str) -> dict[str, Any]:
    data = FARMING_KNOWLEDGE["irrigation"].get(crop)
    if not data:
        return {
            "text": f"Irrigation details for '{crop}' are not yet available. General rule: irrigate at "
            f"critical growth stages (flowering, grain filling) and avoid waterlogging.",
            "sources": [{"type": "knowledge_base", "topic": "general_irrigation"}],
            "actions": [
                "Check weather forecast",
                "Explore drip irrigation subsidy under PMKSY",
            ],
        }

    lines = [f"Irrigation guide for {crop.title()}:"]
    lines.append(f"  Total water: {data['total']}")
    lines.append(f"  Critical stages: {data['critical_stages']}")
    if "schedule" in data:
        lines.append("  Schedule:")
        for s in data["schedule"]:
            priority_label = s["priority"].upper()
            lines.append(f"    [{priority_label}] {s['stage']}: {s['note']}")
    if "note" in data:
        lines.append(f"  Tip: {data['note']}")

    return {
        "text": "\n".join(lines),
        "sources": [{"type": "knowledge_base", "topic": f"{crop}_irrigation"}],
        "actions": [
            "Check weather forecast for rain",
            "Explore PMKSY subsidy for drip/sprinkler",
            f"View {crop.title()} crop calendar",
        ],
    }


def _format_pest_management(crop: str, message: str) -> dict[str, Any]:
    data = FARMING_KNOWLEDGE["pest_management"].get(crop)
    if not data:
        return {
            "text": f"Pest/disease data for '{crop}' is not yet in our database. General advice: "
            f"scout your field regularly, identify the pest correctly before spraying, and use "
            f"recommended pesticides at correct dosage. Contact your nearest Krishi Vigyan Kendra (KVK) "
            f"for diagnosis.",
            "sources": [{"type": "knowledge_base", "topic": "general_pest"}],
            "actions": [
                "Contact nearest KVK",
                "Send a photo to agriculture helpline 1551",
            ],
        }

    msg = message.lower()
    # Try to match a specific pest/disease
    matched_pest = None
    for pest_key, pest_info in data.items():
        if pest_key.replace("_", " ") in msg or pest_key in msg:
            matched_pest = (pest_key, pest_info)
            break
    # Also check symptoms keywords
    if not matched_pest:
        for pest_key, pest_info in data.items():
            symptoms_lower = pest_info.get("symptoms", "").lower()
            # Check if any distinctive symptom word is in the message
            symptom_words = [w for w in symptoms_lower.split() if len(w) > 4]
            for sw in symptom_words:
                if sw in msg:
                    matched_pest = (pest_key, pest_info)
                    break
            if matched_pest:
                break

    if matched_pest:
        name, info = matched_pest
        lines = [f"Pest/Disease: {name.replace('_', ' ').title()} in {crop.title()}"]
        lines.append(f"  Symptoms: {info['symptoms']}")
        lines.append(f"  Favorable conditions: {info['conditions']}")
        lines.append(f"  Control: {info['control']}")
        lines.append(f"  Prevention: {info['prevention']}")
    else:
        lines = [f"Common pests and diseases of {crop.title()}:"]
        for pest_key, pest_info in data.items():
            lines.append(f"\n  {pest_key.replace('_', ' ').title()}:")
            lines.append(f"    Symptoms: {pest_info['symptoms']}")
            lines.append(f"    Control: {pest_info['control']}")

    return {
        "text": "\n".join(lines),
        "sources": [{"type": "knowledge_base", "topic": f"{crop}_pest_management"}],
        "actions": [
            "Send a photo to KVK for exact diagnosis",
            "Purchase recommended spray from agri-input dealer",
            "Call agriculture helpline 1551",
        ],
    }


def _format_sowing(crop: str) -> dict[str, Any]:
    data = FARMING_KNOWLEDGE["sowing"].get(crop)
    if not data:
        return {
            "text": f"Sowing information for '{crop}' is not yet available. Contact your local Krishi "
            f"Vigyan Kendra or agriculture university for region-specific recommendations.",
            "sources": [{"type": "knowledge_base", "topic": "general_sowing"}],
            "actions": [
                "Contact nearest KVK",
                "Visit state agriculture university website",
            ],
        }

    lines = [f"Sowing guide for {crop.title()}:"]
    for season, info in data.items():
        lines.append(f"\n  Season: {season.title()}")
        lines.append(
            f"    Optimal sowing date: {info.get('optimal_date_range', 'N/A')}"
        )
        lines.append(f"    Seed rate: {info.get('seed_rate', 'N/A')}")
        if info.get("seed_treatment"):
            lines.append(f"    Seed treatment: {info['seed_treatment']}")
        lines.append(f"    Spacing: {info.get('spacing', 'N/A')}")
        if info.get("soil_preparation"):
            lines.append(f"    Soil preparation: {info['soil_preparation']}")
        if info.get("varieties"):
            lines.append("    Recommended varieties:")
            for region, varieties in info["varieties"].items():
                if isinstance(varieties, list):
                    lines.append(
                        f"      {region.replace('_', ' ').title()}: {', '.join(varieties)}"
                    )
                else:
                    lines.append(
                        f"      {region.replace('_', ' ').title()}: {varieties}"
                    )

    return {
        "text": "\n".join(lines),
        "sources": [{"type": "knowledge_base", "topic": f"{crop}_sowing"}],
        "actions": [
            "Purchase certified seed from authorized dealer",
            "Get soil tested before sowing",
            f"View {crop.title()} crop calendar",
        ],
    }


def _format_harvest(crop: str) -> dict[str, Any]:
    data = FARMING_KNOWLEDGE["harvest"].get(crop)
    if not data:
        return {
            "text": f"Harvest information for '{crop}' is not yet available. General advice: harvest when "
            f"the crop shows full maturity signs and moisture is at the recommended level for your crop.",
            "sources": [{"type": "knowledge_base", "topic": "general_harvest"}],
            "actions": ["Contact KVK", "Check mandi rates before selling"],
        }

    lines = [f"Harvest guide for {crop.title()}:"]
    lines.append(f"  When to harvest: {data['timing']}")
    lines.append(f"  Crop duration: {data['duration']}")
    lines.append(f"  Harvesting method: {data['method']}")
    lines.append(f"  Post-harvest: {data['post_harvest']}")
    lines.append(f"  Expected yield: {data['yield']}")

    return {
        "text": "\n".join(lines),
        "sources": [{"type": "knowledge_base", "topic": f"{crop}_harvest"}],
        "actions": [
            "Check current mandi prices on e-NAM",
            "Book combine harvester",
            "Check MSP and procurement dates",
        ],
    }


def _format_market(crop: str) -> dict[str, Any]:
    data = FARMING_KNOWLEDGE["market_info"].get(crop)
    if not data:
        return {
            "text": f"Market information for '{crop}' is not available in our database. Check real-time "
            f"prices on e-NAM (enam.gov.in) or call your nearest APMC mandi for today's rates.",
            "sources": [{"type": "knowledge_base", "topic": "general_market"}],
            "actions": ["Visit enam.gov.in", "Call APMC mandi for today's rates"],
        }

    lines = [f"Market information for {crop.title()}:"]
    if "msp_2025_26" in data:
        lines.append(f"  MSP 2025-26: {data['msp_2025_26']}")
    if "frp_2025_26" in data:
        lines.append(f"  FRP 2025-26: {data['frp_2025_26']}")
    if "sap_note" in data:
        lines.append(f"  SAP note: {data['sap_note']}")
    if "note" in data:
        lines.append(f"  Note: {data['note']}")
    if "average_price" in data:
        lines.append(f"  Average price: {data['average_price']}")
    if "procurement" in data:
        lines.append(f"  Procurement: {data['procurement']}")
    if "tips" in data:
        lines.append(f"  Selling tip: {data['tips']}")

    return {
        "text": "\n".join(lines),
        "sources": [{"type": "knowledge_base", "topic": f"{crop}_market"}],
        "actions": [
            "Register on e-NAM for online trading",
            "Check APMC mandi rates today",
            "Explore warehousing options for better prices",
        ],
    }


def _format_schemes_chat() -> dict[str, Any]:
    lines = ["Here are the major government schemes for farmers:\n"]
    for scheme in GOVERNMENT_SCHEMES[:6]:
        lines.append(f"  {scheme['name']} ({scheme['id'].upper()})")
        lines.append(f"    Benefit: {scheme['benefit']}")
        lines.append(f"    Apply: {scheme['application_url']}")
        lines.append("")

    lines.append(f"  ... and {len(GOVERNMENT_SCHEMES) - 6} more schemes available.")
    lines.append(
        "\nUse the /schemes endpoint or ask about a specific scheme for details."
    )

    return {
        "text": "\n".join(lines),
        "sources": [{"type": "knowledge_base", "topic": "government_schemes"}],
        "actions": [
            "Check PM-KISAN status at pmkisan.gov.in",
            "Apply for Kisan Credit Card at your bank",
            "Visit Common Service Centre for application help",
        ],
    }


def _format_general_response(message: str) -> dict[str, Any]:
    return {
        "text": (
            "I am Kisaan Sahayak, your farming assistant. I can help you with:\n"
            "  1. Fertilizer recommendations (ask about urea, DAP, NPK for your crop)\n"
            "  2. Irrigation schedule (when and how much to water)\n"
            "  3. Pest and disease management (identification and control)\n"
            "  4. Sowing guide (best time, seed rate, varieties)\n"
            "  5. Harvest and post-harvest advice\n"
            "  6. Market prices and MSP information\n"
            "  7. Government schemes (PM-KISAN, PMFBY, KCC, etc.)\n\n"
            "Please mention your crop name (e.g., wheat, rice, maize) along with "
            "your question for the best advice. For example:\n"
            "  'What fertilizer should I use for wheat?'\n"
            "  'When should I irrigate rice?'\n"
            "  'How to control rust in wheat?'"
        ),
        "sources": [],
        "actions": [
            "Ask about fertilizer for your crop",
            "Ask about irrigation schedule",
            "Check government schemes",
        ],
    }


# ============================================================
# Session Management (in-memory)
# ============================================================

_sessions: dict[str, list[dict[str, str]]] = {}

MAX_SESSION_HISTORY = 20


def _get_or_create_session(session_id: str | None) -> tuple[str, list[dict[str, str]]]:
    if session_id and session_id in _sessions:
        return session_id, _sessions[session_id]
    sid = session_id or f"sess-{uuid.uuid4().hex[:12]}"
    _sessions[sid] = []
    return sid, _sessions[sid]


def _add_to_session(history: list[dict[str, str]], role: str, content: str) -> None:
    history.append({"role": role, "content": content})
    # Keep only the last N messages
    if len(history) > MAX_SESSION_HISTORY:
        del history[: len(history) - MAX_SESSION_HISTORY]


# ============================================================
# Season Detection
# ============================================================

MONTH_TO_SEASON: dict[int, str] = {
    1: "rabi",
    2: "rabi",
    3: "rabi",
    4: "zaid",
    5: "kharif",
    6: "kharif",
    7: "kharif",
    8: "kharif",
    9: "kharif",
    10: "rabi",
    11: "rabi",
    12: "rabi",
}

# Which season does each crop primarily belong to
_CROP_SEASON: dict[str, str] = {
    "wheat": "rabi",
    "rice": "kharif",
    "maize": "kharif",
    "mustard": "rabi",
    "cotton": "kharif",
    "potato": "rabi",
    "sugarcane": "spring",
}


def _detect_season(crop: str | None, explicit_season: str | None = None) -> str:
    if explicit_season:
        return explicit_season.lower()
    if crop and crop in _CROP_SEASON:
        return _CROP_SEASON[crop]
    now = datetime.now(timezone.utc)
    return MONTH_TO_SEASON.get(now.month, "rabi")


# ============================================================
# Pydantic Models
# ============================================================


class ChatRequest(BaseModel):
    message: str
    language: str = "en"
    session_id: str | None = None
    context: dict[str, Any] | None = None


class ChatSource(BaseModel):
    type: str
    topic: str


class ChatResponse(BaseModel):
    session_id: str
    response: str
    language: str
    intent_detected: str
    crop_detected: str | None
    sources: list[ChatSource]
    suggested_actions: list[str]
    responded_at: str


class SchemeResponse(BaseModel):
    id: str
    name: str
    description: str
    benefit: str
    eligibility: dict[str, Any]
    application_url: str
    documents_required: list[str]
    crop_specific: bool
    category: str


class SchemesListResponse(BaseModel):
    total: int
    filters_applied: dict[str, str | None]
    schemes: list[SchemeResponse]


class CalendarTask(BaseModel):
    week: int
    month: str
    task: str
    details: str
    priority: str
    status: str = "upcoming"


class CalendarResponse(BaseModel):
    crop: str
    season: str
    region: str
    total_tasks: int
    upcoming_tasks: list[CalendarTask]
    past_tasks: list[CalendarTask]
    current_date: str


class FAQItem(BaseModel):
    id: int
    topic: str
    question: str
    answer: str


class FAQResponse(BaseModel):
    total: int
    topic_filter: str | None
    faqs: list[FAQItem]


# ============================================================
# FastAPI App
# ============================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan: initialize and cleanup resources."""
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="Kisaan Sahayak",
    description="Rule-based agricultural knowledge assistant for Indian farmers",
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

# auth router already has prefix="/auth" — do NOT add prefix again
app.include_router(auth_router, tags=["auth"])


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "service": "kisaan_sahayak",
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.get("/")
async def root():
    """Root endpoint returning service info."""
    return {
        "service": "Kisaan Sahayak",
        "version": "1.0.0",
        "features": [
            "Natural language farming Q&A in multiple Indian languages",
            "Government scheme eligibility and application assistance",
            "Personalized crop calendar and task reminders",
            "Rule-based knowledge retrieval — no external API keys needed",
        ],
    }


# ------------------------------------------------------------------
# POST /chat
# ------------------------------------------------------------------


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Process a farming question and return knowledge-based response."""
    session_id, history = _get_or_create_session(request.session_id)
    _add_to_session(history, "user", request.message)

    intent = _detect_intent(request.message)
    crop = _extract_crop(request.message, request.context)

    # If no crop from current message, try to get from recent session context
    if not crop and history:
        for entry in reversed(history[:-1]):
            found = _extract_crop(entry["content"])
            if found:
                crop = found
                break

    # Build the response based on intent
    if intent == "fertilizer_advice":
        if crop:
            result = _format_fertilizer(crop)
        else:
            result = {
                "text": "Which crop do you need fertilizer advice for? I have detailed recommendations for "
                "wheat, rice, maize, sugarcane, mustard, cotton, and potato.",
                "sources": [],
                "actions": ["Specify your crop name"],
            }
    elif intent == "irrigation_advice":
        if crop:
            result = _format_irrigation(crop)
        else:
            result = {
                "text": "Which crop do you need irrigation advice for? I have schedules for "
                "wheat, rice, maize, sugarcane, mustard, cotton, and potato.",
                "sources": [],
                "actions": ["Specify your crop name"],
            }
    elif intent == "pest_management":
        if crop:
            result = _format_pest_management(crop, request.message)
        else:
            result = {
                "text": "Which crop are you facing pest or disease issues with? Please mention the crop "
                "and describe the symptoms (e.g., 'yellow spots on wheat leaves').",
                "sources": [],
                "actions": ["Describe symptoms with crop name"],
            }
    elif intent == "government_schemes":
        result = _format_schemes_chat()
    elif intent == "sowing_advice":
        if crop:
            result = _format_sowing(crop)
        else:
            result = {
                "text": "Which crop do you want sowing advice for? I have detailed guides for "
                "wheat, rice, maize, sugarcane, mustard, cotton, and potato.",
                "sources": [],
                "actions": ["Specify your crop name"],
            }
    elif intent == "harvest_advice":
        if crop:
            result = _format_harvest(crop)
        else:
            result = {
                "text": "Which crop do you need harvest information for? Please mention the crop name.",
                "sources": [],
                "actions": ["Specify your crop name"],
            }
    elif intent == "market_info":
        if crop:
            result = _format_market(crop)
        else:
            result = {
                "text": "Which crop do you need market/price information for? I have MSP data for "
                "wheat, rice, maize, sugarcane, mustard, and cotton.",
                "sources": [],
                "actions": [
                    "Specify your crop name",
                    "Visit enam.gov.in for live rates",
                ],
            }
    else:
        result = _format_general_response(request.message)

    _add_to_session(history, "assistant", result["text"])

    return ChatResponse(
        session_id=session_id,
        response=result["text"],
        language=request.language,
        intent_detected=intent,
        crop_detected=crop,
        sources=[ChatSource(**s) for s in result["sources"]],
        suggested_actions=result["actions"],
        responded_at=datetime.now(timezone.utc).isoformat(),
    )


# ------------------------------------------------------------------
# GET /schemes
# ------------------------------------------------------------------


@app.get("/schemes", response_model=SchemesListResponse)
async def get_government_schemes(
    state: str | None = Query(
        None, description="Filter by state (e.g., 'Punjab', 'Maharashtra')"
    ),
    category: str | None = Query(
        None, description="Farmer category: small_marginal, medium, large"
    ),
    crop: str | None = Query(None, description="Filter for crop-specific schemes"),
):
    """Get relevant government schemes, optionally filtered by state, farmer category, and crop."""
    filtered = GOVERNMENT_SCHEMES

    # Filter by farmer category
    if category:
        category_lower = category.lower().strip()
        filtered = [
            s
            for s in filtered
            if category_lower in s["eligibility"].get("category", [])
        ]

    # Filter by crop relevance (only return crop-specific if crop given, plus all general)
    if crop:
        crop_lower = crop.lower().strip()
        crop_lower = _CROP_ALIASES.get(crop_lower, crop_lower)
        filtered = [
            s
            for s in filtered
            if not s["crop_specific"]  # always include non-crop-specific schemes
            or crop_lower in s.get("name", "").lower()
            or crop_lower in s.get("description", "").lower()
        ]

    # State filter — most schemes are "all"; this is a placeholder for state-specific filtering
    if state:
        state_lower = state.lower().strip()
        filtered = [
            s
            for s in filtered
            if s["applicable_states"] == "all"
            or state_lower in str(s.get("applicable_states", "")).lower()
        ]

    return SchemesListResponse(
        total=len(filtered),
        filters_applied={"state": state, "category": category, "crop": crop},
        schemes=[
            SchemeResponse(
                id=s["id"],
                name=s["name"],
                description=s["description"],
                benefit=s["benefit"],
                eligibility=s["eligibility"],
                application_url=s["application_url"],
                documents_required=s["documents_required"],
                crop_specific=s["crop_specific"],
                category=s["category"],
            )
            for s in filtered
        ],
    )


# ------------------------------------------------------------------
# GET /calendar/{crop}
# ------------------------------------------------------------------


@app.get("/calendar/{crop}", response_model=CalendarResponse)
async def get_crop_calendar(
    crop: str,
    region: str = Query(
        "north_india",
        description="Region: north_india, central_india, south_india, east_india",
    ),
    season: str | None = Query(
        None,
        description="Season: rabi, kharif, zaid, spring. Auto-detected if omitted.",
    ),
):
    """Get personalized crop calendar with tasks classified as past or upcoming based on current date."""
    crop_lower = crop.lower().strip()
    crop_lower = _CROP_ALIASES.get(crop_lower, crop_lower)

    detected_season = _detect_season(crop_lower, season)

    calendar_data = CROP_CALENDAR.get(crop_lower, {})
    tasks = calendar_data.get(detected_season, [])

    if not tasks:
        available_seasons = list(calendar_data.keys()) if calendar_data else []
        hint = ""
        if available_seasons:
            hint = (
                f" Available seasons for {crop_lower}: {', '.join(available_seasons)}."
            )
            # Try returning first available season
            detected_season = available_seasons[0]
            tasks = calendar_data[detected_season]
        else:
            return CalendarResponse(
                crop=crop_lower,
                season=detected_season,
                region=region,
                total_tasks=0,
                upcoming_tasks=[],
                past_tasks=[],
                current_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
            )

    now = datetime.now(timezone.utc)
    month_map = {
        "january": 1,
        "february": 2,
        "march": 3,
        "april": 4,
        "may": 5,
        "june": 6,
        "july": 7,
        "august": 8,
        "september": 9,
        "october": 10,
        "november": 11,
        "december": 12,
    }

    upcoming: list[CalendarTask] = []
    past: list[CalendarTask] = []

    for task in tasks:
        task_month_num = month_map.get(task["month"].lower(), 1)
        task_day = task.get("start_day", 1)

        # Determine the year for this task; account for calendars spanning year boundaries
        # Heuristic: if current month is in Q4 and task month is in Q1, task is next year
        # If current month is in Q1-Q2 and task month is in Q4, task was previous year
        task_year = now.year
        if now.month >= 10 and task_month_num <= 4:
            task_year = now.year + 1
        elif now.month <= 4 and task_month_num >= 10:
            task_year = now.year - 1

        try:
            task_date = datetime(
                task_year, task_month_num, task_day, tzinfo=timezone.utc
            )
        except ValueError:
            task_date = datetime(task_year, task_month_num, 1, tzinfo=timezone.utc)

        is_past = task_date < now
        ct = CalendarTask(
            week=task["week"],
            month=task["month"],
            task=task["task"],
            details=task["details"],
            priority=task["priority"],
            status="completed" if is_past else "upcoming",
        )
        if is_past:
            past.append(ct)
        else:
            upcoming.append(ct)

    return CalendarResponse(
        crop=crop_lower,
        season=detected_season,
        region=region,
        total_tasks=len(tasks),
        upcoming_tasks=upcoming,
        past_tasks=past,
        current_date=now.strftime("%Y-%m-%d"),
    )


# ------------------------------------------------------------------
# GET /faq
# ------------------------------------------------------------------


@app.get("/faq", response_model=FAQResponse)
async def get_faq(
    topic: str | None = Query(
        None,
        description="Filter by topic: soil_health, fertilizer, irrigation, pest_management, schemes, market_info, organic_farming, sowing, general",
    ),
):
    """Return frequently asked questions, optionally filtered by topic."""
    if topic:
        topic_lower = topic.lower().strip()
        filtered = [f for f in FAQ_DATA if f["topic"] == topic_lower]
    else:
        filtered = FAQ_DATA

    return FAQResponse(
        total=len(filtered),
        topic_filter=topic,
        faqs=[FAQItem(**f) for f in filtered],
    )


if __name__ == "__main__":
    uvicorn.run(
        "services.kisaan_sahayak.app:app", host="0.0.0.0", port=8006, reload=True
    )
