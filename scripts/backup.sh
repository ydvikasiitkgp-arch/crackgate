#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# CrackGate Postgres backup — dump + gzip + (optional) rclone upload.
#
# Cron entry (as deploy user):
#   0 3 * * *  /home/deploy/crackgate/scripts/backup.sh >> /home/deploy/backup.log 2>&1
#
# Reads DB creds from inside the running `db` container (no fragile
# source of .env.production with arbitrary-character values).
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")/.."

BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
RCLONE_REMOTE="${RCLONE_REMOTE:-}"   # e.g. r2:crackgate-backups   (empty = local only)
# Which compose file owns the `db` service. Defaults to docker-compose.yml;
# cloud VMs (Azure/GCP) set docker-compose.cloud.yml.
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
COMPOSE=(docker compose -f "$COMPOSE_FILE")

if ! "${COMPOSE[@]}" ps db --status running --quiet | grep -q .; then
  echo "❌ db service is not running. Aborting." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/crackgate-${STAMP}.sql.gz"

echo "▶ Dumping database → $OUT"
# Reads $POSTGRES_USER / $POSTGRES_DB from inside the db container's env.
"${COMPOSE[@]}" exec -T db sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --clean --if-exists' \
  | gzip -9 > "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "✓ Local backup ${SIZE}"

if [[ -n "$RCLONE_REMOTE" ]] && command -v rclone >/dev/null; then
  echo "▶ Uploading to $RCLONE_REMOTE"
  rclone copy "$OUT" "$RCLONE_REMOTE" --progress
fi

echo "▶ Pruning local backups older than ${RETENTION_DAYS} days"
find "$BACKUP_DIR" -name 'crackgate-*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "✅ Backup complete: $OUT"
