"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { whatsappLink } from "@/lib/contact";
import { Tag, Check, Loader2, X } from "lucide-react";

type CartItem = {
  id: string;
  exam: string;
  subject: string;
  plan: string;
  label: string;
  pricePaise: number;
};

type ComboDiscount = {
  label: string;
  originalTotalPaise: number;
  discountedTotalPaise: number;
  savingsPaise: number;
};

type PromoResult = {
  code: string;
  discountPaise: number;
  label: string;
  type: string;
  value: number;
};

type Props = {
  items: CartItem[];
  amountRupees: number;
  rawTotalPaise: number;
  comboSavingsPaise: number;
  comboDiscounts: ComboDiscount[];
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
};

const APPS = ["PhonePe", "GPay", "Paytm", "BHIM", "Other"] as const;

export default function CheckoutForm({
  items,
  amountRupees,
  rawTotalPaise,
  comboSavingsPaise,
  comboDiscounts,
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
}: Props) {
  const router = useRouter();
  const [payerName, setPayerName] = useState(defaultName);
  const [payerPhone, setPayerPhone] = useState(defaultPhone);
  const [payerEmail, setPayerEmail] = useState(defaultEmail);
  const [upiApp, setUpiApp] = useState<(typeof APPS)[number]>("PhonePe");
  const [payerNote, setPayerNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Promo code state
  const [promoInput, setPromoInput] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoResult, setPromoResult] = useState<PromoResult | null>(null);

  async function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError(null);
    try {
      const r = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, subtotalPaise: amountRupees * 100 }),
      });
      const data = await r.json();
      if (!r.ok) {
        setPromoError(data.error ?? "Invalid code");
        setPromoResult(null);
      } else {
        setPromoResult(data);
        setPromoError(null);
      }
    } catch {
      setPromoError("Failed to verify code");
    } finally {
      setPromoLoading(false);
    }
  }

  function removePromo() {
    setPromoResult(null);
    setPromoInput("");
    setPromoError(null);
  }

  const promoDiscountPaise = promoResult?.discountPaise ?? 0;
  const finalTotalPaise = amountRupees * 100 - promoDiscountPaise;
  const finalAmountRupees = Math.round(finalTotalPaise / 100);

  const phoneDigits = payerPhone.replace(/[^\d]/g, "");
  const formValid =
    payerName.trim().length >= 2 &&
    phoneDigits.length >= 10 &&
    /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payerEmail.trim());

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payloadItems = items.map((i) => ({
        exam: i.exam,
        subject: i.subject,
        plan: i.plan,
        pricePaise: i.pricePaise,
      }));

      const r = await fetch("/api/pay/upi/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          items: payloadItems,
          payerName: payerName.trim(),
          payerPhone: payerPhone.trim(),
          payerEmail: payerEmail.trim(),
          upiApp,
          payerNote: payerNote.trim() || undefined,
          promoCode: promoResult?.code,
          promoDiscountPaise: promoDiscountPaise || undefined,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 401) {
        router.push("/login?next=/pay/checkout");
        return;
      }
      if (!r.ok) {
        throw new Error(data?.message ?? data?.error ?? `HTTP ${r.status}`);
      }
      setDone(true);
      await fetch("/api/cart/clear", { method: "POST" });
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
          <svg viewBox="0 0 24 24" className="h-9 w-9 text-ok" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="mt-4 text-xl font-extrabold text-ok">Payment submitted!</h3>
        <p className="mt-2 text-sm text-muted">
          Thanks, <b>{payerName.trim() || "there"}</b> — we&apos;ve received your cart payment of <b>₹{finalAmountRupees}</b> for {items.length} item{items.length > 1 ? "s" : ""}.
        </p>
        <p className="mt-2 text-sm text-muted">
          We verify against our UPI app and unlock your access within a few hours. You&apos;ll get a WhatsApp confirmation.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          <button className="btn btn-primary w-full" onClick={() => router.push("/dashboard")}>
            Back to dashboard
          </button>
          <a
            href={whatsappLink(`Hi! I just submitted my cart UPI payment (₹${finalAmountRupees}, ${items.length} items). My phone: ${payerPhone.trim()}`)}
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
      {/* Promo code */}
      <div className="rounded-xl border border-line bg-canvas p-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-muted mb-2">
          <Tag className="w-3.5 h-3.5" />
          Have a promo code?
        </div>
        {promoResult ? (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-ok/10 border border-ok/30 px-3 py-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-ok">
              <Check className="w-4 h-4" />
              {promoResult.label}
            </div>
            <button type="button" onClick={removePromo} className="text-muted hover:text-err transition">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              placeholder="e.g. FIRST10"
              className="input flex-1 text-sm uppercase tracking-wider"
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyPromo(); } }}
            />
            <button
              type="button"
              onClick={applyPromo}
              disabled={promoLoading || !promoInput.trim()}
              className="btn btn-ghost text-sm px-3 shrink-0"
            >
              {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
            </button>
          </div>
        )}
        {promoError && <p className="text-xs text-err mt-1.5">{promoError}</p>}
      </div>

      {/* Final price summary */}
      {(comboSavingsPaise > 0 || promoDiscountPaise > 0) && (
        <div className="rounded-xl border border-line bg-canvas p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Subtotal ({items.length} items)</span>
            <span className="tabular-nums">₹{Math.round(rawTotalPaise / 100)}</span>
          </div>
          {comboSavingsPaise > 0 && (
            <div className="flex items-center justify-between text-xs text-ok font-medium">
              <span>{comboDiscounts[0]?.label ?? "Combo discount"}</span>
              <span className="tabular-nums">-₹{Math.round(comboSavingsPaise / 100)}</span>
            </div>
          )}
          {promoDiscountPaise > 0 && (
            <div className="flex items-center justify-between text-xs text-ok font-medium">
              <span>{promoResult!.label}</span>
              <span className="tabular-nums">-₹{Math.round(promoDiscountPaise / 100)}</span>
            </div>
          )}
          <div className="border-t border-line pt-1.5 flex items-center justify-between">
            <span className="text-sm font-bold text-ink">You pay</span>
            <span className="text-lg font-extrabold text-ink tabular-nums">₹{finalAmountRupees}</span>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="payerName" className="block text-xs font-semibold text-muted">
          Full name <span className="text-err">*</span>
        </label>
        <input
          id="payerName"
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
        <label htmlFor="payerPhone" className="block text-xs font-semibold text-muted">
          Phone number <span className="text-err">*</span>
        </label>
        <input
          id="payerPhone"
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
        <label htmlFor="payerEmail" className="block text-xs font-semibold text-muted">
          Email <span className="text-err">*</span>
        </label>
        <input
          id="payerEmail"
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
            <option key={a} value={a}>{a}</option>
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
        <div className="text-xs text-err bg-err/10 px-3 py-2 rounded">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading || !formValid}
        className="btn btn-primary w-full"
      >
        {loading ? "Submitting…" : `I've paid — submit (₹${finalAmountRupees})`}
      </button>
      <p className="text-[11px] text-muted text-center">
        Submit only after the ₹{finalAmountRupees} payment succeeds in your UPI app.
      </p>
    </form>
  );
}
