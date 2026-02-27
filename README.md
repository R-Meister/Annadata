<table>
  <tr>
    <td><img src="Logo_withoutbg.png" alt="Annadata" width="100"/></td>
    <td>
      <h1>Annadata OS</h1>
      <p><strong>Multi-Service AI Agriculture Platform</strong></p>
    </td>
  </tr>
</table>

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black.svg)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791.svg)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://docs.docker.com/compose/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> Empowering Indian farmers with quantum-aware yield forecasting, market intelligence, soil analysis, crop protection, smart irrigation, and AI-powered decision support.

Annadata OS is a multi-service AI agriculture platform where each service runs as an independent FastAPI microservice sharing PostgreSQL and Redis, with a unified Next.js dashboard frontend. The platform integrates quantum computing, classical ML, and real-time data to address food security, sustainability, and resource optimization.

## Platform Services

| # | Service | Port | Description | Endpoints |
|---|---------|------|-------------|-----------|
| 1 | **MSP Mitra** | 8001 | Price intelligence, market analytics, nearest mandis, price alerts (1.1M+ AgMarkNet records) | 20 |
| 2 | **SoilScan AI** | 8002 | Soil health analysis, photo-based analysis, quantum ML correlation, batch analysis | 8 |
| 3 | **Fasal Rakshak** | 8003 | Crop disease detection, pesticide shop finder, protein engineering linkage | 8 |
| 4 | **Jal Shakti** | 8004 | Smart irrigation (Penman-Monteith), IoT valve control, quantum multi-field optimization | 9 |
| 5 | **Harvest Shakti** | 8005 | AGRI-MAA Decision Support System: crop recommendation, fertilizer advisory, irrigation, pest alerts, rotation | 12 |
| 6 | **Kisaan Sahayak** | 8006 | Multi-agent AI assistant: vision, verification, weather, market, memory, LLM summary, full pipeline | 14 |
| 7 | **Protein Engineering** | 8007 | Protein trait-to-gene mapping, climate crop profiles, trait engineering pipeline | 8 |
| 8 | **Kisan Credit Score** | 8008 | Farmer credit scoring, batch calculation, regional risk assessment | 7 |
| 9 | **Harvest-to-Cart** | 8009 | Cold chain logistics, demand prediction, quantum-optimized routing, farmer-retailer matching | 9 |
| 10 | **Beej Suraksha** | 8010 | Seed verification, QR tracking, community reporting, blockchain supply chain traceability | 12 |
| 11 | **Mausam Chakra** | 8011 | Hyper-local weather, satellite data fusion, quantum VQR prediction, agricultural advisory | 12 |
| | **Frontend** | 3000 | Unified Next.js dashboard with 16 routes | |
| | **Total** | | | **119** |

## Architecture

```
Annadata OS
├── services/                  # Microservices (11 independent FastAPI apps)
│   ├── shared/                # Shared infrastructure
│   │   ├── config.py          # Centralized settings (Pydantic)
│   │   ├── db/                # Async SQLAlchemy 2.0 + PostgreSQL
│   │   ├── auth/              # JWT auth (register/login/roles)
│   │   └── celery_app/        # Background task queue (Redis broker)
│   ├── msp_mitra/             # Price intelligence service
│   ├── soilscan_ai/           # Soil analysis service
│   ├── fasal_rakshak/         # Crop protection service
│   ├── jal_shakti/            # Water management service
│   ├── harvest_shakti/        # AGRI-MAA Decision Support System
│   ├── kisaan_sahayak/        # Multi-agent AI assistant
│   ├── protein_engineering/   # Protein engineering service
│   ├── kisan_credit/          # Credit scoring service
│   ├── harvest_to_cart/       # Cold chain logistics service
│   ├── beej_suraksha/         # Seed verification service
│   └── mausam_chakra/         # Weather intelligence service
├── frontend/                  # Unified Next.js 16 dashboard
│   ├── app/                   # App Router pages (16 routes)
│   ├── components/            # UI + layout components
│   ├── lib/                   # API client, utils, query client
│   └── store/                 # Zustand state (auth, services)
├── infra/                     # Docker templates
├── src/                       # Core ML/Quantum pipeline
│   ├── models/                # Classical + Quantum ML models
│   ├── quantum/               # Quantum strategies (Qiskit)
│   ├── data_pipeline/         # ETL + feature engineering
│   └── api/                   # Core FastAPI app
├── msp_mitra/                 # MSP Mitra legacy backend + data
├── protein_engineering/       # Protein Engineering sub-app
├── data/                      # Raw + processed datasets
├── tests/                     # Unit + integration tests (55 tests)
├── docker-compose.yml         # Full orchestration
├── .env.example               # Environment variables template
└── start.sh                   # Dev start script
```

## Tech Stack

### Backend
- **FastAPI** (Python 3.11) with Pydantic v2 validation
- **SQLAlchemy 2.0** async ORM with **asyncpg** driver
- **PostgreSQL 15** shared database
- **Redis 7** for caching + Celery broker
- **Celery** for background ML tasks
- **JWT authentication** with role-based access (farmer/trader/researcher/admin)

### Frontend
- **Next.js 16** (App Router) with **React 19**
- **TypeScript** (strict mode)
- **Tailwind CSS v4** with CSS custom properties
- **TanStack Query** for server state
- **Zustand** for client state
- **GSAP** + **Lottie** for animations

### Infrastructure
- **Docker Compose** for development orchestration
- **Traefik** optional reverse proxy / API gateway
- **GitHub Actions** CI pipeline
- **Kubernetes** production-ready path

### ML / Quantum
- 6 trained classical models (Linear Regression, Random Forest, SVR)
- Quantum VQR model (Qiskit 1.4.5, 4 qubits, COBYLA optimizer)
- 3 quantum strategies for yield forecasting
- 40+ engineered weather + crop features
- Simulated quantum QAOA for multi-field irrigation optimization
- SHA-256 blockchain for seed supply chain verification

## Quick Start

```bash
# Clone
git clone https://github.com/R-Meister/Annadata.git
cd Annadata

# Copy environment config
cp .env.example .env

# Start everything with Docker
./start.sh

# Or start just infrastructure
./start.sh infra

# Or run services locally
./start.sh local
```

Visit:
- **Dashboard**: http://localhost:3000
- **MSP Mitra API**: http://localhost:8001/docs
- **Any Service**: http://localhost:{port}/docs
- **Traefik Dashboard**: http://localhost:8080 (with `--profile gateway`)

For detailed setup instructions, see **[run.md](run.md)**.

## API Endpoints (119 total)

### Authentication (all services)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user profile |

### MSP Mitra — Port 8001 (20 endpoints)
Price intelligence & market analytics powered by 1.1M+ AgMarkNet records.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/commodities` | List all available commodities |
| GET | `/states` | List all states |
| GET | `/markets/{state}` | List markets in a state |
| GET | `/prices/{commodity}/{state}` | Get latest prices for a commodity in a state |
| GET | `/prices/history/{commodity}` | Get historical price data |
| POST | `/train` | Train price prediction models |
| GET | `/predict/{commodity}/{state}` | Get price predictions (Prophet + ensemble) |
| GET | `/recommend/{commodity}/{state}` | Smart sell recommendation |
| GET | `/analytics/volatility/{commodity}/{state}` | Volatility analysis (Bollinger bands, ATR) |
| GET | `/analytics/trends/{commodity}/{state}` | Trend analysis (SMA, EMA, momentum) |
| GET | `/analytics/seasonal/{commodity}` | Seasonal pattern analysis |
| GET | `/analytics/market-comparison/{commodity}/{state}` | Compare prices across markets |
| GET | `/analytics/top-performers/{state}` | Top-performing commodities |
| GET | `/analytics/insights/{commodity}/{state}` | AI-generated market insights |
| POST | `/nearest-mandis` | Find nearest mandis with TSP route optimization |
| POST | `/alerts/create` | Create price alerts with prediction-based triggers |
| GET | `/alerts` | List all active price alerts |
| POST | `/predict/yield-market` | Combined yield + market prediction |

### SoilScan AI — Port 8002 (8 endpoints)
AI-powered soil health analysis with photo recognition and quantum ML.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/analyze` | Analyze soil sample (N/P/K/pH scoring, recommendations) |
| POST | `/batch-analyze` | Batch analysis for multiple samples |
| GET | `/report/{analysis_id}` | Retrieve a completed analysis report |
| GET | `/history` | Get analysis history for a plot (with trend computation) |
| POST | `/analyze-photo` | Photo-based soil analysis from HSV color/texture features |
| POST | `/quantum-correlation` | Quantum-inspired correlation discovery with Kalman fusion |

### Fasal Rakshak — Port 8003 (8 endpoints)
Crop disease detection, pest management, and resistance gene linkage.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/detect` | Detect crop disease from symptoms and environment |
| GET | `/recommendations/{crop}` | Get crop-specific disease prevention recommendations |
| GET | `/alerts` | Active pest/disease alerts for a region |
| GET | `/history` | Detection history (filterable by crop) |
| POST | `/nearby-shops` | Find 16+ nearby pesticide shops with Haversine distance |
| POST | `/protein-engineering-link` | Link disease to resistance genes (Lr34, Pi-ta, Xa21, etc.) |

### Jal Shakti — Port 8004 (9 endpoints)
Smart irrigation using Penman-Monteith ET0, IoT valves, and quantum optimization.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register-plot` | Register a new irrigation plot |
| GET | `/schedule/{plot_id}` | Get 7-day irrigation schedule |
| GET | `/usage` | Water usage analytics |
| GET | `/sensors/{plot_id}` | Simulated soil/weather sensor readings |
| POST | `/iot/valve-control` | Control solar-powered smart valve (on/off/auto) |
| GET | `/iot/valve-status/{plot_id}` | Get current valve status |
| POST | `/quantum-optimize` | Quantum QAOA multi-field water allocation optimization |

### Harvest Shakti (AGRI-MAA DSS) — Port 8005 (12 endpoints)
Comprehensive Decision Support System for crop management.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/register-plot` | Register a plot for monitoring |
| GET | `/yield-estimate/{plot_id}` | ML-based yield estimation |
| GET | `/harvest-window/{plot_id}` | Optimal harvest window computation |
| GET | `/market-timing` | Market intelligence with pricing data |
| POST | `/recommend-crop` | Random Forest crop recommendation (12 crops) |
| POST | `/fertilizer-advisory` | NPK deficit analysis with specific fertilizer names |
| POST | `/irrigation-schedule` | 7-day schedule using Blaney-Criddle ET |
| GET | `/pest-alerts` | Rule-based pest/disease alerts (10 rules) |
| GET | `/crop-rotation/{crop}` | Rotation suggestions with sustainability scoring |
| POST | `/chat` | AI chatbot (8 knowledge categories) |

### Kisaan Sahayak — Port 8006 (14 endpoints)
Multi-agent AI pipeline for end-to-end farm diagnosis and advisory.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat` | Knowledge-based farming Q&A |
| GET | `/schemes` | Government schemes for farmers |
| GET | `/calendar/{crop}` | Crop calendar with regional timing |
| GET | `/faq` | Frequently asked questions |
| POST | `/agent/vision` | Plant disease classification (48 PlantVillage classes) |
| POST | `/agent/verify` | Severity assessment (LOW/MEDIUM/HIGH/CRITICAL) |
| GET | `/agent/weather` | 5-day forecast + irrigation advisory |
| GET | `/agent/market` | Real-time mandi prices |
| POST | `/agent/memory/log` | Log farmer interaction for pattern analysis |
| GET | `/agent/memory/{farmer_id}` | Retrieve interaction history + patterns |
| POST | `/agent/llm` | Multi-language summary (7 languages) |
| POST | `/pipeline/analyze` | Full orchestration: vision + verify + weather + market + LLM |

### Protein Engineering — Port 8007 (8 endpoints)
Trait-to-gene mapping and climate-aware crop protein engineering.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/climate/{region}` | Climate profile from weather CSV data |
| GET | `/crop-performance/{crop}/{state}/{season}` | Historical crop yield performance |
| GET | `/protein-traits/{trait}` | Protein info for a specific trait |
| GET | `/protein-traits` | List all trait-to-protein mappings |
| POST | `/engineer-trait` | Full trait engineering pipeline with yield projection |
| GET | `/recommendations` | Climate-based trait engineering recommendations |

### Kisan Credit Score — Port 8008 (7 endpoints)
Farmer credit scoring and regional agricultural risk assessment.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/credit-score/calculate` | Calculate credit score for a farmer |
| POST | `/credit-score/batch` | Batch credit score calculation |
| GET | `/credit-score/{score_id}` | Retrieve a computed credit score |
| GET | `/credit-score/stats` | Aggregate credit statistics |
| GET | `/risk-assessment/{region}` | Regional agricultural risk assessment |

### Harvest-to-Cart — Port 8009 (9 endpoints)
Cold chain logistics, demand forecasting, and quantum-optimized routing.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/cold-storage/find-nearest` | Find nearest cold storage facilities |
| POST | `/demand/predict` | Demand prediction for a crop in a city |
| POST | `/logistics/optimize-route` | TSP-based delivery route optimization |
| POST | `/connect/farmer-retailer` | Match farmers with suitable retailers |
| GET | `/harvest-window/{crop_type}` | Harvest timing, shelf-life, storage guidance |
| GET | `/stats` | Aggregate service statistics |
| POST | `/quantum/logistics` | Quantum-optimized routing with freshness scoring and 2-opt |

### Beej Suraksha — Port 8010 (12 endpoints)
Seed verification, QR tracking, community trust scoring, and blockchain traceability.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/seed/register` | Register seed batch with QR code |
| GET | `/seed/verify/{qr_code_id}` | Verify seed batch by QR code |
| POST | `/seed/analyze-image` | AI seed image analysis (simulated) |
| GET | `/seed/catalog` | List genuine seed varieties |
| POST | `/community/report` | Submit seed quality report |
| GET | `/community/reports` | Get community reports |
| GET | `/community/dealer-rating/{dealer_name}` | Dealer trust score from community data |
| GET | `/stats` | Platform statistics |
| POST | `/blockchain/add-transaction` | Add SHA-256 chained transaction to supply chain |
| GET | `/blockchain/verify-chain/{qr_code_id}` | Verify blockchain integrity |
| GET | `/blockchain/trace/{qr_code_id}` | Full traceability from manufacturer to farmer |

### Mausam Chakra — Port 8011 (12 endpoints)
Hyper-local weather intelligence with satellite fusion and quantum prediction.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/weather/current/{village_code}` | Current weather for a village |
| GET | `/weather/forecast/{village_code}` | 7-day weather forecast |
| POST | `/weather/alerts` | Severe weather alerts for a region |
| GET | `/weather/historical/{village_code}` | Historical weather summary |
| GET | `/iot/stations` | List IoT weather stations |
| POST | `/iot/station-data` | Submit IoT station observation data |
| POST | `/advisory/agricultural` | Agriculture-specific weather advisory |
| GET | `/stats` | Service statistics |
| POST | `/satellite/fusion` | Kalman-filter satellite + ground data fusion with NDVI |
| POST | `/quantum/vqr-predict` | Quantum VQR weather prediction with uncertainty |

## Data Assets

| Dataset | Records | Description |
|---------|---------|-------------|
| AgMarkNet prices | 1.1M+ | Historical agricultural commodity prices (2024-2025) |
| Crop yield | 19,690 | Crop yield data across Indian regions |
| Weather data | 5,840+ | Synthetic weather records across 8 regions |
| Trained models | 8 | Classical + quantum model artifacts (.pkl) |

## Testing

```bash
# Run all tests (55 tests)
python3 -m pytest tests/ -v

# Unit tests only
python3 -m pytest tests/unit/ -v

# Integration tests only
python3 -m pytest tests/integration/ -v
```

## Team

| Member | Role | GitHub |
|--------|------|--------|
| **Pranav Singh** | Quantum/AI Developer | [pranav271103](https://github.com/pranav271103) |
| **Raman Mendiratta** | ML/Data Science Lead | [R-Meister](https://github.com/R-Meister) |
| **Kritika Yadav** | Data Pipeline Lead | [kritika62](https://github.com/kritika62) |
| **Kshitij Verma** | Full-Stack Developer | [Capatlist](https://github.com/Capatlist) |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Commit (`git commit -m 'Add amazing feature'`)
5. Push (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Adding a New Service

Each new service should:
1. Have its own directory under `services/`
2. Include `app.py`, `tasks.py`, `requirements.txt`, `Dockerfile`
3. Register itself in `docker-compose.yml`
4. Share PostgreSQL + Redis via `services/shared/`
5. Expose a `/health` endpoint
6. Use async SQLAlchemy and Celery for heavy ML tasks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Links

- [How to Run](run.md) - Detailed setup and run instructions
- [Bug Reports & Feature Requests](https://github.com/pranav271103/Annadata/issues)
