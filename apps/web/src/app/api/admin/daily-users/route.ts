import { NextResponse } from "next/server";
import { getAdminSession, getTestUserIds } from "@/lib/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function fillDailySeries(days: number): Map<string, number> {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    map.set(dateKey(new Date(Date.now() - i * 86400_000)), 0);
  }
  return map;
}

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 86400_000);
  const since7 = new Date(now.getTime() - 7 * 86400_000);

  const [
    signupRows,
    attemptRows,
    dauRows,
    total,
    paidUserIds,
    active7dResult,
    testUserIds,
  ] = await Promise.all([
    db.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE("createdAt") as date, COUNT(*)::int as count
      FROM "User"
      WHERE "createdAt" >= ${since30} AND "role" != 'admin'
      GROUP BY DATE("createdAt") ORDER BY date
    `,
    db.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(a."takenAt") as date, COUNT(*)::int as count
      FROM "Attempt" a JOIN "User" u ON u.id = a."userId"
      WHERE a."takenAt" >= ${since30} AND u."role" != 'admin'
      GROUP BY DATE(a."takenAt") ORDER BY date
    `,
    db.$queryRaw<{ date: Date; count: bigint }[]>`
      SELECT DATE(a.ts) as date, COUNT(DISTINCT a."userId")::int as count
      FROM "Activity" a JOIN "User" u ON u.id = a."userId"
      WHERE a.ts >= ${since30} AND u."role" != 'admin'
      GROUP BY DATE(a.ts) ORDER BY date
    `,
    db.user.count({ where: { role: { not: "admin" } } }),
    db.entitlement.findMany({ select: { userId: true }, distinct: ["userId"] }),
    db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT a."userId")::int as count
      FROM "Activity" a JOIN "User" u ON u.id = a."userId"
      WHERE a.ts >= ${since7} AND u."role" != 'admin'
    `,
    getTestUserIds(),
  ]);

  const signupMap = fillDailySeries(30);
  for (const r of signupRows) signupMap.set(dateKey(new Date(r.date)), Number(r.count));

  const attemptMap = fillDailySeries(30);
  for (const r of attemptRows) attemptMap.set(dateKey(new Date(r.date)), Number(r.count));

  const dauMap = fillDailySeries(30);
  for (const r of dauRows) dauMap.set(dateKey(new Date(r.date)), Number(r.count));

  const todayKey = dateKey(now);
  const paidUsers = paidUserIds.filter(
    (u) => !testUserIds.has(u.userId),
  ).length;
  const conversionRate = total > 0 ? Math.round((paidUsers / total) * 1000) / 10 : 0;
  const signups30d = Array.from(signupMap.values()).reduce((s, c) => s + c, 0);
  const dau30d = Array.from(dauMap.values()).reduce((s, c) => s + c, 0);
  const stickiness = signups30d > 0 ? Math.round((dau30d / signups30d) * 10) / 10 : 0;

  return NextResponse.json({
    signups: Array.from(signupMap, ([date, count]) => ({ date, count })),
    attempts: Array.from(attemptMap, ([date, count]) => ({ date, count })),
    dau: Array.from(dauMap, ([date, count]) => ({ date, count })),
    summary: {
      total,
      signupsToday: signupMap.get(todayKey) ?? 0,
      signups7d: Array.from(signupMap.entries()).filter(([k]) => k >= dateKey(since7)).reduce((s, [, c]) => s + c, 0),
      signups30d,
      attemptsToday: attemptMap.get(todayKey) ?? 0,
      attempts7d: Array.from(attemptMap.entries()).filter(([k]) => k >= dateKey(since7)).reduce((s, [, c]) => s + c, 0),
      attempts30d: Array.from(attemptMap.values()).reduce((s, c) => s + c, 0),
      dauToday: dauMap.get(todayKey) ?? 0,
      dau7d: Array.from(dauMap.entries()).filter(([k]) => k >= dateKey(since7)).reduce((s, [, c]) => s + c, 0),
      dau30d,
      active7dUsers: Number(active7dResult[0]?.count ?? 0),
      paidUsers,
      conversionRate,
      stickiness,
    },
  });
}
