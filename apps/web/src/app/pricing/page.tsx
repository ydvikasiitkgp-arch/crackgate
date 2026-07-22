"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCart } from "@/hooks/use-cart";

const PLANS = [
  { id: "free",    name: "Free",     price: 0,    period: "forever",    cta: "Current plan", highlight: false, badge: "",
    perks: [
      "All Learn concept lessons — free forever",
      "Insights dashboard — track scores & progress",
      "Complete study Notes — free forever",
      "Mock 01 free — full exam-portal experience",
    ] },
  { id: "pro",     name: "Pro",      price: 499,  period: "/ GATE 2027 cycle",    cta: "Get Pro",     highlight: false, badge: "Most popular",
    perks: [
      "Everything in Free (Learn, Insights & Notes)",
      "All 2,061 practice questions — fully unlocked",
      "Mock 01 free — full mock series is Premium-only",
      "Subject-wise SWOT & Mastery analytics",
      "Email support",
      "Access through GATE 2027 exam day",
    ] },
  { id: "premium", name: "Premium · All-Access",  price: 899,  period: "/ GATE 2027 cycle", cta: "Get Premium", highlight: true, badge: "Best value",
    perks: [
      "Everything in Pro, plus:",
      "All 10 mocks — the full test series, incl. final FLT",
      "Weekly progress digest on WhatsApp",
      "Priority support",
      "Early access to GATE 2028 prep content",
    ] },
] as const;

const MATRIX: { feature: string; free: string | boolean; pro: string | boolean; premium: string | boolean }[] = [
  { feature: "Learn — concept lessons",         free: true,           pro: true,             premium: true               },
  { feature: "Study Notes",                     free: true,           pro: true,             premium: true               },
  { feature: "Insights dashboard",              free: true,           pro: true,             premium: "+ trends"         },
  { feature: "Full-length mock tests",          free: "1 (Mock 01)",  pro: "1 (Mock 01)",   premium: "All 10"           },
  { feature: "Practice Qs per subject",         free: "Pro only",     pro: "Full subject",   premium: "Full subject"     },
  { feature: "Total practice questions",        free: "Pro only",     pro: "2,061",          premium: "2,061"            },
  { feature: "Subject Mastery dashboard",       free: "Basic",        pro: "Full",           premium: "Full + trends"    },
  { feature: "SWOT analytics",                  free: "Basic",        pro: "Detailed",       premium: "Detailed + percentile" },
  { feature: "Score Trend chart",               free: true,           pro: true,             premium: "+ peer comparison" },
  { feature: "Weekly progress digest",          free: false,          pro: false,            premium: true               },
  { feature: "Support",                         free: "Community",    pro: "Email",          premium: "WhatsApp + email" },
  { feature: "Validity",                        free: "Forever",      pro: "GATE 2027 cycle",premium: "GATE 2027 + 2028 early access" },
];

export default function PricingPage() {
  const sp = useSearchParams();
  const defaultSubject = sp.get("subject") ?? "";

  return (
    <div className="max-w-6xl mx-auto px-5 py-16">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
          Simple, honest pricing.
        </h1>
        <p className="text-muted mt-3 max-w-xl mx-auto text-lg">
          Start free. Upgrade when you want all mocks unlocked. No auto-renewal traps.
        </p>
      </div>

      {/* GATE Plans */}
      <div className="mt-12 text-center">
        <SectionBadge color="brand">GATE 2027</SectionBadge>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mt-6">
        {PLANS.map((p) => <PlanCard key={p.id} plan={p} defaultSubject={defaultSubject} />)}
      </div>

      <FeatureMatrix />

      <p className="text-center text-xs text-muted mt-16">
        Prices in INR · GST extra where applicable · See our <a href="/refund" className="underline">refund policy</a>.
      </p>
    </div>
  );
}

/* ─── Section Badge ─── */
function SectionBadge({ color, children }: { color: "brand" | "amber" | "emerald" | "blue"; children: React.ReactNode }) {
  const cls = {
    brand: "bg-brand/10 text-brand",
    amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  }[color];
  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${cls}`}>
      {children}
    </span>
  );
}

/* ─── GATE Plan Card ─── */
function PlanCard({ plan, defaultSubject = "" }: { plan: typeof PLANS[number]; defaultSubject?: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const devMode = process.env.NEXT_PUBLIC_DEV_TOOLS === "1";

  async function buy() {
    if (plan.id === "free") return router.push("/login");
    if (devMode) {
      setLoading(true);
      try {
        const r = await fetch("/api/dev/set-plan", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ plan: plan.id }),
        });
        if (r.status === 401) return router.push(`/login?next=/pricing`);
        const t = await r.text();
        const data = t ? safeJson(t) : null;
        if (!r.ok) throw new Error(data?.error ?? data?.message ?? `Dev set-plan failed`);
        return router.push(`/dashboard?upgrade=success&dev=1`);
      } catch (e) {
        alert((e as Error).message);
      } finally {
        setLoading(false);
      }
      return;
    }
    router.push(defaultSubject
      ? `/pay/upi?plan=${plan.id}&exam=GATE&subject=${defaultSubject}`
      : `/pay/upi?plan=${plan.id}&exam=GATE`);
  }

  const isFree = plan.id === "free";

  return (
    <div className={`relative card p-8 flex flex-col transition-all duration-200 hover:shadow-lg ${plan.highlight ? "border-accent shadow-pop ring-2 ring-accent/40" : "hover:-translate-y-0.5"}`}>
      {plan.badge && (
        <div className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${plan.highlight ? "bg-accent text-white" : "bg-brand/15 text-brand"}`}>
          {plan.badge}
        </div>
      )}
      <h3 className="text-xl font-bold mt-1">{plan.name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">₹{plan.price}</span>
        <span className="text-sm text-muted">{plan.period}</span>
      </div>
      <ul className="mt-6 space-y-2.5 text-sm flex-1">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex gap-2.5">
            <span className="text-ok mt-0.5 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            </span>
            <span>{perk}</span>
          </li>
        ))}
      </ul>
      {isFree ? (
        <button onClick={() => router.push("/login")} className="btn btn-ghost mt-8">
          Current plan
        </button>
      ) : (
        <div className="space-y-2 mt-8">
          <button
            onClick={buy}
            disabled={loading}
            className={`btn w-full ${plan.id === "premium" ? "btn-accent" : "btn-primary"}`}
          >
            {loading ? "..." : devMode ? `${plan.name}` : `${plan.cta} — ₹${plan.price}`}
          </button>
          <AddToCartButton
            exam="GATE"
            subject={defaultSubject || "mining"}
            plan={plan.id}
            label={`Add ${plan.name} to Cart`}
          />
        </div>
      )}
    </div>
  );
}

/* ─── Feature Matrix ─── */
function FeatureMatrix() {
  return (
    <section className="mt-16">
      <h2 className="text-2xl font-extrabold text-center">What's in each plan</h2>
      <div className="card mt-6 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="p-4">Feature</th>
              <th className="p-4 text-center">Free</th>
              <th className="p-4 text-center bg-brand/5">Pro</th>
              <th className="p-4 text-center bg-accent/5">Premium</th>
            </tr>
          </thead>
          <tbody>
            {MATRIX.map((row) => (
              <tr key={row.feature} className="border-b border-line/60">
                <td className="p-4 font-medium">{row.feature}</td>
                <Cell v={row.free} />
                <Cell v={row.pro} highlight />
                <Cell v={row.premium} highlight accent />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Cell({ v, highlight, accent }: { v: string | boolean; highlight?: boolean; accent?: boolean }) {
  const bg = accent ? "bg-accent/5" : highlight ? "bg-brand/5" : "";
  return (
    <td className={`p-4 text-center ${bg}`}>
      {v === true  ? <span className="text-ok font-bold">✓</span>
       : v === false ? <span className="text-muted">—</span>
       : <span>{v}</span>}
    </td>
  );
}

function safeJson(t: string): { error?: string; message?: string } | null {
  try { return JSON.parse(t); } catch { return null; }
}

/* ─── Add to Cart Button ─── */
function AddToCartButton({
  exam,
  subject,
  plan,
  label,
  disabled,
}: {
  exam: string;
  subject: string;
  plan?: string;
  label?: string;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  async function handleAdd() {
    const ok = await addItem(exam, subject, plan ?? "pro");
    if (ok) {
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  }

  return (
    <button
      onClick={handleAdd}
      disabled={disabled || added}
      className="btn btn-ghost w-full text-sm border border-line hover:border-brand/40 hover:bg-brand/5 transition-all"
    >
      {added ? "✓ Added" : label ?? "Add to Cart"}
    </button>
  );
}
