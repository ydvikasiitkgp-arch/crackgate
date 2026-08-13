"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/contact";
import { useCart } from "@/hooks/use-cart";
import PromoCodeBox, { type PromoResult } from "@/components/promo-code-box";
import {
  Loader2,
  CreditCard,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";

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

type Props = {
  items: CartItem[];
  totalPaise: number;
  rawTotalPaise: number;
  comboSavingsPaise: number;
  comboDiscounts: ComboDiscount[];
  promoResult: PromoResult | null;
  onPromoChange: (promo: PromoResult | null) => void;
  defaultName?: string;
  defaultPhone?: string;
  defaultEmail?: string;
};

const APPS = ["PhonePe", "GPay", "Paytm", "BHIM", "Other"] as const;

export default function CheckoutForm({
  items,
  totalPaise,
  rawTotalPaise,
  comboSavingsPaise,
  comboDiscounts,
  promoResult,
  onPromoChange,
  defaultName = "",
  defaultPhone = "",
  defaultEmail = "",
}: Props) {
  const router = useRouter();
  const { refetch } = useCart();
  const [payerName, setPayerName] = useState(defaultName);
  const [payerPhone, setPayerPhone] = useState(defaultPhone);
  const [payerEmail, setPayerEmail] = useState(defaultEmail);
  const [upiApp, setUpiApp] = useState<(typeof APPS)[number]>("PhonePe");
  const [payerNote, setPayerNote] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const promoDiscountPaise = promoResult?.discountPaise ?? 0;
  const finalTotalPaise = totalPaise - promoDiscountPaise;
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
          referralSource: referralSource.trim() || undefined,
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
      try {
        await fetch("/api/cart/clear", { method: "POST" });
        localStorage.removeItem("cg_cart");
        refetch();
      } catch {
        // best-effort cleanup; payment is already recorded
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-8">
        {/* Checkmark with gradient ring */}
        <div className="relative mx-auto w-24 h-24">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 animate-[cg-success-pulse_2s_ease-out_1]" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 opacity-40 blur-xl animate-[cg-success-pulse_2s_ease-out_1]" />
          <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-emerald-500/30">
            <svg
              viewBox="0 0 24 24"
              className="h-12 w-12 text-white"
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
        </div>

        <h3 className="mt-6 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
          Payment submitted!
        </h3>
        <p className="mt-3 text-sm text-muted max-w-sm mx-auto leading-relaxed">
          Thanks, <b className="text-ink">{payerName.trim() || "there"}</b> —
          we&apos;ve received your payment of{" "}
          <b className="text-ink">₹{finalAmountRupees}</b> for {items.length}{" "}
          mock{items.length > 1 ? "s" : ""}.
        </p>
        <p className="mt-1.5 text-sm text-muted max-w-sm mx-auto leading-relaxed">
          We&apos;ll verify against our UPI app and unlock your access within a
          few hours. You&apos;ll get a{" "}
          <b className="text-ink">WhatsApp confirmation</b>.
        </p>

        {/* What happens next */}
        <div className="mt-7 max-w-sm mx-auto text-left rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-b from-emerald-50/80 to-transparent dark:from-emerald-900/20 dark:to-transparent p-5 space-y-3.5">
          <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
            What happens next
          </p>
          {[
            "We verify your UPI payment (usually within 1-2 hours)",
            "Your mock access is unlocked and you&apos;re notified on WhatsApp",
            "Start attempting mocks from your dashboard",
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-3 text-xs text-muted">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold shrink-0 mt-0.5">
                {i + 1}
              </div>
              <span
                className="leading-relaxed"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-col gap-2.5 max-w-xs mx-auto">
          <button
            className="cg-shimmer w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            onClick={() => router.push("/")}
          >
            Go to Homepage
          </button>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-line bg-surface px-6 py-3 text-sm font-semibold text-ink hover:bg-canvas transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-500" />
            Any questions? Chat with us
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-5 text-sm">
      {/* Final price summary — only when discounts */}
      {(comboSavingsPaise > 0 || promoDiscountPaise > 0) && (
        <div className="rounded-xl border border-ok/30 bg-ok/5 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>Subtotal ({items.length} items)</span>
            <span className="tabular-nums">
              ₹{Math.round(rawTotalPaise / 100)}
            </span>
          </div>
          {comboSavingsPaise > 0 && (
            <div className="flex items-center justify-between text-xs text-ok font-medium">
              <span>{comboDiscounts[0]?.label ?? "Combo discount"}</span>
              <span className="tabular-nums">
                -₹{Math.round(comboSavingsPaise / 100)}
              </span>
            </div>
          )}
          {promoDiscountPaise > 0 && (
            <div className="flex items-center justify-between text-xs text-ok font-medium">
              <span>{promoResult!.label}</span>
              <span className="tabular-nums">
                -₹{Math.round(promoDiscountPaise / 100)}
              </span>
            </div>
          )}
          <div className="border-t border-ok/20 pt-1.5 flex items-center justify-between">
            <span className="text-sm font-bold text-ink flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand" />
              You pay
            </span>
            <span className="text-lg font-extrabold text-ink tabular-nums">
              ₹{finalAmountRupees}
            </span>
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-4">
        <div>
          <label
            htmlFor="payerName"
            className="block text-xs font-semibold text-muted"
          >
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
          <label
            htmlFor="payerPhone"
            className="block text-xs font-semibold text-muted"
          >
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
            We use this to send your access confirmation on WhatsApp.
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
            htmlFor="app"
            className="block text-xs font-semibold text-muted"
          >
            Which app did you pay from?
          </label>
          <select
            id="app"
            value={upiApp}
            onChange={(e) =>
              setUpiApp(e.target.value as (typeof APPS)[number])
            }
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
          <label
            htmlFor="note"
            className="block text-xs font-semibold text-muted"
          >
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

        <div>
          <label
            htmlFor="referralSource"
            className="block text-xs font-semibold text-muted"
          >
            How did you hear about us? (optional)
          </label>
          <textarea
            id="referralSource"
            rows={2}
            maxLength={120}
            value={referralSource}
            onChange={(e) => setReferralSource(e.target.value)}
            placeholder="e.g. friend, WhatsApp, Instagram, YouTube, LinkedIn"
            className="input w-full mt-1"
          />
        </div>
      </div>

      {/* Promo code */}
      <PromoCodeBox
        subtotalPaise={totalPaise}
        value={promoResult}
        onChange={onPromoChange}
      />

      {error && (
        <div className="text-xs text-err bg-err/10 border border-err/20 px-3 py-2.5 rounded-lg">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || !formValid}
        className="cg-shimmer w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-indigo-600 disabled:hover:to-violet-600 flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Submitting…
          </>
        ) : (
          <>
            <CreditCard className="w-5 h-5" />
            Submit payment details (₹{finalAmountRupees})
          </>
        )}
      </button>

      {/* Trust strip */}
      <div className="flex items-center justify-center gap-3 text-[11px] text-muted">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-ok" />
          Secure
        </span>
        <span className="text-line">·</span>
        <span>Submit only after payment succeeds</span>
        <span className="text-line">·</span>
        <span>Unlocks within hours</span>
      </div>
    </form>
  );
}
