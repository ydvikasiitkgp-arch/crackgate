import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { cn, fmtDate } from "@/lib/utils";
import dynamicImport from "next/dynamic";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { AdminCommandBar } from "@/components/admin/admin-command-bar";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import {
  AdminEmptyState,
  AdminDataTableEmpty,
} from "@/components/admin/admin-empty-state";
import { AdminFunnelChart } from "@/components/admin-funnel-chart";

const RealtimeBadge = dynamicImport(() =>
  import("@/components/realtime-badge").then((m) => m.RealtimeBadge),
);

const AdminCharts = dynamicImport(() =>
  import("@/components/admin-charts").then((m) => m.AdminCharts)
);

export const dynamic = "force-dynamic";

const EXAM_LABELS: Record<string, string> = {
  GATE: "GATE",
  PSU: "PSU",
  STATE: "State",
  DIPLOMA: "Diploma",
};

const SUBJECT_LABELS: Record<string, string> = {
  mining: "Mining Engineering (MN)",
  civil: "Civil Engineering (CE)",
  environment: "Environmental Science and Engineering (ES)",
  geology: "Geology and Geophysics (GG)",
  geomatics: "Geomatics Engineering (GE)",
  textile: "Textile Engineering and Fibre Science (TF)",
  "life-sciences": "Life Sciences (XL)",
  ecology: "Ecology and Evolution (EY)",
  agricultural: "Agricultural Engineering (AG)",
  electrical: "Electrical",
  mechanical: "Mechanical",
  system: "System",
  "e-and-t": "E&T",
  "industrial-engineering": "Ind. Engg.",
  "rpsc-ame": "RPSC AME",
  "cgpsc-mining-officer": "CGPSC",
  "coal-sirdar": "Coal Sirdar",
  "coal-overman": "Coal Overman",
  "ongc-mechanical": "ONGC Mech",
  "ongc-petroleum": "ONGC Petrol",
  "ongc-chemical": "ONGC Chem",
  "ongc-electrical": "ONGC Elec",
  "ongc-geology": "ONGC Geo",
  "ongc-geophysics": "ONGC GeoPhys",
  "ongc-physics": "ONGC Phys",
};

function inr(paise: number): string {
  return "₹" + Math.round(paise / 100).toLocaleString("en-IN");
}

function pctChange(
  a: number,
  b: number
): { dir: "up" | "down" | "flat"; label: string } {
  if (b === 0)
    return { dir: a > 0 ? "up" : "flat", label: a > 0 ? "+∞" : "—" };
  const diff = ((a - b) / b) * 100;
  const rounded = Math.round(Math.abs(diff));
  if (diff > 0) return { dir: "up", label: `+${rounded}%` };
  if (diff < 0) return { dir: "down", label: `-${rounded}%` };
  return { dir: "flat", label: "0%" };
}

export default async function AdminPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/login?next=/admin");
  }

  const now = new Date();
  const since30 = new Date(now.getTime() - 30 * 86400_000);
  const since7 = new Date(now.getTime() - 7 * 86400_000);
  const since1 = new Date(now.getTime() - 86400_000);
  const prev7 = new Date(now.getTime() - 14 * 86400_000);

  const [
    totalUsers,
    usersByPlan,
    signups1,
    signups7,
    signups30,
    signupsPrev7,
    activeUsers7,
    activeUsersPrev7,
    attempts1,
    attempts7,
    attempts30,
    attemptsPrev7,
    revenue30,
    revenuePrev30,
    revenueLifetime,
    recentUsers,
    recentPayments,
    recentActivity,
    upiPending,
    pendingReports,
    totalReports,
    reportsByType,
    reportsByExam,
    recentReports,
    totalEntitlements,
    entitlementsByExam,
    entitlementsBySubject,
    usersWithEntitlements,
    allEntitlements,
    visitors7,
    visitorsPrev7,
    visitors30,
  ] = await Promise.all([
    db.user.count(),
    db.user.groupBy({ by: ["plan"], _count: { _all: true } }),
    db.user.count({ where: { createdAt: { gte: since1 } } }),
    db.user.count({ where: { createdAt: { gte: since7 } } }),
    db.user.count({ where: { createdAt: { gte: since30 } } }),
    db.user.count({ where: { createdAt: { gte: prev7, lt: since7 } } }),
    db.user.count({ where: { lastLoginAt: { gte: since7 } } }),
    db.user.count({ where: { lastLoginAt: { gte: prev7, lt: since7 } } }),
    db.attempt.count({ where: { takenAt: { gte: since1 } } }),
    db.attempt.count({ where: { takenAt: { gte: since7 } } }),
    db.attempt.count({ where: { takenAt: { gte: since30 } } }),
    db.attempt.count({ where: { takenAt: { gte: prev7, lt: since7 } } }),
    db.payment.aggregate({
      where: { status: "captured", capturedAt: { gte: since30 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.payment.aggregate({
      where: { status: "captured", capturedAt: { gte: prev7, lt: since30 } },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.payment.aggregate({
      where: { status: "captured" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        plan: true,
        createdAt: true,
        lastLoginAt: true,
        entitlements: {
          select: { exam: true, subject: true, tier: true, expiry: true },
        },
      },
    }),
    db.payment.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: { user: { select: { email: true, name: true } } },
    }),
    db.activity.findMany({
      orderBy: { ts: "desc" },
      take: 12,
      include: { user: { select: { email: true } } },
    }),
    db.upiPayment.count({ where: { status: "pending" } }),
    db.questionReport.count({ where: { status: "pending" } }),
    db.questionReport.count(),
    db.questionReport.groupBy({ by: ["issueType"], _count: { _all: true } }),
    db.questionReport.groupBy({ by: ["exam"], _count: { _all: true } }),
    db.questionReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { user: { select: { email: true, name: true } } },
    }),
    db.entitlement.count(),
    db.entitlement.groupBy({ by: ["exam"], _count: { _all: true } }),
    db.entitlement.groupBy({ by: ["subject"], _count: { _all: true } }),
    db.entitlement.findMany({ select: { userId: true }, distinct: ["userId"] }),
    db.entitlement.findMany({
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true, name: true } } },
    }),
    // ponytail: raw SQL COUNT DISTINCT — avoids fetching 50K rows per query into JS
    db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT COALESCE("userId", "ip", 'anon')) as count
      FROM "PageView" WHERE "createdAt" >= ${since7}
      AND ("userId" IS NULL OR "userId" NOT IN (SELECT id FROM "User" WHERE role = 'admin'))
    `,
    db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT COALESCE("userId", "ip", 'anon')) as count
      FROM "PageView" WHERE "createdAt" >= ${prev7} AND "createdAt" < ${since7}
      AND ("userId" IS NULL OR "userId" NOT IN (SELECT id FROM "User" WHERE role = 'admin'))
    `,
    db.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(DISTINCT COALESCE("userId", "ip", 'anon')) as count
      FROM "PageView" WHERE "createdAt" >= ${since30}
      AND ("userId" IS NULL OR "userId" NOT IN (SELECT id FROM "User" WHERE role = 'admin'))
    `,
  ]);

  const planMap: Record<string, number> = { free: 0, pro: 0, premium: 0 };
  for (const r of usersByPlan) planMap[r.plan] = r._count._all;

  const paidUsers = usersWithEntitlements.length;
  const freeUsers = totalUsers - paidUsers;
  const conversionPct = totalUsers
    ? Math.round((paidUsers / totalUsers) * 1000) / 10
    : 0;

  const signupsTrend = pctChange(signups7, signupsPrev7);
  const activeTrend = pctChange(activeUsers7, activeUsersPrev7);
  const revenueTrend = pctChange(
    revenue30._sum.amount ?? 0,
    revenuePrev30._sum.amount ?? 0
  );

  const rev30 = revenue30._sum.amount ?? 0;
  const revPrev = revenuePrev30._sum.amount ?? 0;

  const visitors7Count = Number(visitors7[0]?.count ?? 0);
  const visitorsPrev7Count = Number(visitorsPrev7[0]?.count ?? 0);
  const visitors30Count = Number(visitors30[0]?.count ?? 0);
  const visitorsTrend = pctChange(visitors7Count, visitorsPrev7Count);

  function reportStatusBadge(status: string) {
    if (status === "pending")
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
    if (status === "resolved")
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
  }

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-10">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">
            Founder Console
          </h1>
          <p className="text-muted mt-1 text-sm">
            Command center for CrackGate operations
          </p>
          <div className="mt-2">
            <RealtimeBadge />
          </div>
        </div>
        <AdminCommandBar
          pendingReports={pendingReports}
          pendingUpi={upiPending}
        />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
        <AdminKpiCard
          label="Total Users"
          value={totalUsers}
          subtitle={`${signups1} today · ${signups7} this week`}
          icon="Users"
          trend={signupsTrend.dir}
          trendValue={signupsTrend.label}
          sparkData={[signupsPrev7, signups7]}
          tone="brand"
        />
        <AdminKpiCard
          label="Paid Users"
          value={paidUsers}
          subtitle={`${conversionPct}% conversion · ${freeUsers} free`}
          icon="Crown"
          tone="ok"
        />
        <AdminKpiCard
          label="Active (7d)"
          value={activeUsers7}
          subtitle={`${attempts7} attempts this week`}
          icon="Activity"
          trend={activeTrend.dir}
          trendValue={activeTrend.label}
          sparkData={[activeUsersPrev7, activeUsers7]}
        />
        <AdminKpiCard
          label="Visitors (7d)"
          value={visitors7Count}
          subtitle={`${visitors30Count} this month · excl. admins`}
          icon="Eye"
          trend={visitorsTrend.dir}
          trendValue={visitorsTrend.label}
          sparkData={[visitorsPrev7Count, visitors7Count]}
          tone="accent"
        />
        <AdminKpiCard
          label="Revenue (30d)"
          value={inr(rev30)}
          subtitle={`${revenue30._count._all} payments · lifetime ${inr(revenueLifetime._sum.amount ?? 0)}`}
          icon="IndianRupee"
          trend={revenueTrend.dir}
          trendValue={revenueTrend.label}
          sparkData={[revPrev, rev30]}
          tone="ok"
        />
        <AdminKpiCard
          label="Pending Issues"
          value={totalReports}
          subtitle={`${pendingReports} pending review`}
          icon="Flag"
          tone={pendingReports > 0 ? "accent" : "default"}
        />
      </div>

      {/* Charts */}
      <div className="mt-8" data-track-section="admin:charts">
        <AdminCharts />
      </div>

      {/* Conversion Funnel */}
      <div data-track-section="admin:funnel">
        <AdminFunnelChart />
      </div>

      {/* Entitlements + Engagement */}
      <section className="mt-8 grid lg:grid-cols-3 gap-6" data-track-section="admin:entitlements">
        <div className="card p-6 lg:col-span-2">
          <AdminSectionHeader
            title="Entitlements"
            subtitle={`${totalEntitlements} total across ${usersWithEntitlements.length} users`}
          />
          {totalEntitlements === 0 ? (
            <AdminEmptyState
              icon="Flag"
              title="No entitlements yet"
              description="Paid access appears here after UPI approval."
            />
          ) : (
            <>
              <div className="mt-5 space-y-3">
                {entitlementsByExam.map((r) => {
                  const pct = totalEntitlements
                    ? Math.round((r._count._all / totalEntitlements) * 100)
                    : 0;
                  return (
                    <div key={r.exam}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-semibold">
                          {EXAM_LABELS[r.exam] ?? r.exam}
                        </span>
                        <span className="text-muted tabular-nums">
                          {r._count._all}{" "}
                          <span className="text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full"
                          style={{ width: `${Math.max(2, pct)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 pt-5 border-t border-line">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
                  By subject
                </h3>
                <div className="flex flex-wrap gap-2">
                  {entitlementsBySubject.map((r) => (
                    <span
                      key={r.subject}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand"
                    >
                      {SUBJECT_LABELS[r.subject] ?? r.subject}:{" "}
                      {r._count._all}
                    </span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="card p-6">
          <AdminSectionHeader title="Engagement" />
          <ul className="text-sm mt-5 space-y-3">
            <li className="flex justify-between items-center">
              <span className="text-muted">Attempts today</span>
              <b className="tabular-nums">{attempts1}</b>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted">Attempts last 7d</span>
              <b className="tabular-nums">{attempts7}</b>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted">Attempts last 30d</span>
              <b className="tabular-nums">{attempts30}</b>
            </li>
            <li className="flex justify-between items-center border-t border-line pt-3">
              <span className="text-muted">New signups today</span>
              <b className="tabular-nums">{signups1}</b>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted">New signups last 7d</span>
              <b className="tabular-nums">{signups7}</b>
            </li>
            <li className="flex justify-between items-center">
              <span className="text-muted">New signups last 30d</span>
              <b className="tabular-nums">{signups30}</b>
            </li>
          </ul>
        </div>
      </section>

      {/* Recent Signups */}
      <section className="mt-8 card overflow-hidden" data-track-section="admin:recent-signups">
        <div className="p-6 pb-0">
          <AdminSectionHeader
            title="Recent Signups"
            subtitle={`${recentUsers.length} of ${totalUsers} users`}
            actionHref="/api/admin/export?dataset=users"
            actionLabel="Export CSV"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-4">
            <thead className="text-xs text-muted uppercase tracking-wider border-b border-line">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left">User</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left">Phone</th>
                <th className="px-3 sm:px-6 py-3 text-left">Access</th>
                <th className="px-3 sm:px-6 py-3 text-left">Joined</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left">Last login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {recentUsers.length === 0 ? (
                <AdminDataTableEmpty
                  colSpan={5}
                  icon="Users"
                  title="No users yet"
                  description="Users will appear here after signups."
                />
              ) : (
                recentUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-paper/50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3">
                      <div className="font-medium">{u.email}</div>
                      {u.name && (
                        <div className="text-xs text-muted">{u.name}</div>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 text-muted text-xs">
                      {u.phone ?? "—"}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      {u.entitlements.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.entitlements.map((e, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand"
                            >
                              {SUBJECT_LABELS[e.subject] ?? e.subject}
                              <span className="ml-1 text-brand/60">
                                {e.tier}
                              </span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-muted">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-muted">
                      {u.lastLoginAt ? fmtDate(u.lastLoginAt) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Entitlements */}
      {allEntitlements.length > 0 && (
        <section className="mt-8 card overflow-hidden">
          <div className="p-6 pb-0">
            <AdminSectionHeader
              title="Recent Entitlements"
              subtitle={`${allEntitlements.length} of ${totalEntitlements} total`}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-4">
              <thead className="text-xs text-muted uppercase tracking-wider border-b border-line">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left">User</th>
                  <th className="px-3 sm:px-6 py-3 text-left">Exam</th>
                  <th className="px-3 sm:px-6 py-3 text-left">Subject</th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left">Tier</th>
                  <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left">Source</th>
                  <th className="px-3 sm:px-6 py-3 text-left">Expiry</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {allEntitlements.slice(0, 10).map((e) => (
                  <tr
                    key={e.id}
                    className="hover:bg-paper/50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 font-medium">
                      {e.user.email}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">
                        {EXAM_LABELS[e.exam] ?? e.exam}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      {SUBJECT_LABELS[e.subject] ?? e.subject}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {e.tier}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-muted">{e.source}</td>
                    <td className="px-3 sm:px-6 py-3 text-muted">
                      {e.expiry ? fmtDate(e.expiry) : "∞"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Recent Payments */}
      <section className="mt-8 card overflow-hidden" data-track-section="admin:recent-payments">
        <div className="p-6 pb-0">
          <AdminSectionHeader
            title="Recent Payments"
            subtitle={`${revenueLifetime._count._all} total · lifetime ${inr(revenueLifetime._sum.amount ?? 0)}`}
            actionHref="/api/admin/export?dataset=payments"
            actionLabel="Export CSV"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-4">
            <thead className="text-xs text-muted uppercase tracking-wider border-b border-line">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left">User</th>
                <th className="px-3 sm:px-6 py-3 text-left">Plan</th>
                <th className="px-3 sm:px-6 py-3 text-left">Amount</th>
                <th className="px-3 sm:px-6 py-3 text-left">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left">Created</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left">Captured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {recentPayments.length === 0 ? (
                <AdminDataTableEmpty
                  colSpan={6}
                  icon="CreditCard"
                  title="No payments yet"
                  description="Once Razorpay is live, captures show here."
                />
              ) : (
                recentPayments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-paper/50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 font-medium">
                      <div>{p.user.email}</div>
                      {p.user.name && (
                        <div className="text-xs text-muted">{p.user.name}</div>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {p.plan.charAt(0).toUpperCase() + p.plan.slice(1)}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 tabular-nums font-medium">
                      {inr(p.amount)}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                          p.status === "captured"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : p.status === "failed"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                        )}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-muted">
                      {fmtDate(p.createdAt)}
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-muted">
                      {p.capturedAt ? fmtDate(p.capturedAt) : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="mt-8 card overflow-hidden" data-track-section="admin:recent-activity">
        <div className="p-6 pb-0">
          <AdminSectionHeader
            title="Recent Activity"
            subtitle="Last 12 events"
            actionHref="/api/admin/export?dataset=activity"
            actionLabel="Export CSV"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm mt-4">
            <thead className="text-xs text-muted uppercase tracking-wider border-b border-line">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left">When</th>
                <th className="px-3 sm:px-6 py-3 text-left">User</th>
                <th className="px-3 sm:px-6 py-3 text-left">Event</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {recentActivity.length === 0 ? (
                <AdminDataTableEmpty
                  colSpan={3}
                  icon="BarChart3"
                  title="No activity yet"
                  description="Activity events will appear here."
                />
              ) : (
                recentActivity.map((a) => (
                  <tr
                    key={a.id}
                    className="hover:bg-paper/50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 text-muted">
                      {fmtDate(a.ts)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 font-medium">
                      {a.user.email}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {a.type}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reports Overview */}
      <section className="mt-8 grid lg:grid-cols-3 gap-6" data-track-section="admin:reports">
        <div className="card p-6">
          <AdminSectionHeader
            title="Reports by Exam"
            actionHref="/admin/reports"
            actionLabel="View all"
          />
          {reportsByExam.length === 0 ? (
            <AdminEmptyState
              icon="ClipboardList"
              title="No reports yet"
              description="Issue reports from users will appear here."
            />
          ) : (
            <div className="mt-5 space-y-3">
              {reportsByExam.map((r) => {
                const pct = totalReports
                  ? Math.round((r._count._all / totalReports) * 100)
                  : 0;
                return (
                  <div key={r.exam}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-semibold">
                        {EXAM_LABELS[r.exam] ?? r.exam}
                      </span>
                      <span className="text-muted tabular-nums">
                        {r._count._all}{" "}
                        <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand rounded-full"
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-6">
          <AdminSectionHeader
            title="Reports by Type"
            actionHref="/admin/reports"
            actionLabel="View all"
          />
          {reportsByType.length === 0 ? (
            <AdminEmptyState
              icon="FileText"
              title="No reports yet"
              description="Issue type breakdown will appear here."
            />
          ) : (
            <div className="mt-5 space-y-3">
              {reportsByType.map((r) => {
                const pct = totalReports
                  ? Math.round((r._count._all / totalReports) * 100)
                  : 0;
                const label = r.issueType.replace(/_/g, " ");
                return (
                  <div key={r.issueType}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize font-semibold">{label}</span>
                      <span className="text-muted tabular-nums">
                        {r._count._all}{" "}
                        <span className="text-xs">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${Math.max(2, pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 pb-0">
            <AdminSectionHeader
              title="Recent Reports"
              actionHref="/admin/reports"
              actionLabel="Manage all"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm mt-4">
              <thead className="text-xs text-muted uppercase tracking-wider border-b border-line">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left">When</th>
                  <th className="px-3 sm:px-6 py-3 text-left">User</th>
                  <th className="px-3 sm:px-6 py-3 text-left">Exam</th>
                  <th className="px-3 sm:px-6 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/50">
                {recentReports.length === 0 ? (
                  <AdminDataTableEmpty
                    colSpan={4}
                    icon="Flag"
                    title="No reports yet"
                    description="Issue reports will appear here."
                  />
                ) : (
                  recentReports.map((r) => (
                    <tr
                      key={r.id}
                      className={cn(
                        "hover:bg-paper/50 transition-colors",
                        r.status === "pending" && "bg-amber-50/50 dark:bg-amber-900/10"
                      )}
                    >
                      <td className="px-3 sm:px-6 py-3 text-muted">
                        {fmtDate(r.createdAt)}
                      </td>
                      <td className="px-3 sm:px-6 py-3">{r.user.email}</td>
                      <td className="px-3 sm:px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand">
                          {EXAM_LABELS[r.exam] ?? r.exam}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3">
                        <span
                          className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                            reportStatusBadge(r.status)
                          )}
                        >
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Footer */}
      <p className="text-xs text-muted mt-10 text-center">
        Founder-only view · grant access by setting{" "}
        <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
          ADMIN_EMAILS=&quot;you@example.com&quot;
        </code>{" "}
        in{" "}
        <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
          .env.local
        </code>{" "}
        or updating{" "}
        <code className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px]">
          User.role = &quot;admin&quot;
        </code>{" "}
        in the database.
        <br />
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1 text-brand hover:text-brand-2 transition-colors mt-1"
        >
          <ArrowRight className="w-3 h-3 rotate-180" />
          Back to user dashboard
        </Link>
      </p>
    </div>
  );
}


