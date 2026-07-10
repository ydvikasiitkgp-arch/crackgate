# syntax=docker/dockerfile:1.6
# ─────────────────────────────────────────────────────────────────────────────
# CrackGate production image — multi-stage build for an npm-workspace monorepo
# with Next.js 15 (standalone output) + Prisma + a shared packages/database.
#
# IMPORTANT:
#   1. Every stage uses WORKDIR /app so absolute paths baked into Next's
#      standalone bundle resolve correctly at runtime.
#   2. NEXT_PUBLIC_* vars are inlined into the client JS at build time. They
#      MUST be provided as build ARGs (via docker compose build.args), NOT
#      runtime env vars. Forgetting this breaks Razorpay / Google / WhatsApp
#      buttons silently in production.
# ─────────────────────────────────────────────────────────────────────────────

# ---- Stage 1: install all deps (including devDeps for the build) ----
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY apps/web/package.json            apps/web/package.json
COPY packages/database/package.json   packages/database/package.json
RUN npm ci --no-audit --no-fund

# ---- Stage 2: build Next.js (standalone) + Prisma client ----
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
# Some npm deps get installed in workspace-local node_modules instead of root
# (e.g. posthog-node). Copy those too so the build stage can resolve them.
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY . .

# Generate Prisma client (binaryTargets in schema.prisma include linux-musl)
RUN npx --workspace @crackgate/database prisma generate

# ── Build-time public env vars (inlined into client bundle) ─────────────
# docker compose passes these from .env.production via build.args.
ARG NEXT_PUBLIC_GOOGLE_ENABLED=0
ARG NEXT_PUBLIC_WHATSAPP_ENABLED=0
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=
ARG NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL=
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID=
ARG NEXT_PUBLIC_UPI_VPA=
ARG NEXT_PUBLIC_UPI_PAYEE_NAME=
ARG NEXT_PUBLIC_POSTHOG_KEY=
ARG NEXT_PUBLIC_POSTHOG_HOST=
ARG NEXT_PUBLIC_SENTRY_DSN=
ARG NEXT_PUBLIC_DEV_TOOLS=
ARG NEXT_PUBLIC_SITE_ENV=production
ENV NEXT_PUBLIC_GOOGLE_ENABLED=$NEXT_PUBLIC_GOOGLE_ENABLED \
    NEXT_PUBLIC_WHATSAPP_ENABLED=$NEXT_PUBLIC_WHATSAPP_ENABLED \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER \
    NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL=$NEXT_PUBLIC_WHATSAPP_COMMUNITY_URL \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
    NEXT_PUBLIC_UPI_VPA=$NEXT_PUBLIC_UPI_VPA \
    NEXT_PUBLIC_UPI_PAYEE_NAME=$NEXT_PUBLIC_UPI_PAYEE_NAME \
    NEXT_PUBLIC_POSTHOG_KEY=$NEXT_PUBLIC_POSTHOG_KEY \
    NEXT_PUBLIC_POSTHOG_HOST=$NEXT_PUBLIC_POSTHOG_HOST \
    NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN \
    NEXT_PUBLIC_DEV_TOOLS=$NEXT_PUBLIC_DEV_TOOLS \
    NEXT_PUBLIC_SITE_ENV=$NEXT_PUBLIC_SITE_ENV

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build -w apps/web

# ---- Stage 3: minimal runtime image ----
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl tini curl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && \
    adduser  --system --uid 1001 nextjs

# Next.js standalone bundle (built with outputFileTracingRoot=monorepo root)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone     ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static         ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public               ./apps/web/public

# Prisma generated client + engine binaries (the standalone trace references
# ./packages/database/src/generated/client)
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/src/generated ./packages/database/src/generated

# Prisma schema, migrations, CLI, and bin shim — needed for `prisma migrate
# deploy` on container start. We copy node_modules/.bin so `npx prisma`
# resolves to the local install instead of triggering a network download.
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/prisma      ./packages/database/prisma
# Full node_modules (overlays Next standalone's traced subset) — needed because
# Prisma 6's CLI pulls in transitive deps (effect, c12, defu, …) that Next's
# tracer never sees, since the app never imports the CLI itself.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules                  ./node_modules

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://127.0.0.1:3000/api/healthz || exit 1

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["sh", "-c", "node ./node_modules/prisma/build/index.js migrate deploy --schema=./packages/database/prisma/schema.prisma && node apps/web/server.js"]
