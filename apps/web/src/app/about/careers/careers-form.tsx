"use client";

import { useState } from "react";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const ROLES = [
  "Questions Evaluator",
  "Marketing & Sales",
  "Content Creator",
  "Other",
] as const;

export default function CareersForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<(typeof ROLES)[number]>("Questions Evaluator");
  const [message, setMessage] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const phoneDigits = phone.replace(/[^\d]/g, "");
  const valid =
    name.trim().length >= 2 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phoneDigits.length >= 10;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const r = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role,
          message: message.trim() || undefined,
          portfolio: portfolio.trim() || undefined,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) {
        throw new Error(data?.error ?? `HTTP ${r.status}`);
      }
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="w-14 h-14 text-ok mx-auto" />
        <h3 className="mt-4 text-xl font-extrabold text-ink">
          Application submitted!
        </h3>
        <p className="mt-2 text-sm text-muted max-w-sm mx-auto">
          Thanks, <b className="text-ink">{name.trim()}</b> — we&apos;ll review
          your application and get back to you within 3-5 days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card p-6 sm:p-8 space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="c-name" className="block text-xs font-semibold text-muted">
            Full name <span className="text-err">*</span>
          </label>
          <input
            id="c-name"
            required
            autoComplete="name"
            minLength={2}
            maxLength={80}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
            className="input w-full mt-1"
          />
        </div>
        <div>
          <label htmlFor="c-phone" className="block text-xs font-semibold text-muted">
            Phone <span className="text-err">*</span>
          </label>
          <input
            id="c-phone"
            required
            type="tel"
            autoComplete="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit mobile number"
            className="input w-full mt-1"
          />
        </div>
      </div>

      <div>
        <label htmlFor="c-email" className="block text-xs font-semibold text-muted">
          Email <span className="text-err">*</span>
        </label>
        <input
          id="c-email"
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input w-full mt-1"
        />
      </div>

      <div>
        <label htmlFor="c-role" className="block text-xs font-semibold text-muted">
          Role you&apos;re applying for <span className="text-err">*</span>
        </label>
        <select
          id="c-role"
          value={role}
          onChange={(e) => setRole(e.target.value as (typeof ROLES)[number])}
          className="input w-full mt-1"
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="c-message" className="block text-xs font-semibold text-muted">
          Why do you want to join CrackGate? <span className="text-muted">(optional)</span>
        </label>
        <textarea
          id="c-message"
          rows={3}
          maxLength={500}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us about yourself and why you're interested..."
          className="input w-full mt-1"
        />
      </div>

      <div>
        <label htmlFor="c-portfolio" className="block text-xs font-semibold text-muted">
          LinkedIn / Portfolio URL <span className="text-muted">(optional)</span>
        </label>
        <input
          id="c-portfolio"
          type="url"
          value={portfolio}
          onChange={(e) => setPortfolio(e.target.value)}
          placeholder="https://linkedin.com/in/yourname"
          className="input w-full mt-1"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs text-err bg-err/10 border border-err/20 px-3 py-2.5 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !valid}
        className="cg-shimmer w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit Application"
        )}
      </button>

      <p className="text-[11px] text-muted text-center">
        🔒 Your info is safe with us. We only use it to review your application.
      </p>
    </form>
  );
}
