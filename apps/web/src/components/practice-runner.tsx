"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn, secondsToHMS } from "@/lib/utils";
import { CalculatorLauncher } from "@/components/gate-calculator";
import { QuestionTypeTag, CommunitySuccessRate } from "@/components/question-extras";
import { OfflineToast } from "@/components/offline-toast";
import { QuestionFigure, type QuestionFigure as Figure } from "@/components/question-figure";
import { MathText } from "@/components/math-text";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

type Q =
  | { id: string; subject: string; topic: string; difficulty: "easy" | "medium" | "hard"; type: "MCQ"; stem: string; options: string[]; answer: number; solution: string; figure?: Figure; marks?: 1 | 2 }
  | { id: string; subject: string; topic: string; difficulty: "easy" | "medium" | "hard"; type: "MSQ"; stem: string; options: string[]; answer: number[]; solution: string; figure?: Figure; marks?: 1 | 2 }
  | { id: string; subject: string; topic: string; difficulty: "easy" | "medium" | "hard"; type: "NAT"; stem: string; answer: number; tolerance: number; solution: string; figure?: Figure; marks?: 1 | 2 };

type Difficulty = "mixed" | "easy" | "medium" | "hard";
type Answer = number | number[] | string | undefined;

interface DiffCounts { mixed: number; easy: number; medium: number; hard: number }
interface Meta {
  plan: string;
  cap: number;
  capped: boolean;
  totalAvailable: number;
  counts?: DiffCounts;
  adaptive?: boolean;
  weakTopics?: string[];
}

/** Selectable session sizes (untimed practice). 'All' is appended dynamically. */
const SIZE_OPTIONS = [10, 20, 30, 60];

/**
 * Palette colours follow GATE NTA convention:
 *   nv     – Not visited                  (grey)
 *   not    – Visited, not answered        (rose)
 *   ans    – Answered (submitted)         (emerald)
 *   mark   – Marked for review, no answer (violet)
 *   marka  – Marked & answered            (violet + emerald ring)
 */
type Status = "nv" | "not" | "ans" | "mark" | "marka";

interface State {
  idx: number;
  answers:   Record<number, Answer>;
  status:    Record<number, Status>;
  submitted: Record<number, boolean>;
}

type Action =
  | { type: "go"; i: number }
  | { type: "set"; idx: number; answer: Answer }
  | { type: "mark"; idx: number; status: Status }
  | { type: "submit"; idx: number }
  | { type: "clear"; idx: number };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "go":     return { ...s, idx: a.i };
    case "set":    return { ...s, answers: { ...s.answers, [a.idx]: a.answer } };
    case "mark":   return { ...s, status:  { ...s.status,  [a.idx]: a.status } };
    case "submit": return { ...s, submitted: { ...s.submitted, [a.idx]: true } };
    case "clear":  return { ...s, answers: { ...s.answers, [a.idx]: undefined }, status: { ...s.status, [a.idx]: "not" } };
  }
}

/* ------------------------------------------------------------------ */
/* GATE marking helpers                                               */
/* ------------------------------------------------------------------ */

/** Use the authored `marks` when present; otherwise derive: easy = 1, else 2. */
function marksFor(q: Q): number {
  return q.marks ?? (q.difficulty === "easy" ? 1 : 2);
}
function negativeFor(q: Q): number {
  if (q.type !== "MCQ") return 0;
  return marksFor(q) === 1 ? 1 / 3 : 2 / 3;
}
function isAnswered(a: Answer): boolean {
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}
function gradeAnswer(q: Q, a: Answer): boolean {
  if (!isAnswered(a)) return false;
  if (q.type === "NAT") {
    const num = typeof a === "number" ? a : parseFloat(String(a));
    if (!Number.isFinite(num)) return false;
    return Math.abs(num - q.answer) <= (q.tolerance ?? 0);
  }
  if (q.type === "MSQ") {
    const arr = Array.isArray(a) ? [...a].sort() : [];
    return arr.length === q.answer.length && arr.every((v, i) => v === q.answer[i]);
  }
  return a === q.answer;
}
function scoreFor(q: Q, a: Answer): number {
  if (!isAnswered(a)) return 0;
  return gradeAnswer(q, a) ? marksFor(q) : -negativeFor(q);
}

/* ------------------------------------------------------------------ */
/* Top-level: loader + portal                                         */
/* ------------------------------------------------------------------ */

export function PracticeRunner({ slug, name }: { slug: string; name: string }) {
  const searchParams = useSearchParams();
  // Honour `?minutes=15|45|90` from dashboard "Today's focus" time selector.
  // Mapping: ~1.5 min/question → 15→10, 45→30 (default), 90→60.
  const minutesParam = parseInt(searchParams.get("minutes") ?? "", 10);
  const initialLimit = useMemo(() => {
    if (!Number.isFinite(minutesParam) || minutesParam <= 0) return 30;
    if (minutesParam <= 20) return 10;
    if (minutesParam <= 60) return 30;
    return 60;
  }, [minutesParam]);

  const [limit, setLimit] = useState(initialLimit);
  // Re-sync if the dashboard deep-link (?minutes=) changes.
  useEffect(() => { setLimit(initialLimit); }, [initialLimit]);

  const [difficulty, setDifficulty] = useState<Difficulty>("mixed");
  const [adaptive,   setAdaptive]   = useState(false);
  const [questions, setQuestions]   = useState<Q[]>([]);
  const [loading,   setLoading]     = useState(true);
  const [meta,      setMeta]        = useState<Meta | null>(null);

  useEffect(() => {
    setLoading(true);
    setQuestions([]);
    const params = new URLSearchParams({ difficulty, limit: String(limit) });
    if (adaptive) params.set("adaptive", "1");
    fetch(`/api/practice/${slug}?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setQuestions(d.questions ?? []);
        setMeta({ plan: d.plan, cap: d.cap, capped: d.capped, totalAvailable: d.totalAvailable, adaptive: d.adaptive, weakTopics: d.weakTopics });
      })
      .finally(() => setLoading(false));
  }, [slug, difficulty, adaptive, limit]);

  if (loading) return <LoadingScreen />;
  if (questions.length === 0) return <EmptyScreen difficulty={difficulty} setDifficulty={setDifficulty} counts={meta?.counts} />;

  return (
    <PracticePortal
      key={`${slug}-${difficulty}-${adaptive ? "a" : "r"}-${questions.length}`}
      slug={slug}
      subjectName={name}
      questions={questions}
      difficulty={difficulty}
      setDifficulty={setDifficulty}
      adaptive={adaptive}
      setAdaptive={setAdaptive}
      limit={limit}
      setLimit={setLimit}
      meta={meta}
    />
  );
}

function LoadingScreen() {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20 text-center">
      <div className="inline-block w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted mt-3">Loading questions…</p>
    </div>
  );
}

function EmptyScreen({ difficulty, setDifficulty, counts }: { difficulty: Difficulty; setDifficulty: (d: Difficulty) => void; counts?: DiffCounts }) {
  return (
    <div className="max-w-3xl mx-auto px-5 py-20 text-center">
      <p>No questions available for difficulty: <b>{difficulty}</b></p>
      <div className="mt-4 flex gap-2 justify-center flex-wrap">
        {(["mixed","easy","medium","hard"] as const).map((d) => (
          <button key={d} onClick={() => setDifficulty(d)} className="btn btn-ghost text-sm capitalize">
            {d}{counts && <span className="ml-1 opacity-60 tabular-nums">{counts[d]}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Session-size selector — lets paid users choose how many questions   */
/* this sitting covers (10 / 20 / 30 / 60 / All). Free plan is capped.  */
/* ------------------------------------------------------------------ */

function SessionSizeBar({
  difficulty, allCount, cap, limit, setLimit, attempted, shown,
}: {
  difficulty: Difficulty;
  allCount: number;
  cap: number;
  limit: number;
  setLimit: (n: number) => void;
  attempted: number;
  shown: number;
}) {
  const presets = SIZE_OPTIONS.filter((n) => n < allCount);
  const options: { value: number; label: string }[] = [
    ...presets.map((n) => ({ value: n, label: String(n) })),
    { value: allCount, label: `All ${allCount}` },
  ];

  const choose = (value: number, locked: boolean) => {
    if (locked) { window.location.href = "/pricing"; return; }
    if (value === limit) return;
    if (attempted > 0 && !confirm("Start a new session? Current progress will be lost.")) return;
    setLimit(value);
  };

  return (
    <div className="bg-surface border-b border-line px-4 sm:px-5 py-2 flex items-center gap-2 flex-wrap text-xs">
      <span className="text-muted font-semibold">Session size</span>
      <div className="flex gap-1 flex-wrap">
        {options.map(({ value, label }) => {
          const locked = value > cap;
          const active = !locked && (value === limit || (value === allCount && limit >= allCount));
          return (
            <button
              key={value}
              onClick={() => choose(value, locked)}
              className={cn(
                "px-2.5 py-1 rounded-md border transition tabular-nums font-semibold",
                active
                  ? "bg-brand text-white border-brand"
                  : locked
                    ? "bg-canvas text-muted border-line opacity-70"
                    : "bg-canvas text-ink border-line hover:border-brand",
              )}
              title={locked ? "Upgrade to unlock larger sessions" : `Practice ${label} questions`}
            >{label}{locked && " 🔒"}</button>
          );
        })}
      </div>
      <span className="text-muted ml-auto">
        Showing <b className="text-ink">{shown}</b> of {allCount}{difficulty === "mixed" ? "" : ` ${difficulty}`} questions
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* GATE NTA-style practice portal                                     */
/* ------------------------------------------------------------------ */

function PracticePortal({
  slug, subjectName, questions, difficulty, setDifficulty, adaptive, setAdaptive, limit, setLimit, meta,
}: {
  slug: string;
  subjectName: string;
  questions: Q[];
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  adaptive: boolean;
  setAdaptive: (v: boolean) => void;
  limit: number;
  setLimit: (n: number) => void;
  meta: Meta | null;
}) {
  const [state, dispatch] = useReducer(reducer, {
    idx: 0,
    answers:   {},
    status:    Object.fromEntries(questions.map((_, i) => [i, "nv" as Status])),
    submitted: {},
  });

  // Elapsed timer (counts up — practice is untimed)
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(Date.now());
  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt.current) / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  // First-visit → mark "not"
  useEffect(() => {
    if (state.status[state.idx] === "nv") {
      dispatch({ type: "mark", idx: state.idx, status: "not" });
    }
  }, [state.idx]); // eslint-disable-line react-hooks/exhaustive-deps

  const q         = questions[state.idx];
  const a         = state.answers[state.idx];

  const go = useCallback((i: number) => { if (i >= 0 && i < questions.length) dispatch({ type: "go", i }); }, [questions.length]);

  // Grade every *answered* question — GATE-style: nothing is revealed until the
  // session is finished, so we score on answers, not on a per-question reveal.
  const totals = useMemo(() => {
    let score = 0, correctN = 0, wrongN = 0, attempted = 0;
    for (let i = 0; i < questions.length; i++) {
      if (!isAnswered(state.answers[i])) continue;
      attempted++;
      const c = gradeAnswer(questions[i], state.answers[i]);
      if (c) correctN++; else wrongN++;
      score += scoreFor(questions[i], state.answers[i]);
    }
    const totalPossible = questions.reduce((s, qq) => s + marksFor(qq), 0);
    return { score, correctN, wrongN, attempted, totalPossible };
  }, [questions, state.answers]);

  const counts = useMemo(() => {
    const c = { nv: 0, not: 0, ans: 0, mark: 0, marka: 0 };
    for (const s of Object.values(state.status)) c[s]++;
    return c;
  }, [state.status]);

  // Log a per-question attempt to the profile the first time it's answered
  // (powers adaptive practice / weak-topic tracking). Reveals nothing in the UI.
  function track(qq: Q, ans: Answer, idx: number) {
    if (!isAnswered(ans) || state.submitted[idx]) return;
    dispatch({ type: "submit", idx });
    fetch("/api/practice/attempt", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        subjectSlug: slug,
        subjectName,
        qid: qq.id,
        topic: qq.topic,
        difficulty: qq.difficulty,
        correct: gradeAnswer(qq, ans),
      }),
    }).catch(() => {});
  }

  const saveAndNext = () => {
    const answered = isAnswered(a);
    dispatch({ type: "mark", idx: state.idx, status: answered ? "ans" : "not" });
    if (answered) track(q, a, state.idx);
    go(state.idx + 1);
  };
  const markAndNext = () => {
    const answered = isAnswered(a);
    dispatch({ type: "mark", idx: state.idx, status: answered ? "marka" : "mark" });
    if (answered) track(q, a, state.idx);
    go(state.idx + 1);
  };
  const clear = () => dispatch({ type: "clear", idx: state.idx });

  const [finished, setFinished] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Auto-close drawer on question change; lock scroll while open
  useEffect(() => { setPaletteOpen(false); }, [state.idx]);
  useEffect(() => {
    if (!paletteOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [paletteOpen]);

  // GATE simulation: once the session is finished, reveal answers + solutions.
  if (finished) {
    return (
      <PracticeReview
        questions={questions}
        answers={state.answers}
        totals={totals}
        elapsed={elapsed}
        subjectName={subjectName}
        onResume={() => setFinished(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-canvas -mt-px pb-20 lg:pb-0">
      {/* ---------- Top bar ---------- */}
      <header className="bg-gradient-to-r from-brand-2 to-brand text-white px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="hidden min-[400px]:inline-flex w-9 h-9 bg-white/15 grid place-items-center rounded-lg font-bold shrink-0">CG</div>
        <div className="min-w-0">
          <div className="text-xs sm:text-sm opacity-80">GATE Practice · Untimed</div>
          <div className="font-semibold text-sm sm:text-base truncate">{subjectName}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {/* Difficulty switcher */}
          <div className="hidden sm:flex gap-0.5 bg-white/15 rounded-md p-0.5 text-xs font-semibold">
            {(["mixed","easy","medium","hard"] as const).map((d) => (
              <button
                key={d}
                onClick={() => {
                  if (d === difficulty) return;
                  if (totals.attempted > 0 && !confirm("Start a new session? Current progress will be lost.")) return;
                  setDifficulty(d);
                }}
                className={cn(
                  "px-2.5 py-1 rounded transition capitalize",
                  difficulty === d ? "bg-white text-brand" : "text-white/80 hover:text-white"
                )}
              >{d}{meta?.counts && <span className="ml-1 opacity-60 tabular-nums">{meta.counts[d]}</span>}</button>
            ))}
          </div>
          {/* Adaptive (premium) */}
          {meta?.plan === "premium" ? (
            <button
              onClick={() => {
                if (totals.attempted > 0 && !confirm("Start a new session? Current progress will be lost.")) return;
                setAdaptive(!adaptive);
              }}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-semibold transition",
                adaptive ? "bg-amber-400 text-ink" : "bg-white/15 text-white hover:bg-white/25"
              )}
              title="Bias selection toward your weak topics"
            >💎 Adaptive {adaptive ? "ON" : "OFF"}</button>
          ) : (
            <a
              href="/pricing"
              className="rounded-md px-3 py-1.5 text-xs font-semibold bg-white/10 text-white/70 hover:bg-white/20"
              title="Unlock Adaptive practice with Premium"
            >💎 Adaptive · Upgrade</a>
          )}
          {/* Running score */}
          <div className="bg-white/15 text-white rounded-md px-3 py-1.5 text-sm font-bold tabular-nums">
            {totals.attempted} answered
          </div>
          {/* Elapsed timer */}
          <div className="bg-amber-400 text-ink rounded-md px-3 py-1.5 text-sm font-bold tabular-nums whitespace-nowrap">
            <span className="hidden sm:inline">⏱ </span>{secondsToHMS(elapsed)}
          </div>
          {/* Scientific calculator — top bar, like the real TCS iON CBT */}
          <CalculatorLauncher floating={false} />
        </div>
      </header>

      {/* ---------- Session-size selector ---------- */}
      {meta && (
        <SessionSizeBar
          difficulty={difficulty}
          allCount={meta.counts?.[difficulty] ?? meta.totalAvailable}
          cap={meta.cap}
          limit={limit}
          setLimit={setLimit}
          attempted={totals.attempted}
          shown={questions.length}
        />
      )}

      {/* ---------- Adaptive banner ---------- */}
      {meta?.adaptive && meta.weakTopics && meta.weakTopics.length > 0 && (
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-900 flex flex-wrap items-center gap-2">
          <span className="font-semibold">💎 Adaptive mode:</span>
          <span>focusing on your weak topics —</span>
          {meta.weakTopics.map((t) => (
            <span key={t} className="bg-white border border-amber-300 px-2 py-0.5 rounded-full">{t}</span>
          ))}
        </div>
      )}

      {/* ---------- Status band ---------- */}
      <div className="bg-slate-800 text-slate-100 px-5 py-2 text-xs flex flex-wrap gap-x-6 gap-y-1">
        <span>Topic · <b>{q.topic}</b></span>
        <span>Type · <b>{q.type}</b></span>
        <span>Difficulty · <b className="capitalize">{q.difficulty}</b></span>
        <span>
          <span className="text-emerald-300">+{marksFor(q)}</span>
          <span className="text-rose-300"> · −{negativeFor(q).toFixed(2)}</span>
        </span>
        <span className="ml-auto">Question <b>{state.idx + 1}</b> / {questions.length}</span>
      </div>

      {meta?.capped && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-5 py-2 text-xs">
          {meta.plan === "free" ? "Free preview" : "Showing"}: {questions.length} of {meta.totalAvailable} questions.{" "}
          <Link href="/pricing" className="underline font-semibold">Upgrade to unlock all {meta.totalAvailable}</Link>.
        </div>
      )}

      {/* ---------- Two-column body ---------- */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 px-4 sm:px-5 py-4 sm:py-5">
        {/* Question column */}
        <section className="bg-surface rounded-xl border border-line p-6">
          <div className="flex items-center justify-between text-sm mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="badge bg-brand/10 text-brand">{q.subject}</span>
              <QuestionTypeTag type={q.type} />
              <span className="badge font-bold">
                {marksFor(q)} mark{marksFor(q) > 1 ? "s" : ""}
              </span>
            </div>
            {q.type === "MSQ" && (
              <span className="text-[11px] text-muted">select all that apply</span>
            )}
          </div>

          <MathText className="text-base leading-relaxed">{q.stem}</MathText>
          {q.figure && <QuestionFigure figure={q.figure} />}

          <div className="mt-5">
            {q.type === "NAT" ? (
              <NatInput
                value={a as number | string | undefined}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
                tolerance={q.tolerance}
              />
            ) : q.type === "MSQ" ? (
              <Options
                options={q.options}
                multi
                selected={(a as number[]) ?? []}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
              />
            ) : (
              <Options
                options={q.options}
                multi={false}
                selected={a as number | undefined}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v as number })}
              />
            )}
          </div>

          {/* GATE simulation — no per-question verdict. Answers & solutions are
              revealed only on the review screen after you finish the session. */}

          {/* Action row */}
          <div className="mt-7 flex flex-wrap gap-2">
        <button
          onClick={saveAndNext}
          className="btn btn-primary text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform"
        >Save &amp; Next</button>
        <button
          onClick={markAndNext}
          className="btn bg-amber-500 text-white hover:bg-amber-600 text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform"
        >Mark for Review &amp; Next</button>
        <button
          onClick={clear}
          disabled={!isAnswered(a)}
          className="btn btn-ghost text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform"
        >Clear</button>
        <span className="flex-1" />
        <button onClick={() => go(state.idx - 1)} disabled={state.idx === 0} className="btn btn-ghost text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">‹ Prev</button>
        <button onClick={() => go(state.idx + 1)} disabled={state.idx === questions.length - 1} className="btn btn-ghost text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">Next ›</button>
          </div>
        </section>

        {/* Palette — desktop sticky sidebar */}
        <aside className="hidden lg:block bg-surface rounded-xl border border-line p-5 lg:sticky lg:top-20 h-fit">
          <Legend counts={counts} />
          <div className="mt-4 font-semibold text-sm text-muted">Choose a question</div>
          <div className="mt-2 grid grid-cols-5 sm:grid-cols-6 gap-1.5">
            {questions.map((_, i) => {
              const s = state.status[i] ?? "nv";
              return (
                <button
                  key={i}
                  onClick={() => go(i)}
                  className={cn(
                    "min-h-[44px] sm:min-h-[36px] min-w-[44px] sm:min-w-0 text-xs font-semibold rounded transition active:scale-90",
                    s === "nv"    && "bg-slate-200 text-slate-700",
                    s === "not"   && "bg-rose-200 text-rose-900",
                    s === "ans"   && "bg-emerald-500 text-white",
                    s === "mark"  && "bg-violet-500 text-white",
                    s === "marka" && "bg-violet-700 text-white ring-2 ring-emerald-400",
                    i === state.idx && "ring-2 ring-brand"
                  )}
                  title={`Question ${i + 1}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setFinished(true)}
            className="btn btn-accent w-full mt-5 text-sm"
          >
            Finish session
          </button>
        </aside>
      </div>

      {/* ---------- Mobile bottom action bar ---------- */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-line px-3 py-2 grid grid-cols-2 gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setPaletteOpen(true)}
          className="btn btn-ghost border border-line h-12 justify-center font-semibold"
        >
          🗂 Palette ({state.idx + 1}/{questions.length})
        </button>
        <button
          onClick={() => setFinished(true)}
          className="btn btn-accent h-12 justify-center font-semibold"
        >
          Finish
        </button>
      </div>

      <OfflineToast />
      {/* ---------- Mobile palette drawer ---------- */}
      <div
        className={cn(
          "lg:hidden fixed inset-0 z-40 transition",
          paletteOpen ? "visible" : "invisible pointer-events-none",
        )}
        aria-hidden={!paletteOpen}
      >
        <div
          onClick={() => setPaletteOpen(false)}
          className={cn("absolute inset-0 bg-ink/40 transition-opacity", paletteOpen ? "opacity-100" : "opacity-0")}
        />
        <div
          className={cn(
            "absolute top-0 right-0 h-full w-[88%] max-w-sm bg-surface shadow-2xl flex flex-col transition-transform duration-200",
            paletteOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="h-14 flex items-center justify-between px-5 border-b border-line">
            <span className="font-bold">Question palette</span>
            <button
              type="button"
              aria-label="Close palette"
              onClick={() => setPaletteOpen(false)}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-canvas"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12" /><path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <Legend counts={counts} />
            <div className="mt-4 font-semibold text-sm text-muted">Choose a question</div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {questions.map((_, i) => {
                const s = state.status[i] ?? "nv";
                return (
                  <button
                    key={i}
                    onClick={() => { go(i); setPaletteOpen(false); }}
                    className={cn(
                      "min-h-[44px] min-w-[44px] text-xs font-semibold rounded transition active:scale-90",
                      s === "nv"    && "bg-slate-200 text-slate-700",
                      s === "not"   && "bg-rose-200 text-rose-900",
                      s === "ans"   && "bg-emerald-500 text-white",
                      s === "mark"  && "bg-violet-500 text-white",
                      s === "marka" && "bg-violet-700 text-white ring-2 ring-emerald-400",
                      i === state.idx && "ring-2 ring-brand"
                    )}
                    title={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Legend({ counts }: { counts: Record<string, number> }) {
  const items: [string, string, number][] = [
    ["bg-slate-200",   "Not visited",       counts.nv],
    ["bg-rose-200",    "Not answered",      counts.not],
    ["bg-emerald-500", "Answered",          counts.ans],
    ["bg-violet-500",  "Marked",            counts.mark],
    ["bg-violet-700",  "Marked & answered", counts.marka],
  ];
  return (
    <ul className="text-xs space-y-1.5">
      {items.map(([bg, label, n]) => (
        <li key={label} className="flex items-center gap-2">
          <span className={cn("inline-block w-4 h-4 rounded", bg)} />
          <span className="flex-1">{label}</span>
          <span className="font-semibold">{n ?? 0}</span>
        </li>
      ))}
    </ul>
  );
}

function Options({
  options, selected, multi, onChange, correct, disabled,
}: {
  options: string[];
  selected: number | number[] | undefined;
  multi: boolean;
  onChange: (v: number | number[]) => void;
  correct?: number[];
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const isSel = multi
          ? Array.isArray(selected) && selected.includes(i)
          : selected === i;
        const isRight     = correct?.includes(i);
        const isWrongPick = correct && isSel && !isRight;
        return (
          <label
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 min-h-[48px] transition active:scale-[0.99]",
              disabled ? "cursor-default" : "cursor-pointer hover:bg-canvas active:bg-brand/[0.06]",
              !correct && isSel && "border-brand bg-brand/5",
              correct && isRight && "border-ok bg-emerald-50 dark:bg-emerald-500/15",
              correct && isWrongPick && "border-bad bg-rose-50 dark:bg-rose-500/15",
              !correct && !isSel && "border-line",
            )}
          >
            <input
              type={multi ? "checkbox" : "radio"}
              checked={!!isSel}
              disabled={disabled}
              onChange={() => {
                if (!multi) return onChange(i);
                const cur = Array.isArray(selected) ? [...selected] : [];
                const ix = cur.indexOf(i);
                if (ix >= 0) cur.splice(ix, 1); else cur.push(i);
                onChange(cur);
              }}
              className="mt-0.5 min-w-5 min-h-5"
            />
            <span className="font-bold w-5">{String.fromCharCode(65 + i)}.</span>
            <MathText className="flex-1 text-sm">{opt}</MathText>
            {correct && isRight     && <span className="text-ok font-bold text-sm">✓</span>}
            {correct && isWrongPick && <span className="text-bad font-bold text-sm">✗</span>}
          </label>
        );
      })}
    </div>
  );
}

function NatInput({
  value, onChange, tolerance, disabled,
}: {
  value: number | string | undefined;
  onChange: (v: number | string | undefined) => void;
  tolerance: number;
  disabled?: boolean;
}) {
  return (
    <div className="max-w-sm">
      <label className="text-sm font-semibold">Your answer (numerical)</label>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
        className="input mt-1.5 font-mono"
        placeholder="e.g. 12.5"
      />
      <p className="text-xs text-muted mt-1">Accepted tolerance: ±{tolerance}</p>
    </div>
  );
}

/**
 * End-of-session review (GATE simulation): shows the score summary and then
 * every question with the candidate's response, the correct answer, marks
 * earned and the full solution. This is the *only* place answers are revealed.
 */
function PracticeReview({
  questions, answers, totals, elapsed, subjectName, onResume,
}: {
  questions: Q[];
  answers: Record<number, Answer>;
  totals: { score: number; correctN: number; wrongN: number; attempted: number; totalPossible: number };
  elapsed: number;
  subjectName: string;
  onResume: () => void;
}) {
  const pct = totals.totalPossible > 0 ? (totals.score / totals.totalPossible) * 100 : 0;
  const skipped = questions.length - totals.attempted;
  return (
    <div className="min-h-screen bg-canvas -mt-px">
      <header className="bg-gradient-to-r from-brand-2 to-brand text-white px-4 sm:px-5 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-xs opacity-80">GATE Practice · Review</div>
          <div className="font-semibold text-lg">{subjectName}</div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-5 py-6">
        {/* Summary */}
        <div className="bg-surface rounded-xl border border-line p-5">
          <h2 className="text-xl font-extrabold">Session summary</h2>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            <Stat label="Score" value={`${totals.score >= 0 ? "+" : ""}${totals.score.toFixed(2)} / ${totals.totalPossible}`} />
            <Stat label="Percentage" value={`${pct.toFixed(1)}%`} />
            <Stat label="Time" value={secondsToHMS(elapsed)} />
            <Stat label="Correct" value={`${totals.correctN}`} tone="ok" />
            <Stat label="Wrong"   value={`${totals.wrongN}`}   tone="bad" />
            <Stat label="Skipped" value={`${skipped}`} />
          </div>
          <div className="mt-5 flex gap-2 flex-wrap">
            <button onClick={onResume} className="btn btn-ghost text-sm">‹ Resume session</button>
            <Link href="/practice" className="btn btn-primary text-sm">Back to subjects</Link>
            <Link href="/dashboard" className="btn btn-accent text-sm">View dashboard</Link>
          </div>
        </div>

        {/* Per-question review */}
        <div className="mt-6 space-y-5">
          {questions.map((qq, i) => {
            const ans     = answers[i];
            const answered = isAnswered(ans);
            const correct = answered && gradeAnswer(qq, ans);
            const delta   = scoreFor(qq, ans);
            return (
              <article key={qq.id} className="bg-surface rounded-xl border border-line p-5">
                <div className="flex items-center gap-2 flex-wrap text-sm mb-3">
                  <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold">Q{i + 1}</span>
                  <QuestionTypeTag type={qq.type} />
                  <span className="badge bg-brand/10 text-brand">{qq.topic}</span>
                  <span className="badge font-bold">{marksFor(qq)} mark{marksFor(qq) > 1 ? "s" : ""}</span>
                  <span className={cn(
                    "ml-auto px-2 py-0.5 rounded text-xs font-bold tabular-nums",
                    !answered ? "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300" : correct ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200" : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200"
                  )}>
                    {!answered ? "Not attempted" : `${correct ? "✓ Correct" : "✗ Incorrect"} · ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`}
                  </span>
                </div>

                <MathText className="text-base leading-relaxed">{qq.stem}</MathText>
                {qq.figure && <QuestionFigure figure={qq.figure} />}

                <div className="mt-4">
                  {qq.type === "NAT" ? (
                    <div className="text-sm space-y-1">
                      <div>Your answer: <b className="font-mono">{answered ? String(ans) : "—"}</b></div>
                      <div className="text-emerald-700 dark:text-emerald-300">Correct answer: <b className="font-mono">{qq.answer}</b> <span className="text-muted">(±{qq.tolerance})</span></div>
                    </div>
                  ) : (
                    <Options
                      options={qq.options}
                      multi={qq.type === "MSQ"}
                      selected={qq.type === "MSQ" ? ((ans as number[]) ?? []) : (ans as number | undefined)}
                      onChange={() => {}}
                      correct={qq.type === "MSQ" ? qq.answer : [qq.answer]}
                      disabled
                    />
                  )}
                </div>

                <div className="mt-4 rounded-lg bg-canvas p-4 text-sm">
                  <p className="font-semibold text-brand">Solution</p>
                  <MathText className="mt-1.5 leading-relaxed cg-solution">{qq.solution}</MathText>
                  <CommunitySuccessRate qid={qq.id} difficulty={qq.difficulty} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "bad" }) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="text-xs text-muted">{label}</div>
      <div className={cn(
        "font-bold tabular-nums mt-0.5",
        tone === "ok"  && "text-ok",
        tone === "bad" && "text-bad",
      )}>{value}</div>
    </div>
  );
}
