"use client";

import Link from "next/link";
import { WHATSAPP_COMMUNITY_URL } from "@/lib/contact";
import { type ExamTrack } from "@/data/catalog";

/* ─── Real data, no fabrication ─── */

type CourseMeta = {
  exam: ExamTrack;
  slug: string;
  label: string;
  href: string;
  mocks: number;
  questions: number;
  price: number;
  features: string[];
  gradient: string;
  accent: string;
  badge: string;
  urgency: string | null;
  freeMock: boolean;
  /** Cards with live recruitment get a pulsing glow. */
  liveRecruitment?: boolean;
};

const COURSES: CourseMeta[] = [
  // ── GATE ──
  {
    exam: "GATE", slug: "mining", label: "Mining Engineering (MN)",
    href: "/gate/mining",
    mocks: 20, questions: 1400, price: 499,
    gradient: "from-indigo-600 to-violet-600",
    accent: "text-indigo-400",
    badge: "bg-indigo-500/15 text-indigo-300",
    freeMock: true,
    urgency: "GATE 2027 expected Feb — start now",
    features: ["20 full-length mocks · 65 Qs each", "Topic-wise practice bank", "All India Test Series", "Predicted AIR based on your scores"],
  },
  {
    exam: "GATE", slug: "civil", label: "Civil Engineering (CE)",
    href: "/gate/civil",
    mocks: 20, questions: 1430, price: 499,
    gradient: "from-sky-600 to-blue-600",
    accent: "text-sky-400",
    badge: "bg-sky-500/15 text-sky-300",
    freeMock: true,
    urgency: "GATE 2027 expected Feb — start now",
    features: ["20 full-length mocks · 65 Qs each", "14 topic-wise practice sets", "All India Test Series", "Predicted AIR based on your scores"],
  },
  {
    exam: "GATE", slug: "geology", label: "Geology & Geophysics (GG)",
    href: "/gate/geology",
    mocks: 20, questions: 1430, price: 499,
    gradient: "from-teal-600 to-emerald-600",
    accent: "text-teal-400",
    badge: "bg-teal-500/15 text-teal-300",
    freeMock: true,
    urgency: "GATE 2027 expected Feb — start now",
    features: ["20 full-length mocks · 65 Qs each", "14 topic-wise practice sets", "All India Test Series", "Predicted AIR based on your scores"],
  },
  {
    exam: "GATE", slug: "environment", label: "Env. Science & Engg. (ES)",
    href: "/gate/environment",
    mocks: 20, questions: 1390, price: 499,
    gradient: "from-green-600 to-lime-600",
    accent: "text-green-400",
    badge: "bg-green-500/15 text-green-300",
    freeMock: true,
    urgency: "GATE 2027 expected Feb — start now",
    features: ["20 full-length mocks · 65 Qs each", "10 topic-wise practice sets", "All India Test Series", "Predicted AIR based on your scores"],
  },

  // ── PSU CIL ──
  {
    exam: "PSU", slug: "cil", label: "Coal India (CIL) — All 7 Disciplines",
    href: "/psu/cil",
    mocks: 19, questions: 8645, price: 499,
    gradient: "from-cyan-600 to-teal-600",
    accent: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-300",
    freeMock: false,
    urgency: "651 Management Trainee seats — live",
    liveRecruitment: true,
    features: ["19 mocks per discipline · 7 disciplines", "8,600+ practice questions total", "Sectional analytics", "Pattern-matched to CIL CBT"],
  },

  // ── PSU ONGC ──
  {
    exam: "PSU", slug: "ongc", label: "ONGC — 5 Disciplines",
    href: "/psu/ongc",
    mocks: 19, questions: 6175, price: 499,
    gradient: "from-orange-600 to-amber-600",
    accent: "text-orange-400",
    badge: "bg-orange-500/15 text-orange-300",
    freeMock: false,
    urgency: "52 vacancies · Advt. No. 1/2025",
    liveRecruitment: true,
    features: ["19 mocks per discipline · 5 disciplines", "6,100+ practice questions total", "85-MCQ CBT pattern · 120 min", "Sectional analytics"],
  },

  // ── DIPLOMA: NCL ──
  {
    exam: "DIPLOMA", slug: "ncl-mining-sirdar", label: "NCL Mining Sirdar T&S Gr. C",
    href: "/diploma/ncl/mining-sirdar",
    mocks: 20, questions: 2000, price: 399,
    gradient: "from-emerald-600 to-green-600",
    accent: "text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300",
    freeMock: false,
    urgency: "254 posts — Advt. 10 Jul 2026",
    liveRecruitment: true,
    features: ["20 full-length mocks · 100 Qs each", "100 MCQ · 90 min · Bilingual", "100 marks · No negative marking", "CMR 2017 + DGMS focused"],
  },
  {
    exam: "DIPLOMA", slug: "ncl-surveyor", label: "NCL Surveyor (Mining) T&S Gr. B",
    href: "/diploma/ncl/surveyor",
    mocks: 20, questions: 2000, price: 399,
    gradient: "from-violet-600 to-purple-600",
    accent: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300",
    freeMock: false,
    urgency: "5 posts — Advt. 10 Jul 2026",
    liveRecruitment: true,
    features: ["20 full-length mocks · 100 Qs each", "Survey-specific 100 MCQ pattern", "Theodolite, Total Station, GPS", "Mine plan & section prep"],
  },

  // ── DIPLOMA: WCL ──
  {
    exam: "DIPLOMA", slug: "wcl-sirdar", label: "WCL Mining Sirdar",
    href: "/diploma/wcl/mining-sirdar",
    mocks: 20, questions: 2000, price: 399,
    gradient: "from-amber-600 to-yellow-600",
    accent: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-300",
    freeMock: false,
    urgency: "Live recruitment — check WCL notifications",
    features: ["20 full-length mocks · 100 Qs each", "80 Technical + 20 General", "120 min · 100 marks · No neg. marking", "CMR 2017 + Mines Act 1952"],
  },
  {
    exam: "DIPLOMA", slug: "wcl-af-electrical", label: "WCL Asst. Foreman (Electrical)",
    href: "/diploma/wcl/assistant-foreman-electrical",
    mocks: 20, questions: 2000, price: 399,
    gradient: "from-rose-600 to-pink-600",
    accent: "text-rose-400",
    badge: "bg-rose-500/15 text-rose-300",
    freeMock: false,
    urgency: "Live recruitment — check WCL notifications",
    features: ["20 full-length mocks · 100 Qs each", "Electrical engineering focus", "FLP + intrinsically safe devices", "Mine safety regulations"],
  },
];

/* ─── Urgency banner ─── */
const URGENCY_ITEMS = [
  { text: "NCL Mining Sirdar — 254 posts live", color: "text-emerald-400", dot: "bg-emerald-400" },
  { text: "CIL MT — 651 seats across 7 disciplines", color: "text-cyan-400", dot: "bg-cyan-400" },
  { text: "ONGC — 52 vacancies · 5 disciplines", color: "text-orange-400", dot: "bg-orange-400" },
  { text: "GATE 2027 — expected Feb 2027", color: "text-indigo-400", dot: "bg-indigo-400" },
];

const SECTION_META: Record<ExamTrack, { icon: string; label: string; gradient: string }> = {
  GATE: { icon: "🎓", label: "GATE 2027", gradient: "from-indigo-500 to-violet-500" },
  PSU: { icon: "🏭", label: "PSU Recruitment", gradient: "from-cyan-500 to-teal-500" },
  DIPLOMA: { icon: "⛏️", label: "Diploma & Coalfields", gradient: "from-emerald-500 to-green-500" },
  STATE: { icon: "🏛️", label: "State Exams", gradient: "from-amber-500 to-orange-500" },
};

function formatPrice(p: number): string {
  return `₹${p}`;
}

function formatQuestions(n: number): string {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}K` : `${n}`;
}

/* ─── Hero stats — real computed numbers ─── */
function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="relative text-center px-3 py-2 rounded-xl bg-white/5 dark:bg-white/[0.03] border border-white/5">
      <div className="text-xl sm:text-2xl font-extrabold tabular-nums bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-muted font-semibold mt-0.5">{label}</div>
    </div>
  );
}

/* ─── Urgency ticker with pulsing LIVE dot ─── */
function UrgencyTicker() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-2 px-1">
      <span className="shrink-0 inline-flex items-center gap-1.5 badge text-[10px] font-bold uppercase bg-red-500/15 text-red-400">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
        </span>
        Live
      </span>
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
        {URGENCY_ITEMS.map((item, i) => (
          <span key={i} className="shrink-0 flex items-center gap-2 text-xs font-semibold">
            <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} />
            <span className={item.color}>{item.text}</span>
            {i < URGENCY_ITEMS.length - 1 && <span className="text-border mx-0.5">·</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ─── */
export function ChooseExam({ firstName }: { firstName: string }) {
  const grouped = new Map<ExamTrack, CourseMeta[]>();
  for (const c of COURSES) {
    const arr = grouped.get(c.exam) ?? [];
    arr.push(c);
    grouped.set(c.exam, arr);
  }

  const order: ExamTrack[] = ["GATE", "PSU", "DIPLOMA"];
  const totalMocks = COURSES.reduce((s, c) => s + c.mocks, 0);
  const totalQuestions = COURSES.reduce((s, c) => s + c.questions, 0);

  return (
    <section className="space-y-6">
      {/* ── Hero ── */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface via-surface to-canvas p-6 sm:p-10">
        <div aria-hidden className="pointer-events-none absolute -left-20 -top-20 h-60 w-60 rounded-full bg-brand/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-accent/8 blur-3xl" />

        <div className="relative">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Welcome, {firstName}{" "}
            <span className="inline-block animate-[cg-success-pulse_0.6s_ease-out]">👋</span>
          </h1>
          <p className="text-muted mt-3 text-base sm:text-lg max-w-2xl">
            Pick an exam below and start practising. Every track has real exam-pattern mocks
            with detailed solutions and analytics — no filler content.
          </p>
        </div>

        {/* Stats — real computed numbers */}
        <div className="relative flex flex-wrap items-center gap-3 sm:gap-4 mt-6">
          <HeroStat value={`${totalMocks}+`} label="Exam Mocks" />
          <HeroStat value={`${formatQuestions(totalQuestions)}+`} label="Questions" />
          <HeroStat value="4" label="Exam Tracks" />
          <HeroStat value="100%" label="Solutions" />
        </div>

        {/* Urgency ticker */}
        <div className="relative mt-5 pt-4 border-t border-line">
          <UrgencyTicker />
        </div>
      </div>

      {/* ── Course groups ── */}
      {order.map((exam) => {
        const courses = grouped.get(exam);
        if (!courses || courses.length === 0) return null;
        const meta = SECTION_META[exam];

        return (
          <div key={exam} className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-lg">{meta.icon}</span>
              <h2 className="text-lg font-extrabold">{meta.label}</h2>
              <div className={`flex-1 h-px bg-gradient-to-r ${meta.gradient} opacity-20`} />
              <span className="badge text-[10px] font-bold uppercase bg-surface-elevated text-muted">
                {courses.length} {courses.length === 1 ? "course" : "courses"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((c, i) => (
                <Link
                  key={c.slug}
                  href={c.href}
                  className={[
                    "group relative flex flex-col card overflow-hidden transition-all duration-200",
                    "hover:-translate-y-0.5 animate-in fade-in",
                    // Left border accent on hover
                    "border-l-2 border-l-transparent hover:border-l-brand",
                    // Pulsing glow for live recruitment cards
                    c.liveRecruitment ? "cg-pulse" : "hover:border-brand/50 hover:shadow-pop",
                  ].join(" ")}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  {/* Gradient top bar */}
                  <div className={`h-1 w-full bg-gradient-to-r ${c.gradient}`} />

                  <div className="flex flex-col flex-1 p-5">
                    {/* Top row: badge + free mock */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`badge text-[10px] font-bold uppercase ${c.badge}`}>
                        {c.exam}
                      </span>
                      {c.freeMock && (
                        <span className="text-[10px] font-bold text-ok bg-ok/10 rounded-full px-2 py-0.5">
                          1 Free Mock
                        </span>
                      )}
                    </div>

                    {/* Course name */}
                    <h3 className="text-sm font-extrabold leading-snug line-clamp-2 min-h-[2rem]">
                      {c.label}
                    </h3>

                    {/* Urgency line — pulsing glow for live recruitment */}
                    {c.urgency && (
                      <p className={`mt-2 text-xs font-semibold ${c.accent} line-clamp-1 ${c.liveRecruitment ? "cg-pulse-emerald" : ""}`}>
                        🔥 {c.urgency}
                      </p>
                    )}

                    {/* Value props */}
                    <ul className="mt-3 space-y-1.5 flex-1">
                      {c.features.map((f, fi) => (
                        <li key={fi} className="flex items-start gap-1.5 text-xs text-muted leading-relaxed">
                          <span className="mt-0.5 h-1 w-1 rounded-full bg-border shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    {/* Price + CTA row */}
                    <div className="mt-4 pt-3 border-t border-line flex items-center justify-between">
                      <div>
                        <span className="text-lg font-extrabold">{formatPrice(c.price)}</span>
                        <span className="text-xs text-muted ml-1">/ track</span>
                      </div>
                      <span className="text-sm font-semibold text-brand inline-flex items-center gap-1 group-hover:gap-2 transition-all duration-200">
                        {c.freeMock ? "Try Free" : "Start Prep"}
                        <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })}

      {/* ── WhatsApp community CTA ── */}
      <div className="relative overflow-hidden rounded-2xl border border-line bg-gradient-to-r from-emerald-900/20 to-green-900/20 p-6 sm:p-8">
        {/* Subtle chat bubble pattern */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.03]">
          <div className="absolute top-4 left-8 w-16 h-10 rounded-2xl rounded-bl-sm border-2 border-current" />
          <div className="absolute top-8 left-28 w-20 h-10 rounded-2xl rounded-bl-sm border-2 border-current" />
          <div className="absolute bottom-4 right-12 w-14 h-10 rounded-2xl rounded-br-sm border-2 border-current" />
          <div className="absolute bottom-8 right-32 w-18 h-10 rounded-2xl rounded-br-sm border-2 border-current" />
        </div>

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <span className="text-xl">💬</span>
              Got questions? Talk to us on WhatsApp
            </h3>
            <p className="text-sm text-muted mt-1">
              Doubts about which exam to pick, pricing, or how the platform works — we reply fast.
            </p>
          </div>
          <a
            href={WHATSAPP_COMMUNITY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 badge bg-emerald-500 text-white font-bold text-sm px-5 py-2.5 rounded-full hover:bg-emerald-400 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/25"
          >
            Chat on WhatsApp
          </a>
        </div>
      </div>

      {/* ── Trust signals — checkmarks ── */}
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted pt-2">
        <span className="flex items-center gap-1.5">
          <span className="text-ok text-sm">✓</span>
          Real exam-pattern questions
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-ok text-sm">✓</span>
          Detailed solutions for every question
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-ok text-sm">✓</span>
          Instant performance analytics
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-ok text-sm">✓</span>
          No subscription — pay once per track
        </span>
      </div>
    </section>
  );
}
