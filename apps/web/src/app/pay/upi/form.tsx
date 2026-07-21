"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { whatsappLink } from "@/lib/contact";

type Props = {
  plan: "pro" | "premium";
  amountRupees: number;
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
  defaultExam?: string;
  /** Canonical subject value submitted/stored (e.g. the discipline slug). */
  defaultSubject?: string;
  /** Friendly label shown when attribution is locked from a deep link. */
  defaultSubjectLabel?: string;
  /** True when purchasing a combo (shows both entitlements). */
  isCombo?: boolean;
  /** Display names for combo entitlements. */
  comboLabels?: string[];
};

const APPS = ["PhonePe", "GPay", "Paytm", "BHIM", "Other"] as const;
const EXAMS = ["GATE", "PSU", "State Level", "Diploma"] as const;

function coerceExam(value: string | undefined): (typeof EXAMS)[number] {
  return (EXAMS as readonly string[]).includes(value ?? "")
    ? (value as (typeof EXAMS)[number])
    : "GATE";
}

export default function UpiClaimForm({
  plan,
  amountRupees,
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
  defaultExam,
  defaultSubject = "",
  defaultSubjectLabel,
  isCombo = false,
  comboLabels = [],
}: Props) {
  const router = useRouter();
  // Attribution is locked when the buyer arrived from a specific product CTA
  // (deep link carried both exam + subject) — they shouldn't have to retype it,
  // and we keep the canonical slug so the access gate matches.
  const locked = Boolean(defaultExam && defaultSubject && defaultSubjectLabel);
  const [payerName, setPayerName] = useState(defaultName);
  const [payerPhone, setPayerPhone] = useState(defaultPhone);
  const [payerEmail, setPayerEmail] = useState(defaultEmail);
  const [examName, setExamName] = useState<(typeof EXAMS)[number]>(coerceExam(defaultExam));
  const [subject, setSubject] = useState(defaultSubject);
  const [upiApp, setUpiApp] = useState<(typeof APPS)[number]>("PhonePe");
  const [payerNote, setPayerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const phoneDigits = payerPhone.replace(/[^\d]/g, "");
  const formValid =
    payerName.trim().length >= 2 &&
    phoneDigits.length >= 10 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payerEmail.trim()) &&
    subject.trim().length >= 2;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/pay/upi/submit", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          plan,
          payerName: payerName.trim(),
          payerPhone: payerPhone.trim(),
          payerEmail: payerEmail.trim(),
          examName,
          subject: subject.trim(),
          upiApp,
          payerNote: payerNote.trim() || undefined,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 401) {
        router.push(`/login?next=/pay/upi?plan=${plan}`);
        return;
      }
      if (!r.ok) {
        throw new Error(data?.message ?? data?.error ?? `HTTP ${r.status}`);
      }
      setDone(true);
      // Refresh to show the new pending claim in the table below.
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-2">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ok/15">
          <svg
            viewBox="0 0 24 24"
            className="h-9 w-9 text-ok"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h3 className="mt-4 text-xl font-extrabold text-ok">
          Payment submitted!
        </h3>
        <p className="mt-2 text-sm text-muted">
          Thanks, <b>{payerName.trim() || "there"}</b> — we&apos;ve received
          your <b className="capitalize">{plan}</b> claim of{" "}
          <b>₹{amountRupees}</b>.
          {isCombo && comboLabels.length > 0 && (
            <span className="block mt-1 text-xs text-muted">
              This unlocks: {comboLabels.join(" + ")}
            </span>
          )}
        </p>
        <p className="mt-2 text-sm text-muted">
          We verify against our UPI app and unlock your access within a few
          hours (usually faster). You&apos;ll get a WhatsApp confirmation and
          the status updates below.
        </p>

        <div className="mt-5 flex flex-col gap-2">
          <button
            className="btn btn-primary w-full"
            onClick={() => router.push("/dashboard")}
          >
            Back to dashboard
          </button>
          <a
            href={whatsappLink(
              `Hi! I just submitted my ${plan} UPI payment (₹${amountRupees}). My phone: ${payerPhone.trim()}`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost w-full text-sm"
          >
            💬 Any questions? Chat with us on WhatsApp
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-2 space-y-4 text-sm">
      <div>
        <label
          htmlFor="payerName"
          className="block text-xs font-semibold text-muted"
        >
          Full name <span className="text-err">*</span>
        </label>
        <input
          id="payerName"
          name="payerName"
          required
          autoComplete="name"
          minLength={2}
          maxLength={80}
          value={payerName}
          onChange={(e) => setPayerName(e.target.value)}
          placeholder="Name you paid with"
          className="input w-full mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="payerPhone"
          className="block text-xs font-semibold text-muted"
        >
          Phone number <span className="text-err">*</span>
        </label>
        <input
          id="payerPhone"
          name="payerPhone"
          required
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          value={payerPhone}
          onChange={(e) => setPayerPhone(e.target.value)}
          placeholder="10-digit mobile number"
          className="input w-full mt-1"
        />
        <p className="text-[11px] text-muted mt-1">
          We use this to confirm your payment and send your access on WhatsApp.
        </p>
      </div>

      <div>
        <label
          htmlFor="payerEmail"
          className="block text-xs font-semibold text-muted"
        >
          Email <span className="text-err">*</span>
        </label>
        <input
          id="payerEmail"
          name="payerEmail"
          required
          type="email"
          autoComplete="email"
          value={payerEmail}
          onChange={(e) => setPayerEmail(e.target.value)}
          placeholder="you@example.com"
          className="input w-full mt-1"
        />
      </div>

      <div>
        <label
          htmlFor="examName"
          className="block text-xs font-semibold text-muted"
        >
          Exam <span className="text-err">*</span>
        </label>
        {locked ? (
          <div className="input w-full mt-1 flex items-center justify-between bg-canvas/60">
            <span className="font-medium text-ink">{examName}</span>
            <span className="text-[11px] text-muted">from your selection</span>
          </div>
        ) : (
          <select
            id="examName"
            value={examName}
            onChange={(e) => setExamName(e.target.value as (typeof EXAMS)[number])}
            className="input w-full mt-1"
          >
            {EXAMS.map((x) => (
              <option key={x} value={x}>
                {x}
              </option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label
          htmlFor="subject"
          className="block text-xs font-semibold text-muted"
        >
          Subject <span className="text-err">*</span>
        </label>
        {locked ? (
          <div className="input w-full mt-1 flex items-center justify-between bg-canvas/60">
            <span className="font-medium text-ink">{defaultSubjectLabel}</span>
            <span className="text-[11px] text-muted">from your selection</span>
          </div>
        ) : (
          <input
            id="subject"
            name="subject"
            required
            minLength={2}
            maxLength={80}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Mining Engineering"
            className="input w-full mt-1"
          />
        )}
      </div>

      <div>
        <label htmlFor="app" className="block text-xs font-semibold text-muted">
          Which app did you pay from?
        </label>
        <select
          id="app"
          value={upiApp}
          onChange={(e) => setUpiApp(e.target.value as (typeof APPS)[number])}
          className="input w-full mt-1"
        >
          {APPS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="note" className="block text-xs font-semibold text-muted">
          Note (optional)
        </label>
        <textarea
          id="note"
          rows={2}
          maxLength={280}
          value={payerNote}
          onChange={(e) => setPayerNote(e.target.value)}
          placeholder="Anything we should know — e.g. paid from a different UPI ID"
          className="input w-full mt-1"
        />
      </div>

      {error && (
        <div className="text-xs text-err bg-err/10 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !formValid}
        className="btn btn-primary w-full"
      >
        {loading ? "Submitting…" : `I've paid — submit for ${plan}`}
      </button>
      <p className="text-[11px] text-muted text-center">
        Submit only after the ₹{amountRupees} payment succeeds in your UPI app.
      </p>
    </form>
  );
}
