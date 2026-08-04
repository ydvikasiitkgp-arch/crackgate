"use client";

import { useEffect, useState } from "react";
import {
  Check,
  Clock,
  Lock,
  MessageCircle,
  Package,
  RotateCcw,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import CheckoutForm from "./form";
import CopyCard from "./copy-card";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/contact";
import type { PromoResult } from "@/components/promo-code-box";
import type { CartComboDiscount } from "@/lib/combos";

type CartItem = {
  id: string;
  exam: string;
  subject: string;
  plan: string;
  label: string;
  pricePaise: number;
};

type Props = {
  items: CartItem[];
  totalPaise: number;
  rawTotalPaise: number;
  comboSavingsPaise: number;
  comboDiscounts: CartComboDiscount[];
  initialPromo: PromoResult | null;
  vpa: string;
  payeeName: string;
  note: string;
  defaultName: string;
  defaultPhone: string;
  defaultEmail: string;
};

export default function CheckoutClient({
  items,
  totalPaise,
  rawTotalPaise,
  comboSavingsPaise,
  comboDiscounts,
  initialPromo,
  vpa,
  payeeName,
  note,
  defaultName,
  defaultPhone,
  defaultEmail,
}: Props) {
  const [promoResult, setPromoResult] = useState<PromoResult | null>(initialPromo);
  const [qrSvg, setQrSvg] = useState("");

  const promoDiscountPaise = promoResult?.discountPaise ?? 0;
  const qrAmountRupees = Math.round((totalPaise - promoDiscountPaise) / 100);
  const upiUrl = vpa
    ? `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${qrAmountRupees}&cu=INR&tn=${encodeURIComponent(note)}`
    : "";

  useEffect(() => {
    let cancelled = false;
    if (!upiUrl) return;
    (async () => {
      try {
        const QRCode = (await import("qrcode")).default;
        const svg = await QRCode.toString(upiUrl, {
          type: "svg",
          errorCorrectionLevel: "M",
          margin: 1,
          width: 288,
        });
        if (!cancelled) setQrSvg(svg);
      } catch {
        // ponytail: amount text still shown without QR
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [upiUrl]);

  const totalSavingsPaise = comboSavingsPaise + promoDiscountPaise;

  return (
    <div className="grid lg:grid-cols-5 gap-8">
      {/* Left: Payment — 3 cols */}
      <div className="lg:col-span-3 space-y-5">
        {vpa ? (
          <>
            {/* Step 1: Scan QR — hero */}
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-ok text-white text-sm font-bold">
                  <Check className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-ink">Scan & pay</h2>
                  <p className="text-xs text-muted">
                    Open any UPI app and scan
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-extrabold text-ink tabular-nums">
                    ₹{qrAmountRupees}
                  </p>
                  {totalSavingsPaise > 0 && (
                    <p className="text-xs text-ok font-semibold">
                      Save ₹{Math.round(totalSavingsPaise / 100)}
                    </p>
                  )}
                </div>
              </div>

              {/* QR — centered hero */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-2xl bg-brand/10 blur-xl scale-110" />
                  <div
                    className="relative bg-white p-4 rounded-2xl w-full max-w-[260px] [&>svg]:w-full [&>svg]:h-auto shadow-md border border-line"
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                  />
                </div>
                <p className="text-xs text-muted mt-3 font-medium">
                  Scan with any UPI app
                </p>
              </div>

              {/* Copy cards */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <CopyCard label="UPI ID" value={vpa} />
                <CopyCard label="Reference note" value={note} />
              </div>
              <p className="text-[11px] text-muted mt-2 text-center">
                Enter the reference note in your UPI app so we can match your
                payment. Pay the exact amount.
              </p>

              {/* Mobile UPI buttons */}
              <div className="mt-5 sm:hidden">
                <div className="flex gap-2">
                  <a
                    href={upiUrl}
                    className="flex-1 rounded-lg bg-[#5f259f] px-3 py-3 text-center text-xs font-bold text-white hover:brightness-110 transition"
                  >
                    PhonePe
                  </a>
                  <a
                    href={upiUrl}
                    className="flex-1 rounded-lg bg-[#1a73e8] px-3 py-3 text-center text-xs font-bold text-white hover:brightness-110 transition"
                  >
                    GPay
                  </a>
                  <a
                    href={upiUrl}
                    className="flex-1 rounded-lg bg-[#00b9f5] px-3 py-3 text-center text-xs font-bold text-white hover:brightness-110 transition"
                  >
                    Paytm
                  </a>
                </div>
              </div>
            </div>

            {/* Step 2: Enter details */}
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white text-sm font-bold shadow-sm">
                  2
                </div>
                <div>
                  <h2 className="font-bold text-ink">Enter your details</h2>
                  <p className="text-xs text-muted">
                    We&apos;ll use this to verify your payment and unlock access
                  </p>
                </div>
              </div>
              <CheckoutForm
                items={items}
                totalPaise={totalPaise}
                rawTotalPaise={rawTotalPaise}
                comboSavingsPaise={comboSavingsPaise}
                comboDiscounts={comboDiscounts}
                promoResult={promoResult}
                onPromoChange={setPromoResult}
                defaultPhone={defaultPhone}
                defaultName={defaultName}
                defaultEmail={defaultEmail}
              />
            </div>
          </>
        ) : (
          <div className="card p-5 border-warn text-warn-foreground">
            UPI is not configured. Ask the admin to set{" "}
            <code>NEXT_PUBLIC_UPI_VPA</code>.
          </div>
        )}
      </div>

      {/* Right: Order Summary — 2 cols */}
      <div className="lg:col-span-2">
        <div className="sticky top-24 space-y-4">
          {/* Order summary with inline savings */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-line bg-surface/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-muted" />
                  <h2 className="font-bold text-sm text-ink">
                    Order Summary
                  </h2>
                </div>
                <span className="text-xs text-muted">
                  {items.length} item{items.length > 1 ? "s" : ""}
                </span>
              </div>
            </div>

            <div className="p-5 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">
                      {item.label}
                    </p>
                    <p className="text-[11px] text-muted capitalize">
                      {item.exam} · {item.plan}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink tabular-nums shrink-0 ml-3">
                    ₹{Math.round(item.pricePaise / 100)}
                  </span>
                </div>
              ))}

              <div className="border-t border-line pt-3 space-y-1.5">
                {comboSavingsPaise > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span>Subtotal</span>
                      <span className="line-through tabular-nums">
                        ₹{Math.round(rawTotalPaise / 100)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-ok font-medium">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Combo discount
                      </span>
                      <span className="tabular-nums">
                        -₹{Math.round(comboSavingsPaise / 100)}
                      </span>
                    </div>
                  </>
                )}
                {promoDiscountPaise > 0 && (
                  <div className="flex items-center justify-between text-xs text-ok font-medium">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {promoResult!.label}
                    </span>
                    <span className="tabular-nums">
                      -₹{Math.round(promoDiscountPaise / 100)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 border-t border-line">
                  <span className="text-sm font-bold text-ink">
                    You pay
                  </span>
                  <span className="text-xl font-extrabold text-ink tabular-nums">
                    ₹{qrAmountRupees}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* What you get */}
          <div className="card p-4">
            <h3 className="text-xs font-bold text-ink mb-3 uppercase tracking-wider">
              What you get
            </h3>
            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  icon: <Zap className="w-4 h-4 text-brand" />,
                  text: "All mocks + practice questions",
                },
                {
                  icon: <Shield className="w-4 h-4 text-brand" />,
                  text: "SWOT analytics dashboard",
                },
                {
                  icon: <MessageCircle className="w-4 h-4 text-brand" />,
                  text: "WhatsApp support",
                },
              ].map((item) => (
                <div
                  key={item.text}
                  className="flex items-center gap-2.5 text-xs text-muted"
                >
                  {item.icon}
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-line flex items-center gap-2 text-[11px] text-muted">
              <Clock className="w-3.5 h-3.5 shrink-0" />
              <span>
                Unlocks <b>within hours</b> of payment verification
              </span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>
                Covered by our{" "}
                <a
                  href="/refund"
                  className="text-brand hover:underline font-medium"
                >
                  refund policy
                </a>
              </span>
            </div>
          </div>

          {/* WhatsApp help — compact */}
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="card p-3 flex items-center gap-3 hover:border-brand/30 transition cursor-pointer group"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand/10 group-hover:bg-brand/15 transition shrink-0">
              <MessageCircle className="w-4 h-4 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ink">Need help?</p>
              <p className="text-[11px] text-muted truncate">
                Chat with us on WhatsApp
              </p>
            </div>
          </a>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-line bg-paper/95 backdrop-blur-md px-5 py-3 z-50 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center justify-between gap-4">
          <div>
            {totalSavingsPaise > 0 && (
              <p className="text-xs text-ok font-semibold">
                Save ₹{Math.round(totalSavingsPaise / 100)}
              </p>
            )}
            <p className="text-xl font-extrabold text-ink tabular-nums">
              ₹{qrAmountRupees}
            </p>
          </div>
          <a
            href="#payerName"
            className="cg-shimmer rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-500 hover:to-violet-500"
          >
            Continue →
          </a>
        </div>
      </div>
    </div>
  );
}
