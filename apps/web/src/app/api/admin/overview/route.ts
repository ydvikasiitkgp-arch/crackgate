/** GET /api/admin/overview — founder dashboard aggregate.
 *  Returns counts, plan breakdown, revenue, signup/attempt timeseries.
 *  Cached in-memory with a 5-minute TTL — stale-while-revalidate semantics.
 */
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 5 * 60 * 1000;
const cache = { data: null as unknown, ts: 0 };

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fillDailySeries(days: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400_000);
    map.set(dateKey(d), 0);
  }
  return map;
}

export async function GET() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    if (Date.now() - cache.ts < CACHE_TTL) {
      return NextResponse.json(cache.data);
    }

  const now = new Date();
  const since60 = new Date(now.getTime() - 60 * 86400_000);
  const since30 = new Date(now.getTime() - 30 * 86400_000);
  const since7 = new Date(now.getTime() - 7 * 86400_000);
  const since1 = new Date(now.getTime() - 86400_000);

  const [
    totalUsers,
    usersByPlan,
    signups30,
    signups7,
    signups1,
    activeUsers7,
    payments30Captured,
    paymentsAllCaptured,
    paymentsRecent,
    attempts30,
    attempts7,
    attempts1,
    activity30,
    recentUsers,
    recentActivity,
    reports30,
    pageViews30,
    pageViews60,
  ] = await Promise.all([
    db.user.count(),
    db.user.groupBy({ by: ["plan"], _count: { _all: true } }),
    db.user.count({ where: { createdAt: { gte: since30 } } }),
    db.user.count({ where: { createdAt: { gte: since7 } } }),
    db.user.count({ where: { createdAt: { gte: since1 } } }),
    db.user.count({ where: { lastLoginAt: { gte: since7 } } }),
    db.payment.aggregate({
      where: { status: "captured", capturedAt: { gte: since30 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.payment.aggregate({
      where: { status: "captured" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { user: { select: { email: true, name: true } } },
    }),
    db.attempt.count({ where: { takenAt: { gte: since30 } } }),
    db.attempt.count({ where: { takenAt: { gte: since7 } } }),
    db.attempt.count({ where: { takenAt: { gte: since1 } } }),
    db.activity.findMany({
      where: { ts: { gte: since30 } },
      select: { ts: true, type: true, userId: true },
      take: 10_000,
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, email: true, name: true, plan: true, createdAt: true, lastLoginAt: true },
    }),
    db.activity.findMany({
      orderBy: { ts: "desc" },
      take: 15,
      include: { user: { select: { email: true } } },
    }),
    db.questionReport.findMany({
      where: { createdAt: { gte: since30 } },
      select: { createdAt: true, status: true },
      take: 10_000,
    }),
    // ponytail: raw SQL with date_trunc — avoids fetching 50K rows for timeseries
    db.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(DISTINCT COALESCE("userId", "ip", 'anon')) as count
      FROM "PageView" WHERE "createdAt" >= ${since30}
      GROUP BY DATE("createdAt") ORDER BY date
    `,
    // Total pageviews per day (last 60 days) — all visits, not distinct visitors
    db.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*) as count
      FROM "PageView" WHERE "createdAt" >= ${since60}
      AND ("userId" IS NULL OR "userId" NOT IN (SELECT id FROM "User" WHERE role = 'admin'))
      GROUP BY DATE("createdAt") ORDER BY date
    `,
  ]);

  const adminIds = new Set((await db.user.findMany({ where: { role: "admin" }, select: { id: true } })).map(u => u.id));

  // Build daily signup + attempt + activity + reports series for the last 30 days.
  const signupSeries = fillDailySeries(30);
  const attemptSeries = fillDailySeries(30);
  const activitySeries = fillDailySeries(30);
  const reportSeries = fillDailySeries(30);
  const dauSet = new Map<string, Set<string>>();

  const signups30Rows = await db.user.findMany({
    where: { createdAt: { gte: since30 }, role: { not: "admin" } },
    select: { createdAt: true },
    take: 10_000,
  });
  for (const r of signups30Rows) {
    const k = dateKey(r.createdAt);
    if (signupSeries.has(k)) signupSeries.set(k, (signupSeries.get(k) ?? 0) + 1);
  }
  const attempts30Rows = await db.attempt.findMany({
    where: { takenAt: { gte: since30 } },
    select: { takenAt: true },
    take: 10_000,
  });
  for (const r of attempts30Rows) {
    const k = dateKey(r.takenAt);
    if (attemptSeries.has(k)) attemptSeries.set(k, (attemptSeries.get(k) ?? 0) + 1);
  }
  for (const r of activity30) {
    if (adminIds.has(r.userId)) continue;
    const k = dateKey(r.ts);
    if (activitySeries.has(k)) activitySeries.set(k, (activitySeries.get(k) ?? 0) + 1);
    if (!dauSet.has(k)) dauSet.set(k, new Set());
    dauSet.get(k)!.add(r.userId);
  }
  for (const r of reports30) {
    const k = dateKey(r.createdAt);
    if (reportSeries.has(k)) reportSeries.set(k, (reportSeries.get(k) ?? 0) + 1);
  }
  const dauSeries = Array.from(signupSeries.keys()).map((d) => ({
    date: d,
    count: dauSet.get(d)?.size ?? 0,
  }));

  // ponytail: SQL already returned per-day counts — just convert bigint → number
  const visitorMap = new Map(pageViews30.map((r) => [dateKey(new Date(r.date)), Number(r.count)]));
  const visitorSeries = Array.from(signupSeries.keys()).map((d) => ({
    date: d,
    count: visitorMap.get(d) ?? 0,
  }));

  const pageviewSeries = fillDailySeries(60);
  for (const r of pageViews60) {
    const k = dateKey(new Date(r.date));
    if (pageviewSeries.has(k)) pageviewSeries.set(k, Number(r.count));
  }

  const planMap: Record<string, number> = { free: 0, pro: 0, premium: 0 };
  for (const row of usersByPlan) planMap[row.plan] = row._count._all;

  const payload = {
    generatedAt: now.toISOString(),
    admin: { email: admin.email, source: admin.source },
    users: {
      total: totalUsers,
      byPlan: planMap,
      paid: planMap.pro + planMap.premium,
      signups: { today: signups1, last7: signups7, last30: signups30 },
      activeLast7Days: activeUsers7,
    },
    revenue: {
      last30Days: {
        amountPaise: payments30Captured._sum.amount ?? 0,
        amountInr: Math.round((payments30Captured._sum.amount ?? 0) / 100),
        count: payments30Captured._count._all,
      },
      lifetime: {
        amountPaise: paymentsAllCaptured._sum.amount ?? 0,
        amountInr: Math.round((paymentsAllCaptured._sum.amount ?? 0) / 100),
        count: paymentsAllCaptured._count._all,
      },
    },
    engagement: {
      attempts: { today: attempts1, last7: attempts7, last30: attempts30 },
    },
    series: {
      signups: Array.from(signupSeries, ([date, count]) => ({ date, count })),
      attempts: Array.from(attemptSeries, ([date, count]) => ({ date, count })),
      activity: Array.from(activitySeries, ([date, count]) => ({ date, count })),
      reports: Array.from(reportSeries, ([date, count]) => ({ date, count })),
      dau: dauSeries,
      visitors: visitorSeries,
      pageviews: Array.from(pageviewSeries, ([date, count]) => ({ date, count })),
    },
    recent: {
      users: recentUsers,
      payments: paymentsRecent.map((p) => ({
        id: p.id,
        email: p.user.email,
        name: p.user.name,
        plan: p.plan,
        amountInr: Math.round(p.amount / 100),
        status: p.status,
        createdAt: p.createdAt,
        capturedAt: p.capturedAt,
      })),
      activity: recentActivity.map((a) => ({
        id: a.id,
        type: a.type,
        email: a.user.email,
        ts: a.ts,
      })),
    },
  };
  cache.data = payload;
  cache.ts = Date.now();
  return NextResponse.json(payload);
  } catch (error) {
    console.error("GET /api/admin/overview:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
