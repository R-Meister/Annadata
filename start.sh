#!/bin/bash
# ============================================================
# Annadata OS - Development Start Script
# ============================================================
# Usage:
#   ./start.sh              Start all services via Docker Compose
#   ./start.sh infra        Start only PostgreSQL + Redis
#   ./start.sh local        Start services locally (without Docker)
#   ./start.sh frontend     Start only the frontend (npm dev)
# ============================================================

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Annadata OS ===${NC}"
echo ""

case "${1:-all}" in
  infra)
    echo -e "${BLUE}Starting infrastructure (PostgreSQL + Redis)...${NC}"
    docker compose up -d postgres redis
    echo -e "${GREEN}Infrastructure ready!${NC}"
    echo "  PostgreSQL: localhost:5432"
    echo "  Redis:      localhost:6379"
    ;;

  local)
    echo -e "${BLUE}Starting services locally...${NC}"
    echo -e "${YELLOW}Make sure PostgreSQL and Redis are running (use './start.sh infra')${NC}"
    echo ""

    # Start MSP Mitra backend
    echo "Starting MSP Mitra on port 8001..."
    (cd "$PROJECT_DIR/msp_mitra/backend" && uvicorn main:app --reload --host 0.0.0.0 --port 8001) &

    # Start Protein Engineering backend
    echo "Starting Protein Engineering on port 8000..."
    (cd "$PROJECT_DIR/protein_engineering/backend" && uvicorn app:app --reload --host 0.0.0.0 --port 8000) &

    # Start unified frontend
    echo "Starting Frontend on port 3000..."
    (cd "$PROJECT_DIR/frontend" && npm run dev) &

    echo ""
    echo -e "${GREEN}All services starting!${NC}"
    echo "  MSP Mitra:             http://localhost:8001"
    echo "  Protein Engineering:   http://localhost:8000"
    echo "  Frontend:              http://localhost:3000"
    echo ""
    echo "Press Ctrl+C to stop all services"
    wait
    ;;

  frontend)
    echo -e "${BLUE}Starting frontend only...${NC}"
    cd "$PROJECT_DIR/frontend" && npm run dev
    ;;

  all)
    echo -e "${BLUE}Starting all services via Docker Compose...${NC}"
    
    # Copy .env.example to .env if it doesn't exist
    if [ ! -f "$PROJECT_DIR/.env" ]; then
      echo -e "${YELLOW}Creating .env from .env.example...${NC}"
      cp "$PROJECT_DIR/.env.example" "$PROJECT_DIR/.env"
    fi

    docker compose up --build
    ;;

  stop)
    echo -e "${BLUE}Stopping all services...${NC}"
    docker compose down
    echo -e "${GREEN}All services stopped.${NC}"
    ;;

  *)
    echo "Usage: ./start.sh [all|infra|local|frontend|stop]"
    exit 1
    ;;
esac
