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

    # Start MSP Mitra backend (legacy)
    echo "Starting MSP Mitra on port 8001..."
    (cd "$PROJECT_DIR/msp_mitra/backend" && uvicorn main:app --reload --host 0.0.0.0 --port 8001) &

    # Start microservices (ports 8002-8011)
    for svc_dir in soilscan_ai fasal_rakshak jal_shakti harvest_shakti kisaan_sahayak protein_engineering kisan_credit harvest_to_cart beej_suraksha mausam_chakra; do
      port=$((8001 + $(echo "soilscan_ai fasal_rakshak jal_shakti harvest_shakti kisaan_sahayak protein_engineering kisan_credit harvest_to_cart beej_suraksha mausam_chakra" | tr ' ' '\n' | grep -n "^${svc_dir}$" | cut -d: -f1)))
      echo "Starting $svc_dir on port $port..."
      (cd "$PROJECT_DIR" && PYTHONPATH="$PROJECT_DIR" uvicorn "services.${svc_dir}.app:app" --reload --host 0.0.0.0 --port "$port") &
    done

    # Start unified frontend
    echo "Starting Frontend on port 3000..."
    (cd "$PROJECT_DIR/frontend" && npm run dev) &

    echo ""
    echo -e "${GREEN}All services starting!${NC}"
    echo "  MSP Mitra:             http://localhost:8001"
    echo "  SoilScan AI:           http://localhost:8002"
    echo "  Fasal Rakshak:         http://localhost:8003"
    echo "  Jal Shakti:            http://localhost:8004"
    echo "  Harvest Shakti:        http://localhost:8005"
    echo "  Kisaan Sahayak:        http://localhost:8006"
    echo "  Protein Engineering:   http://localhost:8007"
    echo "  Kisan Credit:          http://localhost:8008"
    echo "  Harvest-to-Cart:       http://localhost:8009"
    echo "  Beej Suraksha:         http://localhost:8010"
    echo "  Mausam Chakra:         http://localhost:8011"
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
