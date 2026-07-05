"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { secondsToHMS, cn } from "@/lib/utils";
import { CalculatorLauncher } from "@/components/gate-calculator";
import { QuestionTypeTag } from "@/components/question-extras";
import { OfflineToast } from "@/components/offline-toast";
import { QuestionFigure, type QuestionFigure as Figure } from "@/components/question-figure";
import { MathText } from "@/components/math-text";

type Question =
  | { type: "MCQ"; marks: number; subject: string; stem: string; options: string[]; answer: number; solution?: string; figure?: Figure }
  | { type: "MSQ"; marks: number; subject: string; stem: string; options: string[]; answer: number[]; solution?: string; figure?: Figure }
  | { type: "NAT"; marks: number; subject: string; stem: string; answer: number; tolerance?: number; solution?: string; figure?: Figure };

type Status = "nv" | "not" | "ans" | "mark" | "marka";
type Answer = number | number[] | string | undefined;

interface State {
  idx: number;
  answers: Record<number, Answer>;
  status: Record<number, Status>;
}

type Action =
  | { type: "go"; i: number }
  | { type: "set"; idx: number; answer: Answer }
  | { type: "mark"; idx: number; status: Status }
  | { type: "clear"; idx: number }
  | { type: "hydrate"; state: State };

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "go":    return { ...s, idx: a.i };
    case "set":   return { ...s, answers: { ...s.answers, [a.idx]: a.answer } };
    case "mark":  return { ...s, status: { ...s.status, [a.idx]: a.status } };
    case "clear": return { ...s, answers: { ...s.answers, [a.idx]: undefined }, status: { ...s.status, [a.idx]: "not" } };
    case "hydrate": return a.state;
  }
}

function isAnswered(a: Answer) {
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}

/** Short tab label: the trailing segment of a "Paper-I · General Awareness"
 *  style subject, falling back to the whole subject for flat names. */
function shortName(subject: string): string {
  const parts = subject.split("·").map((s) => s.trim());
  return parts.length > 1 ? parts[parts.length - 1] : subject;
}

/** Compact m:ss formatter for the advisory per-section timer. */
function mmss(total: number): string {
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function ExamPortal({
  kind, refId, title, questions, durationSec, lockdown, negativeMarking, examLabel, showCalculator,
}: {
  kind: "mock" | "pyq";
  refId: string;
  title: string;
  questions: Question[];
  durationSec: number;
  /** Exam-center lockdown: disable right-click, copy/paste, text selection and
   *  dev-tool shortcuts. Defaults on for mocks; PYQ Exam Mode enables it too. */
  lockdown?: boolean;
  /** Whether wrong MCQs incur negative marks. GATE = true; CIL MT = false.
   *  Defaults to true to preserve existing GATE behaviour. */
  negativeMarking?: boolean;
  /** Exam-family caption shown in the top bar. Defaults to GATE. */
  examLabel?: string;
  /** Whether the on-screen scientific calculator is available. GATE = true;
   *  CIL MT = false. Defaults to true to preserve existing GATE behaviour. */
  showCalculator?: boolean;
}) {
  const locked = lockdown ?? kind === "mock";
  const negMarking = negativeMarking ?? true;
  const examCaption = examLabel ?? "GATE — Graduate Aptitude Test in Engineering";
  const calculatorAllowed = showCalculator ?? true;
  const router = useRouter();
  const [state, dispatch] = useReducer(reducer, {
    idx: 0,
    answers: {},
    status: Object.fromEntries(questions.map((_, i) => [i, "nv" as Status])),
  });
  const [secondsLeft, setSecondsLeft] = useState(durationSec);
  const [submitting, setSubmitting] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drill, setDrill] = useState(false);

  // Autosave / resume + pause state
  const storageKey = `cg:exam:${kind}:${refId}`;
  const hydrated = useRef(false);
  const [resumed, setResumed] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  // Advisory per-section time tracking (non-blocking): seconds spent in each
  // subject. currentSubjectRef lets the 1s tick attribute time to the section
  // the candidate is currently viewing without restarting the interval.
  const [sectionSecs, setSectionSecs] = useState<Record<string, number>>({});
  const currentSubjectRef = useRef(questions[0]?.subject ?? "");

  // Auto-close mobile palette whenever the question changes
  useEffect(() => { setPaletteOpen(false); }, [state.idx]);

  // Lock body scroll while drawer open
  useEffect(() => {
    if (!paletteOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [paletteOpen]);

  // Mark first-visit as 'not' on entry
  useEffect(() => {
    if (state.status[state.idx] === "nv") {
      dispatch({ type: "mark", idx: state.idx, status: "not" });
    }
  }, [state.idx]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the active-section ref in sync for the per-section timer
  useEffect(() => {
    currentSubjectRef.current = questions[state.idx]?.subject ?? "";
  }, [state.idx, questions]);

  // Hydrate a saved attempt from localStorage once on mount (post-render, so
  // server + client first paint match and there is no hydration mismatch).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        if (saved?.answers && saved?.status) {
          dispatch({ type: "hydrate", state: { idx: saved.idx ?? 0, answers: saved.answers, status: saved.status } });
          if (typeof saved.secondsLeft === "number") setSecondsLeft(saved.secondsLeft);
          if (saved.sectionSecs) setSectionSecs(saved.sectionSecs);
          setResumed(true);
        }
      }
    } catch { /* ignore corrupt/blocked storage */ }
    hydrated.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave progress to localStorage on every change (after hydration).
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        idx: state.idx,
        answers: state.answers,
        status: state.status,
        secondsLeft,
        sectionSecs,
        savedAt: Date.now(),
      }));
    } catch { /* ignore quota/blocked storage */ }
  }, [state, secondsLeft, sectionSecs, storageKey]);

  // Tick timer
  useEffect(() => {
    const t = setInterval(() => {
      if (pausedRef.current) return;
      setSecondsLeft((s) => {
        if (s <= 1) { clearInterval(t); void submit(true); return 0; }
        return s - 1;
      });
      setSectionSecs((m) => {
        const subj = currentSubjectRef.current;
        if (!subj) return m;
        return { ...m, [subj]: (m[subj] ?? 0) + 1 };
      });
    }, 1000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Warn on close
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  // ---------- Exam-center lockdown ----------
  useEffect(() => {
    if (!locked) return;
    const noop = (e: Event) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      // Block dev tools + copy/paste/print/save/select-all/view-source
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["i", "j", "c"].includes(k)) ||
        ((e.ctrlKey || e.metaKey) && ["c", "v", "x", "a", "s", "p", "u"].includes(k))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener("contextmenu", noop);
    document.addEventListener("copy", noop);
    document.addEventListener("cut", noop);
    document.addEventListener("paste", noop);
    document.addEventListener("selectstart", noop);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("contextmenu", noop);
      document.removeEventListener("copy", noop);
      document.removeEventListener("cut", noop);
      document.removeEventListener("paste", noop);
      document.removeEventListener("selectstart", noop);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [locked]);

  const q = questions[state.idx];
  const counts = useMemo(() => {
    const c = { nv: 0, not: 0, ans: 0, mark: 0, marka: 0 };
    for (const s of Object.values(state.status)) c[s]++;
    return c;
  }, [state.status]);

  // Sections derived from the questions' subjects, in order of first appearance.
  // Drives the section tabs and the grouped palette (discipline-generic).
  const sections = useMemo(() => {
    const map = new Map<string, number[]>();
    questions.forEach((qq, i) => {
      const list = map.get(qq.subject);
      if (list) list.push(i);
      else map.set(qq.subject, [i]);
    });
    return Array.from(map.entries()).map(([name, indices]) => ({ name, indices }));
  }, [questions]);

  const sectionStats = useMemo(
    () =>
      sections.map((sec) => {
        let answered = 0;
        for (const i of sec.indices) {
          const s = state.status[i];
          if (s === "ans" || s === "marka") answered++;
        }
        return { name: sec.name, indices: sec.indices, answered };
      }),
    [sections, state.status],
  );

  function setStatus(idx: number) {
    return isAnswered(state.answers[idx]) ? "ans" : "not";
  }

  const saveAndNext  = () => { dispatch({ type: "mark", idx: state.idx, status: setStatus(state.idx) }); go(state.idx + 1); };
  const markAndNext  = () => { dispatch({ type: "mark", idx: state.idx, status: isAnswered(state.answers[state.idx]) ? "marka" : "mark" }); go(state.idx + 1); };
  const clear        = () => dispatch({ type: "clear", idx: state.idx });
  const go = useCallback((i: number) => { if (i >= 0 && i < questions.length) dispatch({ type: "go", i }); }, [questions.length]);

  // ---- Flagged-question drill mode ----
  const flaggedIdxs = useMemo(
    () => questions.map((_, i) => i).filter((i) => {
      const s = state.status[i];
      return s === "mark" || s === "marka";
    }),
    [questions, state.status],
  );
  const gotoFlagged = (dir: 1 | -1) => {
    if (flaggedIdxs.length === 0) return;
    const pos = flaggedIdxs.indexOf(state.idx);
    let next: number;
    if (pos === -1) {
      next = dir === 1
        ? (flaggedIdxs.find((i) => i > state.idx) ?? flaggedIdxs[0])
        : ([...flaggedIdxs].reverse().find((i) => i < state.idx) ?? flaggedIdxs[flaggedIdxs.length - 1]);
    } else {
      next = flaggedIdxs[(pos + dir + flaggedIdxs.length) % flaggedIdxs.length];
    }
    go(next);
  };
  const enterDrill = () => {
    if (flaggedIdxs.length === 0) return;
    if (!flaggedIdxs.includes(state.idx)) go(flaggedIdxs[0]);
    setDrill(true);
  };
  useEffect(() => { if (drill && flaggedIdxs.length === 0) setDrill(false); }, [drill, flaggedIdxs.length]);

  async function submit(auto = false) {
    if (!auto && !confirmOpen) { setConfirmOpen(true); return; }
    setConfirmOpen(false);
    setSubmitting(true);
    try {
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          kind, refId,
          answers: state.answers,
          durationSec: Math.max(0, durationSec - secondsLeft),
        }),
      });
      if (res.status === 401) return router.push(`/login?next=/${kind === "pyq" ? "pyq" : "mocks"}/${refId}`);
      if (res.status === 402) { alert("Upgrade required to attempt this paper."); return router.push("/pricing"); }
      const data = await res.json();
      if (!res.ok) throw new Error(JSON.stringify(data?.error));
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      router.push(`/result/${data.attempt.id}`);
    } catch (e) {
      alert((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("min-h-screen bg-canvas -mt-px pb-20 lg:pb-0", locked && "select-none")}>
      {/* ---------- Top bar ---------- */}
      <header className="bg-gradient-to-r from-brand-2 to-brand text-white px-4 sm:px-5 py-3 flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="hidden min-[400px]:inline-flex w-9 h-9 bg-white/15 grid place-items-center rounded-lg font-bold shrink-0">CG</div>
        <div className="min-w-0 flex-1">
          <div className="text-xs sm:text-sm opacity-80">{examCaption}</div>
          <div className="font-semibold text-sm sm:text-base truncate">{title}</div>
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Scientific calculator — top bar, like the real TCS iON CBT.
             GATE allows it; CIL MT does not. */}
          {calculatorAllowed && <CalculatorLauncher floating={false} />}
          <button
            type="button"
            onClick={() => setPaused(true)}
            className="bg-white/15 hover:bg-white/25 rounded-md px-3 py-1.5 text-sm font-semibold transition"
          >
            ⏸ Pause
          </button>
          <div className="bg-amber-400 text-ink rounded-md px-3 py-1.5 text-sm font-bold tabular-nums whitespace-nowrap">
            <span className="hidden sm:inline">⏱ </span>{secondsToHMS(secondsLeft)}
          </div>
        </div>
      </header>

      {/* ---------- Status band ---------- */}
      <div className="bg-slate-800 text-slate-100 px-4 sm:px-5 py-2 text-xs flex flex-wrap gap-x-4 gap-y-1 sm:gap-6">
        <span>Section · <b>{q.subject}</b></span>
        <span className="text-amber-300">⏱ <b className="tabular-nums">{mmss(sectionSecs[q.subject] ?? 0)}</b> in section</span>
        <span>Type · <b>{q.type}</b></span>
        <span className="hidden sm:inline">
          +{q.marks}
          {negMarking
            ? <span className="text-bad"> · −{q.type === "MCQ" ? (q.marks / 3).toFixed(2) : 0}</span>
            : <span className="text-ok"> · no negative marking</span>}
        </span>
        <span className="ml-auto">Q <b>{state.idx + 1}</b> / {questions.length}</span>
      </div>

      {/* ---------- Section tabs ---------- */}
      {sections.length > 1 && (
        <div className="bg-slate-700 text-slate-100 px-2 sm:px-4 overflow-x-auto">
          <div className="flex gap-1 min-w-max" role="tablist" aria-label="Exam sections">
            {sectionStats.map((sec) => {
              const active = sec.name === q.subject;
              return (
                <button
                  key={sec.name}
                  role="tab"
                  aria-selected={active}
                  onClick={() => go(sec.indices[0])}
                  className={cn(
                    "px-3 py-2 text-xs font-semibold whitespace-nowrap border-b-2 transition",
                    active
                      ? "border-amber-400 text-white"
                      : "border-transparent text-slate-300 hover:text-white",
                  )}
                  title={sec.name}
                >
                  {shortName(sec.name)}
                  <span className="ml-1.5 text-[10px] opacity-80 tabular-nums">
                    {sec.answered}/{sec.indices.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ---------- Resumed-attempt banner ---------- */}
      {resumed && (
        <div className="bg-emerald-50 text-emerald-900 text-xs px-4 sm:px-5 py-1.5 flex items-center gap-2">
          <span>↻ Resumed your saved attempt — your answers and timer were restored.</span>
          <button type="button" onClick={() => setResumed(false)} className="ml-auto underline">Dismiss</button>
        </div>
      )}

      {/* ---------- Flagged-question drill bar ---------- */}
      {drill && (
        <div className="bg-violet-600 text-white px-4 sm:px-5 py-2 text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-semibold">🚩 Reviewing marked questions</span>
          <span className="tabular-nums">{Math.max(0, flaggedIdxs.indexOf(state.idx)) + 1} / {flaggedIdxs.length}</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => gotoFlagged(-1)} className="bg-white/15 hover:bg-white/25 rounded px-2 py-1">‹ Prev marked</button>
            <button onClick={() => gotoFlagged(1)} className="bg-white/15 hover:bg-white/25 rounded px-2 py-1">Next marked ›</button>
            <button onClick={() => setDrill(false)} className="underline">Exit</button>
          </div>
        </div>
      )}

      {/* ---------- Two-column body ---------- */}
      <div className="grid lg:grid-cols-[1fr_320px] gap-5 px-4 sm:px-5 py-4 sm:py-5">

        {/* Question column */}
        <section className="bg-surface rounded-xl border border-line p-4 sm:p-6">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="badge bg-brand/10 text-brand">{q.subject}</span>
            <QuestionTypeTag type={q.type} />
          </div>
          <MathText className="prose max-w-none text-base leading-relaxed">{q.stem}</MathText>
          {q.figure && <QuestionFigure figure={q.figure} />}

          <div className="mt-5">
            {q.type === "NAT" ? (
              <NatInput
                value={state.answers[state.idx] as number | string | undefined}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
                tolerance={q.tolerance ?? 0}
              />
            ) : q.type === "MSQ" ? (
              <Options
                options={q.options}
                multi
                selected={(state.answers[state.idx] as number[]) ?? []}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
              />
            ) : (
              <Options
                options={q.options}
                multi={false}
                selected={state.answers[state.idx] as number | undefined}
                onChange={(v) => dispatch({ type: "set", idx: state.idx, answer: v })}
              />
            )}
          </div>

          {/* actions */}
          <div className="mt-7 grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
            <button onClick={saveAndNext}  className="btn btn-primary text-sm col-span-2 sm:col-span-1 min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">Save &amp; Next</button>
            <button onClick={markAndNext} className="btn bg-amber-500 text-white hover:bg-amber-600 text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">Mark &amp; Next</button>
            <button onClick={clear}       className="btn btn-ghost text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">Clear</button>
            <button onClick={enterDrill} disabled={flaggedIdxs.length === 0} className="btn btn-ghost text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">🚩 Marked ({flaggedIdxs.length})</button>
            <span className="hidden sm:block sm:flex-1" />
            <button onClick={() => go(state.idx - 1)} className="btn btn-ghost text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">‹ Prev</button>
            <button onClick={() => go(state.idx + 1)} className="btn btn-ghost text-sm min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">Next ›</button>
          </div>
        </section>

        {/* Palette — desktop sticky sidebar */}
        <aside className="hidden lg:block bg-surface rounded-xl border border-line p-5 lg:sticky lg:top-20 h-fit">
          <PaletteBody
            counts={counts}
            sections={sections}
            sectionSecs={sectionSecs}
            activeSubject={q.subject}
            currentIdx={state.idx}
            status={state.status}
            go={go}
            submitting={submitting}
            onSubmit={() => submit(false)}
          />
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
          disabled={submitting}
          onClick={() => submit(false)}
          className="btn btn-accent h-12 justify-center font-semibold"
        >
          {submitting ? "Submitting…" : "Submit"}
        </button>
      </div>

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
            <PaletteBody
              counts={counts}
              sections={sections}
              sectionSecs={sectionSecs}
              activeSubject={q.subject}
              currentIdx={state.idx}
              status={state.status}
              go={(i) => { go(i); setPaletteOpen(false); }}
              submitting={submitting}
              onSubmit={() => submit(false)}
            />
          </div>
        </div>
      </div>

      {/* Submit summary + double-confirmation modal */}
      {confirmOpen && (
        <SubmitConfirm
          counts={counts}
          total={questions.length}
          sections={sections}
          status={state.status}
          sectionSecs={sectionSecs}
          submitting={submitting}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => submit(false)}
          onJump={(i) => { setConfirmOpen(false); go(i); }}
        />
      )}

      {/* ---------- Pause overlay (timer & progress frozen) ---------- */}
      <OfflineToast />
      {paused && (
        <div className="fixed inset-0 z-[80] bg-ink/80 backdrop-blur-sm grid place-items-center p-4 text-center">
          <div className="bg-surface rounded-xl max-w-sm w-full p-6">
            <h2 className="text-xl font-extrabold">Test paused</h2>
            <p className="text-sm text-muted mt-1">
              Your timer is frozen and progress is saved. Resume when you’re ready.
            </p>
            <button onClick={() => setPaused(false)} className="btn btn-accent w-full mt-5">
              Resume test
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SubmitConfirm({
  counts, total, sections, status, sectionSecs, submitting, onCancel, onConfirm, onJump,
}: {
  counts: Record<string, number>;
  total: number;
  sections: { name: string; indices: number[] }[];
  status: Record<number, Status>;
  sectionSecs: Record<string, number>;
  submitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  onJump: (i: number) => void;
}) {
  const answered = (counts.ans ?? 0) + (counts.marka ?? 0);
  const marked = (counts.mark ?? 0) + (counts.marka ?? 0);
  const notAnswered = total - answered;
  const [sure, setSure] = useState(false);

  const rows = sections.map((sec) => {
    let ans = 0, mark = 0, firstUnanswered = -1;
    for (const i of sec.indices) {
      const s = status[i];
      if (s === "ans" || s === "marka") ans++;
      else if (firstUnanswered < 0) firstUnanswered = i;
      if (s === "mark" || s === "marka") mark++;
    }
    return {
      name: sec.name,
      ans,
      notAns: sec.indices.length - ans,
      mark,
      secs: sectionSecs[sec.name] ?? 0,
      jumpTo: firstUnanswered >= 0 ? firstUnanswered : sec.indices[0],
      complete: firstUnanswered < 0,
    };
  });

  return (
    <div className="fixed inset-0 z-[70] bg-black/50 grid place-items-center p-4">
      <div className="bg-surface rounded-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-extrabold">Submit examination?</h2>
        <p className="text-sm text-muted mt-1">Review your attempt before ending the test.</p>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <SummaryCell label="Answered" value={answered} tone="ok" />
          <SummaryCell label="Not answered" value={notAnswered} tone="bad" />
          <SummaryCell label="Marked for review" value={marked} tone="mark" />
        </div>

        {/* Per-section breakdown */}
        <div className="mt-5 overflow-hidden rounded-lg border border-line">
          <table className="w-full text-xs">
            <thead className="bg-canvas text-muted">
              <tr>
                <th className="text-left font-semibold px-3 py-2">Section</th>
                <th className="font-semibold px-2 py-2">Ans</th>
                <th className="font-semibold px-2 py-2">Left</th>
                <th className="font-semibold px-2 py-2">Marked</th>
                <th className="font-semibold px-2 py-2">Time</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-t border-line">
                  <td className="px-3 py-2 font-medium truncate max-w-[140px]" title={r.name}>{shortName(r.name)}</td>
                  <td className="text-center px-2 py-2 tabular-nums text-emerald-700 font-semibold">{r.ans}</td>
                  <td className={cn("text-center px-2 py-2 tabular-nums font-semibold", r.notAns > 0 ? "text-rose-600" : "text-muted")}>{r.notAns}</td>
                  <td className="text-center px-2 py-2 tabular-nums text-violet-700">{r.mark}</td>
                  <td className="text-center px-2 py-2 tabular-nums text-muted">{mmss(r.secs)}</td>
                  <td className="text-right px-2 py-2">
                    {!r.complete && (
                      <button onClick={() => onJump(r.jumpTo)} className="text-brand underline whitespace-nowrap">Review →</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {notAnswered > 0 && (
          <p className="mt-3 text-xs text-rose-600">
            You have <b>{notAnswered}</b> unanswered question{notAnswered === 1 ? "" : "s"}. Use “Review →” to revisit them before submitting.
          </p>
        )}

        {!sure ? (
          <div className="mt-6 flex gap-2 justify-end">
            <button onClick={onCancel} className="btn btn-ghost text-sm">Resume test</button>
            <button onClick={() => setSure(true)} className="btn btn-accent text-sm">Submit…</button>
          </div>
        ) : (
          <div className="mt-6">
            <p className="text-sm font-semibold text-bad">Are you absolutely sure you want to end the exam? This cannot be undone.</p>
            <div className="mt-3 flex gap-2 justify-end">
              <button onClick={() => setSure(false)} className="btn btn-ghost text-sm">Go back</button>
              <button disabled={submitting} onClick={onConfirm} className="btn btn-accent text-sm">
                {submitting ? "Submitting…" : "Yes, end exam"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryCell({ label, value, tone }: { label: string; value: number; tone: "ok" | "bad" | "mark" }) {
  return (
    <div className={cn(
      "rounded-lg p-3",
      tone === "ok" && "bg-emerald-50 text-emerald-900",
      tone === "bad" && "bg-rose-50 text-rose-900",
      tone === "mark" && "bg-violet-50 text-violet-900",
    )}>
      <div className="text-2xl font-extrabold tabular-nums">{value}</div>
      <div className="text-[11px] mt-0.5">{label}</div>
    </div>
  );
}

function PaletteBody({
  counts, sections, sectionSecs, activeSubject, currentIdx, status, go, submitting, onSubmit,
}: {
  counts: Record<string, number>;
  sections: { name: string; indices: number[] }[];
  sectionSecs: Record<string, number>;
  activeSubject: string;
  currentIdx: number;
  status: Record<number, Status>;
  go: (i: number) => void;
  submitting: boolean;
  onSubmit: () => void;
}) {
  return (
    <>
      <Legend counts={counts} />
      {sections.map((sec) => {
        const answered = sec.indices.filter((i) => {
          const s = status[i];
          return s === "ans" || s === "marka";
        }).length;
        return (
          <div key={sec.name} className="mt-4">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  "text-sm font-semibold truncate",
                  sec.name === activeSubject ? "text-brand" : "text-muted",
                )}
                title={sec.name}
              >
                {shortName(sec.name)}
              </span>
              <span className="text-[11px] text-muted tabular-nums shrink-0">
                ⏱ {mmss(sectionSecs[sec.name] ?? 0)} · {answered}/{sec.indices.length}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-5 sm:grid-cols-6 gap-1.5">
              {sec.indices.map((i) => {
                const s = status[i] ?? "nv";
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
                      i === currentIdx && "ring-2 ring-brand",
                    )}
                    title={`Question ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
      <button
        disabled={submitting}
        onClick={onSubmit}
        className="btn btn-accent w-full mt-5 text-sm"
      >
        {submitting ? "Submitting…" : "Submit Paper"}
      </button>
    </>
  );
}

function Legend({ counts }: { counts: Record<string, number> }) {
  const items: [string, string, number][] = [
    ["bg-slate-200",    "Not visited",       counts.nv],
    ["bg-rose-200",     "Not answered",      counts.not],
    ["bg-emerald-500",  "Answered",          counts.ans],
    ["bg-violet-500",   "Marked",            counts.mark],
    ["bg-violet-700",   "Marked & answered", counts.marka],
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
  options, selected, multi, onChange,
}: {
  options: string[];
  selected: number | number[] | undefined;
  multi: boolean;
  onChange: (v: number | number[]) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const isSel = multi
          ? Array.isArray(selected) && selected.includes(i)
          : selected === i;
        return (
          <label
            key={i}
            className={cn(
              "flex items-start gap-3 rounded-lg border p-3 min-h-[48px] cursor-pointer transition active:bg-brand/[0.06] active:scale-[0.99]",
              isSel ? "border-brand bg-brand/5" : "border-line hover:bg-canvas"
            )}
          >
            <input
              type={multi ? "checkbox" : "radio"}
              checked={!!isSel}
              onChange={() => {
                if (!multi) onChange(i);
                else {
                  const cur = Array.isArray(selected) ? [...selected] : [];
                  const idx = cur.indexOf(i);
                  if (idx >= 0) cur.splice(idx, 1); else cur.push(i);
                  onChange(cur);
                }
              }}
              className="mt-0.5 min-w-5 min-h-5"
            />
            <span className="font-bold w-5">{String.fromCharCode(65 + i)}.</span>
            <MathText className="flex-1 text-sm">{opt}</MathText>
          </label>
        );
      })}
    </div>
  );
}

function NatInput({
  value, onChange, tolerance,
}: {
  value: number | string | undefined;
  onChange: (v: number | string | undefined) => void;
  tolerance: number;
}) {
  return (
    <div className="max-w-sm">
      <label className="text-sm font-semibold">Your answer (numerical)</label>
      <input
        type="number"
        step="any"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
        className="input mt-1.5 font-mono"
        placeholder="e.g. 12.5"
      />
      <p className="text-xs text-muted mt-1">Accepted tolerance: ±{tolerance}</p>
    </div>
  );
}
