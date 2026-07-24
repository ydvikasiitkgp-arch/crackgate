import Link from "next/link";
import Image from "next/image";
import { WCL_EXAMS } from "@/data/wcl";
import { WCL_SIRDAR_MOCKS } from "@/data/diploma/wcl-mocks";
import { WCL_AF_MOCKS } from "@/data/diploma/wcl-af-mocks";
import { Breadcrumb } from "@/components/breadcrumb";
import { NewsletterForm } from "@/components/newsletter-form";
import { DiplomaCard } from "@/components/diploma-card";
import { ComboAddToCartBtn } from "@/components/combo-add-to-cart-btn";

export const metadata = {
  title: "WCL Diploma Exams · CrackGate",
  description:
    "20 full-length mock tests each for WCL Mining Sirdar and Assistant Foreman (Electrical) — 100 MCQs, no negative marking, based on CMR 2017 and CEA 2023 syllabus.",
  alternates: { canonical: "/diploma/wcl" },
};

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

const SYLLABUS_MINING = [
  "Explosives & Blasting",
  "Bord & Pillar / Depillaring",
  "Strata Control / Roof Bolting",
  "Mine Ventilation & Gases",
  "Face Machineries (SDL/LHD/CM)",
  "Duties of Sirdar (CMR 2017)",
];

const SYLLABUS_ELECTRICAL = [
  "Electrical Machines (Motors, Transformers)",
  "Switchgear & Protection (CBs, Relays)",
  "Earthing System (IS-3043)",
  "Substation Design & Layout",
  "Electric Drives (VFD, PLC, SCADA)",
  "Safety & Legislation (CEA 2023)",
];

export default function WclIndexPage() {
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

        <div className="relative mx-auto max-w-7xl px-5 py-16 lg:py-24">
          <Breadcrumb className="text-white/50 [&_a]:hover:text-white [&_span]:text-white" crumbs={[
            { label: "Home", href: "/" },
            { label: "Diploma", href: "/diploma" },
            { label: "WCL" },
          ]} />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/wcl/wcl-logo.webp"
                  alt="WCL logo"
                  width={56}
                  height={56}
                  className="rounded-lg"
                  priority
                />
                <span className="badge border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
                  Diploma Recruitment · Western Coalfields Limited
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] lg:text-6xl">
                Western Coalfields
                <span className="block text-emerald-300">Limited (WCL)</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/80">
                Diploma-level recruitment mocks for Mining Sirdar and Assistant Foreman
                (Electrical) — 100 MCQs, 120 min, no negative marking.
              </p>

              {/* Stats strip */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Stat value="52" label="Mines" />
                <Stat value="10" label="Areas" />
                <Stat value="100" label="MCQs / mock" />
                <Stat value="120" label="Minutes" />
                <Stat value="0" label="Negative marking" />
                <Stat value="40" label="Total mocks" />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#exams"
                  className="cg-neon inline-flex items-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-400/10 px-6 py-3.5 text-base font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
                >
                  Choose your exam <span aria-hidden>↓</span>
                </a>
              </div>
            </div>

            {/* Right — logo card (desktop) */}
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <Image
                  src="/images/wcl/wcl-logo.webp"
                  alt="WCL"
                  width={160}
                  height={75}
                  className="rounded-xl"
                  priority
                />
                <div className="mt-4 space-y-1 text-sm text-white/70">
                  <p className="font-semibold text-white">Miniratna Category-I</p>
                  <p>Mining Sirdar · Asst. Foreman (Electrical)</p>
                  <p>T&S Grade-C · 52 mines across 2 states</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXAM CARDS */}
      <section id="exams" className="max-w-7xl mx-auto px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Choose your WCL exam</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Pick your role to open its dedicated <b>20-mock WCL series</b> in the official
              100 Q · 120 min pattern with no negative marking.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <DiplomaCard
            href="/diploma/wcl/mining-sirdar"
            badge="T&S Grade-C"
            badgeCls="bg-emerald-400/15 text-emerald-700 dark:text-emerald-300"
            title="Mining Sirdar"
            description="DGMS Mining Sirdar Certificate of Competency under Coal Mines Regulations, 2017. Covers ventilation, blasting, depillaring, strata control, and face machineries."
            syllabus={SYLLABUS_MINING}
            exam="DIPLOMA"
            subject="wcl-sirdar"
          />
          <DiplomaCard
            href="/diploma/wcl/assistant-foreman-electrical"
            badge="T&S Grade-C"
            badgeCls="bg-emerald-400/15 text-emerald-700 dark:text-emerald-300"
            title="Assistant Foreman (Electrical)"
            description="WCL Assistant Foreman (Trainee) Electrical / Electrical Supervisor CBT. Covers EE basics, machines, drives, switchgear, earthing, and CEA 2023 safety."
            syllabus={SYLLABUS_ELECTRICAL}
            exam="DIPLOMA"
            subject="wcl-af-electrical"
          />
        </div>
      </section>

      {/* COMBO DEAL */}
      <section className="max-w-7xl mx-auto px-5 pb-16">
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-500/5 via-orange-500/5 to-red-500/5 p-6 sm:p-8 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/10">
          <div className="absolute -top-16 -right-16 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 bg-orange-400/10 rounded-full blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-3">
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">WCL</span>
                <span className="text-muted text-sm font-bold">+</span>
                <span className="inline-flex items-center rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400">NCL</span>
                <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">BEST VALUE</span>
              </div>
              <h3 className="text-2xl font-extrabold text-ink">WCL + NCL Mining Sirdar Combo</h3>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold">₹678</span>
                <span className="text-lg text-muted line-through">₹798</span>
                <span className="inline-flex items-center rounded-full bg-ok/15 px-2.5 py-0.5 text-xs font-bold text-ok">SAVE ₹120 (15% off)</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li className="flex gap-2.5"><span className="text-ok shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> WCL Mining Sirdar — 20 mocks</li>
                <li className="flex gap-2.5"><span className="text-ok shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> NCL Mining Sirdar — 20 mocks</li>
                <li className="flex gap-2.5"><span className="text-ok shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> 40 total mocks · 100 MCQs each · 120 min · no negative marking</li>
                <li className="flex gap-2.5"><span className="text-ok shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> Add any 2+ mocks to cart — 15% off automatically</li>
              </ul>
            </div>
            <div className="shrink-0 sm:text-right">
              <ComboAddToCartBtn />
              <p className="mt-2 text-xs text-muted">Pay via UPI · QR / GPay / PhonePe / Paytm</p>
            </div>
          </div>
        </div>
      </section>

      {/* WCL BANNER */}
      <div className="max-w-7xl mx-auto px-5 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 shadow-pop sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />

          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-emerald-400/15 text-emerald-200">Diploma · WCL</span>
                <span className="badge bg-amber-400/15 text-amber-200">Miniratna</span>
              </div>
              <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                Western Coalfields Limited — 52 Mines
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Recruitment for Mining Sirdar and Assistant Foreman (Electrical) across
                Maharashtra and Madhya Pradesh. Start your targeted diploma prep now.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <Link
                href="/diploma/wcl/mining-sirdar"
                className="cg-neon inline-flex items-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
              >
                Mining Sirdar <span aria-hidden>→</span>
              </Link>
              <Link
                href="/diploma/wcl/assistant-foreman-electrical"
                className="cg-pulse inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-500 hover:to-emerald-400"
              >
                AF Electrical <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

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
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h3 className="text-xl font-bold text-ink">Get WCL exam updates</h3>
          <p className="mt-2 text-sm text-muted">
            New mock releases, recruitment alerts, and prep tips for WCL diploma exams — once a week.
          </p>
          <div className="mt-5 flex justify-center">
            <NewsletterForm source="diploma-wcl" />
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
