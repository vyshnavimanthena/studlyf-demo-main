#!/bin/bash
# Database backup script for Studlyf
# Usage: ./scripts/backup.sh [output_dir]
# Requires: mongodump (mongodb-database-tools), .env with MONGO_URL

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Load .env
if [ -f "$PROJECT_DIR/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/.env" | xargs)
fi

BACKUP_DIR="${1:-$PROJECT_DIR/backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_DIR/studlyf_$TIMESTAMP"

mkdir -p "$BACKUP_PATH"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Starting backup..."

if [ -z "${MONGO_URL:-}" ]; then
    echo "ERROR: MONGO_URL not set"
    exit 1
fi

# Run mongodump
mongodump \
    --uri="$MONGO_URL" \
    --out="$BACKUP_PATH" \
    --gzip \
    --numParallelCollections=4

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup complete: $BACKUP_PATH"

# Compress
tar -czf "$BACKUP_PATH.tar.gz" -C "$BACKUP_DIR" "studlyf_$TIMESTAMP"
rm -rf "$BACKUP_PATH"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Compressed: $BACKUP_PATH.tar.gz"

# Keep last 7 days, remove older
find "$BACKUP_DIR" -name "studlyf_*.tar.gz" -mtime +7 -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Old backups cleaned (retention: 7 days)"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Done"
