import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject, KNOWN_COMING_SOON } from "@/data/gate/registry";
import { TrackHub, GATE_MODULES } from "@/components/track-hub";
import dynamicImport from "next/dynamic";

const CivilWindow = dynamicImport(() => import("@/components/hero-carousel").then((m) => m.CivilWindow));
const GeologyWindow = dynamicImport(() => import("@/components/hero-carousel").then((m) => m.GeologyWindow));
const EnvironmentWindow = dynamicImport(() => import("@/components/hero-carousel").then((m) => m.EnvironmentWindow));
import { Breadcrumb } from "@/components/breadcrumb";

export const dynamic = "force-dynamic";

/** GATE discipline codes for any subject staged as coming-soon (KNOWN_COMING_SOON). */
const COMING_SOON_CODES: Record<string, string> = {
  aerospace: "AE",
  agricultural: "AG",
  architecture: "AR",
  biomedical: "BM",
  biotechnology: "BT",
  chemistry: "CY",
  ecology: "EY",
  geomatics: "GE",
  mathematics: "MA",
  metallurgical: "MT",
  naval: "NM",
  petroleum: "PE",
  physics: "PH",
  statistics: "ST",
  textile: "TF",
  "engineering-sciences": "XE",
  humanities: "XH",
  "life-sciences": "XL",
};

const COMING_SOON_LABELS: Record<string, string> = {
  aerospace: "Aerospace Engineering",
  agricultural: "Agricultural Engineering",
  architecture: "Architecture and Planning",
  biomedical: "Biomedical Engineering",
  biotechnology: "Biotechnology",
  chemistry: "Chemistry",
  ecology: "Ecology and Evolution",
  geomatics: "Geomatics Engineering",
  mathematics: "Mathematics",
  metallurgical: "Metallurgical Engineering",
  naval: "Naval Architecture and Marine Engineering",
  petroleum: "Petroleum Engineering",
  physics: "Physics",
  statistics: "Statistics",
  textile: "Textile Engineering and Fibre Science",
  "engineering-sciences": "Engineering Sciences",
  humanities: "Humanities and Social Sciences",
  "life-sciences": "Life Sciences",
};

export async function generateMetadata(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (meta) {
    return {
    alternates: { canonical: "/gate/" + subject + "" },
      title: `GATE ${meta.label} (${meta.code}) · CrackGate`,
      openGraph: { images: [{ url: "/api/og?subject=" + encodeURIComponent("GATE " + meta.code) + "&title=" + encodeURIComponent(meta.label), alt: `GATE ${meta.label} (${meta.code}) preparation` }] },
    description: `Complete GATE ${meta.code} preparation — full-length mocks, topic-wise practice, IIT-authored learn modules, SWOT analytics, and exam simulations for ${meta.label}.`,
    };
  }
  const label = subject.charAt(0).toUpperCase() + subject.slice(1);
  return {
    title: `GATE ${label} · CrackGate`,
    openGraph: { images: [{ url: "/api/og?subject=" + encodeURIComponent("GATE " + label) + "&title=" + encodeURIComponent(label + " preparation"), alt: `GATE ${label} preparation` }] },
    description: `Prepare for GATE ${label} with CrackGate — mock tests, practice questions, learn modules and performance analytics.`,
  };
}

export default async function GateSubjectHome(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);

  // Coming-soon subjects render the dimmed discipline hub.
  if (!meta) {
    if (!KNOWN_COMING_SOON.has(subject)) notFound();
    const label = COMING_SOON_LABELS[subject] ?? subject.charAt(0).toUpperCase() + subject.slice(1);
    const code = COMING_SOON_CODES[subject] ?? subject.slice(0, 3).toUpperCase();
    return (
      <TrackHub
        discipline={`${label} (${code})`}
        subject={subject}
        tagline={`Full GATE ${label} preparation is being authored right now — learn, practice, mocks and AITS, all in one place.`}
        live={false}
        modules={GATE_MODULES}
      />
    );
  }

  // Live subject home — stats + module cards.
  const practiceQs = meta.practice.reduce((s, sub) => s + sub.questions.length, 0);
  const subjectsCount = meta.practice.length;
  const mocksCount = meta.mocks.length;
  const learnCount = meta.learnTopics.length;
  const aitsCount = meta.aits.length;

  const modules = [
    { href: `/gate/${subject}/learn`, icon: "📚", title: "Learn & Solve", desc: `${learnCount} topic-wise modules with formula matrices, traps and worked 3-tier question suites.` },
    { href: `/gate/${subject}/practice`, icon: "✍️", title: "Practice", desc: `${practiceQs}+ exam-grade questions across ${subjectsCount} subjects, instantly graded with solutions.` },
    { href: `/gate/${subject}/mocks`, icon: "🧪", title: "Mock Tests", desc: `${mocksCount} full-length papers on the official GATE pattern — 65 Q · 100 marks · 3 hours.` },
    { href: `/gate/${subject}/aits`, icon: "💎", title: "All India Test Series", desc: `${aitsCount} scheduled tests with All-India percentile rankings.` },
  ];

  return (
    <>
      {/* HERO */}
      {subject === "civil" ? (
        <section className="relative bg-slate-950 text-white">
          <div className="relative min-h-[680px] lg:min-h-[720px]">
            <CivilWindow civil={{ practiceQs, mocksCount, learnCount, subjectsCount }} />
          </div>
        </section>
      ) : subject === "geology" ? (
        <section className="relative bg-slate-950 text-white">
          <div className="relative min-h-[680px] lg:min-h-[720px]">
            <GeologyWindow stats={{ practiceQs, mocksCount, learnCount, subjectsCount }} />
          </div>
        </section>
      ) : subject === "environment" ? (
        <section className="relative bg-slate-950 text-white">
          <div className="relative min-h-[680px] lg:min-h-[720px]">
            <EnvironmentWindow stats={{ practiceQs, mocksCount, learnCount, subjectsCount }} />
          </div>
        </section>
      ) : (
        <section className="relative bg-gradient-to-br from-brand to-brand-2 text-white">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="relative max-w-7xl mx-auto px-5 py-16 lg:py-24">
            <span className="badge bg-white/10 text-amber-300 border border-amber-300/30">
              GATE 2027 · {meta.code}
            </span>
            <h1 className="mt-4 text-4xl lg:text-6xl font-extrabold leading-[1.05]">
              GATE {meta.label}
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/80">{meta.blurb}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href={`/gate/${subject}/mocks`} className="btn btn-accent btn-lg">Start free mock →</Link>
              <Link href={`/gate/${subject}/practice`} className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
                Practice questions
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-2.5">
              <HeroStat n={`${practiceQs}+`} label="practice Qs" />
              <HeroStat n={`${mocksCount}`} label="full-length mocks" />
              <HeroStat n={`${learnCount}`} label="learn modules" />
              <HeroStat n={`${aitsCount}`} label="AITS tests" />
            </div>
          </div>
        </section>
      )}

      {/* ABOUT THE EXAM */}
      <section className="bg-paper/40 border-b border-line">
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <span className="badge bg-brand/10 text-brand">About the exam</span>
              <h2 className="mt-3 text-2xl lg:text-3xl font-extrabold">GATE {meta.code} — {meta.label}</h2>
              <p className="mt-4 text-muted leading-relaxed">{meta.blurb}</p>
              {subject === "civil" && (
                <div className="mt-4 text-sm text-muted space-y-2 leading-relaxed">
                  <p>GATE Civil Engineering (CE) is one of the largest GATE papers by test-takers, with over 80,000 candidates annually. The syllabus spans structural engineering, geotechnical engineering, water resources, transportation, environmental engineering, and geomatics.</p>
                  <p>The paper follows a 65-question, 100-mark, 3-hour pattern with General Aptitude (15 marks) and the CE technical section (85 marks). Top scores (AIR 1–50) typically land PSU interviews at NMDC, Coal India, NTPC, and ONGC, while others pursue MTech at IITs, NITs, and IISc.</p>
                  <p>Standard references include Punmia for structures, Gopal Ranjan for geotech, K. Subramanya for water resources, S.K. Khanna for transportation, B.C. Punmia for surveying, and B.S. Grewal for mathematics.</p>
                </div>
              )}
              {subject === "geology" && (
                <div className="mt-4 text-sm text-muted space-y-2 leading-relaxed">
                  <p>GATE Geology &amp; Geophysics (GG) is a specialized paper designed for BS/MS graduates in Geology, Applied Geology, and Geophysics. The syllabus is split into two parts — Geology (70%) and Geophysics (30%) — covering mineralogy, petrology, structural geology, sedimentology, paleontology, and geophysical exploration methods.</p>
                  <p>With approximately 5,000–8,000 candidates per year, GG offers a favorable competition-to-seats ratio for MTech at IITs and PSU recruitment. Top rankers are recruited by ONGC, Oil India, GSI (Geological Survey of India), CIL, NMDC, and Mineral Exploration Corporation Ltd.</p>
                  <p>Key textbooks include B. M. Williams for mineralogy, A. K. Mukherjee for structural geology, J. A. Winter for petrology, P. Kearey for geophysics, S. Ramakrishnan for Indian stratigraphy, and B. S. Grewal for the mathematics component.</p>
                </div>
              )}
              {subject === "environment" && (
                <div className="mt-4 text-sm text-muted space-y-2 leading-relaxed">
                  <p>GATE Environmental Science (ES) is a relatively new paper (introduced in 2025) designed for graduates in Environmental Science, Environmental Engineering, and related interdisciplinary fields. The syllabus covers environmental chemistry, ecology, atmospheric science, water and wastewater treatment, solid and hazardous waste management, and environmental impact assessment.</p>
                  <p>This paper was introduced to address the growing demand for environmental professionals in the mining, infrastructure, and regulatory sectors. PSUs such as CIL, NMDC, and NTPC have started recruiting through GATE ES scores. Career paths include environmental consultancies, regulatory bodies (CPCB, SPCB), research in climate science, and MTech programs at IITs and NITs.</p>
                  <p>Recommended references include S. K. Garg for environmental engineering, P. C. C. de Nevers for air pollution control, H. S. Peavy for environmental engineering, A. K. De for environmental chemistry, and B. S. Grewal for engineering mathematics.</p>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatBox value={`${mocksCount}`} label="Full-length mocks" />
              <StatBox value={`${practiceQs.toLocaleString("en-IN")}+`} label="Practice questions" />
              <StatBox value={`${learnCount}`} label="Learn modules" />
              <StatBox value={`${aitsCount}`} label="AITS tests" />
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
        <Breadcrumb crumbs={[{ label: "GATE", href: "/gate" }, { label: `${meta.label} (${meta.code})` }]} />
        <h2 className="text-3xl font-extrabold text-center">Your complete GATE {meta.code} track.</h2>
        <p className="mt-3 text-muted text-center max-w-2xl mx-auto">
          Everything is built specifically for {meta.label} — no generic padding. Every question is
          auto-graded with a detailed solution.
        </p>
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group card p-6 flex items-start gap-4 hover:border-brand hover:shadow-sm transition"
            >
              <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-brand/10 text-2xl">{m.icon}</div>
              <div>
                <h3 className="font-bold group-hover:text-brand">{m.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{m.desc}</p>
              </div>
              <span className="ml-auto text-brand text-xl shrink-0 group-hover:translate-x-0.5 transition">→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* WHY CRACKGATE */}
      <section className="bg-paper/40 border-y border-line">
        <div className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
          <h2 className="text-3xl font-extrabold text-center">Everything you need to crack GATE {meta.code}.</h2>
          <p className="mt-3 text-muted text-center max-w-2xl mx-auto">
            Hyper-focused on {meta.label}. Tuned a notch tougher than the real paper so exam day feels easy —
            every question is graded automatically with a detailed, worked solution.
          </p>
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Feature icon="🧪" title={`${mocksCount} Full-length Mocks`} desc="Exam-pattern papers (65 Q · 100 marks · 3 hours) with section analysis and subject SWOT. First mock free." />
            <Feature icon="✍️" title={`${practiceQs}+ Practice Questions`} desc={`Topic-wise practice across ${subjectsCount} subjects, each with worked solutions and instant grading.`} />
            <Feature icon="📚" title={`${learnCount} Learn Modules`} desc="Concept, formula matrix, IIT-style traps and a 3-tier question suite — cited to standard textbooks." />
            <Feature icon="🎯" title="NTA-style Live Portal" desc="Identical to the real CBT — palette, mark-for-review, timer and auto-submit." />
            <Feature icon="📊" title="SWOT Analytics" desc="Subject-wise strengths and weaknesses, time-per-question and an accuracy trend after every attempt." />
            <Feature icon="🛡️" title="Server-side Grading" desc="Scores are computed on our servers — tamper-proof, with a detailed report each time." />
          </div>
        </div>
      </section>

    </>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card group p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="w-12 h-12 rounded-xl grid place-items-center bg-brand/10 text-2xl transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 text-center">
      <div className="text-3xl font-extrabold text-brand">{value}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}

function HeroStat({ n, label }: { n: string; label: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-sm text-white/70">
      <b className="text-base font-extrabold text-white">{n}</b> {label}
    </span>
  );
}
