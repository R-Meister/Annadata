# Annadata OS -- Current State Assessment

> Last updated: February 28, 2026
> Prepared during hackathon optimization sprint

---

## Executive Summary

Annadata OS is a multi-service AI agriculture platform with **11 FastAPI microservices**, a **Next.js 16 frontend**, and full Docker Compose orchestration (15 containers). The platform has **119 API endpoints** and a navigable 16-route dashboard.

However, **only 2 of 11 services use real ML/data**. The remaining 9 are simulated via hardcoded lookups, seeded RNG, and rule-based heuristics. The frontend has **zero data visualizations**, **no maps**, **no real-time features**, and **no LLM integration**. Dashboard stats are hardcoded strings.

---

## What Is REAL (Production-Quality)

### MSP Mitra (Port 8001)
- **1.1M+ AgMarkNet commodity price records** loaded from CSV on startup
- **Facebook Prophet + ensemble ML** (Linear Regression, Random Forest, SVR) for price forecasting
- Real sell recommendations, volatility (Bollinger Bands, ATR), trend analysis (SMA/EMA/momentum), seasonal decomposition
- 20 endpoints, all returning real data-derived results
- **Verdict: Strongest service. Demo centerpiece.**

### Protein Engineering (Port 8007)
- **5,840+ weather records** and **19,690 crop yield records** from real CSVs
- Trait-to-protein mapping database with real gene references (DREB2A, Bt Cry1Ac, GoldenRice2)
- 8 endpoints, all data-driven
- **Verdict: Solid. Unique differentiator in agriculture space.**

### Core ML Pipeline (src/)
- **8 trained model artifacts** in `src/models/saved_models/`:
  - 3 weather models: Linear Regression, Random Forest, SVR
  - 3 crop yield models: Linear Regression, Random Forest, SVR
  - 2 scalers: feature_scaler.pkl, crop_feature_scaler.pkl
  - 1 Quantum VQR model (Qiskit, 4 qubits, COBYLA optimizer)
- 40+ engineered features via data pipeline
- **NOT wired into the microservices** -- they live in `src/` and serve `src/api/app.py`, not the Docker services

### Authentication System
- JWT + bcrypt + PostgreSQL -- fully functional end-to-end
- Register, login, role-based access (farmer/trader/researcher/admin)
- Used by all 11 services

### Infrastructure
- PostgreSQL 15 -- schema auto-created on startup
- Redis 7 -- available for caching + Celery broker
- Celery worker configured with autodiscover
- Docker Compose orchestration -- `docker compose up --build` works
- GitHub Actions CI pipeline

---

## What Is SIMULATED (9 of 11 Services)

### SoilScan AI (Port 8002) -- Fully Simulated
| Feature | Reality |
|---------|---------|
| `/analyze` | Hand-tuned polynomial/bell-curve formulas, not ML |
| `/analyze-photo` | HSV color extraction + rule-based pH estimation, not a CNN |
| `/quantum-correlation` | Kalman filter math is real, "quantum advantage" numbers are fabricated |
| Sensor data | None -- no real sensor ingestion |

### Fasal Rakshak (Port 8003) -- Fully Simulated
| Feature | Reality |
|---------|---------|
| `/detect` | Hardcoded dictionary of 25+ diseases, rule-based matching |
| `/nearby-shops` | 16 hardcoded pesticide shops with Haversine distance (real math, fake data) |
| Image classification | None -- would need MobileNetV2/ResNet on PlantVillage |

### Jal Shakti (Port 8004) -- Partially Real
| Feature | Reality |
|---------|---------|
| ET0 calculation | **Real Penman-Monteith math** |
| Crop coefficients | **Real Kc curves** |
| Sensor readings | Seeded RNG, not real IoT |
| `/quantum-optimize` | Simulated annealing labeled "QAOA", not actual quantum |

### Harvest Shakti (Port 8005) -- Fully Simulated
| Feature | Reality |
|---------|---------|
| `/recommend-crop` | Hardcoded crop-soil suitability matrix + noise |
| `/fertilizer-advisory` | Rule-based NPK deficit (real agronomy logic, not ML) |
| Yield estimation | Formula-based, not ML |
| `/chat` | Pattern-matched responses, labeled "simulated Gemini" |

### Kisaan Sahayak (Port 8006) -- Fully Simulated
| Feature | Reality |
|---------|---------|
| `/chat` | **100% keyword matching against static FAQ** -- zero LLM |
| `/agent/vision` | Hardcoded PlantVillage class names via string matching |
| `/agent/weather` | Seeded RNG weather generation |
| `/agent/market` | Hardcoded base prices with RNG noise |
| `/agent/llm` | Template-based output, not a real LLM |
| Knowledge base | **Excellent content**: 7 crops, 12 gov schemes, crop calendars, pest management |

### Kisan Credit Score (Port 8008) -- Fully Simulated
| Feature | Reality |
|---------|---------|
| Credit scoring | Weighted formula (land, income, history, crop diversity, irrigation) |
| External data | None -- no credit bureau integration |

### Harvest-to-Cart (Port 8009) -- Fully Simulated
| Feature | Reality |
|---------|---------|
| Cold storage | 20+ hardcoded facilities with Haversine distance |
| Demand prediction | Seasonal sine wave + trend + noise |
| Route optimization | Nearest-neighbor TSP + 2-opt (real algorithm, simulated coordinates) |

### Beej Suraksha (Port 8010) -- Fully Simulated
| Feature | Reality |
|---------|---------|
| Seed registration | QR code generation works (real logic) |
| Image analysis | Text matching against hardcoded color vectors |
| Blockchain | SHA-256 chaining is real math, but in-memory only |
| Community reporting | Functional but in-memory, no persistence |

### Mausam Chakra (Port 8011) -- Fully Simulated
| Feature | Reality |
|---------|---------|
| All weather data | Seeded RNG with seasonal/diurnal patterns |
| OpenWeather API | Env var exists, **completely unused** |
| Sentinel Hub | Env var exists, **completely unused** |
| Quantum VQR | Simulated, not Qiskit execution |

---

## Frontend State

### What Works
- 16-route Next.js 16 dashboard (App Router, TypeScript strict mode)
- API rewrites to all 11 backend services via `next.config.ts`
- Auth state management (Zustand) with login/register
- Clean card-based UI with Tailwind CSS v4
- All service pages render feature cards
- Sidebar navigation with 12 items
- Header with search, notifications, user dropdown

### What Does NOT Work / Is Missing

| Gap | Impact | Detail |
|-----|--------|--------|
| **No data visualizations** | CRITICAL | Every chart slot is a placeholder div. Recharts is in `package.json` but completely unused |
| **No map integration** | HIGH | No leaflet/mapbox/google maps anywhere. No mandi map, no plot map, no route visualization |
| **No real-time features** | HIGH | No WebSockets, no SSE, no polling. Dashboard is fully static after page load |
| **No LLM chat** | HIGH | Kisaan Sahayak chat is keyword matching. If a judge types a free-form question, it fails |
| **No weather API** | MEDIUM | `OPENWEATHER_API_KEY` env var exists but is never read by any service |
| **No animations** | MEDIUM | GSAP and Lottie are in `package.json` but unused. Landing page is clean but static |
| **Hardcoded dashboard stats** | MEDIUM | "12,450 Active Farmers", "89% Yield Accuracy" -- all static strings |
| **Static activity feed** | LOW | "Recent Activity" in dashboard overview is a hardcoded array |

---

## Data Storage Reality

| Service | Storage | Persistence |
|---------|---------|-------------|
| MSP Mitra | CSV -> pandas DataFrame | Read-only from disk |
| Protein Engineering | CSV -> pandas DataFrame | Read-only from disk |
| SoilScan AI | `_analysis_store` (Python dict) | **Lost on restart** |
| Fasal Rakshak | `_detection_store` (Python dict) | **Lost on restart** |
| Jal Shakti | `_plot_store`, `_valve_store` (Python dicts) | **Lost on restart** |
| Harvest Shakti | `_plot_store` (Python dict) | **Lost on restart** |
| Kisaan Sahayak | `_session_store`, `_memory_store` (Python dicts) | **Lost on restart** |
| Kisan Credit | `_score_store` (Python dict) | **Lost on restart** |
| Harvest-to-Cart | In-memory only | **Lost on restart** |
| Beej Suraksha | `_seed_store`, `_blockchain_store` (Python dicts) | **Lost on restart** |
| Mausam Chakra | Stateless (generated per request) | N/A |
| All services | PostgreSQL (users, service_logs) | Persistent |

Only the auth system actively writes to PostgreSQL. All service data lives in in-memory dicts.

---

## Test & Build Status

| Check | Status | Detail |
|-------|--------|--------|
| Python tests | 55/55 passing | Unit + integration |
| Frontend build | Passing | All 16 routes generated |
| ESLint | 0 errors, 0 warnings | Fixed during this sprint |
| Docker Compose config | Valid | `docker compose config --quiet` passes |
| CI pipeline | Configured | `.github/workflows/ci.yml` |

---

## Team

| Member | Role | Primary Services |
|--------|------|------------------|
| Pranav Singh | Quantum/AI Developer | Core ML pipeline (src/), Quantum VQR, Mausam Chakra |
| Raman Mendiratta | ML/Data Science Lead | MSP Mitra, SoilScan AI, Harvest Shakti, Kisan Credit |
| Kritika Yadav | Data Pipeline Lead | Data pipeline, Fasal Rakshak, Beej Suraksha |
| Kshitij Verma | Full-Stack Developer | Frontend, Kisaan Sahayak, Harvest-to-Cart, Jal Shakti |

---

## Key Files Reference

| File/Directory | Purpose |
|----------------|---------|
| `services/` | All 11 microservices + shared infrastructure |
| `frontend/` | Next.js 16 frontend (app/, components/, lib/, store/) |
| `src/models/saved_models/` | 8 trained ML models (NOT wired into services) |
| `src/quantum/` | Quantum VQR code and results |
| `docker-compose.yml` | Full 15-container orchestration |
| `SCOPE.md` | Honest real-vs-simulated disclosure |
| `.env.example` | Environment variables template |
| `data/` | Raw/processed datasets |
| `msp_mitra/` | Legacy MSP Mitra sub-app with 1.1M row CSV |
