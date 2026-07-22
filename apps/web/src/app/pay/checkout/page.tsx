import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { whatsappLink } from "@/lib/contact";
import { subjectPrice, subjectLabel } from "@/data/catalog";
import { calculateComboDiscounts } from "@/lib/combos";
import CheckoutForm from "./form";

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
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?next=/pay/checkout");
  }

  // Fetch cart items
  const raw = await db.cart.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  if (raw.length === 0) {
    redirect("/pricing");
  }

  // Enrich with prices and labels
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
  const comboDiscounts = calculateComboDiscounts(items);
  const comboSavingsPaise = comboDiscounts.reduce((sum, d) => sum + d.savingsPaise, 0);
  const totalPaise = rawTotalPaise - comboSavingsPaise;
  const amountRupees = Math.round(totalPaise / 100);

  const [me, myClaims] = await Promise.all([
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

  const vpa = process.env.NEXT_PUBLIC_UPI_VPA || "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "CrackGate";

  // UPI note: use first item's subject for identification
  const note = `cg-cart-${session.user.id.slice(0, 8)}`;
  const upiUrl = vpa
    ? `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(payeeName)}&am=${amountRupees}&cu=INR&tn=${encodeURIComponent(note)}`
    : "";

  const qrSvg = upiUrl
    ? await QRCode.toString(upiUrl, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 1,
        width: 256,
      })
    : "";

  // Serialize items for the client form
  const itemsJson = JSON.stringify(items);

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold">Checkout — {items.length} item{items.length > 1 ? "s" : ""}</h1>
      <p className="text-muted mt-2">
        Single payment for all selected mocks. Manual verification — your access unlocks within a few hours.
      </p>

      {/* Itemized summary */}
      <div className="card p-5 mt-6">
        <h2 className="font-bold text-sm text-muted uppercase tracking-wider">Order Summary</h2>
        <div className="mt-3 divide-y divide-line">
          {items.map((item) => (
            <div key={item.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink truncate">{item.label}</p>
                <p className="text-xs text-muted capitalize">{item.exam} · {item.plan}</p>
              </div>
              <span className="text-sm font-semibold text-ink tabular-nums shrink-0 ml-3">
                ₹{Math.round(item.pricePaise / 100)}
              </span>
            </div>
          ))}
        </div>

        {comboDiscounts.length > 0 && (
          <div className="mt-3 pt-3 border-t border-line">
            <div className="flex items-center justify-between text-sm text-ok font-semibold">
              <span>{comboDiscounts[0].label}</span>
              <span>-₹{Math.round(comboSavingsPaise / 100)}</span>
            </div>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-line flex items-center justify-between">
          {comboSavingsPaise > 0 && (
            <span className="text-sm font-semibold text-muted">
              <span className="line-through">₹{Math.round(rawTotalPaise / 100)}</span>
            </span>
          )}
          {comboSavingsPaise > 0 && <span className="text-sm text-ok font-medium">You save ₹{Math.round(comboSavingsPaise / 100)}</span>}
        </div>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-muted">Total</span>
          <span className="text-xl font-extrabold text-ink">₹{amountRupees}</span>
        </div>
      </div>

      {!vpa && (
        <div className="card p-5 mt-6 border-warn text-warn-foreground">
          UPI is not configured. Ask the admin to set <code>NEXT_PUBLIC_UPI_VPA</code>.
        </div>
      )}

      {vpa && (
        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <div className="card p-6">
            <h2 className="font-bold text-lg">1 · Scan & pay</h2>

            <div
              className="mt-4 bg-white p-3 rounded-md w-full max-w-[280px] [&>svg]:w-full [&>svg]:h-auto"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />

            <div className="mt-4 text-sm">
              <div className="text-muted">UPI ID</div>
              <div className="font-mono text-base font-semibold select-all">{vpa}</div>
            </div>
            <div className="mt-3 text-sm">
              <div className="text-muted">Amount</div>
              <div className="text-2xl font-extrabold">₹{amountRupees}</div>
            </div>
            <div className="mt-3 text-sm">
              <div className="text-muted">Note (auto-filled)</div>
              <div className="font-mono text-xs break-all">{note}</div>
            </div>

            {/* Mobile UPI buttons */}
            <div className="mt-5 md:hidden">
              <p className="text-xs font-semibold text-muted mb-2">Pay with</p>
              <div className="flex gap-2">
                <a href={upiUrl} className="flex-1 rounded-lg bg-[#5f259f] px-3 py-2.5 text-center text-xs font-bold text-white hover:brightness-110 transition">PhonePe</a>
                <a href={upiUrl} className="flex-1 rounded-lg bg-[#1a73e8] px-3 py-2.5 text-center text-xs font-bold text-white hover:brightness-110 transition">GPay</a>
                <a href={upiUrl} className="flex-1 rounded-lg bg-[#00b9f5] px-3 py-2.5 text-center text-xs font-bold text-white hover:brightness-110 transition">Paytm</a>
              </div>
            </div>

            <ol className="mt-5 text-xs text-muted list-decimal pl-4 space-y-1">
              <li>Pay the <b>exact</b> amount — ₹{amountRupees}.</li>
              <li>Wait for the <b>success</b> screen in your UPI app.</li>
              <li>Fill your name, phone &amp; email on the right and submit.</li>
            </ol>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-lg">2 · Confirm your payment</h2>
            <CheckoutForm
              items={items}
              amountRupees={amountRupees}
              defaultPhone={me?.phone ?? ""}
              defaultName={me?.name ?? ""}
              defaultEmail={me?.email ?? ""}
            />
          </div>
        </div>
      )}

      {myClaims.length > 0 && (
        <div className="card p-6 mt-8">
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
                      {c.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                    </td>
                    <td className="py-2 pr-3">{c.plan}</td>
                    <td className="py-2 pr-3">₹{Math.round(c.amountPaise / 100)}</td>
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

      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold">Why this is safe</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li className="flex gap-2"><span aria-hidden>⏱️</span><span>Access unlocked within a few hours of payment.</span></li>
            <li className="flex gap-2"><span aria-hidden>🔒</span><span>You pay directly through your own UPI app. We never see or store your bank details.</span></li>
            <li className="flex gap-2"><span aria-hidden>↩️</span><span>Covered by our <a href="/refund" className="text-brand hover:underline">refund policy</a>.</span></li>
          </ul>
        </div>
        <div className="card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold">Need help?</h3>
            <p className="mt-2 text-sm text-muted">Payment stuck or access not unlocked? Message us on WhatsApp.</p>
          </div>
          <a
            href={whatsappLink(`Hi! I need help with my cart checkout (₹${amountRupees}) UPI payment.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary mt-4 w-full"
          >
            💬 Chat with us on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status, note }: { status: "pending" | "approved" | "rejected"; note?: string | null }) {
  const cls =
    status === "approved" ? "bg-ok/15 text-ok"
    : status === "rejected" ? "bg-err/15 text-err"
    : "bg-warn/15 text-warn";
  return (
    <span className="inline-flex flex-col">
      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>{status}</span>
      {status === "rejected" && note && <span className="text-[10px] text-muted mt-1">{note}</span>}
    </span>
  );
}
