"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { AshokaChakra } from "@/components/ashoka-chakra";
import {
  INDEPENDENCE_DAY_ACTIVE,
  INDEPENDENCE_DAY_DISCOUNT,
  INDEPENDENCE_DAY_PROMO_CODE,
} from "@/lib/celebration";

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

export function PricingBody({ defaultSubject = "" }: { defaultSubject?: string }) {
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
  const { addItem } = useCart();

  async function buy() {
    if (plan.id === "free") return router.push("/login");
    setLoading(true);
    await addItem("GATE", defaultSubject || "mining", plan.id);
    router.push("/pay/checkout");
  }

  const isFree = plan.id === "free";
  const isPremium = plan.id === "premium";

  return (
    <div className={`relative card p-8 flex flex-col transition-all duration-300 hover:shadow-xl ${plan.highlight ? "ring-2 ring-accent/30 shadow-pop" : "hover:-translate-y-1 hover:ring-1 hover:ring-brand/20"}`}>
      {/* Premium highlight ring for indy */}
      {INDEPENDENCE_DAY_ACTIVE && !isFree && (
        <div
          aria-hidden
          className="absolute inset-0 rounded-xl"
          style={{
            border: '1px solid transparent',
            borderImage: 'linear-gradient(135deg, rgba(255,153,51,0.4) 0%, rgba(255,255,255,0.2) 40%, rgba(19,136,8,0.4) 100%) 1',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Subtle corner accent for indy on paying plans */}
      {INDEPENDENCE_DAY_ACTIVE && !isFree && (
        <>
          <div
            aria-hidden
            className="absolute top-0 left-0 h-16 w-16"
            style={{
              borderTop: '1px solid transparent',
              borderLeft: '1px solid transparent',
              borderImage: 'linear-gradient(135deg, rgba(255,153,51,0.5), transparent 60%) 1',
              borderRadius: '12px 0 0 0',
              pointerEvents: 'none'
            }}
          />
          <div
            aria-hidden
            className="absolute top-0 right-0 h-16 w-16"
            style={{
              borderTop: '1px solid transparent',
              borderRight: '1px solid transparent',
              borderImage: 'linear-gradient(-135deg, rgba(19,136,8,0.5), transparent 60%) 1',
              borderRadius: '0 12px 0 0',
              pointerEvents: 'none'
            }}
          />
        </>
      )}

      {plan.badge && (
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${plan.highlight ? "bg-accent text-white" : "bg-brand/15 text-brand"}`}
          style={plan.highlight ? { boxShadow: "0 4px 12px rgba(245,158,11,0.4)" } : undefined}
        >
          {plan.badge}
        </div>
      )}

      {INDEPENDENCE_DAY_ACTIVE && !isFree && isPremium && (
        <div
          className="absolute -top-3 right-4 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,153,51,0.2), rgba(19,136,8,0.2))',
            color: '#FFD66B',
            border: '1px solid rgba(255,153,51,0.3)',
            boxShadow: '0 2px 8px rgba(255,153,51,0.15)'
          }}
        >
          Independence Offer
        </div>
      )}

      <h3 className="text-xl font-bold mt-1">{plan.name}</h3>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-4xl font-extrabold">₹{plan.price}</span>
        <span className="text-sm text-muted">{plan.period}</span>
      </div>
      {INDEPENDENCE_DAY_ACTIVE && !isFree && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium"
          style={{
            background: 'linear-gradient(135deg, rgba(255,153,51,0.12), rgba(19,136,8,0.12))',
            color: '#FFB84D',
            border: '1px solid rgba(255,153,51,0.2)'
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#FF9933' }} aria-hidden />
          {INDEPENDENCE_DAY_DISCOUNT.replace("up to ", "")} with
          <span className="font-mono font-bold ml-1">{INDEPENDENCE_DAY_PROMO_CODE}</span>
        </div>
      )}
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
            className={`btn w-full ${INDEPENDENCE_DAY_ACTIVE ? "btn-indian" : plan.id === "premium" ? "btn-accent" : "btn-primary"}`}
            style={INDEPENDENCE_DAY_ACTIVE ? undefined : { boxShadow: plan.id === "premium" ? "0 4px 20px -5px rgba(245,158,11,0.4)" : undefined }}
          >
            {loading ? "..." : `${plan.cta} — ₹${plan.price}`}
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
