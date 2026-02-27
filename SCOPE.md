# Annadata OS — Project Scope

## What This Project Is

Annadata OS is a **multi-service AI agriculture platform** targeting Indian smallholder farmers. It provides 11 independent microservices covering the full farming lifecycle: soil analysis, crop selection, irrigation, disease detection, market intelligence, credit scoring, cold chain logistics, seed verification, weather forecasting, and AI-powered advisory.

The platform is built as a **proof-of-concept / Major Project** demonstrating how quantum computing, classical ML, real-time data, and microservice architecture can be combined to address food security and farmer welfare.

---

## What Currently Works (Production-Ready)

These components use **real data, real trained models, or real logic** — not simulated:

### MSP Mitra (Port 8001)
- **Real data**: Loads 1.1M+ AgMarkNet commodity price records from CSV on startup
- **Real ML**: Facebook Prophet + ensemble (Linear Regression, Random Forest, SVR) for price forecasting — trains on-demand via `POST /train`
- **Real logic**: Sell recommendations, volatility (Bollinger Bands, ATR), trend analysis (SMA/EMA/momentum), seasonal decomposition, market comparison
- Simulated: nearest mandi prices (distances and current prices use seeded RNG), yield estimation in combined endpoint

### Protein Engineering (Port 8007)
- **Real data**: Reads `weather_processed.csv` (5,840+ records) and `crop_raw_data.csv` (19,690 records) for climate profiles and crop performance
- **Real logic**: Trait-to-protein mapping database (drought tolerance, pest resistance, nutritional quality, etc.) with gene references (DREB2A, Bt Cry1Ac, GoldenRice2, etc.)
- All endpoints return data derived from real CSVs

### Core ML Pipeline (`src/`)
- **8 trained model artifacts** in `src/models/saved_models/`:
  - 3 weather models: Linear Regression, Random Forest, SVR
  - 3 crop yield models: Linear Regression, Random Forest, SVR
  - 2 scalers: feature_scaler.pkl, crop_feature_scaler.pkl
  - 1 Quantum VQR model (Qiskit, 4 qubits, COBYLA optimizer)
- **40+ engineered features** via the data pipeline
- These models are trained and saved but **not yet wired into the microservices** (they live in `src/` and are used by the standalone `src/api/app.py`, not by the Docker services)

### Shared Infrastructure
- **JWT authentication** with bcrypt password hashing — fully functional
- **PostgreSQL 15** — schema created on startup (users, service_logs tables)
- **Redis 7** — available for caching
- **Celery** — worker configured with autodiscover for all 11 services

### Frontend (Port 3000)
- 16-route Next.js 16 dashboard with TypeScript strict mode
- API rewrites to all 11 backend services
- Auth state management via Zustand
- All service dashboards render feature cards — but API calls to simulated backends will return simulated data

---

## What Is Simulated (Needs Real Implementation)

Every service listed below has **functioning endpoints** that return structured, realistic-looking data — but the data is generated via seeded RNG, hardcoded lookup tables, or rule-based heuristics rather than real ML models or real external data.

### SoilScan AI (Port 8002) — Fully Simulated
- `/analyze`: Scoring functions use hand-tuned polynomial/bell-curve formulas (not ML)
- `/analyze-photo`: HSV color extraction + rule-based pH/nutrient estimation (not a CNN)
- `/quantum-correlation`: Kalman filter logic is real math, but "quantum advantage metrics" are fabricated numbers
- No trained models, no real sensor data ingestion

### Fasal Rakshak (Port 8003) — Fully Simulated
- `/detect`: Rule-based disease matching from a hardcoded dictionary of 25+ diseases
- `/nearby-shops`: 16 hardcoded pesticide shops with Haversine distance (real math, fake shop data)
- `/protein-engineering-link`: Static lookup table mapping diseases to resistance genes
- No image classification model (would need MobileNetV2/ResNet trained on PlantVillage)

### Jal Shakti (Port 8004) — Partially Real
- **Real math**: Penman-Monteith ET0 calculation, crop coefficient (Kc) curves, MAD threshold logic
- Simulated: sensor readings (seeded RNG), IoT valve state (in-memory dict), weather data for scheduling
- `/quantum-optimize`: Simulated annealing labeled as "QAOA" — not actual quantum circuit execution

### Harvest Shakti (Port 8005) — Fully Simulated
- `/recommend-crop`: Hardcoded crop-soil suitability matrix with noise, labeled "simulated Random Forest"
- `/fertilizer-advisory`: Rule-based NPK deficit calculation (real agronomy logic, not ML)
- `/irrigation-schedule`: Blaney-Criddle ET with hardcoded weather (real formula, fake weather)
- `/pest-alerts`: 10 hardcoded rules
- `/chat`: Pattern-matched responses from a static knowledge base, labeled "simulated Gemini"
- Yield estimation: formula-based, not ML

### Kisaan Sahayak (Port 8006) — Fully Simulated
- `/agent/vision`: Returns hardcoded PlantVillage class names based on string matching, not a CNN
- `/agent/verify`: Rule-based severity scoring
- `/agent/weather`: Seeded RNG weather generation
- `/agent/market`: Hardcoded base prices with RNG noise
- `/agent/llm`: Template-based multilingual output, not a real LLM
- `/pipeline/analyze`: Orchestrates the above simulated agents
- Chat: keyword matching against a static FAQ/knowledge base

### Kisan Credit Score (Port 8008) — Fully Simulated
- Credit scoring uses a weighted formula (land, income, history, crop diversity, irrigation) — reasonable heuristic but not trained on real credit data
- No external credit bureau integration

### Harvest-to-Cart (Port 8009) — Fully Simulated
- Cold storage: 20+ hardcoded facility entries with Haversine distance (real math, fake facilities)
- Demand prediction: Seasonal sine wave + trend + noise (not a real demand model)
- Route optimization: Nearest-neighbor TSP with 2-opt improvement (real algorithm, simulated coordinates)
- `/quantum/logistics`: Same TSP labeled as "quantum-optimized"
- Farmer-retailer matching: Hardcoded retailer database with simulated matching

### Beej Suraksha (Port 8010) — Fully Simulated
- Seed registration and QR code generation work (real logic)
- Image analysis: Text matching against hardcoded color feature vectors (not a CNN)
- Community reporting: In-memory store, functional but no persistence
- Blockchain: SHA-256 chaining logic is real, but in-memory only (not a real distributed ledger)

### Mausam Chakra (Port 8011) — Fully Simulated
- All weather data is generated from seeded RNG with seasonal/diurnal patterns
- No OpenWeather API integration (env var exists but unused)
- No Sentinel Hub satellite data (env var exists but unused)
- `/satellite/fusion`: Kalman filter math is real, but satellite "observations" are generated
- `/quantum/vqr-predict`: Simulated quantum variational regression (not Qiskit execution)

---

## Data Storage Model

| Service | Storage | Persistence |
|---------|---------|-------------|
| MSP Mitra | CSV loaded into pandas DataFrame | Read-only from disk |
| Protein Engineering | CSV loaded into pandas DataFrame | Read-only from disk |
| SoilScan AI | `_analysis_store` (Python dict) | Lost on restart |
| Fasal Rakshak | `_detection_store` (Python dict) | Lost on restart |
| Jal Shakti | `_plot_store`, `_valve_store` (Python dicts) | Lost on restart |
| Harvest Shakti | `_plot_store` (Python dict) | Lost on restart |
| Kisaan Sahayak | `_session_store`, `_memory_store` (Python dicts) | Lost on restart |
| Kisan Credit Score | `_score_store` (Python dict) | Lost on restart |
| Harvest-to-Cart | In-memory only | Lost on restart |
| Beej Suraksha | `_seed_store`, `_blockchain_store` (Python dicts) | Lost on restart |
| Mausam Chakra | Stateless (generated on each request) | N/A |
| All services | PostgreSQL (users, service_logs) | Persistent |

All services call `init_db()` on startup to create the shared PostgreSQL schema, but only the auth system (users table) actively writes to it. The service-specific data lives in **in-memory Python dicts** and is lost when containers restart.

---

## What This Means for a Demo

For a **live demo or presentation**, the platform works well:
- All 119 endpoints return structured, realistic JSON responses
- The frontend dashboard is fully navigable
- MSP Mitra has real data and real predictions
- Protein Engineering has real CSV data and real trait mappings
- The auth system works end-to-end (register, login, JWT)
- Everything runs with `docker compose up --build`

For **production use**, you would need to:
1. Train real ML models and wire them in (see [ML_TRAINING.md](ML_TRAINING.md))
2. Connect external APIs and real data sources (see [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md))
3. Move in-memory stores to PostgreSQL
4. Add real IoT device integration for Jal Shakti sensors/valves

---

## Team Responsibilities

| Member | Primary Services | Role |
|--------|-----------------|------|
| **Pranav Singh** | Core ML pipeline (`src/`), Quantum VQR, Mausam Chakra | Quantum/AI |
| **Raman Mendiratta** | MSP Mitra, SoilScan AI, Harvest Shakti, Kisan Credit | ML/Data Science Lead |
| **Kritika Yadav** | Data pipeline, Fasal Rakshak, Beej Suraksha | Data Pipeline Lead |
| **Kshitij Verma** | Frontend, Kisaan Sahayak, Harvest-to-Cart, Jal Shakti | Full-Stack |
