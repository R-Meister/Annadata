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

| Service | Port | Description | Status |
|---------|------|-------------|--------|
| **MSP Mitra** | 8001 | Price intelligence & market analytics (1.1M+ records, Prophet + ensemble ML) | Active |
| **SoilScan AI** | 8002 | AI-powered soil health analysis using satellite imagery & sensor data | Scaffold |
| **Fasal Rakshak** | 8003 | Crop disease detection & pest management recommendations | Scaffold |
| **Jal Shakti** | 8004 | Smart irrigation scheduling & water resource management | Scaffold |
| **Harvest Shakti** | 8005 | Harvest timing optimization & yield estimation DSS | Scaffold |
| **Kisaan Sahayak** | 8006 | Multi-agent AI assistant for personalized farming guidance | Scaffold |
| **Protein Engineering** | 8000 | Protein trait-to-gene mapping & climate crop profiles | Active |
| **Frontend** | 3000 | Unified Next.js dashboard | Active |

## Architecture

```
Annadata OS
├── services/                  # Microservices (new architecture)
│   ├── shared/                # Shared infrastructure
│   │   ├── config.py          # Centralized settings (Pydantic)
│   │   ├── db/                # Async SQLAlchemy 2.0 + PostgreSQL
│   │   ├── auth/              # JWT auth (register/login/roles)
│   │   └── celery_app/        # Background task queue (Redis broker)
│   ├── msp_mitra/             # Price intelligence service
│   ├── soilscan_ai/           # Soil analysis service
│   ├── fasal_rakshak/         # Crop protection service
│   ├── jal_shakti/            # Water management service
│   ├── harvest_shakti/        # Harvest DSS service
│   └── kisaan_sahayak/        # AI assistant service
├── frontend/                  # Unified Next.js 16 dashboard
│   ├── app/                   # App Router pages
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
- **Kubernetes** production-ready path

### ML / Quantum
- 6 trained classical models (Linear Regression, Random Forest, SVR)
- Quantum VQR model (Qiskit 1.4.5, 4 qubits, COBYLA optimizer)
- 3 quantum strategies for yield forecasting
- 40+ engineered weather + crop features

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
- **Traefik Dashboard**: http://localhost:8080 (with `--profile gateway`)

For detailed setup instructions, see **[run.md](run.md)**.

## API Endpoints

### Authentication (all services)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/auth/me` | Get current user profile |

### MSP Mitra (port 8001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/commodities` | List available commodities |
| GET | `/states` | List all states |
| GET | `/prices/{commodity}/{state}` | Get latest prices |
| GET | `/predict/{commodity}/{state}` | Get price predictions |
| GET | `/recommend/{commodity}/{state}` | Get sell recommendations |
| GET | `/analytics/volatility/{commodity}/{state}` | Volatility analysis |
| GET | `/analytics/trends/{commodity}/{state}` | Trend analysis |
| GET | `/analytics/insights/{commodity}/{state}` | AI market insights |

### Other Services
Each service exposes `/health` for monitoring and service-specific endpoints documented at `http://localhost:{port}/docs`.

## Data Assets

| Dataset | Records | Description |
|---------|---------|-------------|
| AgMarkNet prices | 1.1M+ | Historical agricultural commodity prices (2024-2025) |
| Crop yield | 19,690 | Crop yield data across Indian regions |
| Weather data | 5,840+ | Synthetic weather records across 8 regions |
| Trained models | 8 | Classical + quantum model artifacts (.pkl) |

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
