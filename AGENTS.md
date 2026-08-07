# CrackGate — AGENTS.md

## Branch rules

- Every new change goes on either `main` or a fresh feature branch. Never merge/commit work directly to a branch named after a remote ref.
- **Never create a branch named `main`, `origin/main`, `upstream/main`, or any `<prefix>/main`** (e.g. `feat/main`) — a local branch with `main` in its name shadows the remote-tracking refs and breaks `git fetch`/status comparisons.
- **Never start a new branch name with `feat`** — `feat` and `feat/*` collide in Git's flat ref namespace (a ref named `feat` cannot coexist with refs named `feat/...`). The upstream `feat` branch owns that prefix. Use a different prefix (e.g. `fix/`, `improve/`, or a plain noun) for new branches.

## Monorepo structure

- `apps/web` — Next.js 16 App Router, React 19, Tailwind CSS
- `packages/database` — Prisma schema + migrations, consumed as `@crackgate/database`
- `infra-tf/` — AWS Terraform (prod + staging)
- Pre-commit hooks: none

## Essential commands (run from root)

| Command | What it does |
|---------|-------------|
| `npm run dev` | Next.js dev server on :3000 (Turbopack) |
| `npm run build` | Prisma generate then Next.js build |
| `npm run lint` | ESLint across all workspaces |
| `npm run --workspace apps/web typecheck` | `tsc --noEmit` |
| `npm run --workspace apps/web test` | Vitest unit tests |
| `npm run --workspace apps/web test:e2e` | Playwright e2e |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:deploy` | `prisma migrate deploy` (CI) |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | `tsx prisma/seed.ts` |

CI runs: `lint` → `typecheck` → `vitest` → build → deploy → Playwright smoke.
Run `lint` before `typecheck` before `test` when verifying locally.

## Architecture notes

- **Auth split**: `lib/auth.config.ts` (edge-safe, middleware imports) vs `lib/auth.ts` (Node runtime with Prisma adapter + full providers). Never import `lib/auth.ts` in middleware.
- **CSRF**: middleware checks Origin/Referer on API POST/PATCH/DELETE. Routes in `isCsrfExempt()` are skipped (webhooks, cron). Trusted origins from `APP_ORIGIN` env var.
- **Theme**: CSS custom properties toggled via `data-theme="dark"` on `<html>`. No `dark:` Tailwind classes. Override dark mode with `[data-theme="dark"]` selectors in CSS.
- **Rate limiting**: In-memory sliding window in `lib/rate-limit.ts` — resets on server restart. Used for OTP authorize + verify.
- **Grading**: Server-side only in `lib/grading.ts`; NAT matching in `lib/nat.ts`. Unit tests in `grading.test.ts`.
- **Email**: Resend via `lib/resend.ts`. Individual `to: [email]` sends (not BCC batches), 10 concurrent at a time.
- **Analytics**: PostHog in `lib/posthog.ts` — client is null when key is unset (safe to call unconditionally).
- **Background jobs**: BullMQ queue in `lib/queue.ts`. Newsletter and potentially other delayed tasks.

## Database (Prisma)

- Schema: `packages/database/prisma/schema.prisma`
- Client re-exported at `packages/database/src/index.ts`
- Override: `@prisma/client` pinned to `6.19.3` via root `package.json` `overrides`
- Connection pooling via pgbouncer in production; migrations run against DIRECT_URL
- After pulling upstream changes, run `npm run db:generate` then `npm run db:migrate` if schema changed

## Mock data

- Source data in `apps/web/src/data/` (mocks, practice, PYQ, PSU catalogs)
- Regenerate with: `npm run build:mocks` (or `build:mocks:force`, `build:mocks:one=<name>`)
- Also: `build:gg:practice` and `build:gg:mocks` for GATE Geology content

## Infrastructure

- `AWS_PROFILE=crackgate` must be set for all `aws` / `terraform` commands
- Terraform native arm64 binary at `/opt/homebrew/bin/terraform`
- State: S3 `crackgate-tfstate` + DynamoDB lock
- Prod secrets: Secrets Manager `crackgate/prod/env`
- No manual deploys — CI/CD on push/merge: `main`→prod, `develop`→staging
- SSH key for deploy user: `~/.ssh/id_ed25519.pub`

## AI assistant skills

- Project-scoped assistant skills live in `.opencode/skills/<name>/SKILL.md` (committed, auto-discovered). Personal skills live in `~/.claude/skills/`.
- `mock-review` skill: audit any mock to real-exam standard (factual accuracy vs DGMS/Mines Act/CMR/Mines Rules, distractor quality, duplicates, difficulty labels, topic coverage). Run `node .opencode/skills/mock-review/scripts/validate-mock.cjs <mock.json>` to validate structure + find same-series duplicate stems.

## Dev server quirks

- Next.js 16 uses Turbopack by default. High CPU expected during initial compilation, especially after syncing main with large mock data additions. Drop `.next/` cache if Turbopack gets stuck in a rebuild loop.
- `.env.local` goes in `apps/web/` — root `.env` is not the app env.
- Postgres must be running locally for the dev server to start without errors.
