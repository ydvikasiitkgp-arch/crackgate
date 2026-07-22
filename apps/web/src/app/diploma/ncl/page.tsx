import Link from "next/link";
import Image from "next/image";
import { NCL_EXAMS } from "@/data/ncl";
import { NCL_SIRDAR_MOCKS } from "@/data/diploma/ncl-sirdar-mocks";
import { NCL_SURVEYOR_MOCKS } from "@/data/diploma/ncl-surveyor-mocks";
import { Breadcrumb } from "@/components/breadcrumb";
import { NewsletterForm } from "@/components/newsletter-form";

export const metadata = {
  title: "NCL Diploma Exams · CrackGate",
  description:
    "20 full-length mock tests each for NCL Mining Sirdar and Surveyor (Mining) — 100 MCQs, no negative marking, based on CMR 2017 syllabus.",
  alternates: { canonical: "/diploma/ncl" },
};

const NCL_FACTS = [
  ["CMD", "Manish Kumar"],
  ["HQ", "Singrauli, Madhya Pradesh"],
  ["Founded", "1985"],
  ["Parent", "Coal India Limited (CIL)"],
  ["Status", "Miniratna"],
  ["Districts", "Singrauli (MP) & Sonebhadra (UP)"],
];

const SYLLABUS_SIRDAR = [
  "Opencast Coal Mine Working",
  "Explosives & Shot Firing",
  "Safety in Opencast Workings",
  "Reclamation Operations",
  "Safety Management Plan",
  "CMR 2017 — Duties of Sirdar & Shot Firer",
  "Mines Rules 1955 & Rescue Rules 1985",
  "General Knowledge & Aptitude",
];

const SYLLABUS_SURVEYOR = [
  "Linear Measurement & Chain Surveying",
  "EDM & Electronic Measurement",
  "Angular Measurement (Prismatic Compass)",
  "Theodolite & Total Station Surveying",
  "Levelling & Contouring",
  "Mine Surveying & Borehole Survey",
  "Photogrammetry & Remote Sensing",
  "Errors & Adjustments",
];

export default function NclIndexPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1a3a5c] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/cil/coal-mine-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-15"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a5c] via-[#1a3a5c]/90 to-[#1a3a5c]/60" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 py-16 lg:py-24">
          <Breadcrumb className="text-white/50 [&_a]:hover:text-white [&_span]:text-white" crumbs={[
            { label: "Home", href: "/" },
            { label: "Diploma", href: "/diploma" },
            { label: "NCL" },
          ]} />

          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/ncl/ncl-logo.png"
                  alt="NCL logo"
                  width={56}
                  height={56}
                  className="rounded-lg"
                  priority
                />
                <span className="badge border border-blue-300/30 bg-blue-300/10 text-blue-300">
                  Diploma Recruitment · Northern Coalfields Limited
                </span>
              </div>
              <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] lg:text-6xl">
                Northern Coalfields
                <span className="block text-blue-300">Limited (NCL)</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-white/80">
                Diploma-level recruitment mocks for Mining Sirdar and Surveyor (Mining) —
                100 MCQs, 120 min, no negative marking. Advt. 2026/246.
              </p>

              {/* Stats strip */}
              <div className="mt-8 flex flex-wrap gap-3">
                <Stat value="259" label="Vacancies" />
                <Stat value="100" label="MCQs / mock" />
                <Stat value="120" label="Minutes" />
                <Stat value="0" label="Negative marking" />
                <Stat value="40" label="Total mocks" />
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#exams"
                  className="cg-neon inline-flex items-center gap-2 rounded-lg border border-blue-400/70 bg-blue-400/10 px-6 py-3.5 text-base font-semibold text-blue-100 transition hover:bg-blue-400/20"
                >
                  Choose your exam <span aria-hidden>↓</span>
                </a>
              </div>
            </div>

            {/* Right — logo card (desktop) */}
            <div className="hidden lg:block">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
                <Image
                  src="/images/ncl/ncl-logo.png"
                  alt="NCL"
                  width={160}
                  height={160}
                  className="rounded-xl"
                  priority
                />
                <div className="mt-4 space-y-1 text-sm text-white/70">
                  <p className="font-semibold text-white">Miniratna Company</p>
                  <p>Mining Sirdar · Surveyor (Mining)</p>
                  <p>Singrauli (MP) & Sonebhadra (UP)</p>
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
            <h2 className="text-2xl font-extrabold text-ink">Choose your NCL exam</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Pick your role to open its dedicated <b>20-mock NCL series</b> in the official
              100 Q · 120 min pattern with no negative marking.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {/* Mining Sirdar */}
          <Link
            href="/diploma/ncl/mining-sirdar"
            className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-pop"
          >
            <div className="flex items-center justify-between">
              <span className="badge bg-blue-400/15 text-blue-700 dark:text-blue-300">T&S Gr. C</span>
              <span className="badge badge-pro">20 mocks</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink">Mining Sirdar</h3>
            <p className="mt-2 flex-1 text-sm text-muted leading-snug">
              DGMS Mining Sirdar Certificate of Competency under Coal Mines Regulations, 2017.
              Covers opencast working, explosives, safety, CMR 2017 duties, and general aptitude.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted">
              {SYLLABUS_SIRDAR.map((t) => (
                <li key={t}>▸ {t}</li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-brand">
                Open mock series <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
              <span className="text-xs text-muted">20 mocks · ₹399</span>
            </div>
          </Link>

          {/* Surveyor */}
          <Link
            href="/diploma/ncl/surveyor"
            className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-pop"
          >
            <div className="flex items-center justify-between">
              <span className="badge bg-indigo-400/15 text-indigo-700 dark:text-indigo-300">T&S Gr. B</span>
              <span className="badge badge-pro">20 mocks</span>
            </div>
            <h3 className="mt-4 text-lg font-bold text-ink">Surveyor (Mining)</h3>
            <p className="mt-2 flex-1 text-sm text-muted leading-snug">
              Surveyors&apos; Certificate of Competency (SCC) under Coal Mines Regulations, 2017.
              Covers linear measurement, theodolite, total station, levelling, and mine surveying.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-muted">
              {SYLLABUS_SURVEYOR.map((t) => (
                <li key={t}>▸ {t}</li>
              ))}
            </ul>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-brand">
                Open mock series <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
              <span className="text-xs text-muted">20 mocks · ₹399</span>
            </div>
          </Link>
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
                <span className="text-4xl font-extrabold">₹599</span>
                <span className="text-lg text-muted line-through">₹798</span>
                <span className="inline-flex items-center rounded-full bg-ok/15 px-2.5 py-0.5 text-xs font-bold text-ok">SAVE ₹198</span>
              </div>
              <ul className="mt-4 space-y-2 text-sm text-muted">
                <li className="flex gap-2.5"><span className="text-ok shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> WCL Mining Sirdar — 20 mocks</li>
                <li className="flex gap-2.5"><span className="text-ok shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> NCL Mining Sirdar — 20 mocks</li>
                <li className="flex gap-2.5"><span className="text-ok shrink-0"><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span> 40 total mocks · 100 MCQs each · 120 min · no negative marking</li>
              </ul>
            </div>
            <div className="shrink-0 sm:text-right">
              <Link
                href="/pay/upi?plan=pro&exam=DIPLOMA&subject=combo-wcl-ncl-mining-sirdar"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-400 hover:to-orange-400 hover:shadow-xl"
              >
                Get Combo — ₹599
              </Link>
              <p className="mt-2 text-xs text-muted">Pay via UPI · QR / GPay / PhonePe / Paytm</p>
            </div>
          </div>
        </div>
      </section>

      {/* NCL BANNER */}
      <div className="max-w-7xl mx-auto px-5 pb-16">
        <div className="relative overflow-hidden rounded-2xl border border-blue-400/30 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-6 shadow-pop sm:p-8">
          <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-blue-400/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-blue-400/15 text-blue-200">Diploma · NCL</span>
                <span className="badge bg-amber-400/15 text-amber-200">Miniratna</span>
              </div>
              <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                Northern Coalfields Limited — 259 Posts
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-white/70">
                Recruitment for Mining Sirdar (254) and Surveyor (5) across Singrauli (MP)
                and Sonebhadra (UP). Start your targeted diploma prep now.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <a
                href="https://www.nclcil.in/data-listing/pages/recruitment"
                target="_blank"
                rel="noopener noreferrer"
                className="cg-neon inline-flex items-center gap-2 rounded-lg border border-blue-400/70 bg-blue-400/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-400/20"
              >
                Apply on NCL <span aria-hidden>→</span>
              </a>
              <Link
                href="/diploma/ncl/mining-sirdar"
                className="cg-pulse inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-blue-500 hover:to-blue-400"
              >
                Start Preparing <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* NCL QUICK FACTS */}
      <section className="max-w-7xl mx-auto px-5 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">NCL Quick Facts</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {NCL_FACTS.map(([k, v]) => (
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
          <h3 className="text-xl font-bold text-ink">Get NCL exam updates</h3>
          <p className="mt-2 text-sm text-muted">
            New mock releases, recruitment alerts, and prep tips for NCL diploma exams — once a week.
          </p>
          <div className="mt-5 flex justify-center">
            <NewsletterForm source="diploma-ncl" />
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
