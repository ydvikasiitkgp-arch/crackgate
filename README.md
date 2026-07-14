# CrackGate.in 🛠️⛏️

India's #1 dedicated **GATE** preparation platform — covering **Mining Engineering (MN)**, **Civil Engineering (CY)**, **Geology (GL)**, and **Environmental Science & Engineering (ES)**, plus **PSU recruitment** (Coal India, ONGC, NMDC, NTPC, GAIL, HZL), **STATE** and **DIPLOMA** exam tracks.

> A full-stack **Next.js 16** application running on **AWS** (EC2 + RDS Postgres), provisioned with **Terraform** and shipped through **GitHub Actions** CI/CD with separate **production** and **staging** environments.

> 📐 New here or briefing a stakeholder? Start with the **[Architecture overview](ARCHITECTURE.md)** — a plain-language tour of the whole system.

## ✨ Features

- 🧪 **Full-length Mock Tests** on the latest GATE pattern, with section-wise analysis and subject SWOT. First mock free.
- 📚 **900+ topic-wise Practice Questions** across every subject, each with worked solutions and instant grading.
- 🗂️ **Previous Year Question bank** with detailed step-by-step solutions.
- 🎯 **NTA-style live exam portal** — pixel-identical to the real CBT (question palette, mark-for-review, timer, auto-submit).
- 🛡️ **Server-side grading** — scores computed on the server (tamper-proof) with a detailed report after every attempt.
- 📊 **SWOT Analytics** — subject-wise strength/weakness graphs, time-per-question, accuracy trend, percentile.
- 📅 **AITS** (All-India Test Series) scheduled around the exam cycle.
- 🏢 **PSU recruitment mocks** — CIL, ONGC, NMDC, NTPC, GAIL, HZL exam patterns.
- 🗺️ **STATE & DIPLOMA** exam tracks with tailored practice sets.
- 🔐 **Auth** via Google sign-in and WhatsApp/phone OTP (env-gated).
- 💳 **Payments** via Razorpay + UPI.
- 📱 Mobile-first, accessible, fast; progress syncs across devices.

## 🏗️ Tech stack

| Layer         | Tech                                                              |
| ------------- | ---------------------------------------------------------------- |
| Frontend      | Next.js 16 (App Router), React 19, Tailwind CSS, Recharts, KaTeX |
| Backend       | Next.js Route Handlers / Server Actions, NextAuth v5             |
| Database      | PostgreSQL 16 (AWS RDS) via Prisma                               |
| Infra         | AWS (EC2 t4g arm64, RDS, S3, ECR, Secrets Manager) via Terraform |
| Runtime       | Docker Compose on EC2, Caddy (TLS), Redis                         |
| CI/CD         | GitHub Actions → ECR → SSH deploy, Playwright smoke tests        |
| Observability | Sentry, CloudWatch, Route 53 health checks                       |
| Tests         | Vitest (unit), Playwright (e2e/smoke)                            |

## 📁 Structure

```
crackgate/
├── apps/
│   └── web/                    # Next.js 16 app (App Router)
│       ├── src/app/            # routes (home, gate/*, practice, mocks, aits, pricing, dashboard…)
│       ├── src/components/     # UI (mega-nav, exam-portal, practice-runner, charts…)
│       ├── src/data/           # mocks, practice, pyq, aits, psu catalogs
│       ├── src/lib/            # grading, nat, auth, utils
│       ├── e2e/                # Playwright smoke tests
│       └── public/             # favicons, og images
├── packages/
│   └── database/               # Prisma schema, migrations, generated client (@crackgate/database)
├── infra-tf/                   # Terraform — PRODUCTION (network, compute, rds, iam, storage, uptime)
│   └── staging/                # Terraform — STAGING (lightweight, shares prod VPC/RDS)
├── scripts/                    # build_mocks.ts, ec2-bootstrap*.sh, backup.sh, deploy.sh…
├── .github/workflows/
│   ├── deploy.yml              # main → production
│   └── deploy-staging.yml      # develop → staging
├── Dockerfile
├── docker-compose.aws.yml
├── Caddyfile
├── STAGING.md                  # staging environment runbook
└── README.md
```

## 🚀 Local development

Prerequisites: **Node ≥ 20**, **npm ≥ 10**, and a local or remote Postgres.

```bash
# install workspace deps
npm install

# generate the Prisma client
npm run db:generate

# copy env and fill in values (DB URL, auth, etc.)
cp apps/web/.env.example apps/web/.env.local

# run migrations + seed (optional)
npm run db:migrate
npm run db:seed

# start the dev server → http://localhost:3000
npm run dev
```

Useful scripts (root):

| Command               | Description                        |
| --------------------- | ---------------------------------- |
| `npm run dev`         | Next.js dev server                 |
| `npm run build`       | Prisma generate + production build |
| `npm run lint`        | ESLint across workspaces           |
| `npm run db:studio`   | Prisma Studio                      |
| `npm run db:migrate`  | Create/apply a dev migration       |
| `npm run build:mocks` | Regenerate mock data from source   |

App-scoped (`apps/web`): `npm run --workspace apps/web typecheck | test | test:e2e`.

## 🌍 Environments

| Environment    | URL                    | Branch    | Terraform           | Notes                                                           |
| -------------- | ---------------------- | --------- | ------------------- | --------------------------------------------------------------- |
| **Production** | `crackgate.in`         | `main`    | `infra-tf/`         | t4g.small, RDS Postgres, always-on                              |
| **Staging**    | `staging.crackgate.in` | `develop` | `infra-tf/staging/` | t4g.micro, shared RDS (`crackgate_staging` DB), auto stop/start |

See **[STAGING.md](STAGING.md)** for the staging setup + runbook.

## 🔁 Deployment (CI/CD)

Pushing to a branch triggers the matching GitHub Actions workflow:

```
feature ─▶ PR to develop ─▶ deploy to staging  (deploy-staging.yml)
                              │
        PR develop ─▶ main ─▶ deploy to production (deploy.yml)
```

Each pipeline: **verify** (lint + typecheck + Vitest) → **build** (native arm64 image → ECR via OIDC) → **deploy** (SSH to EC2, `prisma migrate deploy`, zero-downtime container swap, healthcheck + rollback) → **smoke** (Playwright against the live URL).

`main` is branch-protected — changes ship via PR with the `verify` check required.

## 🧱 Infrastructure (Terraform)

All infra is declared in `infra-tf/` (state in S3 + DynamoDB lock).

```bash
cd infra-tf
AWS_PROFILE=crackgate terraform init
AWS_PROFILE=crackgate terraform plan
AWS_PROFILE=crackgate terraform apply
```

Provisions: VPC + subnets + security groups, EC2 (arm64) + Elastic IP, RDS Postgres, S3 (uploads + backups), ECR, Secrets Manager, IAM (EC2 profile + GitHub OIDC deploy role), CloudWatch alarms, Route 53 uptime health check + SNS alerts.

## 🗄️ Database

Schema and migrations live in `packages/database` (Prisma). The generated client is consumed as `@crackgate/database`.

```bash
npm run db:migrate   # dev migration
npm run db:deploy    # apply migrations (prod/staging — runs in CI)
npm run db:studio    # browse data
```

## 📝 Adding more questions

- Mocks/practice/PYQ source data lives in `apps/web/src/data/` and is regenerated via `scripts/build_mocks.ts` (`npm run build:mocks`).
- Grading logic: `apps/web/src/lib/grading.ts` (covered by `grading.test.ts`); NAT matching: `apps/web/src/lib/nat.ts`.

Question schema (simplified):
```ts
{ subject: "Mine Ventilation", type: "MCQ" | "MSQ" | "NAT", marks: 1 | 2,
  stem: "Question text…",
  options: ["A", "B", "C", "D"],   // MCQ/MSQ only
  answer: 2,                        // index (MCQ) | array (MSQ) | number (NAT)
  tolerance: 0.01,                  // NAT only
  solution: "Step-by-step explanation." }
```

## ⚖️ Disclaimer

GATE® is a registered trademark of IIT/IISc. CrackGate.in is an independent prep platform and is not affiliated with IIT/IISc.
All practice questions are original and authored by the CrackGate team based on the latest GATE syllabus.

---

© CrackGate.in
