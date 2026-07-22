import Link from "next/link";
import Image from "next/image";
import { WCL_AF_MOCKS, WCL_AF_PRICING } from "@/data/diploma/wcl-af-mocks";
import { Breadcrumb } from "@/components/breadcrumb";
import { ShareOnWhatsApp } from "@/components/share-on-whatsapp";
import { NewsletterForm } from "@/components/newsletter-form";
import { AddToCartBtn } from "@/components/add-to-cart-btn";
import { auth } from "@/lib/auth";
import { hasEntitlement } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "WCL Assistant Foreman Electrical Mock Tests · CrackGate",
  description:
    "20 full-length mock tests for WCL Assistant Foreman (Trainee) Electrical / Electrical Supervisor CBT — 100 MCQs each, no negative marking.",
  alternates: { canonical: "/diploma/wcl/assistant-foreman-electrical" },
};

const SYLLABUS = [
  "Basics of EE (Ohm's/KCL/KVL, Power Factor)",
  "Power Generation Economics (Load/Diversity, APFC, AVR)",
  "Electrical Machines (Motors, Generators, Transformers)",
  "Renewable Energy & Battery Vehicles",
  "Electric Drives & Control (VFD, PLC, SCADA, DCS)",
  "Switchgear & Protection (CBs, Relays, Coordination)",
  "Earthing System (IS-3043, Chemical Earthing)",
  "Neutral Systems (Solid/Restricted/Isolated)",
  "Substation Design & Layout",
  "Overhead Lines & Underground Cables",
  "Mining Type Cables & Jointing",
  "Safety & Legislation (IS:5216, CEA 2023, Electricity Act)",
  "NBC 2016 & Lightning Protection",
  "General Awareness & Aptitude",
];

const WCL_FACTS = [
  ["CMD", "Dr. Hemant Sharad Pande"],
  ["HQ", "Nagpur, Maharashtra"],
  ["Founded", "1975"],
  ["Parent", "Coal India Limited (CIL)"],
  ["Status", "Miniratna (since 2007)"],
  ["Areas", "10"],
  ["Mines", "52 (19 UG + 33 OC)"],
  ["States", "Maharashtra & Madhya Pradesh"],
];

export default async function WCLAFElectricalPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const unlocked = isAdmin || (await hasEntitlement(userId ?? "", "DIPLOMA", "wcl-af-electrical"));

  const liveCount = WCL_AF_MOCKS.length;
  const payHref = "/pay/upi?plan=pro&exam=DIPLOMA&subject=wcl-af-electrical";

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1a472a] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/cil/coal-mine-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-15"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a472a] via-[#1a472a]/90 to-[#1a472a]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 py-14 lg:py-16">
          <div className="flex items-start justify-between">
            <Breadcrumb className="text-white/50 [&_a]:hover:text-white [&_span]:text-white" crumbs={[
              { label: "Home", href: "/" },
              { label: "Diploma", href: "/diploma" },
              { label: "WCL", href: "/diploma/wcl" },
              { label: "AF Electrical" },
            ]} />
            <ShareOnWhatsApp />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="badge border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
              T&S Grade-C · WCL Recruitment
            </span>
          </div>
          <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold leading-tight">
            Assistant Foreman (Electrical)
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            20 full-length mock tests for WCL Assistant Foreman (Trainee) Electrical /
            Electrical Supervisor, T&S Grade-C — 100 MCQs, 120 min, no negative marking.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#mocks" className="cg-neon inline-flex items-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20">
              View all mocks <span aria-hidden>↓</span>
            </a>
            <Link href="/diploma/wcl" className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20">
              All WCL exams
            </Link>
          </div>

          {/* Stats strip */}
          <div className="mt-8 flex flex-wrap gap-3">
            <Stat value="100" label="MCQs" />
            <Stat value="120" label="Minutes" />
            <Stat value="0" label="Negative marking" />
            <Stat value="20" label="Mock tests" />
          </div>
        </div>
      </section>

      {/* MOCK PLAN */}
      <section id="mocks" className="max-w-7xl mx-auto px-5 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">AF Electrical — {liveCount} Full-length Mock Tests</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              A complete WCL Assistant Foreman (Electrical) series:{" "}
              <b>100 MCQs · 120 minutes · no negative marking</b> ·
              Section A (General Awareness &amp; Aptitude) + Section B (Technical Electrical).
            </p>
          </div>
          <span className="badge badge-pro shrink-0">
            {liveCount} of {liveCount} live
          </span>
        </div>

        {/* Access state */}
        {unlocked ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm">
            <span aria-hidden className="text-ok">✓</span>
            <span className="font-semibold text-ink">AF Electrical series unlocked.</span>
            <span className="text-muted">All {liveCount} mocks are open — start any set below.</span>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950 to-slate-900 text-white">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 text-2xl">🔒</span>
                <div>
                  <h3 className="text-lg font-extrabold">Unlock all {liveCount} AF Electrical mocks</h3>
                  <p className="mt-1 max-w-xl text-sm text-white/70">
                    Full official WCL CBT pattern — {liveCount} complete 100-question papers
                    covering General Awareness + Technical Electrical. One payment, valid through the recruitment cycle.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
                <div className="text-right">
                  <span className="text-3xl font-extrabold">₹{WCL_AF_PRICING.pro}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={payHref}
                    className="cg-neon inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-400/10 px-6 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                  >
                    Unlock now <span aria-hidden>→</span>
                  </Link>
                  <AddToCartBtn exam="DIPLOMA" subject="wcl-af-electrical" variant="light" size="md" />
                </div>
                <span className="text-[11px] text-white/50">Pay via UPI · access in a few hours</span>
              </div>
            </div>
          </div>
        )}

        {/* Mock card grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {WCL_AF_MOCKS.map((m) => {
            const canStart = unlocked;
            return (
              <div key={m.id} className="card relative flex flex-col p-5">
                <span className={`badge absolute right-4 top-4 ${unlocked ? "bg-brand/10 text-brand" : "badge-pro"}`}>
                  {unlocked ? "Ready" : "Locked"}
                </span>
                <div className="text-xs font-mono text-brand">{m.title}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                  <span className="rounded-md bg-canvas px-2 py-1">{m.questions.length} Q</span>
                  <span className="rounded-md bg-canvas px-2 py-1">{m.duration} min</span>
                  <span className="rounded-md bg-canvas px-2 py-1">{m.totalMarks} marks</span>
                </div>
                {canStart ? (
                  <Link href={`/mocks/${m.id}`} className="btn btn-primary mt-4 w-full justify-center">
                    Start Mock
                  </Link>
                ) : (
                  <Link href={payHref} title="Unlock to access" className="btn btn-ghost mt-4 w-full justify-center gap-2">
                    <span aria-hidden>🔒</span> Unlock to access
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SYLLABUS */}
      <section className="max-w-7xl mx-auto px-5 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Syllabus Coverage</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-muted">
          {SYLLABUS.map((topic) => (
            <div key={topic} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
              {topic}
            </div>
          ))}
        </div>
      </section>

      {/* WCL QUICK FACTS */}
      <section className="max-w-7xl mx-auto px-5 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">WCL Quick Facts</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          {WCL_FACTS.map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg border border-line bg-surface px-3 py-2">
              <span className="text-muted">{k}</span>
              <span className="font-medium text-ink">{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-line bg-paper/40">
        <div className="max-w-3xl mx-auto px-5 py-12 text-center">
          <h3 className="text-lg font-bold text-ink">Get WCL AF Electrical exam updates</h3>
          <p className="mt-1 text-sm text-muted">
            New mock releases, WCL notification alerts, and prep tips — once a week.
          </p>
          <div className="mt-4 flex justify-center">
            <NewsletterForm source="diploma-wcl-af-electrical" />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
