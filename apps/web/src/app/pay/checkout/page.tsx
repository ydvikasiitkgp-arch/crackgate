import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subjectPrice, subjectLabel } from "@/data/catalog";
import { calculateComboDiscounts } from "@/lib/combos";
import CheckoutClient from "./checkout-client";
import EmptyCart from "./empty-cart";
import { Sparkles, Lock, Check } from "lucide-react";

export const dynamic = "force-dynamic";

type CartItem = {
  id: string;
  exam: string;
  subject: string;
  plan: string;
  label: string;
  pricePaise: number;
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ promo?: string }>;
}) {
  let session;
  try {
    session = await auth();
  } catch (e) {
    console.error("[checkout] auth() failed:", e);
    redirect("/login?next=/pay/checkout");
  }

  if (!session?.user?.id) {
    redirect("/login?next=/pay/checkout");
  }

  let raw;
  try {
    raw = await db.cart.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "asc" },
    });
  } catch (e) {
    console.error("[checkout] db.cart.findMany failed:", e);
    redirect("/cart?error=db");
  }

  if (raw.length === 0) {
    // Don't bounce to /pricing. The cart may live in localStorage (guest add,
    // or auth hadn't resolved when the item was added) — EmptyCart pushes it to
    // db.cart and refreshes so checkout renders with the user's real items.
    return (
      <div className="max-w-5xl mx-auto px-5 py-8 pb-32 lg:pb-8">
        <EmptyCart />
      </div>
    );
  }

  const items: CartItem[] = raw.map((r) => {
    const price = subjectPrice(r.exam, r.subject);
    return {
      id: r.id,
      exam: r.exam,
      subject: r.subject,
      plan: r.plan,
      label: subjectLabel(r.exam, r.subject),
      pricePaise: r.plan === "premium" ? price.premiumPaise : price.proPaise,
    };
  });

  const rawTotalPaise = items.reduce((sum, i) => sum + i.pricePaise, 0);
  const comboDiscounts = calculateComboDiscounts(
    items.map((i) => ({
      exam: i.exam,
      subject: i.subject,
      pricePaise: i.pricePaise,
    })),
  );
  const comboSavingsPaise = comboDiscounts.reduce(
    (sum, d) => sum + d.savingsPaise,
    0,
  );
  const totalPaise = rawTotalPaise - comboSavingsPaise;

  // Validate promo code from ?promo= (read-only; usage is counted at submit)
  let promoDiscountPaise = 0;
  let initialPromo: { code: string; discountPaise: number; label: string; type: string; value: number } | null = null;
  const params = await searchParams;
  const promoCode = params.promo?.trim().toUpperCase();
  if (promoCode) {
    try {
      const promo = await db.promoCode.findUnique({ where: { code: promoCode } });
      if (promo && promo.active && (!promo.expiresAt || promo.expiresAt > new Date()) && (promo.maxUses == null || promo.usedCount < promo.maxUses)) {
        if (promo.type === "percent") {
          promoDiscountPaise = Math.round(totalPaise * (promo.value / 100));
        } else {
          promoDiscountPaise = promo.value;
        }
        promoDiscountPaise = Math.min(promoDiscountPaise, totalPaise);
        const label =
          promo.type === "percent"
            ? `${promo.code} — ${promo.value}% off`
            : `${promo.code} — ₹${Math.round(promo.value / 100)} off`;
        initialPromo = { code: promo.code, discountPaise: promoDiscountPaise, label, type: promo.type, value: promo.value };
      }
    } catch (e) {
      console.error("[checkout] promo validation failed:", e);
    }
  }

  let me = null;
  try {
    me = await db.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, phone: true },
    });
  } catch (e) {
    console.error("[checkout] user lookup failed:", e);
  }

  const vpa = process.env.NEXT_PUBLIC_UPI_VPA || "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "CrackGate";
  const note = `cg-cart-${session.user.id.slice(0, 8)}`;

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 pb-32 lg:pb-8">
      {/* Progress bar */}
      <nav className="mb-8" aria-label="Checkout progress">
        <ol className="flex items-center justify-center gap-0">
          {[
            { label: "Scan QR", done: true },
            { label: "Enter details", done: false },
            { label: "Done", done: false },
          ].map((step, i) => (
            <li key={step.label} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition ${
                    step.done
                      ? "bg-ok text-white"
                      : i === 1
                        ? "bg-brand text-white shadow-sm"
                        : "bg-line text-muted"
                  }`}
                >
                  {step.done ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    i + 1
                  )}
                </div>
                <span
                  className={`text-xs font-semibold hidden sm:inline ${
                    step.done || i === 1 ? "text-ink" : "text-muted"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < 2 && (
                <div className="w-8 sm:w-16 h-0.5 bg-line mx-2 sm:mx-3">
                  <div
                    className={`h-full cg-progress-fill ${
                      step.done ? "bg-ok w-full" : "bg-brand/40 w-0"
                    }`}
                  />
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Savings banner — only when combo active */}
      {comboSavingsPaise > 0 && (
        <div className="mb-6 rounded-xl border border-ok/30 bg-gradient-to-r from-ok/10 via-emerald-500/5 to-ok/10 px-4 py-3 flex items-center justify-center gap-2 text-sm">
          <Sparkles className="w-4 h-4 text-ok" />
          <span className="font-bold text-ok">
            Combo discount applied — you save ₹
            {Math.round(comboSavingsPaise / 100)}
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-ink">Secure Checkout</h1>
          <div className="flex items-center gap-1.5 rounded-full bg-ok/10 border border-ok/30 px-3 py-1 text-xs font-bold text-ok">
            <Lock className="w-3 h-3" />
            Encrypted
          </div>
        </div>
        <p className="text-sm text-muted mt-1">
          Pay once via UPI — unlock everything in your cart instantly after verification.
        </p>
      </div>

      <CheckoutClient
        items={items}
        totalPaise={totalPaise}
        rawTotalPaise={rawTotalPaise}
        comboSavingsPaise={comboSavingsPaise}
        comboDiscounts={comboDiscounts}
        initialPromo={initialPromo}
        vpa={vpa}
        payeeName={payeeName}
        note={note}
        defaultName={me?.name ?? ""}
        defaultPhone={me?.phone ?? ""}
        defaultEmail={me?.email ?? ""}
      />
    </div>
  );
}
