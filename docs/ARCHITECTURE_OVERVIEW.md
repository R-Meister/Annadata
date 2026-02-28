# Annadata OS -- Technical Architecture Overview

> Last updated: February 28, 2026

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                                │
│                                                                     │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │              Next.js 16 Frontend (Port 3000)                 │  │
│   │   App Router • React 19 • TypeScript • Tailwind v4           │  │
│   │   Zustand (auth) • TanStack Query (server state)             │  │
│   │   16 routes • API rewrites to all 11 backend services        │  │
│   └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────┬───────────────────────────────────────────┘
                          │ HTTP (Next.js rewrites)
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SERVICE LAYER (11 Microservices)                │
│                                                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│   │MSP Mitra │ │SoilScan  │ │  Fasal   │ │Jal Shakti│             │
│   │  :8001   │ │   AI     │ │ Rakshak  │ │  :8004   │             │
│   │ 20 eps   │ │  :8002   │ │  :8003   │ │  9 eps   │             │
│   │ Prophet  │ │  8 eps   │ │  8 eps   │ │ Penman-  │             │
│   │ Ensemble │ │ Scoring  │ │ Disease  │ │ Monteith │             │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│   │ Harvest  │ │ Kisaan   │ │ Protein  │ │  Kisan   │             │
│   │ Shakti   │ │ Sahayak  │ │ Engineer │ │ Credit   │             │
│   │  :8005   │ │  :8006   │ │  :8007   │ │  :8008   │             │
│   │ 12 eps   │ │ 14 eps   │ │  8 eps   │ │  7 eps   │             │
│   │ AGRI-MAA │ │ Chat/LLM │ │ Trait DB │ │ Scoring  │             │
│   └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                     │
│   ┌──────────┐ ┌──────────┐ ┌──────────┐                          │
│   │Harvest-  │ │   Beej   │ │ Mausam   │                          │
│   │to-Cart   │ │ Suraksha │ │ Chakra   │                          │
│   │  :8009   │ │  :8010   │ │  :8011   │                          │
│   │  9 eps   │ │ 12 eps   │ │ 12 eps   │                          │
│   │ Logistics│ │Blockchain│ │ Weather  │                          │
│   └──────────┘ └──────────┘ └──────────┘                          │
│                                                                     │
│   Total: 119 API endpoints across 11 services                      │
└──────────┬────────────────────────┬─────────────────────────────────┘
           │                        │
           ▼                        ▼
┌─────────────────────┐  ┌──────────────────────┐
│    PostgreSQL 15     │  │      Redis 7         │
│                      │  │                      │
│  Tables:             │  │  - Celery broker     │
│  - users             │  │  - API caching       │
│  - service_logs      │  │  - Session store     │
│  (+ 16 more models)  │  │                      │
└─────────────────────┘  └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │   Celery Worker       │
                         │                       │
                         │  Autodiscover tasks    │
                         │  from all 11 services  │
                         │  (ML training, batch   │
                         │   processing)          │
                         └───────────────────────┘
```

---

## Service Catalog

### Production-Quality Services (Real Data/ML)

| Service | Port | Key Technology | Data Source | Endpoints |
|---------|------|---------------|-------------|-----------|
| **MSP Mitra** | 8001 | Prophet + Ensemble ML | 1.1M AgMarkNet CSV records | 20 |
| **Protein Engineering** | 8007 | Trait-to-gene mapping | 5,840 weather + 19,690 crop records | 8 |

### Simulation Services (Functional, Not ML-Backed)

| Service | Port | Simulation Method | Endpoints |
|---------|------|------------------|-----------|
| **SoilScan AI** | 8002 | Polynomial scoring formulas | 8 |
| **Fasal Rakshak** | 8003 | Hardcoded disease dictionary | 8 |
| **Jal Shakti** | 8004 | Real ET math, simulated sensors | 9 |
| **Harvest Shakti** | 8005 | Hardcoded suitability matrix | 12 |
| **Kisaan Sahayak** | 8006 | Keyword matching FAQ | 14 |
| **Kisan Credit** | 8008 | Weighted scoring formula | 7 |
| **Harvest-to-Cart** | 8009 | TSP + fake coordinates | 9 |
| **Beej Suraksha** | 8010 | In-memory blockchain | 12 |
| **Mausam Chakra** | 8011 | Seeded RNG weather | 12 |

---

## Shared Infrastructure

### services/shared/

```
services/shared/
├── config.py              # Pydantic Settings (env vars, ports, secrets)
├── db/
│   ├── session.py         # Async SQLAlchemy engine + session factory
│   ├── models.py          # 18 SQLAlchemy ORM models (708 lines)
│   └── __init__.py
├── auth/
│   ├── routes.py          # /auth/register, /auth/login, /auth/me
│   ├── dependencies.py    # get_current_user JWT dependency
│   └── __init__.py
└── celery_app/
    ├── celery_config.py   # Celery app with autodiscover
    └── __init__.py
```

### Authentication Flow

```
Client                    FastAPI Service              PostgreSQL
  │                            │                          │
  │  POST /auth/register       │                          │
  │  {email, password, role}   │                          │
  │ ───────────────────────►   │                          │
  │                            │  bcrypt hash password     │
  │                            │  INSERT INTO users        │
  │                            │ ────────────────────────► │
  │                            │  ◄──────────────────────  │
  │  ◄─────────────────────    │                          │
  │  {user_id, token}         │                          │
  │                            │                          │
  │  GET /any-endpoint         │                          │
  │  Authorization: Bearer JWT │                          │
  │ ───────────────────────►   │                          │
  │                            │  Decode JWT, verify exp   │
  │                            │  SELECT FROM users        │
  │                            │ ────────────────────────► │
  │                            │  ◄──────────────────────  │
  │  ◄─────────────────────    │                          │
  │  {protected response}      │                          │
```

---

## Frontend Architecture

```
frontend/
├── app/                          # Next.js 16 App Router
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx            # Login page
│   ├── register/page.tsx         # Registration page
│   ├── layout.tsx                # Root layout
│   └── dashboard/                # Protected dashboard routes
│       ├── page.tsx              # Dashboard overview
│       ├── layout.tsx            # Dashboard layout (sidebar + header)
│       ├── msp-mitra/page.tsx
│       ├── soilscan-ai/page.tsx
│       ├── fasal-rakshak/page.tsx
│       ├── jal-shakti/page.tsx
│       ├── harvest-shakti/page.tsx
│       ├── kisaan-sahayak/page.tsx
│       ├── protein-engineering/page.tsx
│       ├── kisan-credit/page.tsx
│       ├── harvest-to-cart/page.tsx
│       ├── beej-suraksha/page.tsx
│       └── mausam-chakra/page.tsx
├── components/
│   ├── layout/
│   │   ├── sidebar.tsx           # Navigation (12 items)
│   │   └── header.tsx            # Search, notifications, user menu
│   └── ui/
│       ├── card.tsx
│       ├── button.tsx
│       ├── badge.tsx
│       └── status-indicator.tsx
├── lib/
│   ├── api.ts                    # API client (fetch wrapper)
│   ├── utils.ts                  # API_URLS, API_PREFIXES, helpers
│   └── query-client.ts           # TanStack Query config
├── store/
│   ├── auth-store.ts             # Zustand: JWT, user, login/logout
│   └── services-store.ts         # Zustand: service health status
├── middleware.ts                  # Route protection (redirect if not auth'd)
└── next.config.ts                # API rewrites to all 11 backend services
```

### Frontend -> Backend Communication

```
Browser Request: GET /api/msp-mitra/commodities
        │
        ▼
Next.js Middleware (middleware.ts)
  - Check auth for /dashboard/* routes
  - Redirect to /login if no token
        │
        ▼
Next.js Rewrites (next.config.ts)
  /api/msp-mitra/* → http://localhost:8001/*
  /api/soilscan/*  → http://localhost:8002/*
  /api/fasal/*     → http://localhost:8003/*
  ... (all 11 services)
        │
        ▼
FastAPI Service (e.g., MSP Mitra on :8001)
  - Validate JWT token
  - Process request
  - Return JSON response
```

---

## Data Architecture

### Database Schema (18 Models)

The shared `services/shared/db/models.py` defines 18 SQLAlchemy models:

| Model | Table | Service | Used? |
|-------|-------|---------|-------|
| User | users | Auth (all) | YES -- active writes |
| ServiceLog | service_logs | Logging | Partially |
| SoilAnalysis | soil_analyses | SoilScan | Schema only (in-memory dict used) |
| CropDetection | crop_detections | Fasal Rakshak | Schema only |
| IrrigationPlot | irrigation_plots | Jal Shakti | Schema only |
| HarvestPlot | harvest_plots | Harvest Shakti | Schema only |
| CreditScore | credit_scores | Kisan Credit | Schema only |
| ... | ... | ... | Schema only |

**Reality**: Only the `users` table is actively written to. All service-specific data uses in-memory Python dicts.

### Data Flow

```
External Data Sources
  │
  ├── AgMarkNet CSV (1.1M rows) ──► MSP Mitra (pandas DataFrame)
  ├── weather_processed.csv ──────► Protein Engineering (pandas DataFrame)
  ├── crop_raw_data.csv ─────────► Protein Engineering (pandas DataFrame)
  ├── OpenWeather API ───────────► Mausam Chakra (planned, not yet wired)
  └── LLM API ───────────────────► Kisaan Sahayak (planned, not yet wired)

Internal Data Flow
  │
  ├── User registers ──► PostgreSQL (users table)
  ├── User analyzes soil ──► In-memory dict (lost on restart)
  ├── User detects disease ──► In-memory dict (lost on restart)
  └── All service outputs ──► JSON response (not persisted)
```

---

## Docker Compose Topology

```yaml
# 15 total containers
services:
  # Infrastructure (3)
  postgres:     PostgreSQL 15 (port 5432)
  redis:        Redis 7 (port 6379)
  celery:       Celery worker (autodiscover)

  # Microservices (11)
  msp_mitra:           Port 8001
  soilscan_ai:         Port 8002
  fasal_rakshak:       Port 8003
  jal_shakti:          Port 8004
  harvest_shakti:      Port 8005
  kisaan_sahayak:      Port 8006
  protein_engineering:  Port 8007
  kisan_credit:        Port 8008
  harvest_to_cart:     Port 8009
  beej_suraksha:       Port 8010
  mausam_chakra:       Port 8011

  # Frontend (1)
  frontend:            Port 3000
```

All services share the same Docker network. Each service has:
- Its own `Dockerfile`
- Its own `requirements.txt`
- Health check endpoint at `/health`
- Dependency on `postgres` and `redis` containers

---

## ML Pipeline (src/)

```
src/
├── models/
│   ├── saved_models/
│   │   ├── weather_lr_model.pkl        # Weather: Linear Regression
│   │   ├── weather_rf_model.pkl        # Weather: Random Forest
│   │   ├── weather_svr_model.pkl       # Weather: SVR
│   │   ├── crop_lr_model.pkl           # Crop Yield: Linear Regression
│   │   ├── crop_rf_model.pkl           # Crop Yield: Random Forest
│   │   ├── crop_svr_model.pkl          # Crop Yield: SVR
│   │   ├── feature_scaler.pkl          # Weather feature scaler
│   │   └── crop_feature_scaler.pkl     # Crop feature scaler
│   ├── classical/                       # Classical ML training code
│   └── quantum/                         # Quantum VQR training code
├── quantum/
│   ├── quantum_vqr.py                  # Qiskit VQR implementation
│   └── results/                         # Quantum experiment results
├── data_pipeline/
│   ├── feature_engineering.py          # 40+ engineered features
│   └── preprocessing.py               # Data cleaning + transforms
└── api/
    └── app.py                          # Standalone FastAPI (not Docker)
```

**Key gap**: These 8 trained models are NOT wired into the Docker microservices. They serve a standalone `src/api/app.py` that is separate from the 11-service architecture.

---

## Technology Versions

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | Backend runtime |
| FastAPI | 0.100+ | API framework |
| SQLAlchemy | 2.0 | Async ORM |
| asyncpg | Latest | PostgreSQL async driver |
| PostgreSQL | 15 | Primary database |
| Redis | 7 | Cache + Celery broker |
| Celery | Latest | Background task queue |
| Next.js | 16 | Frontend framework |
| React | 19 | UI library |
| TypeScript | Strict | Frontend type safety |
| Tailwind CSS | v4 | Styling |
| Zustand | Latest | Client state management |
| TanStack Query | Latest | Server state management |
| Docker Compose | v2 | Container orchestration |
| Qiskit | 1.4.5 | Quantum computing |
| Prophet | Latest | Time series forecasting |
| scikit-learn | Latest | Classical ML |
