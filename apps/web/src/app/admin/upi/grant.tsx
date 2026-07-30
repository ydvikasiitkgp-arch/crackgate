"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CATALOG, subjectPrice } from "@/data/catalog";
import { COMBOS, comboLabel } from "@/lib/combos";

// Flatten combos into a list for the dropdown.
const COMBO_OPTIONS = Object.values(COMBOS).map((c) => ({
  value: c.slug,
  label: c.label,
  price: `₹${Math.round(c.pricePaise / 100)}`,
}));

type Result = {
  user: { email: string; name: string | null };
  plan: string;
  months: number;
  exam: string;
  subject: string;
  expiry: string;
  isTestUser?: boolean;
  isCombo?: boolean;
  comboLabel?: string;
  comboEntitlements?: string[];
};

export default function GrantAccessForm() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [plan, setPlan] = useState<"pro" | "premium">("pro");
  const [months, setMonths] = useState(18);
  const [examIdx, setExamIdx] = useState(0);
  const entry = CATALOG[examIdx];
  const subjects = entry.subjects;
  const [subject, setSubject] = useState<string>(CATALOG[0].subjects[0].slug);
  const [selectedCombo, setSelectedCombo] = useState<string>("");
  const [isTestUser, setIsTestUser] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  const selectedSubject = subjects.find((s) => s.slug === subject);
  const isComboMode = Boolean(selectedCombo);

  const resolvedPrice = useMemo(() => {
    const p = subjectPrice(entry.exam, subject);
    return { pro: `₹${Math.round(p.proPaise / 100)}`, premium: `₹${Math.round(p.premiumPaise / 100)}` };
  }, [entry.exam, subject]);

  function onExamChange(nextIdx: number) {
    setExamIdx(nextIdx);
    setSubject(CATALOG[nextIdx].subjects[0].slug);
  }

  async function submit() {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          plan,
          months,
          exam: isComboMode ? "DIPLOMA" : entry.exam,
          subject: isComboMode ? selectedCombo : subject,
          isTestUser,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(
          data?.message ??
            (typeof data?.error === "string"
              ? data.error
              : "Could not grant access."),
        );
        return;
      }
      setResult(data as Result);
      setIdentifier("");
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card p-5">
      <h2 className="font-bold text-lg">Grant access manually</h2>
      <p className="text-sm text-muted mt-1">
        Flip access for any account by email or phone — for off-platform
        payments, comps or support fixes. Pick the exam &amp; subject the
        access applies to. The user must have signed in once.
      </p>

      {/* Combo selector */}
      <div className="mt-4">
        <label className="block">
          <span className="text-xs text-muted">Or select a combo</span>
          <select
            value={selectedCombo}
            onChange={(e) => {
              setSelectedCombo(e.target.value);
              if (e.target.value) {
                // Auto-set exam and subject from combo
                const combo = COMBOS[e.target.value];
                if (combo) {
                  const idx = CATALOG.findIndex((c) => c.exam === combo.entitlements[0].exam);
                  setExamIdx(idx >= 0 ? idx : 0);
                  setSubject(combo.entitlements[0].subject);
                }
              }
            }}
            className="input mt-1 w-full"
          >
            <option value="">None (single exam)</option>
            {COMBO_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label} — {c.price}
              </option>
            ))}
          </select>
        </label>
        {isComboMode && (
          <p className="text-xs text-accent mt-1">
            This will grant entitlements for: {COMBOS[selectedCombo]?.entitlements.map((e) => `${e.exam} · ${e.subject}`).join(" + ")}
          </p>
        )}
      </div>

      {/* Exam + subject (hidden when combo is selected) */}
      {!isComboMode && (
        <div className="grid sm:grid-cols-2 gap-3 mt-4">
          <label className="block">
            <span className="text-xs text-muted">Exam</span>
            <select
              value={examIdx}
              onChange={(e) => onExamChange(Number(e.target.value))}
              className="input mt-1 w-full"
            >
              {CATALOG.map((e, i) => (
                <option key={e.label} value={i}>
                  {e.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-muted">Subject</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="input mt-1 w-full"
            >
              {subjects.map((s) => (
                <option key={s.slug} value={s.slug}>
                  {s.label}
                  {s.live ? "" : " · soon"}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      {selectedSubject && !selectedSubject.live && (
        <p className="text-xs text-accent mt-2">
          Heads up: <strong>{selectedSubject.label}</strong> isn’t live yet.
          The entitlement will be recorded but content stays locked until the
          track launches.
        </p>
      )}

      <div className="grid sm:grid-cols-[1fr_auto_auto_auto] gap-3 mt-4 items-end">
        <label className="block">
          <span className="text-xs text-muted">Email or phone</span>
          <input
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="name@email.com or 9876543210"
            className="input mt-1 w-full"
          />
        </label>
        <div className="block">
          <span className="text-xs text-muted">Plan</span>
          <div className="mt-1 inline-flex rounded-lg border border-line p-0.5 bg-surface">
            {([
              { value: "pro" as const, label: "Pro", price: resolvedPrice.pro },
              { value: "premium" as const, label: "Premium", price: resolvedPrice.premium },
            ]).map((p) => {
              const active = plan === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setPlan(p.value)}
                  className={`px-3 py-2 rounded-md text-sm font-semibold transition min-w-[120px] ${
                    active
                      ? "bg-ok text-white shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {p.label} <span className={`text-sm ml-1 ${isTestUser ? "line-through text-bad" : "text-ink/70"}`}>· {p.price}</span>
                </button>
              );
            })}
          </div>
        </div>
        <label className="block">
          <span className="text-xs text-muted">Months</span>
          <input
            type="number"
            min={1}
            max={60}
            value={months}
            onChange={(e) => setMonths(Number(e.target.value) || 1)}
            className="input mt-1 w-20"
          />
        </label>
        <button
          onClick={submit}
          disabled={loading || identifier.trim().length < 3}
          className="btn btn-primary"
        >
          {loading ? "Granting…" : "Grant"}
        </button>
      </div>

      <label className="flex items-center gap-2 mt-4 cursor-pointer">
        <input
          type="checkbox"
          checked={isTestUser}
          onChange={(e) => setIsTestUser(e.target.checked)}
          className="accent-brand"
        />
        <span className="text-sm text-muted">
          Is test user — <span className="text-xs">skip payment record (no revenue impact)</span>
        </span>
      </label>

      {error && <p className="text-sm text-err mt-3">{error}</p>}
      {result && (
        <p className="text-sm mt-3">
          <span className={result.isTestUser ? "text-accent" : "text-ok"}>
            {result.isTestUser ? "🧪" : "✓"}
          </span>{" "}
          <span className={result.isTestUser ? "text-accent" : "text-ok"}>
            {result.isTestUser ? "Test grant" : "Granted"}{" "}
            <strong>{result.plan}</strong>
          </span>{" "}
          {result.isCombo ? (
            <>
              <span className="text-ok font-medium">{result.comboLabel}</span>
              {" → "}
              <span className="text-muted">{result.comboEntitlements?.join(" + ")}</span>
            </>
          ) : (
            <>({result.exam} · {result.subject})</>
          )}{" "}
          to {result.user.name ?? result.user.email} for {result.months} months
          (until {result.expiry}).
          {result.isTestUser && (
            <span className="block text-xs text-muted mt-1">
              No payment record created — won't appear in revenue or payments
              table.
            </span>
          )}
        </p>
      )}
    </div>
  );
}
