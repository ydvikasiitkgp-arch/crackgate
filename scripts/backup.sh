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

# Which compose file owns the `db` service. Defaults to docker-compose.yml;
# cloud VMs (Azure/GCP) set docker-compose.cloud.yml.
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"
COMPOSE=(docker compose -f "$COMPOSE_FILE")
# The compose files use ${VAR:?...} required-vars (POSTGRES_PASSWORD etc.), so
# `ps`/`exec` fail without them. --env-file is compose interpolation only — the
# actual dump still reads creds from inside the db container (see below), so
# arbitrary-character values never hit the shell.
if [[ -f .env.production ]]; then
  COMPOSE+=(--env-file .env.production)
  # Pick up backup settings from .env.production, one key at a time (never
  # shell-sourcing the file — other keys may hold arbitrary characters).
  # An already-set env var (systemd unit, ad-hoc run) wins over the file.
  while IFS='=' read -r _k _v; do
    case "$_k" in
      RCLONE_REMOTE|BACKUP_RETENTION_DAYS)
        if [[ -z "${!_k:-}" ]]; then
          _v="${_v#\"}"; _v="${_v%\"}"
          export "$_k=$_v"
        fi
        ;;
    esac
  done < <(grep -E '^(RCLONE_REMOTE|BACKUP_RETENTION_DAYS)=' .env.production || true)
fi

BACKUP_DIR="${BACKUP_DIR:-/home/deploy/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
RCLONE_REMOTE="${RCLONE_REMOTE:-}"   # e.g. r2:crackgate-backups   (empty = local only)

if ! "${COMPOSE[@]}" ps db --status running --quiet | grep -q .; then
  echo "❌ db service is not running. Aborting." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/crackgate-${STAMP}.sql.gz"
OUT_TMP="${OUT}.tmp"

echo "▶ Dumping database → $OUT"
# Dump to a .tmp file and rename only on success — a mid-dump failure must
# never leave the newest file in BACKUP_DIR (that's the one an operator grabs
# during an outage). pipefail already fails the pipeline; this removes the
# truncated artifact.
# Reads $POSTGRES_USER / $POSTGRES_DB from inside the db container's env.
if "${COMPOSE[@]}" exec -T db sh -c \
  'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --no-owner --clean --if-exists' \
  | gzip -9 > "$OUT_TMP"; then
  mv "$OUT_TMP" "$OUT"
else
  rm -f "$OUT_TMP"
  echo "❌ pg_dump failed — no backup written." >&2
  exit 1
fi

SIZE=$(du -h "$OUT" | cut -f1)
echo "✓ Local backup ${SIZE}"

if [[ -n "$RCLONE_REMOTE" ]] && command -v rclone >/dev/null; then
  echo "▶ Uploading to $RCLONE_REMOTE"
  rclone copy "$OUT" "$RCLONE_REMOTE" --stats 1h --transfers 2
  # Match the local retention window on the remote too.
  rclone delete "$RCLONE_REMOTE" --min-age "${RETENTION_DAYS}d" --max-depth 1 \
    --include "crackgate-*.sql.gz" 2>/dev/null || true
else
  echo "⚠️  No RCLONE_REMOTE configured — backup is LOCAL-ONLY (lost with this VM)."
fi

echo "▶ Pruning local backups older than ${RETENTION_DAYS} days"
find "$BACKUP_DIR" -name 'crackgate-*.sql.gz' -mtime "+${RETENTION_DAYS}" -delete

echo "✅ Backup complete: $OUT"
