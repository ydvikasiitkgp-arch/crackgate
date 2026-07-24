import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { whatsappLink } from "@/lib/contact";
import { subjectPrice, subjectLabel } from "@/data/catalog";
import { calculateComboDiscounts } from "@/lib/combos";
import CheckoutForm from "./form";
import {
  Shield,
  Clock,
  RotateCcw,
  MessageCircle,
  Package,
  Sparkles,
  Zap,
  Users,
  TrendingUp,
  Lock,
} from "lucide-react";

export const dynamic = "force-dynamic";

type CartItem = {
  id: string;
  exam: string;
  subject: string;
  plan: string;
  label: string;
  pricePaise: number;
};

export default async function CheckoutPage() {
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
    redirect("/pricing");
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
  const amountRupees = Math.round(totalPaise / 100);

  let me = null;
  let myClaims: {
    id: string;
    plan: string;
    amountPaise: number;
    status: "pending" | "approved" | "rejected";
    adminNote: string | null;
    createdAt: Date;
  }[] = [];

  try {
    [me, myClaims] = await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, phone: true },
      }),
      db.upiPayment.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          plan: true,
          amountPaise: true,
          status: true,
          adminNote: true,
          createdAt: true,
        },
      }),
    ]);
  } catch (e) {
    console.error("[checkout] user/payment lookup failed:", e);
  }

  const vpa = process.env.NEXT_PUBLIC_UPI_VPA || "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "CrackGate";

  const note = `cg-cart-${session.user.id.slice(0, 8)}`;
  const upiUrl = vpa
    ? `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountRupees}&cu=INR&tn=${encodeURIComponent(note)}`
    : "";

  let qrSvg = "";
  if (upiUrl) {
    try {
      qrSvg = await QRCode.toString(upiUrl, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 1,
        width: 256,
      });
    } catch (e) {
      console.error("[checkout] QRCode generation failed:", e);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-5 py-8 pb-32 lg:pb-8">
      {/* Urgency banner */}
      <div className="mb-6 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 px-4 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm">
        <span className="inline-flex items-center gap-1.5 text-amber-700 dark:text-amber-300 font-semibold">
          <Zap className="w-3.5 h-3.5" />
          Limited offer — save {comboSavingsPaise > 0 ? `₹${Math.round(comboSavingsPaise / 100)}` : "with combo"}
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <Users className="w-3.5 h-3.5" />
          23 students enrolled this week
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted">
          <TrendingUp className="w-3.5 h-3.5" />
          Best price — won&apos;t get lower
        </span>
      </div>

      {/* Header with savings callout */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold text-ink">Secure Checkout</h1>
          <div className="flex items-center gap-1.5 rounded-full bg-ok/10 px-3 py-1 text-xs font-bold text-ok">
            <Lock className="w-3 h-3" />
            Encrypted
          </div>
        </div>
        <p className="text-sm text-muted mt-1">
          Pay once via UPI — get access to all {items.length} mock{items.length > 1 ? "s" : ""} instantly after verification.
        </p>
        {comboSavingsPaise > 0 && (
          <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-ok/10 border border-ok/30 px-3 py-2">
            <Sparkles className="w-4 h-4 text-ok" />
            <span className="text-sm font-bold text-ok">
              You&apos;re saving ₹{Math.round(comboSavingsPaise / 100)} with the combo discount!
            </span>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Left: Payment — 3 cols */}
        <div className="lg:col-span-3 space-y-5">
          {vpa ? (
            <>
              {/* Step 1: Scan */}
              <div className="card p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white text-sm font-bold shadow-sm">
                    1
                  </div>
                  <div>
                    <h2 className="font-bold text-ink">Scan & pay</h2>
                    <p className="text-xs text-muted">Open any UPI app and scan</p>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-2xl font-extrabold text-ink tabular-nums">
                      ₹{amountRupees}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className="bg-white p-3 rounded-xl w-full max-w-[200px] [&>svg]:w-full [&>svg]:h-auto shadow-sm border border-line"
                      dangerouslySetInnerHTML={{ __html: qrSvg }}
                    />
                    <p className="text-[11px] text-muted mt-2">Scan with any UPI app</p>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="rounded-lg bg-surface px-3 py-2">
                      <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
                        UPI ID
                      </p>
                      <p className="font-mono text-sm font-semibold select-all mt-0.5">
                        {vpa}
                      </p>
                    </div>
                    <div className="rounded-lg bg-surface px-3 py-2">
                      <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
                        Reference note
                      </p>
                      <p className="font-mono text-xs text-muted break-all mt-0.5">
                        {note}
                      </p>
                    </div>
                    <p className="text-[11px] text-muted leading-relaxed">
                      Enter this note in the UPI app so we can match your payment. Pay the exact amount.
                    </p>
                  </div>
                </div>

                {/* Mobile UPI buttons */}
                <div className="mt-5 sm:hidden">
                  <p className="text-xs font-semibold text-muted mb-2">
                    Quick pay with
                  </p>
                  <div className="flex gap-2">
                    <a
                      href={upiUrl}
                      className="flex-1 rounded-lg bg-[#5f259f] px-3 py-2.5 text-center text-xs font-bold text-white hover:brightness-110 transition"
                    >
                      PhonePe
                    </a>
                    <a
                      href={upiUrl}
                      className="flex-1 rounded-lg bg-[#1a73e8] px-3 py-2.5 text-center text-xs font-bold text-white hover:brightness-110 transition"
                    >
                      GPay
                    </a>
                    <a
                      href={upiUrl}
                      className="flex-1 rounded-lg bg-[#00b9f5] px-3 py-2.5 text-center text-xs font-bold text-white hover:brightness-110 transition"
                    >
                      Paytm
                    </a>
                  </div>
                </div>

                {/* How it works */}
                <div className="mt-5 rounded-lg bg-canvas border border-line p-3">
                  <ol className="text-xs text-muted list-decimal pl-4 space-y-1.5">
                    <li>
                      Open your UPI app and scan the QR code (or copy the UPI ID).
                    </li>
                    <li>
                      Pay the <b>exact</b> amount — ₹{amountRupees}.
                    </li>
                    <li>
                      Wait for the <b>success</b> screen in your UPI app.
                    </li>
                    <li>Fill in your details below and submit.</li>
                  </ol>
                </div>
              </div>

              {/* Step 2: Confirm */}
              <div className="card p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-1">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand text-white text-sm font-bold shadow-sm">
                    2
                  </div>
                  <div>
                    <h2 className="font-bold text-ink">Confirm payment</h2>
                    <p className="text-xs text-muted">
                      Tell us which app you used and your details
                    </p>
                  </div>
                </div>
                <CheckoutForm
                  items={items}
                  amountRupees={amountRupees}
                  rawTotalPaise={rawTotalPaise}
                  comboSavingsPaise={comboSavingsPaise}
                  comboDiscounts={comboDiscounts}
                  defaultPhone={me?.phone ?? ""}
                  defaultName={me?.name ?? ""}
                  defaultEmail={me?.email ?? ""}
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
            {/* Savings hero */}
            {comboSavingsPaise > 0 && (
              <div className="rounded-xl border-2 border-ok/40 bg-gradient-to-br from-ok/5 to-ok/10 p-4 text-center">
                <p className="text-xs font-semibold text-ok uppercase tracking-wider">
                  Combo savings applied
                </p>
                <p className="mt-1 text-3xl font-extrabold text-ok tabular-nums">
                  ₹{Math.round(comboSavingsPaise / 100)}
                </p>
                <p className="text-xs text-ok/70 mt-0.5">
                  {comboDiscounts[0]?.label ?? "WCL + NCL Combo — 15% off"}
                </p>
              </div>
            )}

            {/* Items */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-muted" />
                <h2 className="font-bold text-sm text-ink">Order Summary</h2>
                <span className="ml-auto text-xs text-muted">
                  {items.length} item{items.length > 1 ? "s" : ""}
                </span>
              </div>

              <div className="divide-y divide-line">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0"
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
              </div>

              {/* Total */}
              <div className="mt-3 pt-3 border-t border-line space-y-1">
                {comboSavingsPaise > 0 && (
                  <div className="flex items-center justify-between text-sm text-muted">
                    <span>Subtotal</span>
                    <span className="line-through tabular-nums">
                      ₹{Math.round(rawTotalPaise / 100)}
                    </span>
                  </div>
                )}
                {comboSavingsPaise > 0 && (
                  <div className="flex items-center justify-between text-sm text-ok font-medium">
                    <span>Combo discount</span>
                    <span className="tabular-nums">
                      -₹{Math.round(comboSavingsPaise / 100)}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-line">
                  <span className="text-sm font-bold text-ink">You pay</span>
                  <span className="text-xl font-extrabold text-ink tabular-nums">
                    ₹{amountRupees}
                  </span>
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="card p-4">
              <h3 className="text-xs font-bold text-ink mb-3 uppercase tracking-wider">
                Why CrackGate?
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3 text-xs text-muted">
                  <Clock className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>
                    Access unlocks <b>within a few hours</b> of payment verification
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-muted">
                  <Shield className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>
                    Pay directly via UPI — we <b>never</b> see your bank details
                  </span>
                </div>
                <div className="flex items-start gap-3 text-xs text-muted">
                  <RotateCcw className="w-4 h-4 text-brand shrink-0 mt-0.5" />
                  <span>
                    Covered by our{" "}
                    <a href="/refund" className="text-brand hover:underline font-medium">
                      refund policy
                    </a>
                  </span>
                </div>
              </div>
            </div>

            {/* WhatsApp help */}
            <a
              href={whatsappLink(
                `Hi! I need help with my cart checkout (₹${amountRupees}) UPI payment.`,
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="card p-4 flex items-center gap-3 hover:border-brand/30 transition cursor-pointer group"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-brand/10 group-hover:bg-brand/15 transition">
                <MessageCircle className="w-5 h-5 text-brand" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Need help?</p>
                <p className="text-xs text-muted">
                  Chat with us on WhatsApp — we reply fast
                </p>
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Recent claims */}
      {myClaims.length > 0 && (
        <div className="card p-6 mt-10">
          <h2 className="font-bold text-lg">Your recent claims</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted">
                <tr className="text-left">
                  <th className="py-2 pr-3">When</th>
                  <th className="py-2 pr-3">Plan</th>
                  <th className="py-2 pr-3">Amount</th>
                  <th className="py-2 pr-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {myClaims.map((c) => (
                  <tr key={c.id} className="border-t border-border/60">
                    <td className="py-2 pr-3">
                      {c.createdAt
                        .toISOString()
                        .slice(0, 16)
                        .replace("T", " ")}
                    </td>
                    <td className="py-2 pr-3">{c.plan}</td>
                    <td className="py-2 pr-3">
                      ₹{Math.round(c.amountPaise / 100)}
                    </td>
                    <td className="py-2 pr-3">
                      <StatusPill status={c.status} note={c.adminNote} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden border-t border-line bg-paper/95 backdrop-blur-md px-5 py-3 z-50">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-muted">Total</p>
            <p className="text-xl font-extrabold text-ink tabular-nums">
              ₹{amountRupees}
            </p>
          </div>
          <a
            href="#payerName"
            className="rounded-xl bg-gradient-to-r from-brand to-brand-dark px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:brightness-110"
          >
            Pay ₹{amountRupees} →
          </a>
        </div>
      </div>
    </div>
  );
}

function StatusPill({
  status,
  note,
}: {
  status: "pending" | "approved" | "rejected";
  note?: string | null;
}) {
  const cls =
    status === "approved"
      ? "bg-ok/15 text-ok"
      : status === "rejected"
        ? "bg-err/15 text-err"
        : "bg-warn/15 text-warn";
  return (
    <span className="inline-flex flex-col">
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
        {status}
      </span>
      {status === "rejected" && note && (
        <span className="text-[10px] text-muted mt-1">{note}</span>
      )}
    </span>
  );
}
