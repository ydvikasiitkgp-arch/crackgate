import { getAdminSession } from "@/lib/admin";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { inr } from "@/lib/utils";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import UpiReviewActions from "./actions";
import GrantAccessForm from "./grant";
import { CATALOG, subjectLabel, getExam } from "@/data/catalog";
import { isComboSlug, comboLabel } from "@/lib/combos";

export const dynamic = "force-dynamic";

/** Derive a human payment source from the synthetic order-id prefix. */
function paymentSource(orderId: string): "grant" | "upi" | "razorpay" {
  if (orderId.startsWith("grant-")) return "grant";
  if (orderId.startsWith("upi-")) return "upi";
  return "razorpay";
}

type SearchParams = { exam?: string; subject?: string };

export default async function AdminUpiPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const admin = await getAdminSession();
  if (!admin) redirect("/login?next=/admin/upi");

  const sp = await searchParams;
  const fExam = sp.exam && getExam(sp.exam) ? sp.exam : undefined;
  const fSubject = fExam && sp.subject ? sp.subject : undefined;

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Attribution filter applied to the unified payments table.
  const payWhere = {
    status: "captured" as const,
    ...(fExam ? { exam: fExam } : {}),
    ...(fSubject ? { subject: fSubject } : {}),
  };

  const [
    pending,
    recentReviewed,
    approvedAgg,
    monthAgg,
    statusGroups,
    examRevenue,
    payments,
  ] = await Promise.all([
    db.upiPayment.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { email: true } } },
    }),
    db.upiPayment.findMany({
      where: { status: { in: ["approved", "rejected"] } },
      orderBy: { reviewedAt: "desc" },
      take: 30,
      include: { user: { select: { email: true } } },
    }),
    db.upiPayment.aggregate({
      where: { status: "approved" },
      _sum: { amountPaise: true },
      _count: { _all: true },
    }),
    db.upiPayment.aggregate({
      where: { status: "approved", reviewedAt: { gte: monthStart } },
      _sum: { amountPaise: true },
      _count: { _all: true },
    }),
    db.upiPayment.groupBy({ by: ["status"], _count: { _all: true } }),
    // Captured revenue per exam track (unified Payment table).
    db.payment.groupBy({
      by: ["exam"],
      where: { status: "captured" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
    // Unified, attribution-filtered list of all captured payments + grants.
    db.payment.findMany({
      where: payWhere,
      orderBy: { capturedAt: "desc" },
      take: 100,
      include: { user: { select: { email: true } } },
    }),
  ]);

  const counts: Record<string, number> = {
    pending: 0,
    approved: 0,
    rejected: 0,
  };
  for (const g of statusGroups) counts[g.status] = g._count._all;

  const filterLabel = fExam
    ? fSubject
      ? subjectLabel(fExam, fSubject)
      : getExam(fExam)?.label ?? fExam
    : "All exams";

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-extrabold">Payments &amp; Access</h1>
        <a href="/admin" className="text-sm text-muted underline">
          ← Admin
        </a>
      </div>

      {/* Totals */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <AdminKpiCard
          label="Collected (lifetime)"
          value={inr(approvedAgg._sum.amountPaise ?? 0)}
          subtitle={`${approvedAgg._count._all} approved payments`}
          icon="IndianRupee"
          tone="ok"
        />
        <AdminKpiCard
          label="Collected this month"
          value={inr(monthAgg._sum.amountPaise ?? 0)}
          subtitle={`${monthAgg._count._all} approved`}
          icon="IndianRupee"
          tone="ok"
        />
        <AdminKpiCard
          label="Pending review"
          value={counts.pending}
          subtitle="awaiting verification"
          icon="Clock"
          tone={counts.pending > 0 ? "accent" : "default"}
        />
        <AdminKpiCard
          label="Rejected"
          value={counts.rejected}
          subtitle={`${counts.approved} approved total`}
          icon="Flag"
        />
      </div>

      {/* Captured revenue by exam track */}
      <section className="mt-6">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Captured by exam
        </h2>
        <div className="flex flex-wrap gap-2 mt-2">
          {CATALOG.map((e) => {
            const row = examRevenue.find((r) => r.exam === e.exam);
            const sum = row?._sum.amount ?? 0;
            const n = row?._count._all ?? 0;
            return (
              <span
                key={e.label}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm"
              >
                <span className="font-semibold">{e.label}</span>
                <span className="text-ok font-bold">{inr(sum)}</span>
                <span className="text-xs text-muted">({n})</span>
              </span>
            );
          })}
        </div>
      </section>

      {/* Manual grant */}
      <section className="mt-8">
        <GrantAccessForm />
      </section>

      {/* All payments (unified) with attribution filters */}
      <section className="mt-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-bold text-lg">
            All payments{" "}
            <span className="text-muted text-sm">({payments.length})</span>
          </h2>
          <span className="text-xs text-muted">
            Filter: <strong>{filterLabel}</strong>
          </span>
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          <FilterChip label="All exams" href="/admin/upi" active={!fExam} />
          {CATALOG.map((e) => (
            <FilterChip
              key={e.label}
              label={e.label}
              href={`/admin/upi?exam=${e.exam}`}
              active={fExam === e.exam && !fSubject}
            />
          ))}
        </div>
        {fExam && (
          <div className="flex flex-wrap gap-2 mt-2 pl-1">
            {getExam(fExam)?.subjects.map((s) => (
              <FilterChip
                key={s.slug}
                label={`${s.label}${s.live ? "" : " · soon"}`}
                href={`/admin/upi?exam=${fExam}&subject=${s.slug}`}
                active={fSubject === s.slug}
                small
              />
            ))}
          </div>
        )}

        {payments.length === 0 ? (
          <p className="text-muted text-sm mt-3">
            No captured payments for this filter yet.
          </p>
        ) : (
          <div className="card p-0 overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted bg-bg-2">
                <tr className="text-left">
                  <th className="p-3">Date</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Exam</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Tier</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Source</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const src = paymentSource(p.razorpayOrderId);
                  return (
                    <tr key={p.id} className="border-t border-border/60">
                      <td className="p-3 whitespace-nowrap text-xs">
                        {(p.capturedAt ?? p.createdAt)
                          .toISOString()
                          .slice(0, 16)
                          .replace("T", " ")}
                      </td>
                      <td className="p-3 text-xs">{p.user.email}</td>
                      <td className="p-3 text-xs">{p.exam ?? "—"}</td>
                      <td className="p-3 text-xs">{p.subject ?? "—"}</td>
                      <td className="p-3 font-semibold">{p.plan}</td>
                      <td className="p-3 font-semibold">{inr(p.amount)}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            src === "grant"
                              ? "bg-accent/15 text-accent"
                              : src === "upi"
                                ? "bg-ok/15 text-ok"
                                : "bg-brand/15 text-brand"
                          }`}
                        >
                          {src}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-bold text-lg">
          Pending review{" "}
          <span className="text-muted text-sm">({pending.length})</span>
        </h2>

        {pending.length === 0 ? (
          <p className="text-muted text-sm mt-3">
            All caught up. New claims will appear here.
          </p>
        ) : (
          <div className="card p-0 overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted bg-bg-2">
                <tr className="text-left">
                  <th className="p-3">Submitted</th>
                  <th className="p-3">Payer</th>
                  <th className="p-3">Exam</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">App</th>
                  <th className="p-3">Note</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((c) => (
                  <tr key={c.id} className="border-t border-border/60 align-top">
                    <td className="p-3 whitespace-nowrap">
                      {c.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{c.payerName ?? "—"}</div>
                      {c.payerPhone && (
                        <div className="text-xs text-muted select-all">
                          {c.payerPhone}
                        </div>
                      )}
                      {c.payerEmail && (
                        <div className="text-xs text-muted select-all">
                          {c.payerEmail}
                        </div>
                      )}
                      {c.user.email && c.user.email !== c.payerEmail && (
                        <div className="text-[10px] text-muted/70">
                          acct: {c.user.email}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-xs">{c.exam ?? "—"}</td>
                    <td className="p-3 text-xs">
                      {c.items ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-600 dark:text-blue-400">
                            CART
                          </span>
                          <span className="text-muted">{Array.isArray(c.items) ? c.items.length : "?"} items</span>
                        </span>
                      ) : c.subject && isComboSlug(c.subject) ? (
                        <span className="inline-flex items-center gap-1">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            COMBO
                          </span>
                          <span className="text-muted">{comboLabel(c.subject)}</span>
                        </span>
                      ) : (
                        c.subject ?? "—"
                      )}
                    </td>
                    <td className="p-3 font-semibold">{c.plan}</td>
                    <td className="p-3 font-semibold">
                      ₹{Math.round(c.amountPaise / 100)}
                    </td>
                    <td className="p-3 text-xs">{c.upiApp ?? "—"}</td>
                    <td className="p-3 text-xs max-w-[16ch]">
                      {c.payerNote ?? "—"}
                    </td>
                    <td className="p-3">
                      <UpiReviewActions claimId={c.id} subject={c.subject} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mt-12">
        <h2 className="font-bold text-lg">Recently reviewed</h2>
        {recentReviewed.length === 0 ? (
          <p className="text-muted text-sm mt-3">Nothing reviewed yet.</p>
        ) : (
          <div className="card p-0 overflow-x-auto mt-3">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted bg-bg-2">
                <tr className="text-left">
                  <th className="p-3">Reviewed</th>
                  <th className="p-3">Payer</th>
                  <th className="p-3">Exam</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Plan</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Admin note</th>
                </tr>
              </thead>
              <tbody>
                {recentReviewed.map((c) => (
                  <tr key={c.id} className="border-t border-border/60">
                    <td className="p-3 whitespace-nowrap text-xs">
                      {c.reviewedAt
                        ?.toISOString()
                        .slice(0, 16)
                        .replace("T", " ") ?? "—"}
                    </td>
                    <td className="p-3 text-xs">
                      <div>{c.payerName ?? c.user.email}</div>
                      {c.payerPhone && (
                        <div className="text-muted">{c.payerPhone}</div>
                      )}
                    </td>
                    <td className="p-3 text-xs">{c.exam ?? "—"}</td>
                    <td className="p-3 text-xs">{c.subject ?? "—"}</td>
                    <td className="p-3 text-xs">{c.plan}</td>
                    <td className="p-3 text-xs">
                      ₹{Math.round(c.amountPaise / 100)}
                    </td>
                    <td className="p-3 text-xs">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          c.status === "approved"
                            ? "bg-ok/15 text-ok"
                            : "bg-err/15 text-err"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-xs max-w-[24ch]">
                      {c.adminNote ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function FilterChip({
  label,
  href,
  active,
  small,
}: {
  label: string;
  href: string;
  active: boolean;
  small?: boolean;
}) {
  return (
    <a
      href={href}
      className={`shrink-0 rounded-full ${
        small ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      } font-medium whitespace-nowrap transition ${
        active
          ? "bg-brand text-white"
          : "bg-canvas text-ink hover:bg-brand/10 border border-line"
      }`}
    >
      {label}
    </a>
  );
}
