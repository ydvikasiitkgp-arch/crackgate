#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────
# CrackGate cloud deploy — run ON the target VM (Azure / GCP), via SSH
# from GitHub Actions (deploy-azure.yml / deploy-gcp.yml).
#
# This is the cloud-neutral equivalent of the inline SSH deploy block in
# .github/workflows/deploy.yml, minus every AWS bit (ECR login, RDS). It is
# copied to /opt/crackgate/scripts/ by the workflow, then:
#     ssh deploy@<host> bash scripts/remote-deploy-cloud.sh
#
# Expected env (CI injects these through the SSH session):
#   GHCR_REPO       e.g. ghcr.io/<owner>/crackgate-azure-web
#   IMAGE_TAG       e.g. sha-abc1234
#   SKIP_MIGRATE    "true" to skip `prisma migrate deploy`
#   GHCR_USERNAME   GHCR read token username (docker pull on the box)
#   GHCR_TOKEN      GHCR read token (PAT with read:packages)
#   ADMIN_EMAILS, ADMIN_SHAREHOLDER_EMAILS, RESEND_API_KEY,
#   IMPERSONATE_SECRET   optional CI-managed values synced into .env.production
#
# Reads/writes .env.production on the box (POSTGRES_*, AUTH_*, GOOGLE_*,
# RAZORPAY_*, ... must be pre-provisioned by the bootstrap, exactly like the
# VPS flow — only the values below are overwritten from CI).
#
# NOTE on rollback: `prisma migrate deploy` runs BEFORE the web swap, so a
# rollback restores OLD code on an ALREADY-MIGRATED schema. Every migration
# must therefore be additive and backward-compatible for one release cycle
# (no destructive drops/renames/backfills) or rollback is not safe.
# ─────────────────────────────────────────────────────────────────
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ ! -f .env.production ]]; then
  echo "❌ .env.production not found — run the bootstrap first, then fill in secrets." >&2
  exit 1
fi

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.cloud.yml}"
COMPOSE="docker compose -f ${COMPOSE_FILE} --env-file .env.production"
GHCR_REPO="${GHCR_REPO:?set GHCR_REPO}"
IMAGE_TAG="${IMAGE_TAG:?set IMAGE_TAG}"
SKIP_MIGRATE="${SKIP_MIGRATE:-false}"

log() { printf "\n\033[1;36m▶ %s\033[0m\n" "$*"; }

# Sync a CI-managed value into .env.production. Only when non-empty so a
# missing CI var never wipes a host-set value. Escapes sed replacement
# metachars so values with & or \ survive verbatim.
sync_env() {
  local key="$1" value="$2"
  [[ -z "${value}" ]] && return 0
  value="${value//\\/\\\\}"
  value="${value//&/\\&}"
  if grep -q "^${key}=" .env.production; then
    sed -i "s|^${key}=.*|${key}=\"${value}\"|" .env.production
  else
    echo "${key}=\"${value}\"" >> .env.production
  fi
}

# ── 1. GHCR login (image pulls need read:packages on this box) ──
if [[ -n "${GHCR_USERNAME:-}" && -n "${GHCR_TOKEN:-}" ]]; then
  log "Logging into GHCR as ${GHCR_USERNAME}"
  echo "${GHCR_TOKEN}" | docker login ghcr.io -u "${GHCR_USERNAME}" --password-stdin
  # Persist so the boot-time ghcr-login systemd timer can refresh (see bootstrap).
  sync_env GHCR_USERNAME "${GHCR_USERNAME}"
  sync_env GHCR_TOKEN "${GHCR_TOKEN}"
fi

# ── 2. Pin image tag for this deploy ─────────────────────────────
# Save the tag the host is currently running first — a failed healthcheck must
# roll back to the last-known-good image, NOT ':latest' (the build job retags
# 'latest' to the new image before deploy starts, so 'latest' is the image that
# just failed).
log "Pinning IMAGE_TAG=${IMAGE_TAG}"
PREVIOUS_IMAGE_TAG="$(grep -E '^IMAGE_TAG=' .env.production | cut -d= -f2- | tr -d '"' | tail -1)"
PREVIOUS_IMAGE_TAG="${PREVIOUS_IMAGE_TAG:-latest}"
sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=${IMAGE_TAG}|" .env.production || \
  echo "IMAGE_TAG=${IMAGE_TAG}" >> .env.production
sed -i "s|^GHCR_REPO=.*|GHCR_REPO=${GHCR_REPO}|" .env.production || \
  echo "GHCR_REPO=${GHCR_REPO}" >> .env.production

# ── 3. Sync CI-managed values ───────────────────────────────────
sync_env ADMIN_EMAILS "${ADMIN_EMAILS:-}"
sync_env ADMIN_SHAREHOLDER_EMAILS "${ADMIN_SHAREHOLDER_EMAILS:-}"
sync_env RESEND_API_KEY "${RESEND_API_KEY:-}"
sync_env IMPERSONATE_SECRET "${IMPERSONATE_SECRET:-}"

# ── 4. Reclaim disk before pulling ───────────────────────────────
# Old image versions accumulate on the small root volume and can fill it
# mid-pull. Images in use by running containers are kept; only unused images
# and build cache are removed.
log "Pruning old images + build cache"
docker image prune -af
docker builder prune -af

# ── 5. Pull new image ────────────────────────────────────────────
log "Pulling ${GHCR_REPO}:${IMAGE_TAG}"
${COMPOSE} pull web

# ── 6. Migrations (DDL runs against DIRECT_URL = in-stack db) ────
if [[ "${SKIP_MIGRATE}" != "true" ]]; then
  log "Running prisma migrate deploy"
  ${COMPOSE} run --rm -T web node ./node_modules/prisma/build/index.js migrate deploy \
    --schema=packages/database/prisma/schema.prisma </dev/null
fi

# ── 7. Sync DB admin role for every email in ADMIN_EMAILS ────────
# Idempotent; promote-only. Mirrors the AWS deploy so the ADMIN tag also shows
# in admin user lists, not just the env allowlist.
if [[ -n "${ADMIN_EMAILS:-}" ]]; then
  log "Syncing admin roles"
  ${COMPOSE} run --rm -T web node -e 'const { PrismaClient } = require("./packages/database/src/generated/client"); const p = new PrismaClient(); const emails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean); p.user.updateMany({ where: { email: { in: emails } }, data: { role: "admin" } }).then(r => console.log("admin role synced:", r.count, "of", emails.length)).catch(e => { console.error(e); process.exit(1); }).finally(() => p.$disconnect());' </dev/null
fi

# ── 8. Zero-downtime web swap (Caddy keeps serving during ~5s gap) ──
log "Recreating web container"
${COMPOSE} up -d --no-deps --force-recreate web

# ── 9. Guard: assert the swap actually landed the expected image ──
WEB_CONTAINER="$(${COMPOSE} ps -q web 2>/dev/null || true)"
if [[ -z "${WEB_CONTAINER}" ]]; then
  echo "✗ no web container running after recreate — deploy failed"
else
  GOT="$(docker inspect --format '{{.Config.Image}}' "${WEB_CONTAINER}")"
  case "${GOT}" in
    *":${IMAGE_TAG}") echo "✓ web recreated on ${GOT}" ;;
    *) echo "✗ expected :${IMAGE_TAG} but web is ${GOT} — recreate failed"; exit 1 ;;
  esac
fi

# ── 10. Wait for /api/healthz ────────────────────────────────────
for i in {1..30}; do
  if ${COMPOSE} exec -T web curl -fsS http://127.0.0.1:3000/api/healthz >/dev/null 2>&1; then
    echo "✓ healthy after ${i} attempts"
    # Bring up the rest of the stack (idempotent — running services are no-ops).
    # Needed on FIRST deploy, where only db/redis/web have been started so far
    # and Caddy (80/443 + TLS) is still down.
    ${COMPOSE} up -d
    docker image prune -af --filter "until=168h"
    exit 0
  fi
  sleep 2
done

echo "✗ health check failed"
# On first deploy there is no prior pinned tag — `latest` was just retagged to
# the image that failed, so "rolling back to latest" would redeploy the exact
# same broken image. Fail loud instead of pretending.
if [[ "${PREVIOUS_IMAGE_TAG}" == "latest" ]]; then
  echo "  no last-known-good image (first deploy) — manual intervention required"
  exit 1
fi
echo "  rolling back to ${PREVIOUS_IMAGE_TAG}"
sed -i "s|^IMAGE_TAG=.*|IMAGE_TAG=${PREVIOUS_IMAGE_TAG}|" .env.production || \
  echo "IMAGE_TAG=${PREVIOUS_IMAGE_TAG}" >> .env.production
${COMPOSE} up -d --no-deps web
exit 1
