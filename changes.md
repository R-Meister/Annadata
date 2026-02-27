# ANNADATA -- Complete Backend, Frontend & Database Roadmap

## 1. Core Stack (Finalized)

### Backend

-   FastAPI (Python 3.11)
-   Pydantic v2
-   SQLAlchemy 2.0
-   PostgreSQL driver: asyncpg
-   Redis (caching + Celery broker)
-   Celery (background jobs)
-   Uvicorn (ASGI server)

### Frontend

-   Next.js 16 (App Router)
-   React 19
-   TypeScript (strict mode)
-   Tailwind CSS v4
-   shadcn/ui (component system)
-   GSAP (hero + storytelling animations)
-   Lottie (AI feedback animations)
-   TanStack Query (server state)
-   Zustand (client state)

### Database

-   PostgreSQL 15
-   Redis 7

### Containerization

-   Docker
-   Docker Compose (dev orchestration)
-   Traefik (optional reverse proxy)

------------------------------------------------------------------------

# 2. Architecture Model

You are building:

ANNADATA OS → Multi-service AI agriculture platform → Each idea =
independent FastAPI service → Shared PostgreSQL + Redis → Unified
Next.js frontend (modular dashboard)

Structure:

services/ msp_mitra/ soilscan_ai/ fasal_rakshak/ jal_shakti/
harvest_shakti/ kisaan_sahayak/

frontend/ app/ components/ lib/ store/

infra/ docker-compose.yml docker-templates/

------------------------------------------------------------------------

# 3. Docker Compose Services

Core Infra: - postgres:15 - redis:7 - traefik (optional)

Per Idea: - fastapi backend container - celery worker container

Frontend: - nextjs container

------------------------------------------------------------------------

# 4. Scaling Pattern

Each new idea should:

1.  Have its own FastAPI app
2.  Register itself in docker-compose
3.  Share PostgreSQL + Redis
4.  Expose health endpoint
5.  Use async SQLAlchemy
6.  Use Celery for heavy ML tasks

------------------------------------------------------------------------

# 5. Development Flow

Local Dev: docker compose up --build

Production Path: Docker → Kubernetes → Helm → Horizontal Pod Autoscaling

Models: Dev → load from mounted volume Prod → move to S3/MinIO +
ONNX/TorchScript

------------------------------------------------------------------------

# 6. Clean Roadmap (Agent-Ready Steps)

PHASE 1 -- Foundation - Setup monorepo layout - Create docker
templates - Setup postgres + redis - Setup base FastAPI service
template - Setup base Next.js dashboard

PHASE 2 -- Core Platform - Auth system (JWT) - User model + roles -
Dashboard layout - API gateway routing

PHASE 3 -- Idea Integration - MSP Mitra service - SoilScan AI service -
Fasal Rakshak service - Kisaan Sahayak multi-agent system - Harvest
Shakti DSS

PHASE 4 -- AI Scaling - Move long tasks to Celery - Add model registry -
Add versioning for ML models - Add monitoring

PHASE 5 -- Production Migration - CI/CD - Image builds - Kubernetes
deployment - Horizontal scaling - Observability (Prometheus + Grafana)

------------------------------------------------------------------------

# Final Stack Summary

Backend: FastAPI + SQLAlchemy 2.0 + PostgreSQL + Redis + Celery

Frontend: Next.js 16 + React 19 + TypeScript + Tailwind v4 + shadcn +
GSAP + Lottie

Database: PostgreSQL 15

Orchestration: Docker Compose (dev) Kubernetes (production-ready path)

------------------------------------------------------------------------

This roadmap is structured for scaling to 10+ services cleanly.
