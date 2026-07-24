"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CIL_ROWS, CIL_TOTAL_SEATS } from "@/data/cil";
import { ONGC_ROWS } from "@/data/ongc";
import { ongcLiveSetNos } from "@/data/ongc-mock-bank";

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

const SLIDES = 8;
const AUTOPLAY_MS = 5000;
const EASE = [0.16, 1, 0.3, 1] as const;

/* ─── Slide metadata ─── */
const SLIDE_META = [
  { label: "NCL", type: "diploma" as const, deadline: "2026-08-05", color: "blue" },
  { label: "WCL", type: "diploma" as const, deadline: "2026-08-10", color: "emerald" },
  { label: "ONGC", type: "psu" as const, deadline: null, color: "blue" },
  { label: "MN", type: "gate" as const, deadline: null, color: "amber" },
  { label: "CE", type: "gate" as const, deadline: null, color: "emerald" },
  { label: "GG", type: "gate" as const, deadline: null, color: "amber" },
  { label: "ES", type: "gate" as const, deadline: null, color: "emerald" },
  { label: "CIL", type: "psu" as const, deadline: null, color: "cyan" },
];

const SLIDE_LABELS = [
  "Diploma recruitment — Northern Coalfields Limited",
  "Diploma recruitment — Western Coalfields Limited",
  "PSU recruitment — Oil & Natural Gas Corporation",
  "GATE MN 2027 — Mining Engineering",
  "GATE CE 2027 — Civil Engineering",
  "GATE GG 2027 — Geology and Geophysics",
  "GATE ES 2027 — Environmental Science and Engineering",
  "PSU recruitment — Coal India Limited",
];

/* ───────────────────────── MAIN CAROUSEL ───────────────────────── */

export function HeroCarousel({ practiceQs, mocksCount, subjectsCount, civil, geology, environment }: Props) {
  const [[active, direction], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStart = useRef<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const go = useCallback((next: number) => {
    setState(([cur]) => {
      const target = ((next % SLIDES) + SLIDES) % SLIDES;
      return [target, target >= cur ? 1 : -1];
    });
  }, []);

  const goRel = useCallback((delta: number) => {
    setState(([cur]) => [((cur + delta) % SLIDES + SLIDES) % SLIDES, delta]);
  }, []);

  /* Autoplay */
  useEffect(() => {
    if (paused || reduceMotion) return;
    timer.current = setInterval(() => {
      setState(([cur]) => [(cur + 1) % SLIDES, 1]);
    }, AUTOPLAY_MS);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [paused, reduceMotion]);

  /* Keyboard navigation */
  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); goRel(-1); }
    if (e.key === "ArrowRight") { e.preventDefault(); goRel(1); }
  }, [goRel]);

  /* Touch swipe */
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart.current === null) return;
    const delta = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 50) goRel(delta > 0 ? 1 : -1);
    touchStart.current = null;
  }, [goRel]);

  /* Stagger variants for text content */
  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  };

  const variants = {
    enter: (dir: number) => ({ x: reduceMotion ? 0 : dir > 0 ? "100%" : "-100%", opacity: reduceMotion ? 0 : 1 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: reduceMotion ? 0 : dir > 0 ? "-100%" : "100%", opacity: reduceMotion ? 0 : 1 }),
  };

  const meta = SLIDE_META[active];

  return (
    <section
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="CrackGate exam tracks"
      className="relative overflow-hidden bg-slate-950 text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      tabIndex={0}
    >
      {/* ── Themed particles ── */}
      <SlideParticles theme={meta.color} />

      {/* ── Slides ── */}
      <div className="relative min-h-[500px] pb-16 sm:min-h-[600px] sm:pb-16 lg:min-h-[720px] lg:pb-20">
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
            aria-label={SLIDE_LABELS[active]}
          >
            {active === 0 ? (
              <NclWindow />
            ) : active === 1 ? (
              <WclWindow />
            ) : active === 2 ? (
              <OngcWindow />
            ) : active === 3 ? (
              <GateWindow practiceQs={practiceQs} mocksCount={mocksCount} subjectsCount={subjectsCount} />
            ) : active === 4 ? (
              <CivilWindow civil={civil} />
            ) : active === 5 ? (
              <GeologyWindow stats={geology} />
            ) : active === 6 ? (
              <EnvironmentWindow stats={environment} />
            ) : (
              <PsuWindow />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Arrows (desktop) ── */}
      <button type="button" onClick={() => goRel(-1)} aria-label="Previous slide"
        className="group absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur-md transition hover:bg-white/20 sm:left-5 lg:block">
        <ChevronLeft />
      </button>
      <button type="button" onClick={() => goRel(1)} aria-label="Next slide"
        className="group absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full border border-white/20 bg-white/10 p-2.5 backdrop-blur-md transition hover:bg-white/20 sm:right-5 lg:block">
        <ChevronRight />
      </button>

      {/* ── Slide counter ── */}
      <div className="absolute top-4 right-4 z-20 rounded-full bg-white/10 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/70">
        {active + 1} / {SLIDES}
      </div>

      {/* ── Progress indicators ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20" style={{ background: "linear-gradient(transparent, rgba(2,6,23,0.8))" }}>
        {/* Mobile: dot indicators */}
        <div className="flex items-center justify-center gap-2 px-4 pb-4 pt-6 md:hidden">
          {SLIDE_META.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to ${s.label}`}
              aria-current={active === i}
              className="relative flex items-center justify-center"
            >
              <span className={`block rounded-full transition-all duration-300 ${active === i ? "h-2 w-2 bg-accent" : "h-1.5 w-1.5 bg-white/30"}`} />
              {active === i && (
                <motion.span
                  className="absolute inset-0 m-auto h-2 w-2 rounded-full bg-accent"
                  initial={{ scale: 0.8, opacity: 0.6 }}
                  animate={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 1.8, repeat: Infinity }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Desktop: segmented bar with labels */}
        <div className="hidden items-end justify-center gap-1 px-8 pb-3 pt-6 md:flex">
          {SLIDE_META.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => go(i)}
              aria-label={`Go to ${s.label}`}
              aria-current={active === i}
              className="group relative flex flex-col items-center gap-1"
            >
              <span className={`text-[10px] font-bold tracking-wider transition-opacity duration-300 ${active === i ? "opacity-100 text-white" : "opacity-0 group-hover:opacity-70 text-white/60"}`}>
                {s.label}
              </span>
              <div className="relative h-1.5 overflow-hidden rounded-full bg-white/15 transition-all duration-300"
                style={{ width: active === i ? 48 : 16 }}>
                {active === i && (
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: AUTOPLAY_MS / 1000, ease: "linear" }}
                    key={`bar-${active}`}
                  />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── PARTICLES ───────────────────────── */

function SlideParticles({ theme }: { theme: string }) {
  const particles = useMemo(() => {
    const count = 12;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 2 + Math.random() * 3,
      delay: Math.random() * 5,
      duration: 8 + Math.random() * 12,
    }));
  }, []);

  const colorMap: Record<string, string> = {
    blue: "bg-blue-400",
    emerald: "bg-emerald-400",
    amber: "bg-amber-400",
    cyan: "bg-cyan-400",
  };

  return (
    <div className="absolute inset-0 z-10 overflow-hidden pointer-events-none" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className={`absolute rounded-full ${colorMap[theme] || "bg-white"} opacity-20`}
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [0, -40, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ───────────────────────── COUNT UP ───────────────────────── */

export function CountUp({ target, duration = 2 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || hasAnimated.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        hasAnimated.current = true;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / (duration * 1000), 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count.toLocaleString("en-IN")}</span>;
}

/* ───────────────────────── MINI QUIZ ───────────────────────── */

const QUIZ_QUESTIONS = [
  {
    q: "The minimum factor of safety for highwall slopes in opencast coal mines as per CMR 2017 is:",
    options: ["1.0", "1.2", "1.5", "2.0"],
    correct: 2,
    explanation: "CMR 2017 mandates a minimum factor of safety of 1.5 for highwall slopes in opencast mines.",
  },
  {
    q: "Which gas is most commonly associated with spontaneous heating in underground coal mines?",
    options: ["Methane (CH₄)", "Carbon Monoxide (CO)", "Hydrogen Sulphide (H₂S)", "Nitrogen (N₂)"],
    correct: 1,
    explanation: "CO is the primary indicator gas for spontaneous heating — it appears early in the oxidation process.",
  },
  {
    q: "The standard duration for GATE MN exam is:",
    options: ["2 hours", "2.5 hours", "3 hours", "3.5 hours"],
    correct: 2,
    explanation: "GATE Mining Engineering (MN) is a 3-hour exam with 65 MCQs and NAT questions.",
  },
];

export function MiniQuiz() {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const q = QUIZ_QUESTIONS[idx];

  const handleSelect = (i: number) => {
    if (showAnswer) return;
    setSelected(i);
    setShowAnswer(true);
  };

  const handleNext = () => {
    setIdx((prev) => (prev + 1) % QUIZ_QUESTIONS.length);
    setSelected(null);
    setShowAnswer(false);
  };

  const isCorrect = selected === q.correct;

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/80 p-3 backdrop-blur-md sm:p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Try a Question</span>
        <span className="text-[10px] text-white/40">{idx + 1}/{QUIZ_QUESTIONS.length}</span>
      </div>
      <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed mb-3">{q.q}</p>
      <div className="space-y-1.5">
        {q.options.map((opt, i) => {
          let cls = "border-white/10 bg-white/5 hover:bg-white/10 text-white/80";
          if (showAnswer && i === q.correct) cls = "border-emerald-400/50 bg-emerald-400/15 text-emerald-300";
          else if (showAnswer && i === selected) cls = "border-red-400/50 bg-red-400/15 text-red-300";
          return (
            <button key={i} onClick={() => handleSelect(i)}
              className={`w-full rounded-lg border px-3 py-2 text-left text-[11px] sm:text-xs font-medium transition ${cls}`}>
              <span className="mr-2 text-white/40">{String.fromCharCode(65 + i)}.</span>
              {opt}
            </button>
          );
        })}
      </div>
      {showAnswer && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2.5">
          <p className={`text-[11px] font-semibold mb-1 ${isCorrect ? "text-emerald-400" : "text-red-400"}`}>
            {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </p>
          <p className="text-[10px] text-white/50 leading-relaxed">{q.explanation}</p>
          <button onClick={handleNext} className="mt-2 text-[10px] font-semibold text-accent hover:underline">
            Next question →
          </button>
        </motion.div>
      )}
    </div>
  );
}

/* ───────────────────────── Stagger wrapper ── */

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
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-slate-950/80" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-amber-300/30 bg-amber-300/10 text-amber-300">
            GATE 2027 · Mining Engineering (MN)
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight lg:text-6xl">
            Conquer GATE MN 2027.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-yellow-500 bg-clip-text text-transparent">
              Secure Your Seat at the Premier IITs.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm sm:text-lg text-white/80">
            Engineered by elite IITians. Master Geomechanics, Advanced Ventilation, and Math through
            high-fidelity, TCS iON-standard exam simulations.
          </p>
          <div className="mt-6 sm:mt-8">
            <Link href="/mocks" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:brightness-105" data-track="hero:cta:mocks-mn">
              Launch Free Exam Portal <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-6 text-sm text-white/70">
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
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-emerald-950/80" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
            GATE 2027 · Civil Engineering (CE) · NEW
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight lg:text-6xl">
            Build Your GATE CE Rank.{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">
              Engineered to the Last Decimal.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm sm:text-lg text-white/80">
            The complete Civil track — Structural, Geotech, Water Resources, Environmental, Transportation,
            Geomatics &amp; Maths. Concept modules, an exam-grade question bank and full-length mocks, tuned a
            notch tougher than the real paper.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Link href="/gate/civil/mocks" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:brightness-105" data-track="hero:cta:mocks-ce">
              Launch Free Exam Portal <span aria-hidden>→</span>
            </Link>
            <Link href="/gate/civil/learn" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-300/5 px-6 py-3.5 text-base font-semibold text-emerald-200 transition hover:bg-emerald-300/15" data-track="hero:cta:learn-ce">
              Learn &amp; Solve
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-6 text-sm text-white/70">
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
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-amber-950/80" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-amber-300/30 bg-amber-300/10 text-amber-200">
            GATE 2027 · Geology and Geophysics (GG)
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight lg:text-6xl">
            Master GATE Geology and Geophysics.{" "}
            <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
              Read the Earth, Decimal by Decimal.
            </span>
          </h1>
           <p className="mt-5 max-w-xl text-sm sm:text-lg text-white/80">
            Mineralogy, structural geology, geophysics &amp; remote sensing. Exam-grade question bank and
            full-length mocks, tuned tougher than the real paper.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Link href="/gate/geology/mocks" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-amber-500/20 transition hover:brightness-105" data-track="hero:cta:mocks-gg">
              Start free mock <span aria-hidden>→</span>
            </Link>
            <Link href="/gate/geology/learn" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-300/5 px-6 py-3.5 text-base font-semibold text-emerald-200 transition hover:bg-emerald-300/15" data-track="hero:cta:learn-gg">
              Learn &amp; Solve
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-6 text-sm text-white/70">
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
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-teal-950/80" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-emerald-300/30 bg-emerald-300/10 text-emerald-200">
            GATE 2027 · Environmental Science and Engineering (ES)
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight lg:text-6xl">
            Crack GATE Environmental Science.{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-cyan-400 bg-clip-text text-transparent">
              Air, Water &amp; Earth, Quantified.
            </span>
          </h1>
           <p className="mt-5 max-w-xl text-sm sm:text-lg text-white/80">
            Air quality, water treatment, waste management &amp; ecology. Exam-grade question bank and
            full-length mocks, tuned tougher than the real paper.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Link href="/gate/environment/mocks" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-teal-500 px-6 py-3.5 text-base font-semibold text-slate-900 shadow-lg shadow-emerald-500/20 transition hover:brightness-105" data-track="hero:cta:mocks-es">
              Start free mock <span aria-hidden>→</span>
            </Link>
            <Link href="/gate/environment/learn" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-300/5 px-6 py-3.5 text-base font-semibold text-emerald-200 transition hover:bg-emerald-300/15" data-track="hero:cta:learn-es">
              Learn &amp; Solve
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-6 text-sm text-white/70">
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


/* ───────────────────────── WINDOW 0 — ONGC CBT ───────────────────────── */

export function OngcWindow() {
  return (
    <div className="relative h-full w-full">
      <OilRigBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-[#002a6b]/95 via-[#003580]/80 to-slate-950/90" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-6 px-4 py-8 sm:px-5 sm:py-10 lg:grid-cols-2 lg:gap-10 lg:py-16">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <img
              src="/images/ongc/ongc-logo.png"
              alt="ONGC logo"
              width={40}
              height={40}
              className="rounded-lg sm:h-12 sm:w-12"
            />
            <span className="badge border border-blue-300/30 bg-blue-300/10 text-blue-300 text-xs sm:text-sm">
              PSU · ONGC · NEW
            </span>
          </div>
          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-extrabold leading-tight">
            Oil &amp; Natural Gas Corporation.{" "}
            <span className="bg-gradient-to-r from-blue-200 to-cyan-300 bg-clip-text text-transparent">
              CBT 2026 — Discipline-Specific Mock Series.
            </span>
          </h1>
          <p className="mt-4 max-w-xl text-sm sm:text-base lg:text-lg text-white/80">
            85 MCQ · 2 hrs · No negative marking. 5 disciplines, 75 full-length mocks
            tuned to the official ONGC recruitment pattern.
          </p>
          <div className="mt-5 sm:mt-6 lg:mt-8 flex flex-wrap gap-3">
            <Link href="/psu/ongc" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-300 to-cyan-400 px-5 py-3 text-sm sm:text-base font-semibold text-[#003580] shadow-lg shadow-blue-500/20 transition hover:brightness-105 sm:px-6 sm:py-3.5">
              Explore ONGC Prep <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 sm:mt-6 sm:grid-cols-6 sm:gap-6 lg:mt-8 text-xs sm:text-sm text-white/70">
            <Stat n="85" label="MCQs / paper" />
            <Stat n="2 hrs" label="Duration" />
            <Stat n="0" label="Neg. marking" />
            <Stat n="5" label="Disciplines" />
            <Stat n="45" label="Live Mocks" />
            <Stat n="75" label="Total Planned" />
          </div>
        </div>
        <div className="hidden sm:block lg:pl-4">
          <OngcDisciplineCard />
        </div>
      </div>
    </div>
  );
}

function OngcDisciplineCard() {
  const liveCount = (slug: string) => ongcLiveSetNos(slug).size;
  return (
    <div className="rounded-xl border border-blue-300/20 bg-slate-900/60 p-3 shadow-pop backdrop-blur sm:rounded-2xl sm:p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-blue-300">
          ONGC CBT · 5 Disciplines
        </div>
        <span className="badge bg-blue-400/10 text-blue-200 text-[10px] sm:text-xs">15 mocks each</span>
      </div>
      <div className="max-h-[220px] sm:max-h-[300px] lg:max-h-[340px] overflow-y-auto rounded-lg border border-white/10">
        <table className="w-full text-left text-[10px] sm:text-xs">
          <thead className="sticky top-0 bg-slate-800/90 text-blue-200 backdrop-blur">
            <tr>
              <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 font-semibold">Discipline</th>
              <th className="hidden sm:table-cell px-2 py-2 font-semibold">Minimum Qualification</th>
              <th className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            {ONGC_ROWS.map((r) => {
              const live = liveCount(r.slug);
              return (
                <tr key={r.slug} className="border-t border-white/5 align-top">
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 font-medium text-white">{r.discipline}</td>
                  <td className="hidden sm:table-cell px-2 py-2 leading-snug">{r.qualification}</td>
                  <td className="px-1.5 py-1.5 sm:px-2 sm:py-2 text-right">
                    {live > 0 ? (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-emerald-400/15 px-1.5 py-0.5 sm:px-2 text-[8px] sm:text-[10px] font-semibold text-emerald-300">
                        <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 rounded-full bg-emerald-400" />
                        {live}/15 LIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full bg-white/10 px-1.5 py-0.5 sm:px-2 text-[8px] sm:text-[10px] font-semibold text-white/50">
                        Coming soon
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* Oil derrick / drilling rig line art for the ONGC window */
function OilRigBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#93c5fd" strokeWidth="2" aria-hidden>
        {/* oil derrick tower */}
        <g transform="translate(580 80)">
          <line x1="0" y1="480" x2="60" y2="0" />
          <line x1="120" y1="480" x2="60" y2="0" />
          {/* cross braces */}
          {Array.from({ length: 8 }).map((_, i) => {
            const y = 60 + i * 52;
            const lx = (60 - (60 * (480 - y)) / 480);
            const rx = 60 + (60 * (480 - y)) / 480;
            return (
              <g key={i}>
                <line x1={lx} y1={y} x2={rx} y2={y} />
                {i < 7 && (
                  <>
                    <line x1={lx} y1={y} x2={rx - 8} y2={y + 52} />
                    <line x1={rx} y1={y} x2={lx + 8} y2={y + 52} />
                  </>
                )}
              </g>
            );
          })}
          {/* crown block */}
          <rect x="45" y="0" width="30" height="20" rx="2" />
          {/* platform */}
          <line x1="-20" y1="480" x2="140" y2="480" />
          <line x1="-20" y1="490" x2="140" y2="490" />
        </g>
        {/* pump jack (nodding donkey) */}
        <g transform="translate(100 420)">
          <circle cx="40" cy="40" r="30" />
          <line x1="40" y1="10" x2="100" y2="-20" />
          <line x1="100" y1="-20" x2="100" y2="50" />
          <rect x="85" y="50" width="30" height="10" rx="2" />
          <line x1="10" y1="70" x2="70" y2="70" />
          <line x1="40" y1="70" x2="40" y2="100" />
        </g>
        {/* pipeline */}
        <line x1="0" y1="520" x2="400" y2="520" strokeWidth="4" />
        <line x1="400" y1="520" x2="500" y2="500" strokeWidth="4" />
        {/* storage tanks */}
        <rect x="200" y="460" width="80" height="50" rx="4" />
        <ellipse cx="240" cy="460" rx="40" ry="8" />
        <rect x="300" y="470" width="60" height="40" rx="3" />
        <ellipse cx="330" cy="470" rx="30" ry="6" />
      </svg>
    </div>
  );
}

/* ───────────────────────── WINDOW 3 — PSU / CIL ───────────────────────── */

export function PsuWindow() {
  return (
    <div className="relative h-full w-full">
      <OpencastBackdrop />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-blue-950/70 to-slate-950/90" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="badge border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
            PSU Recruitment · Coal India Limited
          </span>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight lg:text-6xl">
            Crack the PSU Exams.{" "}
            <span className="bg-gradient-to-r from-cyan-300 to-teal-400 bg-clip-text text-transparent">
              Direct Route to Coal India Limited (CIL).
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm sm:text-lg text-white/80">
            Maximize your rank for Management Trainee (MT) positions. Tailored question banks targeting
            mining legislation, DGMS safety guidelines, and historical PSU weightage matrices.
          </p>
          <div className="mt-6 sm:mt-8">
            <Link href="/psu/cil" className="cg-neon inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-cyan-400/10 px-6 py-3.5 text-base font-semibold text-cyan-200 transition hover:bg-cyan-400/20" data-track="hero:cta:psu-cil">
              Explore PSU Prep Modules <span aria-hidden>→</span>
            </Link>
          </div>
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 text-sm text-white/70">
            <Stat n={`${CIL_TOTAL_SEATS}`} label="CIL Seats" />
            <Stat n="100" label="MCQs / paper" />
            <Stat n="0" label="Neg. Marking" />
          </div>
        </div>
        <div className="hidden lg:block lg:pl-4">
          <CilEligibilityCard />
        </div>
      </div>
    </div>
  );
}

function CilEligibilityCard() {
  return (
    <div className="rounded-2xl border border-cyan-300/20 bg-gradient-to-br from-slate-900/80 to-slate-800/60 p-4 shadow-pop backdrop-blur-md ring-1 ring-white/5">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-xs font-semibold uppercase tracking-wide text-cyan-300">
          CIL Management Trainee · Eligibility &amp; Seats
        </div>
        <span className="badge bg-cyan-400/10 text-cyan-200 ring-1 ring-cyan-300/20">{CIL_TOTAL_SEATS} seats</span>
      </div>
      <div className="max-h-[300px] overflow-y-auto rounded-lg border border-white/10 scrollbar-thin">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-slate-800/95 text-cyan-200 backdrop-blur">
            <tr>
              <th className="px-2.5 py-2.5 font-semibold">Code</th>
              <th className="px-2.5 py-2.5 font-semibold">Discipline</th>
              <th className="px-2.5 py-2.5 text-right font-semibold">Seats</th>
              <th className="px-2.5 py-2.5 font-semibold">Minimum Qualification</th>
            </tr>
          </thead>
          <tbody className="text-white/80">
            {CIL_ROWS.map((r) => (
              <tr key={r.code} className="border-t border-white/5 align-top hover:bg-white/5 transition-colors duration-150">
                <td className="px-2.5 py-2.5 font-mono text-cyan-300">{r.code}</td>
                <td className="px-2.5 py-2.5 font-medium text-white">{r.discipline}</td>
                <td className="px-2.5 py-2.5 text-right font-mono font-semibold text-cyan-200">{r.seats}</td>
                <td className="px-2.5 py-2.5 leading-snug">{r.qualification}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ───────────────────────── WINDOW 6 — NCL Diploma ───────────────────────── */

export function NclWindow() {
  return (
    <div className="relative h-full w-full">
      <CoalMineBackdrop />
      {/* AI-generated background (hybrid: raster bg + SVG overlay) */}
      <div className="absolute inset-0 bg-[url('/images/ncl/ncl-banner-bg.svg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a2342]/90 via-[#0d3060]/65 to-slate-950/85" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/ncl/ncl-logo.png" alt="NCL" className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-contain" />
            <span className="badge border border-blue-300/30 bg-blue-300/10 text-blue-300">
              Diploma · NCL · Live
            </span>
            <DeadlineBadge date="2026-08-05" color="blue" />
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight lg:text-6xl">
            NCL Recruitment 2026.{" "}
            <span className="bg-gradient-to-r from-blue-300 to-indigo-400 bg-clip-text text-transparent">
              259 Seats · Mining Sirdar &amp; Surveyor.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm sm:text-lg text-white/80">
            CBT only — no interview. 100 MCQs · 100 marks · 90 min · No negative marking.
            20 full-length mocks built from the official NCL syllabus.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Link href="/diploma/ncl" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-400 to-indigo-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:brightness-110" data-track="hero:cta:ncl">
              Start Mock Test <span aria-hidden>→</span>
            </Link>
            <a href="https://www.nclcil.in/data-listing/pages/recruitment" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-blue-300/40 bg-blue-300/5 px-6 py-3.5 text-base font-semibold text-blue-200 transition hover:bg-blue-300/15">
              View Notification ↗
            </a>
          </div>
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 text-sm text-white/70">
            <Stat n="259" label="Vacancies" />
            <Stat n="20" label="Mock Tests" />
            <Stat n="90 min" label="CBT Duration" />
            <Stat n="0" label="Neg. Marking" />
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-center">
          <NclScene />
        </div>
      </div>
    </div>
  );
}

function CoalMineBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#93c5fd" strokeWidth="2" aria-hidden>
        {/* opencast benches */}
        <path d="M0 500 H250 V420 H450 V340 H650 V260 H800" />
        <path d="M0 540 H300 V460 H500 V380 H700 V300 H800" />
        {/* dumper */}
        <g transform="translate(100 450)">
          <rect x="0" y="-30" width="80" height="30" rx="3" />
          <circle cx="20" cy="8" r="12" />
          <circle cx="60" cy="8" r="12" />
        </g>
        {/* dragline */}
        <g transform="translate(500 280)">
          <line x1="0" y1="60" x2="40" y2="0" />
          <line x1="80" y1="60" x2="40" y2="0" />
          <line x1="40" y1="0" x2="140" y2="20" />
          <line x1="140" y1="20" x2="140" y2="80" />
        </g>
      </svg>
    </div>
  );
}

function NclScene() {
  const float = (delay: number) => ({
    animate: { y: [0, -10, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const, delay },
  });
  return (
    <div className="relative h-[360px] w-[360px]">
      <div className="absolute inset-0 rounded-full bg-blue-400/10 blur-3xl" />

      {/* central mining helmet */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <svg width="200" height="180" viewBox="0 0 200 180" fill="none" aria-hidden>
          <path d="M30 110 a70 70 0 0 1 140 0 Z" fill="#3b82f6" fillOpacity="0.3" stroke="#60a5fa" strokeWidth="3" />
          <rect x="24" y="108" width="152" height="12" rx="6" fill="#2563eb" />
          <rect x="88" y="40" width="24" height="30" rx="4" fill="#fbbf24" />
          <circle cx="100" cy="36" r="8" fill="#fde68a" />
          {/* headlamp rays */}
          <line x1="100" y1="28" x2="100" y2="10" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
          <line x1="88" y1="32" x2="78" y2="18" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
          <line x1="112" y1="32" x2="122" y2="18" stroke="#fde68a" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* floating survey instrument */}
      <motion.div {...float(0)} className="absolute left-2 top-6">
        <Holo>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
            <line x1="8" y1="36" x2="20" y2="18" />
            <line x1="32" y1="36" x2="20" y2="18" />
            <rect x="12" y="8" width="16" height="12" rx="2" />
            <circle cx="20" cy="6" r="3" fill="#93c5fd" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating safety sign */}
      <motion.div {...float(0.9)} className="absolute right-2 top-10">
        <Holo>
          <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden fill="none" stroke="#fbbf24" strokeWidth="2">
            <path d="M21 6 L36 34 H6 Z" fill="#f59e0b" fillOpacity="0.15" />
            <text x="21" y="30" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">!</text>
          </svg>
        </Holo>
      </motion.div>

      {/* floating coal cart */}
      <motion.div {...float(1.5)} className="absolute bottom-3 left-8">
        <Holo>
          <svg width="48" height="36" viewBox="0 0 48 36" aria-hidden fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round">
            <rect x="8" y="4" width="32" height="20" rx="2" />
            <circle cx="14" cy="30" r="4" />
            <circle cx="34" cy="30" r="4" />
            <line x1="8" y1="24" x2="14" y2="30" />
            <line x1="40" y1="24" x2="34" y2="30" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating certificate */}
      <motion.div {...float(1.2)} className="absolute bottom-6 right-6">
        <Holo>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden fill="none" stroke="#93c5fd" strokeWidth="2">
            <rect x="6" y="4" width="28" height="32" rx="3" />
            <line x1="12" y1="12" x2="28" y2="12" />
            <line x1="12" y1="18" x2="28" y2="18" />
            <line x1="12" y1="24" x2="22" y2="24" />
            <circle cx="28" cy="30" r="6" fill="#3b82f6" fillOpacity="0.3" stroke="#60a5fa" />
            <text x="28" y="33" textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold">✓</text>
          </svg>
        </Holo>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── WINDOW 7 — WCL Diploma ───────────────────────── */

export function WclWindow() {
  return (
    <div className="relative h-full w-full">
      <WclBackdrop />
      {/* AI-generated background (hybrid: raster bg + SVG overlay) */}
      <div className="absolute inset-0 bg-[url('/images/wcl/wcl-banner-bg.svg')] bg-cover bg-center opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a3d1c]/90 via-[#0d5028]/65 to-slate-950/85" />
      <div className="relative mx-auto grid h-full max-w-7xl items-center gap-10 px-5 py-10 sm:py-14 lg:grid-cols-2 lg:py-20">
        <div>
          <div className="flex items-center gap-3">
            <img src="/images/wcl/wcl-logo.webp" alt="WCL" className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg object-contain" />
            <span className="badge border border-emerald-300/30 bg-emerald-300/10 text-emerald-300">
              Diploma · WCL · Live
            </span>
            <DeadlineBadge date="2026-08-10" color="emerald" />
          </div>
          <h1 className="mt-4 text-3xl sm:text-4xl font-extrabold leading-tight lg:text-6xl">
            WCL Recruitment 2026.{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent">
              444 Seats · Mining Sirdar &amp; AF Electrical.
            </span>
          </h1>
          <p className="mt-5 max-w-xl text-sm sm:text-lg text-white/80">
            CBT only — no interview. 100 MCQs · 100 marks · 120 min · No negative marking.
            20 full-length mocks built from the official WCL syllabus.
          </p>
          <div className="mt-6 sm:mt-8 flex flex-wrap gap-3">
            <Link href="/diploma/wcl" className="cg-ripple inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-400 to-green-500 px-6 py-3.5 text-base font-semibold text-white shadow-lg shadow-emerald-500/30 transition hover:brightness-110" data-track="hero:cta:wcl">
              Start Mock Test <span aria-hidden>→</span>
            </Link>
            <a href="https://westerncoal.in/en/career/recruitment" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/40 bg-emerald-300/5 px-6 py-3.5 text-base font-semibold text-emerald-200 transition hover:bg-emerald-300/15">
              View Notification ↗
            </a>
          </div>
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 text-sm text-white/70">
            <Stat n="444" label="Vacancies" />
            <Stat n="20" label="Mock Tests" />
            <Stat n="120 min" label="CBT Duration" />
            <Stat n="0" label="Neg. Marking" />
          </div>
        </div>
        <div className="hidden lg:flex lg:justify-center">
          <WclScene />
        </div>
      </div>
    </div>
  );
}

function WclBackdrop() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg className="absolute inset-0 h-full w-full opacity-[0.12]" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="#6ee7b7" strokeWidth="2" aria-hidden>
        {/* underground mine shaft */}
        <rect x="300" y="100" width="200" height="400" rx="4" />
        <line x1="300" y1="200" x2="500" y2="200" />
        <line x1="300" y1="300" x2="500" y2="300" />
        <line x1="300" y1="400" x2="500" y2="400" />
        {/* elevator cage */}
        <rect x="340" y="140" width="120" height="50" rx="3" />
        <line x1="400" y1="100" x2="400" y2="140" strokeWidth="4" />
        {/* ventilation fan */}
        <circle cx="400" cy="80" r="18" />
        <line x1="400" y1="62" x2="400" y2="98" />
        <line x1="382" y1="80" x2="418" y2="80" />
        {/* conveyor belt */}
        <line x1="100" y1="500" x2="700" y2="500" strokeWidth="4" />
        <circle cx="150" cy="500" r="10" />
        <circle cx="650" cy="500" r="10" />
      </svg>
    </div>
  );
}

function WclScene() {
  const float = (delay: number) => ({
    animate: { y: [0, -10, 0] },
    transition: { duration: 3.2, repeat: Infinity, ease: "easeInOut" as const, delay },
  });
  return (
    <div className="relative h-[360px] w-[360px]">
      <div className="absolute inset-0 rounded-full bg-emerald-400/10 blur-3xl" />

      {/* central electrical panel */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <svg width="200" height="180" viewBox="0 0 200 180" fill="none" aria-hidden>
          <rect x="30" y="20" width="140" height="140" rx="8" stroke="#34d399" strokeWidth="3" fill="#065f46" fillOpacity="0.2" />
          {/* circuit breakers */}
          <rect x="50" y="40" width="40" height="20" rx="3" fill="#10b981" fillOpacity="0.3" stroke="#34d399" strokeWidth="2" />
          <rect x="110" y="40" width="40" height="20" rx="3" fill="#10b981" fillOpacity="0.3" stroke="#34d399" strokeWidth="2" />
          <rect x="50" y="70" width="40" height="20" rx="3" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="2" />
          <rect x="110" y="70" width="40" height="20" rx="3" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="2" />
          {/* meters */}
          <circle cx="70" cy="120" r="18" stroke="#6ee7b7" strokeWidth="2" />
          <line x1="70" y1="120" x2="80" y2="110" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
          <circle cx="130" cy="120" r="18" stroke="#6ee7b7" strokeWidth="2" />
          <line x1="130" y1="120" x2="120" y2="108" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
          {/* lightning bolt */}
          <path d="M100 4 L92 16 H104 L96 28" stroke="#fde68a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* floating wrench */}
      <motion.div {...float(0)} className="absolute left-2 top-6">
        <Holo>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round">
            <path d="M10 30 L24 16" />
            <circle cx="28" cy="12" r="8" />
            <path d="M24 8 L28 12 L32 8" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating voltage symbol */}
      <motion.div {...float(0.9)} className="absolute right-2 top-10">
        <Holo>
          <svg width="42" height="42" viewBox="0 0 42 42" aria-hidden fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M24 6 L16 20 H24 L18 36" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating cable drum */}
      <motion.div {...float(1.5)} className="absolute bottom-3 left-8">
        <Holo>
          <svg width="48" height="36" viewBox="0 0 48 36" aria-hidden fill="none" stroke="#6ee7b7" strokeWidth="2" strokeLinecap="round">
            <circle cx="24" cy="18" r="14" />
            <circle cx="24" cy="18" r="6" />
            <line x1="10" y1="18" x2="18" y2="18" />
            <line x1="30" y1="18" x2="38" y2="18" />
          </svg>
        </Holo>
      </motion.div>

      {/* floating safety helmet */}
      <motion.div {...float(1.2)} className="absolute bottom-6 right-6">
        <Holo>
          <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
            <path d="M6 26 a14 14 0 0 1 28 0 Z" fill="#f59e0b" fillOpacity="0.3" stroke="#fbbf24" strokeWidth="2" />
            <rect x="4" y="26" width="32" height="5" rx="2.5" fill="#fcd34d" />
          </svg>
        </Holo>
      </motion.div>
    </div>
  );
}

/* ───────────────────────── Shared bits ───────────────────────── */

function DeadlineBadge({ date, color }: { date: string; color: "blue" | "emerald" | "amber" | "cyan" }) {
  const target = new Date(date).getTime();
  const now = Date.now();
  const daysLeft = Math.max(0, Math.ceil((target - now) / 86400000));
  const urgent = daysLeft <= 14;

  const colors = {
    blue: "border-blue-400/50 bg-blue-500/15 text-blue-300",
    emerald: "border-emerald-400/50 bg-emerald-500/15 text-emerald-300",
    amber: "border-amber-400/50 bg-amber-500/15 text-amber-300",
    cyan: "border-cyan-400/50 bg-cyan-500/15 text-cyan-300",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${colors[color]} ${urgent ? "animate-pulse" : ""}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${urgent ? "bg-red-400" : `bg-${color}-400`}`} />
      {daysLeft}d left
    </span>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div className="rounded-lg bg-white/5 px-3 py-2 ring-1 ring-white/5">
      <div className="text-xl font-extrabold text-white">{n}</div>
      <div className="text-[10px] uppercase tracking-wider text-white/50">{label}</div>
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
