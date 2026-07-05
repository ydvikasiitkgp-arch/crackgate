"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CIL_ROWS, CIL_TOTAL_SEATS } from "@/data/cil";

type CivilStats = {
  practiceQs: number;
  mocksCount: number;
  learnCount: number;
  subjectsCount: number;
};

type Props = {
  practiceQs: number;
  mocksCount: number;
  subjectsCount: number;
  civil: CivilStats;
  geology: CivilStats;
  environment: CivilStats;
};

const SLIDES = 5;
const AUTOPLAY_MS = 3000;
const EASE = [0.16, 1, 0.3, 1] as const;

export function HeroCarousel({ practiceQs, mocksCount, subjectsCount, civil, geology, environment }: Props) {
  const [[active, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const go = useCallback((next: number) => {
    setState(([cur]) => {
      const target = ((next % SLIDES) + SLIDES) % SLIDES;
      return [target, target >= cur ? 1 : -1];
    });
  }, []);

  const goRel = useCallback((delta: number) => {
    setState(([cur]) => [((cur + delta) % SLIDES + SLIDES) % SLIDES, delta]);
  }, []);

  useEffect(() => {
    if (paused || reduceMotion) return;
    timer.current = setInterval(() => {
      setState(([cur]) => [(cur + 1) % SLIDES, 1]);
    }, AUTOPLAY_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduceMotion]);

  const variants = {
    enter: (dir: number) => ({ x: reduceMotion ? 0 : dir > 0 ? "100%" : "-100%", opacity: reduceMotion ? 0 : 1 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduceMotion ? 0 : dir > 0 ? "-100%" : "100%", opacity: reduceMotion ? 0 : 1 }),
  };

  const slideLabel =
    active === 0
      ? "GATE MN 2027 — Mining Engineering"
      : active === 1
        ? "GATE CE 2027 — Civil Engineering"
        : active === 2
          ? "GATE GG 2027 — Geology & Geophysics"
          : active === 3
            ? "GATE ES 2027 — Environmental Science"
            : "PSU recruitment — Coal India Limited";

  return (
    <section
      aria-roledescription="carousel"
      aria-label="CrackGate exam tracks"
      className="relative overflow-hidden bg-slate-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="relative min-h-[680px] pb-16 lg:min-h-[720px] lg:pb-20">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={active}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: reduceMotion ? 0.3 : 0.8, ease: EASE }}
            className="absolute inset-0"
            aria-roledescription="slide"
            aria-label={slideLabel}
          >
            {active === 0 ? (
              <GateWindow practiceQs={practiceQs} mocksCount={mocksCount} subjectsCount={subjectsCount} />
            ) : active === 1 ? (
              <CivilWindow civil={civil} />
            ) : active === 2 ? (
              <GeologyWindow stats={geology} />
            ) : active === 3 ? (
              <EnvironmentWindow stats={environment} />
            ) : (
              <PsuWindow />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Arrows — hidden on touch/tablet (overlap content); dots + autoplay drive nav there */}
      <button
        type="button"
        onClick={() => goRel(-1)}
        aria-label="Previous slide"
        className="group absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur-md transition hover:bg-white/20 sm:left-5 lg:block"
      >
        <ChevronLeft />
      </button>
      <button
        type="button"
        onClick={() => goRel(1)}
        aria-label="Next slide"
        className="group absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur-md transition hover:bg-white/20 sm:right-5 lg:block"
      >
        <ChevronRight />
      </button>

      {/* Indicators — visual bar kept small but tap target padded to ~44px */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center">
        {Array.from({ length: SLIDES }).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => go(i)}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={active === i}
            className="group grid place-items-center px-1.5 py-3"
          >
            <span
              className={`h-2 rounded-full transition-all duration-300 ${
                active === i ? "w-7 bg-accent" : "w-2 bg-white/40 group-hover:bg-white/70"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

/* ───────────────────────── WINDOW 1 — GATE MN ───────────────────────── */

export function GateWindow({
  practiceQs,
  mocksCount,
  subjectsCount,
}: {
  practiceQs: number;
  mocksCount: number;
  subjectsCount: number;
}) {
  return (
    <div className="relative h-full w-full">
      <IitBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-slate-950" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-amber-300/30 bg-amber-300/10 text-amber-300">
            GATE 2027 · Mining Engineering (MN)
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-6xl">
            Conquer GATE MN 2027.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Secure Your Seat at the Premier IITs.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Engineered by elite IITians. Master Geomechanics, Advanced Ventilation, and Math through
            high-fidelity, TCS iON-standard exam simulations.
          </p>
          <div className="mt-8">
            <Link href="/mocks" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:brightness-105">
              Launch Free Exam Portal <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
            <Stat n={`${practiceQs}+`} label="Practice Questions" />
            <Stat n="200+" label="Mock Questions" />
            <Stat n={`${mocksCount}`} label="Full-length Mocks" />
            <Stat n={`${subjectsCount}`} label="Subjects" />
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-center">
          <StudentScene />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── WINDOW 2 — GATE CE (Civil) ───────────────────────── */

export function CivilWindow({ civil }: { civil: CivilStats }) {
  return (
    <div className="relative h-full w-full">
      <CivilBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-emerald-950/70" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
            GATE 2027 · Civil Engineering (CE) · NEW
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-6xl">
            Build Your GATE CE Rank.{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Engineered to the Last Decimal.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            The complete Civil track — Structural, Geotech, Water Resources, Environmental, Transportation,
            Geomatics &amp; Maths. Concept modules, an exam-grade question bank and full-length mocks, tuned a
            notch tougher than the real paper.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gate/civil/mocks" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:brightness-105">
              Launch Free Exam Portal <span aria-hidden>→</span>
            </Link>
            <Link href="/gate/civil/learn" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-300/5 px-6 py-3.5 text-base font-semibold text-emerald-200 transition hover:bg-emerald-300/15">
              Learn &amp; Solve
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
            <Stat n={`${civil.practiceQs}+`} label="Practice Questions" />
            <Stat n={`${civil.learnCount}`} label="Learn Modules" />
            <Stat n={`${civil.mocksCount}`} label="Full-length Mocks" />
            <Stat n={`${civil.subjectsCount}`} label="Subjects" />
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-center">
          <CivilScene />
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── GATE GG (Geology & Geophysics) ───────────────────────── */

type SubjectStats = {
  practiceQs: number;
  mocksCount: number;
  learnCount: number;
  subjectsCount: number;
};

export function GeologyWindow({ stats }: { stats: SubjectStats }) {
  return (
    <div className="relative h-full w-full">
      <GeologyBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-amber-950/70" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-amber-300/30 bg-amber-300/10 text-amber-200">
            GATE 2027 · Geology &amp; Geophysics (GG)
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-6xl">
            Master GATE Geology &amp; Geophysics.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              Read the Earth, Decimal by Decimal.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            The complete GG track — mineralogy &amp; petrology, structural geology, stratigraphy, geophysics
            and remote sensing. Concept modules, an exam-grade question bank and full-length mocks, tuned a
            notch tougher than the real paper.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gate/geology/mocks" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:brightness-105">
              Start free mock <span aria-hidden>→</span>
            </Link>
            <Link href="/gate/geology/learn" className="inline-flex items-center gap-2 rounded-lg border border-amber-300/40 bg-amber-300/5 px-6 py-3.5 text-base font-semibold text-amber-200 transition hover:bg-amber-300/15">
              Learn &amp; Solve
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
            <Stat n={`${stats.practiceQs}+`} label="Practice Questions" />
            <Stat n={`${stats.learnCount}`} label="Learn Modules" />
            <Stat n={`${stats.mocksCount}`} label="Full-length Mocks" />
            <Stat n={`${stats.subjectsCount}`} label="Subjects" />
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-center">
          <GeologyScene />
        </div>
      </div>
    </div>
  );
}

/* Folded rock-strata line art for the GATE GG window */
function GeologyBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.13]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#fcd34d" strokeWidth="2" aria-hidden>
        {/* folded strata */}
        {Array.from({ length: 7 }).map((_, i) => (
          <path
            key={`s${i}`}
            d={`M0 ${180 + i * 46} Q200 ${110 + i * 46} 400 ${180 + i * 46} T800 ${180 + i * 46}`}
          />
        ))}
        {/* fault line */}
        <line x1="520" y1="120" x2="600" y2="560" stroke="#fb923c" strokeWidth="2.5" />
        {/* dip-strike ticks */}
        {Array.from({ length: 5 }).map((_, i) => (
          <g key={`d${i}`} stroke="#fdba74">
            <line x1={120 + i * 130} y1="500" x2={150 + i * 130} y2="500" />
            <line x1={135 + i * 130} y1="500" x2={135 + i * 130} y2="516" />
          </g>
        ))}
      </svg>
    </div>
  );
}

/* Animated Geology scene — stereonet + strata column + crystal */
function GeologyScene() {
  const float = (delay: number) => ({
    animate: { y: [0, -10, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const, delay },
  });
  return (
    <div className="relative h-[360px] w-[360px]">
      <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-3xl" />

      {/* central stereonet */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden>
          <circle cx="110" cy="110" r="92" stroke="#fcd34d" strokeWidth="3" />
          <line x1="18" y1="110" x2="202" y2="110" stroke="#fbbf24" strokeWidth="2" />
          <line x1="110" y1="18" x2="110" y2="202" stroke="#fbbf24" strokeWidth="2" />
          {/* great-circle arcs */}
          {[-50, -25, 0, 25, 50].map((o) => (
            <path key={o} d={`M110 18 Q${110 + o * 2.4} 110 110 202`} stroke="#fdba74" strokeWidth="1.5" fill="none" />
          ))}
          {[-50, -25, 0, 25, 50].map((o) => (
            <path key={`h${o}`} d={`M18 110 Q110 ${110 + o * 2.4} 202 110`} stroke="#fdba74" strokeWidth="1.5" fill="none" />
          ))}
          <circle cx="146" cy="78" r="5" fill="#fb923c" />
        </svg>
      </motion.div>

      {/* floating strata column */}
      <motion.div {...float(0)} className="absolute left-0 top-6">
        <Holo>
          <svg width="40" height="48" viewBox="0 0 40 48" aria-hidden>
            <rect x="6" y="4" width="28" height="8" rx="1" fill="#fcd34d" />
            <rect x="6" y="14" width="28" height="8" rx="1" fill="#fb923c" />
            <rect x="6" y="24" width="28" height="8" rx="1" fill="#d97706" />
            <rect x="6" y="34" width="28" height="8" rx="1" fill="#92400e" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating crystal */}
      <motion.div {...float(0.9)} className="absolute right-0 top-12">
        <Holo>
          <svg width="42" height="44" viewBox="0 0 42 44" aria-hidden fill="none" stroke="#fde68a" strokeWidth="2" strokeLinejoin="round">
            <path d="M21 4 L34 16 L28 40 L14 40 L8 16 Z" fill="#f59e0b" fillOpacity="0.18" />
            <line x1="21" y1="4" x2="21" y2="40" />
            <line x1="8" y1="16" x2="34" y2="16" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating seismic wave */}
      <motion.div {...float(1.5)} className="absolute bottom-3 left-7">
        <Holo>
          <svg width="48" height="36" viewBox="0 0 48 36" aria-hidden fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round">
            <path d="M2 18 H12 L16 6 L22 30 L28 10 L33 22 L38 18 H46" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating rock hammer */}
      <motion.div {...float(1.2)} className="absolute bottom-7 right-6">
        <Holo>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden fill="none" stroke="#fdba74" strokeWidth="2" strokeLinecap="round">
            <rect x="6" y="8" width="20" height="8" rx="2" />
            <line x1="26" y1="12" x2="34" y2="12" />
            <line x1="16" y1="16" x2="16" y2="34" />
          </svg>
        </Holo>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── GATE ES (Environmental Science) ───────────────────────── */

export function EnvironmentWindow({ stats }: { stats: SubjectStats }) {
  return (
    <div className="relative h-full w-full">
      <EnvironmentBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-teal-950/70" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
            GATE 2027 · Environmental Science (ES)
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-6xl">
            Crack GATE Environmental Science.{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              Air, Water &amp; Earth, Quantified.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            The complete ES track — air quality, water &amp; wastewater treatment, solid &amp; hazardous waste,
            ecology and environmental management. Concept modules, an exam-grade question bank and full-length
            mocks, tuned a notch tougher than the real paper.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/gate/environment/mocks" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:brightness-105">
              Start free mock <span aria-hidden>→</span>
            </Link>
            <Link href="/gate/environment/learn" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-300/5 px-6 py-3.5 text-base font-semibold text-emerald-200 transition hover:bg-emerald-300/15">
              Learn &amp; Solve
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-6 text-sm text-white/70">
            <Stat n={`${stats.practiceQs}+`} label="Practice Questions" />
            <Stat n={`${stats.learnCount}`} label="Learn Modules" />
            <Stat n={`${stats.mocksCount}`} label="Full-length Mocks" />
            <Stat n={`${stats.subjectsCount}`} label="Subjects" />
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-center">
          <EnvironmentScene />
        </div>
      </div>
    </div>
  );
}

/* Flowing water + leaf line art for the GATE ES window */
function EnvironmentBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.13]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#5eead4" strokeWidth="2" aria-hidden>
        {/* water waves */}
        {Array.from({ length: 6 }).map((_, i) => (
          <path
            key={`w${i}`}
            d={`M0 ${260 + i * 48} Q100 ${230 + i * 48} 200 ${260 + i * 48} T400 ${260 + i * 48} T600 ${260 + i * 48} T800 ${260 + i * 48}`}
          />
        ))}
        {/* rising bubbles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <circle key={`b${i}`} cx={120 + i * 120} cy={200 - (i % 3) * 30} r={6 + (i % 3) * 3} stroke="#6ee7b7" />
        ))}
        {/* stylised leaf */}
        <path d="M620 120 Q700 60 760 140 Q700 200 620 120 Z" stroke="#34d399" strokeWidth="2.5" />
        <line x1="640" y1="135" x2="745" y2="135" stroke="#34d399" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

/* Animated Environment scene — treatment process + droplet + leaf */
function EnvironmentScene() {
  const float = (delay: number) => ({
    animate: { y: [0, -10, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const, delay },
  });
  return (
    <div className="relative h-[360px] w-[360px]">
      <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-3xl" />

      {/* central treatment-process card */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <svg width="240" height="180" viewBox="0 0 240 180" fill="none" aria-hidden>
          {/* sedimentation tanks */}
          <rect x="20" y="70" width="56" height="70" rx="4" stroke="#34d399" strokeWidth="3" />
          <rect x="92" y="70" width="56" height="70" rx="4" stroke="#2dd4bf" strokeWidth="3" />
          <rect x="164" y="70" width="56" height="70" rx="4" stroke="#22d3ee" strokeWidth="3" />
          {/* water level */}
          <path d="M20 96 Q48 88 76 96 V140 H20 Z" fill="#0ea5e9" fillOpacity="0.25" />
          <path d="M92 100 Q120 92 148 100 V140 H92 Z" fill="#14b8a6" fillOpacity="0.25" />
          <path d="M164 104 Q192 96 220 104 V140 H164 Z" fill="#06b6d4" fillOpacity="0.25" />
          {/* connecting flow */}
          <line x1="76" y1="110" x2="92" y2="110" stroke="#5eead4" strokeWidth="3" />
          <line x1="148" y1="110" x2="164" y2="110" stroke="#5eead4" strokeWidth="3" />
          {/* clean-out arrow */}
          <line x1="220" y1="60" x2="232" y2="60" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" />
          <polyline points="226,54 232,60 226,66" stroke="#6ee7b7" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* floating droplet */}
      <motion.div {...float(0)} className="absolute left-1 top-6">
        <Holo>
          <svg width="36" height="44" viewBox="0 0 36 44" aria-hidden fill="none" stroke="#22d3ee" strokeWidth="2">
            <path d="M18 6 C26 18 30 26 30 32 A12 12 0 0 1 6 32 C6 26 10 18 18 6 Z" fill="#06b6d4" fillOpacity="0.18" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating leaf */}
      <motion.div {...float(0.8)} className="absolute right-1 top-12">
        <Holo>
          <svg width="44" height="40" viewBox="0 0 44 40" aria-hidden fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
            <path d="M8 32 Q8 8 36 6 Q34 32 10 34" fill="#34d399" fillOpacity="0.15" />
            <line x1="12" y1="30" x2="32" y2="12" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating CO₂ / air-quality gauge */}
      <motion.div {...float(1.5)} className="absolute bottom-2 left-8">
        <Holo>
          <svg width="44" height="40" viewBox="0 0 44 40" aria-hidden fill="none" stroke="#5eead4" strokeWidth="2" strokeLinecap="round">
            <path d="M6 30 A16 16 0 0 1 38 30" />
            <line x1="22" y1="30" x2="32" y2="16" />
            <circle cx="22" cy="30" r="2.5" fill="#5eead4" stroke="none" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating recycle loop */}
      <motion.div {...float(1.2)} className="absolute bottom-6 right-6">
        <Holo>
          <motion.svg
            width="40" height="40" viewBox="0 0 40 40" aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
            fill="none" stroke="#2dd4bf" strokeWidth="2.5" strokeLinecap="round"
          >
            {[0, 120, 240].map((a) => (
              <g key={a} transform={`rotate(${a} 20 20)`}>
                <path d="M20 7 A13 13 0 0 1 31 14" />
                <polyline points="28,8 31,14 25,15" fill="none" />
              </g>
            ))}
          </motion.svg>
        </Holo>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── WINDOW 3 — PSU / CIL ───────────────────────── */

export function PsuWindow() {
  return (
    <div className="relative h-full w-full">
      <OpencastBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-blue-950/80 to-slate-900" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-16 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
            PSU Recruitment · Coal India Limited
          </span>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight lg:text-6xl">
            Crack the PSU Exams.{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Direct Route to Coal India Limited (CIL).
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-white/80">
            Maximize your rank for Management Trainee (MT) positions. Tailored question banks targeting
            mining legislation, DGMS safety guidelines, and historical PSU weightage matrices.
          </p>
          <div className="mt-8">
            <Link href="/psu/cil" className="cg-neon inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-cyan-400/10 px-6 py-3.5 text-base font-semibold text-cyan-200 transition hover:bg-cyan-400/20">
              Explore PSU Prep Modules <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
        <div className="lg:pl-4">
          <CilEligibilityCard />
        </div>
      </div>
    </div>
  );
}

function CilEligibilityCard() {
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-slate-900/60 p-4 shadow-pop backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          CIL Management Trainee · Eligibility &amp; Seats
        </div>
        <span className="badge bg-cyan-400/10 text-cyan-200">{CIL_TOTAL_SEATS} seats</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-800/90 text-cyan-200 backdrop-blur">
            <tr>
              <th className="px-2 py-2 font-semibold">Code</th>
              <th className="px-2 py-2 font-semibold">Discipline</th>
              <th className="px-2 py-2 text-right font-semibold">Seats</th>
              <th className="px-2 py-2 font-semibold">Minimum Qualification</th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            {CIL_ROWS.map((r) => (
              <tr key={r.code} className="border-t border-white/5 align-top">
                <td className="px-2 py-2 font-mono text-cyan-300">{r.code}</td>
                <td className="px-2 py-2 font-medium text-white">{r.discipline}</td>
                <td className="px-2 py-2 text-right font-mono font-semibold text-cyan-200">{r.seats}</td>
                <td className="px-2 py-2 leading-snug">{r.qualification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────────── Shared bits ───────────────────────── */

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-extrabold text-white">{n}</div>
      <div className="text-xs uppercase tracking-wide">{label}</div>
    </div>
  );
}

function ChevronLeft() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

/* Faint heritage-building line art for the GATE window */
function IitBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute right-0 top-0 h-full w-full opacity-[0.12]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#e2e8f0" strokeWidth="2" aria-hidden>
        <rect x="120" y="220" width="560" height="300" />
        <rect x="360" y="120" width="80" height="100" />
        <path d="M340 120 L400 60 L460 120 Z" />
        <line x1="120" y1="300" x2="680" y2="300" />
        {Array.from({ length: 11 }).map((_, i) => (
          <line key={i} x1={150 + i * 50} y1="300" x2={150 + i * 50} y2="520" />
        ))}
        <line x1="120" y1="430" x2="680" y2="430" />
        <circle cx="400" cy="170" r="14" />
      </svg>
    </div>
  );
}

/* Opencast shovel-dumper bench line art for the PSU window */
function OpencastBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.14]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#67e8f9" strokeWidth="2" aria-hidden>
        {/* stepped benches */}
        <path d="M0 520 H300 V440 H520 V360 H720 V280 H800" />
        <path d="M0 560 H360 V480 H560 V400 H760 V320 H800" />
        {/* dumper truck */}
        <g transform="translate(120 470)">
          <path d="M0 0 H120 L150 -40 H40 L0 0 Z" />
          <circle cx="35" cy="14" r="16" />
          <circle cx="110" cy="14" r="16" />
        </g>
        {/* shovel */}
        <g transform="translate(560 320)">
          <rect x="0" y="0" width="60" height="50" />
          <path d="M60 10 L120 -20 L150 0 L120 30 Z" />
        </g>
      </svg>
    </div>
  );
}

/* Lightweight animated student-at-laptop with floating mining symbols */
function StudentScene() {
  const float = (delay: number) => ({
    animate: { y: [0, -10, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const, delay },
  });
  return (
    <div className="relative h-[360px] w-[360px]">
      {/* glow */}
      <div className="absolute inset-0 rounded-full bg-amber-400/10 blur-3xl" />

      {/* student card */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <svg width="220" height="220" viewBox="0 0 220 220" fill="none" aria-hidden>
          <circle cx="110" cy="70" r="34" fill="#fbbf24" />
          <rect x="64" y="104" width="92" height="64" rx="14" fill="#6366f1" />
          <rect x="40" y="168" width="140" height="14" rx="6" fill="#1e293b" />
          <rect x="56" y="150" width="108" height="22" rx="4" fill="#334155" />
          <rect x="70" y="120" width="80" height="34" rx="4" fill="#0ea5e9" />
          <line x1="78" y1="130" x2="142" y2="130" stroke="#e0f2fe" strokeWidth="3" strokeLinecap="round" />
          <line x1="78" y1="140" x2="120" y2="140" stroke="#bae6fd" strokeWidth="3" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* floating safety helmet */}
      <motion.div {...float(0)} className="absolute left-2 top-6">
        <Holo>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
            <path d="M6 26 a14 14 0 0 1 28 0 Z" fill="#f59e0b" />
            <rect x="4" y="26" width="32" height="5" rx="2.5" fill="#fcd34d" />
            <rect x="18" y="6" width="4" height="8" rx="2" fill="#fde68a" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating ventilation fan */}
      <motion.div {...float(0.8)} className="absolute right-2 top-12">
        <Holo>
          <motion.svg
            width="42" height="42" viewBox="0 0 42 42" aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          >
            <circle cx="21" cy="21" r="20" stroke="#38bdf8" strokeWidth="2" fill="none" />
            {[0, 120, 240].map((a) => (
              <path key={a} d="M21 21 C 28 8, 36 14, 21 21" fill="#7dd3fc" transform={`rotate(${a} 21 21)`} />
            ))}
            <circle cx="21" cy="21" r="3.5" fill="#0ea5e9" />
          </motion.svg>
        </Holo>
      </motion.div>

      {/* floating coordinate grid */}
      <motion.div {...float(1.6)} className="absolute bottom-4 left-10">
        <Holo>
          <svg width="48" height="40" viewBox="0 0 48 40" aria-hidden fill="none" stroke="#34d399" strokeWidth="1.5">
            <rect x="2" y="2" width="44" height="36" rx="3" />
            <line x1="14" y1="2" x2="14" y2="38" />
            <line x1="26" y1="2" x2="26" y2="38" />
            <line x1="38" y1="2" x2="38" y2="38" />
            <line x1="2" y1="14" x2="46" y2="14" />
            <line x1="2" y1="26" x2="46" y2="26" />
            <circle cx="26" cy="14" r="3" fill="#34d399" stroke="none" />
          </svg>
        </Holo>
      </motion.div>
    </div>
  );
}

function Holo({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 p-2 shadow-lg backdrop-blur-md">
      {children}
    </div>
  );
}

/* Cable-stayed bridge + skyline line art for the GATE CE window */
function CivilBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.13]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#6ee7b7" strokeWidth="2" aria-hidden>
        {/* deck */}
        <line x1="0" y1="430" x2="800" y2="430" />
        <line x1="0" y1="446" x2="800" y2="446" />
        {/* pylons */}
        <line x1="280" y1="430" x2="280" y2="150" />
        <line x1="520" y1="430" x2="520" y2="150" />
        {/* cables */}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`l${i}`} x1="280" y1="150" x2={280 - (i + 1) * 38} y2="430" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`r${i}`} x1="280" y1="150" x2={280 + (i + 1) * 38} y2="430" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`l2${i}`} x1="520" y1="150" x2={520 - (i + 1) * 38} y2="430" />
        ))}
        {Array.from({ length: 6 }).map((_, i) => (
          <line key={`r2${i}`} x1="520" y1="150" x2={520 + (i + 1) * 38} y2="430" />
        ))}
        {/* piers */}
        <line x1="180" y1="446" x2="180" y2="560" />
        <line x1="400" y1="446" x2="400" y2="560" />
        <line x1="620" y1="446" x2="620" y2="560" />
        {/* skyline */}
        <rect x="40" y="320" width="60" height="110" />
        <rect x="700" y="290" width="60" height="140" />
        <rect x="110" y="360" width="40" height="70" />
      </svg>
    </div>
  );
}

/* Animated Civil-engineering scene — truss bridge + floating holos */
export function CivilScene() {
  const float = (delay: number) => ({
    animate: { y: [0, -10, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const, delay },
  });
  return (
    <div className="relative h-[360px] w-[360px]">
      {/* glow */}
      <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-3xl" />

      {/* central truss bridge card */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <svg width="240" height="180" viewBox="0 0 240 180" fill="none" aria-hidden>
          {/* deck */}
          <rect x="20" y="120" width="200" height="12" rx="3" fill="#0ea5e9" />
          {/* truss top chord */}
          <line x1="30" y1="120" x2="70" y2="70" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
          <line x1="70" y1="70" x2="170" y2="70" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
          <line x1="170" y1="70" x2="210" y2="120" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
          {/* diagonals */}
          <line x1="70" y1="70" x2="95" y2="120" stroke="#6ee7b7" strokeWidth="3" />
          <line x1="120" y1="70" x2="95" y2="120" stroke="#6ee7b7" strokeWidth="3" />
          <line x1="120" y1="70" x2="145" y2="120" stroke="#6ee7b7" strokeWidth="3" />
          <line x1="170" y1="70" x2="145" y2="120" stroke="#6ee7b7" strokeWidth="3" />
          <line x1="70" y1="70" x2="70" y2="120" stroke="#6ee7b7" strokeWidth="3" />
          <line x1="120" y1="70" x2="120" y2="120" stroke="#6ee7b7" strokeWidth="3" />
          <line x1="170" y1="70" x2="170" y2="120" stroke="#6ee7b7" strokeWidth="3" />
          {/* nodes */}
          {[[70, 70], [120, 70], [170, 70], [70, 120], [95, 120], [120, 120], [145, 120], [170, 120]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="#bbf7d0" />
          ))}
          {/* piers */}
          <rect x="36" y="132" width="14" height="40" rx="3" fill="#1e293b" />
          <rect x="190" y="132" width="14" height="40" rx="3" fill="#1e293b" />
        </svg>
      </motion.div>

      {/* floating load arrow (UDL) */}
      <motion.div {...float(0)} className="absolute left-1 top-4">
        <Holo>
          <svg width="44" height="40" viewBox="0 0 44 40" aria-hidden fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
            <line x1="6" y1="6" x2="38" y2="6" />
            {[10, 22, 34].map((x) => (
              <g key={x}>
                <line x1={x} y1="8" x2={x} y2="28" />
                <polyline points={`${x - 4},22 ${x},28 ${x + 4},22`} />
              </g>
            ))}
          </svg>
        </Holo>
      </motion.div>

      {/* floating bending-moment curve */}
      <motion.div {...float(0.8)} className="absolute right-1 top-10">
        <Holo>
          <svg width="46" height="40" viewBox="0 0 46 40" aria-hidden fill="none" stroke="#5eead4" strokeWidth="2">
            <line x1="4" y1="10" x2="42" y2="10" />
            <path d="M4 10 Q23 44 42 10" stroke="#2dd4bf" strokeWidth="2.5" fill="none" />
            <line x1="23" y1="10" x2="23" y2="32" strokeDasharray="3 3" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating theodolite / total station */}
      <motion.div {...float(1.6)} className="absolute bottom-2 left-8">
        <Holo>
          <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="38" x2="21" y2="20" />
            <line x1="34" y1="38" x2="21" y2="20" />
            <line x1="21" y1="38" x2="21" y2="20" />
            <rect x="13" y="10" width="16" height="11" rx="2" />
            <line x1="29" y1="15" x2="38" y2="15" />
            <circle cx="21" cy="8" r="2.5" fill="#6ee7b7" stroke="none" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating spinning gear (construction mgmt) */}
      <motion.div {...float(1.2)} className="absolute bottom-6 right-6">
        <Holo>
          <motion.svg
            width="40" height="40" viewBox="0 0 40 40" aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            fill="none" stroke="#34d399" strokeWidth="2"
          >
            <circle cx="20" cy="20" r="7" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              const x1 = 20 + Math.cos(a) * 11;
              const y1 = 20 + Math.sin(a) * 11;
              const x2 = 20 + Math.cos(a) * 16;
              const y2 = 20 + Math.sin(a) * 16;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} strokeLinecap="round" />;
            })}
          </motion.svg>
        </Holo>
      </motion.div>
    </div>
  );
}
