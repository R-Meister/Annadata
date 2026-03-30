# How to Run Annadata OS (All Services + Gamified Frontend)

This is the single source of truth for running the full Annadata stack:

- 12 backend microservices (including `gamification`)
- PostgreSQL + Redis + Celery worker
- Unified Next.js frontend with dashboard + gamified routes (`/game/*`)

---

## 1) Prerequisites

| Tool | Recommended Version | Used For |
|------|---------------------|----------|
| Docker Desktop | 24+ | Full stack via Compose |
| Docker Compose | v2+ | Service orchestration |
| Node.js | 20+ | Running frontend locally |
| npm | 10+ | Frontend dependencies |
| Python | 3.11+ | Running services locally |
| Git | 2.30+ | Clone + updates |

---

## 2) First-Time Setup

From repo root:

```bash
git clone https://github.com/R-Meister/Annadata.git
cd Annadata
cp .env.example .env
```

### Minimum `.env` values

Defaults in `.env.example` are good enough for local dev. Confirm at least:

```env
POSTGRES_USER=annadata
POSTGRES_PASSWORD=annadata_dev_password
POSTGRES_DB=annadata
POSTGRES_SERVER=postgres
REDIS_HOST=redis
JWT_SECRET_KEY=change-this-jwt-secret-in-production
```

Optional but recommended for richer demos:

```env
OPENWEATHER_API_KEY=
GEMINI_API_KEY=
DATA_GOV_API_KEY=
```

---

## 3) Recommended: Run Everything with Docker

This uses `docker-compose.yml` and starts all core infrastructure, services, worker, and frontend.

```bash
docker compose up --build
```

Run in background:

```bash
docker compose up --build -d
```

Stop:

```bash
docker compose down
```

Stop + remove DB/cache data:

```bash
docker compose down -v
```

### What starts

| Component | Name (Compose service) | Port |
|-----------|--------------------------|------|
| PostgreSQL | `postgres` | 5432 |
| Redis | `redis` | 6379 |
| MSP Mitra | `msp-mitra` | 8001 |
| SoilScan AI | `soilscan-ai` | 8002 |
| Fasal Rakshak | `fasal-rakshak` | 8003 |
| Jal Shakti | `jal-shakti` | 8004 |
| Harvest Shakti | `harvest-shakti` | 8005 |
| Kisaan Sahayak | `kisaan-sahayak` | 8006 |
| Protein Engineering | `protein-engineering` | 8007 |
| Kisan Credit | `kisan-credit` | 8008 |
| Harvest-to-Cart | `harvest-to-cart` | 8009 |
| Beej Suraksha | `beej-suraksha` | 8010 |
| Mausam Chakra | `mausam-chakra` | 8011 |
| Gamification | `gamification` | 8012 |
| Celery Worker | `celery-worker` | - |
| Unified Frontend | `frontend` | 3000 |

Frontend URL:

- `http://localhost:3000` (dashboard)
- `http://localhost:3000/game` (gamified app entry)

---

## 4) Quick Health Verification

### Frontend

```bash
curl -I http://localhost:3000
```

### All backend health checks

```bash
for port in 8001 8002 8003 8004 8005 8006 8007 8008 8009 8010 8011 8012; do
  echo "=== :$port ==="
  curl -s "http://localhost:${port}/health" || echo "not reachable"
  echo
done
```

### DB + Redis

```bash
docker compose exec postgres psql -U annadata -d annadata -c "SELECT 1;"
docker compose exec redis redis-cli ping
```

Expected Redis response: `PONG`.

---

## 5) Logs and Common Docker Ops

All logs:

```bash
docker compose logs -f
```

Single service logs:

```bash
docker compose logs -f gamification
docker compose logs -f frontend
```

Restart one service:

```bash
docker compose restart gamification
```

Rebuild one service:

```bash
docker compose up --build gamification
```

---

## 6) Optional: API Gateway (Traefik)

Run with gateway profile:

```bash
docker compose --profile gateway up --build
```

Traefik dashboard (if enabled):

- `http://localhost:8080`

---

## 7) Run Without Docker (Local Dev)

Use this when you need faster iteration on one or two services.

### 7.1 Start infrastructure only

Either run local PostgreSQL/Redis yourself, or keep infra in Docker:

```bash
docker compose up -d postgres redis
```

If running services locally against Docker infra, set in `.env`:

```env
POSTGRES_SERVER=localhost
REDIS_HOST=localhost
```

### 7.2 Python environment

```bash
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### 7.3 Start one backend service locally

Examples:

```bash
# Gamification
uvicorn services.gamification.app:app --reload --host 0.0.0.0 --port 8012
```

```bash
# MSP Mitra
uvicorn services.msp_mitra.app:app --reload --host 0.0.0.0 --port 8001
```

### 7.4 Start Celery worker locally

```bash
celery -A services.shared.celery_app.app.celery_app worker --loglevel=info
```

### 7.5 Start frontend locally (includes gamified app routes)

```bash
cd frontend
npm install
npm run dev
```

Then open:

- `http://localhost:3000/dashboard`
- `http://localhost:3000/game/home`

---

## 8) Gamified Frontend Notes

- There is no separate `frontend-gamified` app in this repo right now.
- The gamified experience is integrated into the main frontend under `frontend/app/game/*`.
- It calls the gamification backend through Next.js rewrite prefixes (`/api/gamification/*`) configured in `frontend/lib/utils.ts` and `frontend/next.config.ts`.

Key pages:

- `http://localhost:3000/game/home`
- `http://localhost:3000/game/services`
- `http://localhost:3000/game/quests`
- `http://localhost:3000/game/profile`

---

## 9) Troubleshooting

### Port already in use

```bash
lsof -i :3000
lsof -i :8012
```

Stop conflicting process, then retry.

### Frontend fails to start/build

```bash
cd frontend
rm -rf node_modules .next
npm install
npm run dev
```

### Service unhealthy in Docker

```bash
docker compose ps
docker compose logs -f <service-name>
```

### Clean rebuild

```bash
docker compose down
docker system prune -f
docker compose up --build
```

---

## 10) Handy API Docs URLs

- MSP Mitra: `http://localhost:8001/docs`
- SoilScan AI: `http://localhost:8002/docs`
- Fasal Rakshak: `http://localhost:8003/docs`
- Jal Shakti: `http://localhost:8004/docs`
- Harvest Shakti: `http://localhost:8005/docs`
- Kisaan Sahayak: `http://localhost:8006/docs`
- Protein Engineering: `http://localhost:8007/docs`
- Kisan Credit: `http://localhost:8008/docs`
- Harvest-to-Cart: `http://localhost:8009/docs`
- Beej Suraksha: `http://localhost:8010/docs`
- Mausam Chakra: `http://localhost:8011/docs`
- Gamification: `http://localhost:8012/docs`

---

## 11) One-Command Daily Workflow (Suggested)

```bash
# from repo root
docker compose up --build -d
docker compose ps
```

Then open:

- `http://localhost:3000/dashboard`
- `http://localhost:3000/game/home`

When done:

```bash
docker compose down
```
