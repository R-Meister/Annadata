#!/usr/bin/env bash
# ============================================================
# Annadata OS - PostgreSQL Backup Script
# ============================================================
# Usage:
#   ./scripts/backup-db.sh                    # defaults
#   BACKUP_DIR=/mnt/backups ./scripts/backup-db.sh
#
# Requires: docker compose (containers must be running)
# ============================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
CONTAINER="${DB_CONTAINER:-annadata-postgres}"
PG_USER="${POSTGRES_USER:-annadata}"
PG_DB="${POSTGRES_DB:-annadata}"
BACKUP_FILE="${BACKUP_DIR}/annadata_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[backup] Starting PostgreSQL backup..."
echo "[backup] Container : $CONTAINER"
echo "[backup] Database  : $PG_DB"
echo "[backup] Output    : $BACKUP_FILE"

docker exec "$CONTAINER" \
  pg_dump -U "$PG_USER" -d "$PG_DB" --no-owner --no-acl \
  | gzip > "$BACKUP_FILE"

SIZE="$(du -h "$BACKUP_FILE" | cut -f1)"
echo "[backup] Done — $BACKUP_FILE ($SIZE)"

# Prune backups older than 30 days
PRUNED=$(find "$BACKUP_DIR" -name "annadata_*.sql.gz" -mtime +30 -delete -print | wc -l)
if [ "$PRUNED" -gt 0 ]; then
  echo "[backup] Pruned $PRUNED backup(s) older than 30 days"
fi
