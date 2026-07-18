import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL = 5 * 60 * 1000;
const cache = { data: null as unknown, ts: 0 };

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
    const since30 = new Date(now.getTime() - 30 * 86400_000);

    const [visitors, signups, mockStarts, mockSubmits, pricingViews, paidUsers] =
      await Promise.all([
        // Unique visitors (non-admin)
        db.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT COALESCE("userId", "ip", 'anon')) as count
          FROM "PageView" WHERE "createdAt" >= ${since30}
          AND ("userId" IS NULL OR "userId" NOT IN (SELECT id FROM "User" WHERE role = 'admin'))
        `,
        // Signups
        db.user.count({ where: { createdAt: { gte: since30 } } }),
        // Users who started a mock (click data-track="mock:start" or Activity)
        db.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT "userId") as count FROM "PageView"
          WHERE "type" = 'click' AND "element" LIKE 'mock:start' AND "createdAt" >= ${since30}
          AND "userId" IS NOT NULL
        `,
        // Users who submitted a mock
        db.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT "userId") as count FROM "Activity"
          WHERE "type" = 'mock_submit' AND "ts" >= ${since30}
        `,
        // Users who viewed pricing page
        db.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT "userId") as count FROM "PageView"
          WHERE "path" = '/pricing' AND "createdAt" >= ${since30}
          AND "userId" IS NOT NULL
        `,
        // Paid users (captured payments)
        db.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(DISTINCT "userId") as count FROM "Payment"
          WHERE "status" = 'captured' AND "capturedAt" >= ${since30}
        `,
      ]);

    const funnel = [
      { step: "Visitors", count: Number(visitors[0]?.count ?? 0) },
      { step: "Signups", count: signups },
      { step: "Mock Started", count: Number(mockStarts[0]?.count ?? 0) },
      { step: "Mock Submitted", count: Number(mockSubmits[0]?.count ?? 0) },
      { step: "Pricing Viewed", count: Number(pricingViews[0]?.count ?? 0) },
      { step: "Paid", count: Number(paidUsers[0]?.count ?? 0) },
    ];

    // Add conversion rates
    const result = funnel.map((s, i) => ({
      ...s,
      pctOfTotal: funnel[0].count ? Math.round((s.count / funnel[0].count) * 1000) / 10 : 0,
      pctOfPrev: i === 0 ? 100 : funnel[i - 1].count
        ? Math.round((s.count / funnel[i - 1].count) * 1000) / 10
        : 0,
      dropoff: i === 0 ? 0 : funnel[i - 1].count - s.count,
    }));

    cache.data = { generatedAt: now.toISOString(), funnel: result };
    cache.ts = Date.now();
    return NextResponse.json(cache.data);
  } catch (error) {
    console.error("GET /api/admin/funnel:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
