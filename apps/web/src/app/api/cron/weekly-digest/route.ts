/** GET/POST /api/cron/weekly-digest
 *  Sends the weekly progress digest to every Pro/Premium user with a
 *  verified phone number. Idempotent within a 24h window — re-running
 *  it on the same day is a no-op for users already messaged today.
 *
 *  Auth: requires header `x-cron-secret: $CRON_SECRET`. In dev
 *  (NODE_ENV!=production) the header check is skipped so you can hit
 *  it from a browser.
 *
 *  Schedule: every Monday 09:00 IST (= 03:30 UTC) via Vercel cron / EventBridge.
 *
 *  Now delegates per-user digest processing to BullMQ workers so the HTTP
 *  request never blocks on sequential WhatsApp API calls.
 *
 *  ?dryRun=1 → computes digest payloads but does NOT send WhatsApp.
 *  ?userId=X → restrict to a single user (for QA).
 */
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { digestQueue, whatsappQueue } from "@/lib/queue";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DAY_MS  = 24 * 60 * 60 * 1000;

async function run(req: Request) {
  // Auth
  if (process.env.NODE_ENV === "production") {
    const want = process.env.CRON_SECRET;
    if (!want) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    const got = req.headers.get("x-cron-secret") ?? "";
    const wantBuf = Buffer.from(want);
    const gotBuf = Buffer.from(got);
    const ok = gotBuf.length === wantBuf.length && timingSafeEqual(gotBuf, wantBuf);
    if (!ok) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const dryRun = url.searchParams.get("dryRun") === "1";
  const onlyUserId = url.searchParams.get("userId");

  // Find eligible users: pro/premium with a verified phone, not messaged in last 24h
  const since24h = new Date(Date.now() - DAY_MS);
  const recentDigests = await db.activity.findMany({
    where: { type: "weekly_digest_sent", ts: { gt: since24h } },
    select: { userId: true },
  });
  const alreadySent = new Set(recentDigests.map((r) => r.userId));

  const users = await db.user.findMany({
    where: {
      ...(onlyUserId ? { id: onlyUserId } : {}),
      plan: { in: ["pro", "premium"] },
      phone: { not: null },
      phoneVerified: { not: null },
    },
    select: { id: true, name: true, phone: true, plan: true },
  });

  const results: Array<{ userId: string; status: "skipped" | "queued" | "dry"; reason?: string }> = [];

  if (!digestQueue) {
    return NextResponse.json({ error: "redis_not_configured" }, { status: 500 });
  }

  for (const u of users) {
    if (alreadySent.has(u.id)) {
      results.push({ userId: u.id, status: "skipped", reason: "sent_within_24h" });
      continue;
    }
    if (!u.phone) continue;

    if (dryRun) {
      results.push({ userId: u.id, status: "dry" });
      continue;
    }

    // Queue a per-user digest job — BullMQ handles concurrency, retries, and
    // backpressure so the cron endpoint returns instantly.
    await digestQueue.add(u.id, {
      userId: u.id,
      phone: u.phone,
      name: u.name ?? "",
      plan: u.plan,
    });

    results.push({ userId: u.id, status: "queued" });
  }

  return NextResponse.json({
    ok: true,
    dryRun,
    eligible: users.length,
    queued:   results.filter((r) => r.status === "queued").length,
    skipped:  results.filter((r) => r.status === "skipped").length,
    results,
  });
}

export async function GET(req: Request)  { return run(req); }
export async function POST(req: Request) { return run(req); }
