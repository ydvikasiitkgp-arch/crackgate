import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import QRCode from "qrcode";
import UpiClaimForm from "./form";
import { db } from "@/lib/db";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/contact";
import { getCilDiscipline } from "@/data/cil";
import { getOngcDiscipline } from "@/data/ongc";
import { getSubject, subjectPrice, type ExamTrack } from "@/data/catalog";
import { getCombo, isComboSlug, comboLabel, comboEntitlementLabels } from "@/lib/combos";

export const dynamic = "force-dynamic";

// Map a catalog exam code (from the unlock CTA) to the form's exam label.
const EXAM_LABEL: Record<string, string> = {
  GATE: "GATE",
  PSU: "PSU",
  STATE: "State Level",
  DIPLOMA: "Diploma",
};

export default async function PayUpiPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; exam?: string; subject?: string }>;
}) {
  const sp = await searchParams;
  const planKey = sp.plan === "premium" ? "premium" : "pro";
  const examCode = (sp.exam ?? "").toUpperCase();
  const subjectSlug = sp.subject?.trim();

  // Check if this is a combo purchase
  const isCombo = isComboSlug(subjectSlug ?? "");
  const combo = isCombo ? getCombo(subjectSlug!) : null;

  // Resolve the correct price: combo has its own price, otherwise from catalog
  let amountRupees: number;
  let displayLabel: string;
  let months: number;

  if (combo) {
    amountRupees = Math.round(combo.pricePaise / 100);
    displayLabel = combo.label;
    months = combo.months;
  } else {
    const price = subjectPrice(examCode, subjectSlug ?? "");
    amountRupees = planKey === "premium"
      ? Math.round(price.premiumPaise / 100)
      : Math.round(price.proPaise / 100);
    displayLabel = planKey === "premium" ? "Premium" : "Pro";
    months = examCode === "DIPLOMA" ? 12 : 18;
  }

  const defaultExam = EXAM_LABEL[examCode];
  const defaultSubjectLabel =
    isCombo
      ? comboLabel(subjectSlug ?? "")
      : examCode === "PSU" && subjectSlug
        ? (() => {
          const isOngc = subjectSlug.startsWith("ongc-");
          const company = isOngc ? "ONGC" : "CIL";
          const discipline = isOngc
            ? getOngcDiscipline(subjectSlug)?.discipline
            : getCilDiscipline(subjectSlug)?.discipline;
          return `PSU > ${company} > ${discipline ?? subjectSlug}`;
        })()
        : subjectSlug
          ? getSubject(examCode, subjectSlug)?.label ?? subjectSlug
          : subjectSlug;

  const subjectName = isCombo
    ? combo?.label ?? "Combo"
    : defaultSubjectLabel || displayLabel;
  const validityText = `${months} months`;

  const session = await auth();
  if (!session?.user?.id) {
    const qs = new URLSearchParams({ plan: planKey });
    if (sp.exam) qs.set("exam", sp.exam);
    if (subjectSlug) qs.set("subject", subjectSlug);
    redirect(`/login?next=${encodeURIComponent(`/pay/upi?${qs.toString()}`)}`);
  }

  const vpa = process.env.NEXT_PUBLIC_UPI_VPA || "";
  const payeeName = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || "CrackGate";

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

  // Build UPI deep-link with the correct amount
  const note = `cg-${planKey}-${session.user.id.slice(0, 8)}`;
  const upiUrl = vpa
    ? `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(
        payeeName,
      )}&am=${amountRupees}&cu=INR&tn=${encodeURIComponent(note)}`
    : "";

  const qrSvg = upiUrl
    ? await QRCode.toString(upiUrl, {
        type: "svg",
        errorCorrectionLevel: "M",
        margin: 1,
        width: 256,
      })
    : "";

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <h1 className="text-3xl font-extrabold">Pay ₹{amountRupees} via UPI</h1>
      <p className="text-muted mt-2">
        {subjectName} · {displayLabel} plan · valid for {validityText}.
        Manual verification — your access unlocks within a few hours after we
        confirm the payment.
      </p>

      {!vpa && (
        <div className="card p-5 mt-6 border-warn text-warn-foreground">
          UPI is not configured on the server. Ask the admin to set{" "}
          <code>NEXT_PUBLIC_UPI_VPA</code>.
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
              <div className="font-mono text-base font-semibold select-all break-all">
                {vpa}
              </div>
            </div>
            <div className="mt-3 text-sm">
              <div className="text-muted">Amount</div>
              <div className="text-2xl font-extrabold">
                ₹{amountRupees}
              </div>
            </div>
            <div className="mt-3 text-sm">
              <div className="text-muted">Note (auto-filled)</div>
              <div className="font-mono text-xs break-all">{note}</div>
            </div>

            {/* Mobile: quick-launch UPI app buttons */}
            <div className="mt-5 md:hidden">
              <p className="text-xs font-semibold text-muted mb-2">Pay with</p>
              <div className="flex gap-2">
                <a href={upiUrl} className="flex-1 rounded-lg bg-[#5f259f] px-3 py-3 text-center text-xs font-bold text-white hover:brightness-110 transition">
                  PhonePe
                </a>
                <a href={upiUrl} className="flex-1 rounded-lg bg-[#1a73e8] px-3 py-3 text-center text-xs font-bold text-white hover:brightness-110 transition">
                  GPay
                </a>
                <a href={upiUrl} className="flex-1 rounded-lg bg-[#00b9f5] px-3 py-3 text-center text-xs font-bold text-white hover:brightness-110 transition">
                  Paytm
                </a>
              </div>
            </div>

            {/* Desktop: single button */}
            <a
              href={upiUrl}
              className="btn btn-primary mt-5 md:hidden hidden"
            >
              Open in UPI app
            </a>

            <ol className="mt-5 text-xs text-muted list-decimal pl-4 space-y-1">
              <li>Pay the <b>exact</b> amount — ₹{amountRupees}.</li>
              <li>Wait for the <b>success</b> screen in your UPI app.</li>
              <li>Fill your name, phone &amp; email on the right and submit.</li>
            </ol>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-lg">2 · Confirm your payment</h2>
            <UpiClaimForm
              plan={planKey}
              amountRupees={amountRupees}
              defaultPhone={me?.phone ?? ""}
              defaultExam={defaultExam}
              defaultSubject={subjectSlug}
              defaultSubjectLabel={defaultSubjectLabel}
            isCombo={isCombo}
            comboName={combo?.label}
            comboLabels={comboEntitlementLabels(subjectSlug ?? "")}
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

      {/* Trust + support */}
      <div className="mt-8 grid sm:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-bold">Why this is safe</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li className="flex gap-2">
              <span aria-hidden>⏱️</span>
              <span>Access unlocked within a few hours of payment — usually much faster.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>🔒</span>
              <span>You pay directly through your own UPI app. We never see or store your card or bank details.</span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>↩️</span>
              <span>
                Covered by our{" "}
                <a href="/refund" className="text-brand hover:underline">
                  refund policy
                </a>
                .
              </span>
            </li>
            <li className="flex gap-2">
              <span aria-hidden>🎓</span>
              <span>Trusted by aspirants across GATE, PSU, State Level & Diploma exams.</span>
            </li>
          </ul>
        </div>

        <div className="card p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold">Need help?</h3>
            <p className="mt-2 text-sm text-muted">
              Payment stuck, paid the wrong amount, or access not unlocked yet?
              Message us on WhatsApp — we usually reply within minutes.
            </p>
          </div>
          <a
            href={WHATSAPP_COMMUNITY_URL}
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
