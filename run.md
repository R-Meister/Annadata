# How to Run Annadata OS

Complete guide for setting up and running the Annadata multi-service platform.

---

## Prerequisites

| Tool | Version | Required For |
|------|---------|-------------|
| **Docker** + **Docker Compose** | 24+ / v2+ | Running all services (recommended) |
| **Python** | 3.11+ | Running services locally |
| **Node.js** | 20+ | Running the frontend locally |
| **Git** | 2.30+ | Cloning the repository |

> Docker is the recommended approach. If you don't have Docker, see [Running Without Docker](#running-without-docker) below.

---

## 1. Clone and Configure

```bash
git clone https://github.com/R-Meister/Annadata.git
cd Annadata
```

Create your environment file:

```bash
cp .env.example .env
```

Edit `.env` and update values as needed. The defaults work for local development:

```env
# Key settings (defaults work out of the box)
POSTGRES_USER=annadata
POSTGRES_PASSWORD=annadata_dev_password
POSTGRES_DB=annadata
REDIS_HOST=redis
SECRET_KEY=change-this-to-a-random-secret-key-in-production
JWT_SECRET_KEY=change-this-jwt-secret-in-production
```

---

## 2. Running with Docker (Recommended)

### Start Everything

```bash
./start.sh
```

Or equivalently:

```bash
docker compose up --build
```

This starts all services:

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Unified Next.js dashboard |
| MSP Mitra | http://localhost:8001 | Price intelligence API |
| SoilScan AI | http://localhost:8002 | Soil analysis API |
| Fasal Rakshak | http://localhost:8003 | Crop protection API |
| Jal Shakti | http://localhost:8004 | Water management API |
| Harvest Shakti | http://localhost:8005 | Harvest DSS (AGRI-MAA) API |
| Kisaan Sahayak | http://localhost:8006 | AI assistant API |
| Protein Engineering | http://localhost:8007 | Protein analysis API |
| Kisan Credit | http://localhost:8008 | Credit score API |
| Harvest-to-Cart | http://localhost:8009 | Cold chain logistics API |
| Beej Suraksha | http://localhost:8010 | Seed verification API |
| Mausam Chakra | http://localhost:8011 | Hyper-local weather API |
| PostgreSQL | localhost:5432 | Database |
| Redis | localhost:6379 | Cache + task broker |

### Start Only Infrastructure

If you want to run services locally but need the database and cache:

```bash
./start.sh infra
```

This starts only PostgreSQL and Redis.

### Start with API Gateway

To include the Traefik reverse proxy (routes all services through port 80):

```bash
docker compose --profile gateway up --build
```

Traefik dashboard available at http://localhost:8080.

### Stop Everything

```bash
./start.sh stop
```

Or:

```bash
docker compose down
```

To also remove volumes (database data):

```bash
docker compose down -v
```

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f msp-mitra

# Only infrastructure
docker compose logs -f postgres redis
```

### Restart a Single Service

```bash
docker compose restart msp-mitra
```

### Rebuild a Single Service

```bash
docker compose up --build msp-mitra
```

---

## 3. Running Without Docker

### A. Start Infrastructure First

You need PostgreSQL 15 and Redis 7 running locally. Install them via your package manager:

**macOS (Homebrew):**
```bash
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql-15 redis-server
sudo systemctl start postgresql redis
```

Create the database:
```bash
createdb annadata
```

Update `.env` to point to localhost:
```env
POSTGRES_SERVER=localhost
REDIS_HOST=localhost
```

### B. Python Backend Setup

```bash
# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate    # macOS/Linux
# venv\Scripts\activate     # Windows

# Install root dependencies
pip install -r requirements.txt
```

### C. Start Backend Services Locally

**Option 1: Use the start script**
```bash
./start.sh local
```

This starts all 11 backend services and the frontend simultaneously.

**Option 2: Start services individually**

Each service can be started from the project root:

```bash
# MSP Mitra (existing backend)
cd msp_mitra/backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

```bash
# Protein Engineering (existing backend)
cd protein_engineering/backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

```bash
# Any new service (e.g., SoilScan AI)
cd services/soilscan_ai
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8002
```

### D. Start Celery Worker

```bash
# From project root, with venv activated
celery -A services.shared.celery_app.app.celery_app worker --loglevel=info
```

### E. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend available at http://localhost:3000.

---

## 4. Verifying the Setup

### Check Service Health

Each service exposes a `/health` endpoint:

```bash
# MSP Mitra
curl http://localhost:8001/health

# SoilScan AI
curl http://localhost:8002/health

# All services at once
for port in 8001 8002 8003 8004 8005 8006 8007 8008 8009 8010 8011; do
  echo "Port $port: $(curl -s http://localhost:$port/health | python3 -m json.tool 2>/dev/null || echo 'not running')"
done
```

### Check Database Connection

```bash
# Via Docker
docker compose exec postgres psql -U annadata -d annadata -c "SELECT 1;"

# Local
psql -U annadata -d annadata -c "SELECT 1;"
```

### Check Redis Connection

```bash
# Via Docker
docker compose exec redis redis-cli ping

# Local
redis-cli ping
```

Expected response: `PONG`

### API Documentation

Each FastAPI service auto-generates interactive API docs:

| Service | Swagger UI | ReDoc |
|---------|-----------|-------|
| MSP Mitra | http://localhost:8001/docs | http://localhost:8001/redoc |
| SoilScan AI | http://localhost:8002/docs | http://localhost:8002/redoc |
| Fasal Rakshak | http://localhost:8003/docs | http://localhost:8003/redoc |
| Jal Shakti | http://localhost:8004/docs | http://localhost:8004/redoc |
| Harvest Shakti | http://localhost:8005/docs | http://localhost:8005/redoc |
| Kisaan Sahayak | http://localhost:8006/docs | http://localhost:8006/redoc |
| Protein Engineering | http://localhost:8007/docs | http://localhost:8007/redoc |
| Kisan Credit | http://localhost:8008/docs | http://localhost:8008/redoc |
| Harvest-to-Cart | http://localhost:8009/docs | http://localhost:8009/redoc |
| Beej Suraksha | http://localhost:8010/docs | http://localhost:8010/redoc |
| Mausam Chakra | http://localhost:8011/docs | http://localhost:8011/redoc |

---

## 5. Common Tasks

### Register a User

```bash
curl -X POST http://localhost:8001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "securepassword",
    "full_name": "Test Farmer",
    "role": "farmer",
    "state": "Maharashtra"
  }'
```

### Login

```bash
curl -X POST http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "farmer@example.com",
    "password": "securepassword"
  }'
```

This returns a JWT token. Use it in subsequent requests:

```bash
curl -H "Authorization: Bearer <your-token>" http://localhost:8001/auth/me
```

### Get MSP Mitra Predictions

```bash
# Train a model first
curl -X POST http://localhost:8001/train \
  -H "Content-Type: application/json" \
  -d '{"commodity": "Rice", "state": "Punjab"}'

# Get predictions
curl "http://localhost:8001/predict/Rice/Punjab?days=7"

# Get sell recommendation
curl "http://localhost:8001/recommend/Rice/Punjab?current_price=2500&msp=2183"
```

---

## 6. Project Structure

```
Annadata/
├── docker-compose.yml          # Orchestrates all services
├── .env.example                # Environment variable template
├── .env                        # Your local config (git-ignored)
├── start.sh                    # Dev start script
├── requirements.txt            # Root Python dependencies
│
├── services/                   # Microservices
│   ├── shared/                 # Shared infrastructure
│   │   ├── config.py           #   Pydantic settings
│   │   ├── db/                 #   Async SQLAlchemy session + models
│   │   ├── auth/               #   JWT + dependencies + router
│   │   └── celery_app/         #   Background task queue
│   ├── msp_mitra/              # Price intelligence (port 8001)
│   ├── soilscan_ai/            # Soil analysis (port 8002)
│   ├── fasal_rakshak/          # Crop protection (port 8003)
│   ├── jal_shakti/             # Water management (port 8004)
│   ├── harvest_shakti/         # Harvest DSS / AGRI-MAA (port 8005)
│   ├── kisaan_sahayak/         # AI assistant (port 8006)
│   ├── protein_engineering/    # Protein analysis (port 8007)
│   ├── kisan_credit/           # Credit scoring (port 8008)
│   ├── harvest_to_cart/        # Cold chain logistics (port 8009)
│   ├── beej_suraksha/          # Seed verification (port 8010)
│   └── mausam_chakra/          # Hyper-local weather (port 8011)
│
├── frontend/                   # Unified Next.js 16 dashboard
│   ├── app/                    #   Pages (App Router)
│   ├── components/             #   UI + layout components
│   ├── lib/                    #   API client, utils
│   └── store/                  #   Zustand state stores
│
├── infra/                      # Docker templates
│   └── docker-templates/       #   Dockerfile.fastapi, .celery, .nextjs
│
├── msp_mitra/                  # MSP Mitra legacy backend + data
│   ├── backend/                #   FastAPI app (20+ endpoints)
│   └── frontend/               #   Vite + React (standalone)
│
├── protein_engineering/        # Protein Engineering sub-app
│   ├── backend/                #   FastAPI app
│   └── frontend/               #   Next.js (standalone)
│
├── src/                        # Core ML/Quantum pipeline
│   ├── models/                 #   Classical + quantum models
│   ├── quantum/                #   Quantum strategies
│   ├── data_pipeline/          #   ETL + feature engineering
│   └── api/                    #   Core FastAPI app
│
├── data/                       # Datasets (raw + processed)
├── notebooks/                  # Jupyter notebooks (EDA, models)
├── scripts/                    # Utility scripts
└── tests/                      # Test suites
```

---

## 7. Troubleshooting

### Port Already in Use

```bash
# Find what's using a port
lsof -i :8001

# Kill it
kill -9 <PID>
```

### Docker Build Fails

```bash
# Clean rebuild
docker compose down
docker system prune -f
docker compose up --build
```

### Database Connection Refused

- If using Docker: make sure `POSTGRES_SERVER=postgres` in `.env` (the Docker service name)
- If running locally: make sure `POSTGRES_SERVER=localhost` and PostgreSQL is running

### Redis Connection Refused

- Docker: `REDIS_HOST=redis`
- Local: `REDIS_HOST=localhost` and `redis-server` is running

### Frontend Build Errors

```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### MSP Mitra Data Not Loading

The MSP Mitra service loads `msp_mitra/agmarknet_india_historical_prices_2024_2025.csv` on startup. This file is 1.1M+ records and may take 10-30 seconds to load. Check logs:

```bash
docker compose logs -f msp-mitra
```

---

## 8. Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_NAME` | Annadata | Application name |
| `APP_ENV` | development | Environment (development/production) |
| `DEBUG` | true | Enable debug mode |
| `SECRET_KEY` | (insecure default) | App secret key |
| `POSTGRES_SERVER` | postgres | PostgreSQL host |
| `POSTGRES_USER` | annadata | PostgreSQL username |
| `POSTGRES_PASSWORD` | annadata_dev_password | PostgreSQL password |
| `POSTGRES_DB` | annadata | Database name |
| `POSTGRES_PORT` | 5432 | PostgreSQL port |
| `REDIS_HOST` | redis | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `JWT_SECRET_KEY` | (insecure default) | JWT signing key |
| `JWT_ALGORITHM` | HS256 | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 480 | Token expiry (8 hours) |
| `OPENWEATHER_API_KEY` | (empty) | OpenWeather API key |
| `GEMINI_API_KEY` | (empty) | Google Gemini API key (Kisaan Sahayak) |
| `DATA_GOV_API_KEY` | (empty) | data.gov.in API key (MSP Mitra) |
| `TELEGRAM_BOT_TOKEN` | (empty) | Telegram bot token (price alerts) |
| `SENTINEL_HUB_CLIENT_ID` | (empty) | Sentinel Hub client ID |
| `SENTINEL_HUB_CLIENT_SECRET` | (empty) | Sentinel Hub client secret |
| `MSP_MITRA_PORT` | 8001 | MSP Mitra service port |
| `SOILSCAN_AI_PORT` | 8002 | SoilScan AI service port |
| `FASAL_RAKSHAK_PORT` | 8003 | Fasal Rakshak service port |
| `JAL_SHAKTI_PORT` | 8004 | Jal Shakti service port |
| `HARVEST_SHAKTI_PORT` | 8005 | Harvest Shakti service port |
| `KISAAN_SAHAYAK_PORT` | 8006 | Kisaan Sahayak service port |
| `PROTEIN_ENGINEERING_PORT` | 8007 | Protein Engineering service port |
| `KISAN_CREDIT_PORT` | 8008 | Kisan Credit service port |
| `HARVEST_TO_CART_PORT` | 8009 | Harvest-to-Cart service port |
| `BEEJ_SURAKSHA_PORT` | 8010 | Beej Suraksha service port |
| `MAUSAM_CHAKRA_PORT` | 8011 | Mausam Chakra service port |
