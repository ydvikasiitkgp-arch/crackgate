"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/math-text";
import { QuestionFigure, type QuestionFigure as Figure } from "@/components/question-figure";
import { OfflineToast } from "@/components/offline-toast";

type Q = {
  id: string; subject: string; topic: string;
  difficulty: "easy" | "medium" | "hard";
  type: "MCQ" | "MSQ" | "NAT";
  stem: string;
  options?: string[];
  answer: number | number[];
  tolerance?: number;
  solution: string;
  figure?: Figure;
  marks: 1 | 2;
  section: string;
};

type Mock = {
  id: string; seed: number; title: string; description: string;
  durationMin: number; totalQuestions: number; totalMarks: number;
  sections: { name: string; count: number; marks: number }[];
  negativeMarking: { mcq1: number; mcq2: number; nat: number; msq: number };
  questions: Q[];
};

type Phase = "loading" | "instructions" | "running" | "submitted";

export function FreshMockRunner({ initialSeed }: { initialSeed?: number }) {
  const [mock, setMock] = useState<Mock | null>(null);
  const [phase, setPhase] = useState<Phase>("loading");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | number[] | string>>({});
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Load
  useEffect(() => {
    const url = initialSeed ? `/api/mocks/fresh?seed=${initialSeed}` : "/api/mocks/fresh";
    fetch(url)
      .then((r) => r.json())
      .then((d: Mock) => { setMock(d); setSecondsLeft(d.durationMin * 60); setPhase("instructions"); })
      .catch(() => setPhase("instructions"));
  }, [initialSeed]);

  // Timer
  useEffect(() => {
    if (phase !== "running") return;
    const t = setInterval(() => setSecondsLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, [phase]);

  useEffect(() => { if (phase === "running" && secondsLeft === 0) setPhase("submitted"); }, [phase, secondsLeft]);

  // Track seen for "skipped" calc
  useEffect(() => {
    if (phase === "running" && mock) {
      setSeenIds((prev) => { const n = new Set(prev); n.add(mock.questions[idx].id); return n; });
    }
  }, [phase, idx, mock]);

  const result = useMemo(() => {
    if (!mock || phase !== "submitted") return null;
    let scored = 0, correct = 0, wrong = 0, skipped = 0;
    const bySubject: Record<string, { scored: number; total: number; correct: number; wrong: number }> = {};
    for (const q of mock.questions) {
      const a = answers[q.id];
      const subj = q.subject;
      bySubject[subj] ??= { scored: 0, total: 0, correct: 0, wrong: 0 };
      bySubject[subj].total += q.marks;
      if (a === undefined || a === "" || (Array.isArray(a) && a.length === 0)) { skipped += 1; continue; }
      const ok = checkAnswer(q, a);
      if (ok) {
        scored += q.marks; correct += 1;
        bySubject[subj].scored += q.marks; bySubject[subj].correct += 1;
      } else {
        const neg = q.type === "NAT" || q.type === "MSQ" ? 0 : q.marks === 2 ? mock.negativeMarking.mcq2 : mock.negativeMarking.mcq1;
        scored += neg; wrong += 1;
        bySubject[subj].scored += neg; bySubject[subj].wrong += 1;
      }
    }
    return { scored: Math.max(0, Math.round(scored * 100) / 100), total: mock.totalMarks, correct, wrong, skipped, bySubject };
  }, [mock, phase, answers]);

  if (phase === "loading" || !mock) {
    return (
      <div className="max-w-3xl mx-auto px-5 py-20 text-center">
        <div className="inline-block w-8 h-8 border-4 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-muted mt-3">Generating fresh mock…</p>
      </div>
    );
  }

  if (phase === "instructions") {
    return (
      <div className="max-w-3xl mx-auto px-5 py-12">
        <Link href="/mocks" className="text-xs text-muted hover:text-ink">← All mocks</Link>
        <h1 className="text-3xl font-extrabold mt-2">{mock.title}</h1>
        <p className="text-muted mt-2">{mock.description}</p>
        <div className="card p-6 mt-6">
          <h2 className="font-bold">Test pattern</h2>
          <div className="grid sm:grid-cols-3 gap-3 mt-4">
            {mock.sections.map((s) => (
              <div key={s.name} className="rounded-lg border border-line p-3">
                <div className="text-xs text-muted">{s.name}</div>
                <div className="font-bold text-lg">{s.count} Qs</div>
                <div className="text-xs">{s.marks} marks</div>
              </div>
            ))}
          </div>
          <div className="grid sm:grid-cols-3 gap-3 mt-4 text-sm">
            <div><b>Duration</b>: {mock.durationMin} min</div>
            <div><b>Total marks</b>: {mock.totalMarks}</div>
            <div><b>Negative</b>: −1/3 (1m), −2/3 (2m)</div>
          </div>
          <p className="text-xs text-muted mt-4">
            Seed: <code>{mock.seed}</code> — bookmark{" "}
            <Link href={`/mocks/fresh?seed=${mock.seed}`} className="underline">this URL</Link>{" "}
            to replay the exact same questions.
          </p>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={() => setPhase("running")} className="btn btn-primary">Start test</button>
          <button onClick={() => location.reload()} className="btn btn-ghost">Regenerate fresh</button>
        </div>
      </div>
    );
  }

  if (phase === "submitted" && result) {
    const pct = mock.totalMarks ? Math.round((result.scored / mock.totalMarks) * 100) : 0;
    return (
      <div className="max-w-4xl mx-auto px-5 py-12">
        <h1 className="text-3xl font-extrabold">Result · {mock.title}</h1>
        <div className="grid sm:grid-cols-4 gap-4 mt-6">
          <Stat label="Score" value={`${result.scored} / ${mock.totalMarks}`} />
          <Stat label="Accuracy" value={`${pct}%`} tone={pct >= 60 ? "ok" : pct >= 40 ? "warn" : "bad"} />
          <Stat label="Correct" value={result.correct} />
          <Stat label="Wrong" value={result.wrong} />
        </div>

        <h2 className="font-bold mt-8 mb-3">Subject breakdown</h2>
        <div className="space-y-2">
          {Object.entries(result.bySubject).map(([subj, s]) => {
            const p = s.total ? Math.round((s.scored / s.total) * 100) : 0;
            return (
              <div key={subj}>
                <div className="flex justify-between text-sm">
                  <span>{subj}</span>
                  <span><b>{Math.round(s.scored * 100) / 100}</b> / {s.total} · {p}% · ✓{s.correct} ✗{s.wrong}</span>
                </div>
                <div className="h-2 bg-canvas rounded-full overflow-hidden">
                  <div className="h-full" style={{ width: `${Math.max(2, p)}%`, background: p >= 60 ? "var(--ok)" : p >= 40 ? "var(--accent)" : "var(--bad)" }} />
                </div>
              </div>
            );
          })}
        </div>

        <h2 className="font-bold mt-8 mb-3">Solutions</h2>
        <div className="space-y-4">
          {mock.questions.map((q, i) => {
            const a = answers[q.id];
            const attempted = !(a === undefined || a === "" || (Array.isArray(a) && a.length === 0));
            const ok = attempted ? checkAnswer(q, a) : null;
            return (
              <div key={q.id} className={cn(
                "card p-4",
                ok === true && "border-ok",
                ok === false && "border-bad",
              )}>
                <div className="text-xs text-muted">Q{i + 1} · {q.section} · {q.marks}m · {q.subject} · {q.topic} · <span className="capitalize">{q.difficulty}</span></div>
                <MathText className="text-sm mt-2 leading-relaxed">{q.stem}</MathText>
                {q.figure && <QuestionFigure figure={q.figure} />}
                {q.options && (
                  <ul className="mt-2 text-sm space-y-1">
                    {q.options.map((opt, j) => {
                      const correctSet = Array.isArray(q.answer) ? q.answer : [q.answer];
                      const isRight = correctSet.includes(j);
                      const picked = Array.isArray(a) ? a.includes(j) : a === j;
                      return (
                        <li key={j} className={cn(
                          "px-2 py-1 rounded",
                          isRight && "bg-emerald-50",
                          !isRight && picked && "bg-rose-50",
                        )}>
                          {String.fromCharCode(65 + j)}. {opt}
                          {isRight && " ✓"}
                          {!isRight && picked && " ✗ (your answer)"}
                        </li>
                      );
                    })}
                  </ul>
                )}
                {q.type === "NAT" && (
                  <p className="text-sm mt-2">
                    Your answer: <b>{attempted ? String(a) : "—"}</b> · Correct: <b>{q.answer as number}</b>
                  </p>
                )}
                <div className="mt-3 rounded-lg bg-canvas p-3 text-sm">
                  <p className="font-semibold text-brand text-xs uppercase tracking-wide">Solution</p>
                  <MathText className="mt-1.5 leading-relaxed cg-solution">{q.solution}</MathText>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-8">
          <Link href="/mocks/fresh" className="btn btn-primary">Generate another fresh mock</Link>
          <Link href="/dashboard" className="btn btn-ghost">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  // RUNNING
  const q = mock.questions[idx];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const answered = Object.keys(answers).filter((k) => {
    const v = answers[k];
    return !(v === undefined || v === "" || (Array.isArray(v) && v.length === 0));
  }).length;

  return (
    <div className="max-w-5xl mx-auto px-5 py-6">
      {/* Top bar */}
      <div className="sticky top-16 bg-bg/95 backdrop-blur z-10 -mx-5 px-5 py-3 border-b border-line flex justify-between items-center text-sm">
        <div className="min-w-0 truncate mr-2"><b>{mock.title}</b> · {q.section}</div>
        <div className="flex gap-2 sm:gap-4 items-center shrink-0">
          <span className="hidden sm:inline"><b>{answered}</b>/{mock.totalQuestions} answered · {seenIds.size - answered} skipped</span>
          <span className="sm:hidden text-xs"><b>{answered}</b>/{mock.totalQuestions}</span>
          <span className={cn("font-mono font-bold", secondsLeft < 300 && "text-bad")}>
            {String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
          </span>
          <button onClick={() => setPhase("submitted")} className="btn btn-accent text-[11px] sm:text-xs px-2.5 sm:px-3 py-1.5">Submit</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr,260px] gap-6 mt-4 pb-20 lg:pb-0">
        <div className="card p-4 sm:p-6">
          <div className="text-xs text-muted">Question {idx + 1} of {mock.totalQuestions} · {q.marks} mark{q.marks > 1 ? "s" : ""} · {q.type}</div>
          <p className="text-base mt-3">{q.stem}</p>

          <div className="mt-5">
            {q.type === "NAT" ? (
              <input
                type="number"
                step="any"
                value={(answers[q.id] as string | number | undefined) ?? ""}
                onChange={(e) => setAnswers((a) => ({ ...a, [q.id]: e.target.value === "" ? "" : parseFloat(e.target.value) }))}
                className="input font-mono max-w-full sm:max-w-xs"
                placeholder="Numerical answer"
              />
            ) : q.type === "MSQ" ? (
              <ChoiceList options={q.options ?? []} multi
                value={Array.isArray(answers[q.id]) ? (answers[q.id] as number[]) : []}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))}
              />
            ) : (
              <ChoiceList options={q.options ?? []} multi={false}
                value={typeof answers[q.id] === "number" ? (answers[q.id] as number) : undefined}
                onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v as number }))}
              />
            )}
          </div>

          <div className="mt-6 flex gap-3 flex-wrap">
            <button onClick={() => setIdx(Math.max(0, idx - 1))} disabled={idx === 0} className="btn btn-ghost min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">← Previous</button>
            <button onClick={() => setAnswers((a) => { const c = { ...a }; delete c[q.id]; return c; })} className="btn btn-ghost min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">Clear</button>
            <button onClick={() => setIdx(Math.min(mock.totalQuestions - 1, idx + 1))} disabled={idx === mock.totalQuestions - 1} className="btn btn-primary min-h-[48px] sm:min-h-0 active:scale-[0.97] transition-transform">Next →</button>
          </div>
        </div>

        {/* Palette — desktop */}
        <aside className="hidden lg:block card p-4 h-fit sticky top-32">
          <div className="text-sm font-bold mb-2">Question palette</div>
          <div className="grid grid-cols-6 gap-1">
            {mock.questions.map((qq, i) => {
              const a = answers[qq.id];
              const isAnswered = !(a === undefined || a === "" || (Array.isArray(a) && a.length === 0));
              const isSeen = seenIds.has(qq.id);
              return (
                <button
                  key={qq.id}
                  onClick={() => setIdx(i)}
                  className={cn(
                    "min-h-[36px] min-w-[36px] text-xs rounded font-semibold border transition active:scale-90",
                    i === idx && "ring-2 ring-brand",
                    isAnswered ? "bg-emerald-100 border-emerald-300 text-emerald-900" :
                      isSeen ? "bg-amber-50 border-amber-200 text-amber-900" :
                      "bg-surface border-line text-muted",
                  )}
                >{i + 1}</button>
              );
            })}
          </div>
          <div className="mt-3 text-xs space-y-1">
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm" /> answered</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-50 border border-amber-200 rounded-sm" /> seen, skipped</div>
            <div className="flex items-center gap-2"><span className="w-3 h-3 bg-surface border border-line rounded-sm" /> not visited</div>
          </div>
        </aside>
      </div>

      {/* ---------- Mobile bottom action bar ---------- */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-line px-3 py-2 grid grid-cols-2 gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <button
          onClick={() => setPaletteOpen(true)}
          className="btn btn-ghost border border-line h-12 justify-center font-semibold"
        >
          🗂 Palette ({idx + 1}/{mock.totalQuestions})
        </button>
        <button
          onClick={() => setPhase("submitted")}
          className="btn btn-accent h-12 justify-center font-semibold"
        >
          Submit
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
            <div className="text-sm font-bold mb-2">Question palette</div>
            <div className="grid grid-cols-5 gap-1.5">
              {mock.questions.map((qq, i) => {
                const a = answers[qq.id];
                const isAnswered = !(a === undefined || a === "" || (Array.isArray(a) && a.length === 0));
                const isSeen = seenIds.has(qq.id);
                return (
                  <button
                    key={qq.id}
                    onClick={() => { setIdx(i); setPaletteOpen(false); }}
                    className={cn(
                      "min-h-[44px] min-w-[44px] text-xs font-semibold rounded border transition active:scale-90",
                      i === idx && "ring-2 ring-brand",
                      isAnswered ? "bg-emerald-100 border-emerald-300 text-emerald-900" :
                        isSeen ? "bg-amber-50 border-amber-200 text-amber-900" :
                        "bg-surface border-line text-muted",
                    )}
                  >{i + 1}</button>
                );
              })}
            </div>
            <div className="mt-3 text-xs space-y-1">
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-emerald-100 border border-emerald-300 rounded-sm" /> answered</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-amber-50 border border-amber-200 rounded-sm" /> seen, skipped</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 bg-surface border border-line rounded-sm" /> not visited</div>
            </div>
          </div>
        </div>
      </div>

      <OfflineToast />
    </div>
  );
}

function ChoiceList({ options, multi, value, onChange }: {
  options: string[]; multi: boolean;
  value: number | number[] | undefined;
  onChange: (v: number | number[]) => void;
}) {
  return (
    <div className="space-y-2">
      {options.map((opt, i) => {
        const sel = multi ? (Array.isArray(value) && value.includes(i)) : value === i;
        return (
          <label key={i} className={cn(
            "flex items-start gap-3 rounded-lg border p-3 min-h-[48px] cursor-pointer transition active:bg-brand/[0.06] active:scale-[0.99]",
            sel ? "border-brand bg-brand/5" : "border-line hover:bg-canvas",
          )}>
            <input type={multi ? "checkbox" : "radio"} checked={!!sel}
              onChange={() => {
                if (!multi) return onChange(i);
                const cur = Array.isArray(value) ? [...value] : [];
                const ix = cur.indexOf(i);
                if (ix >= 0) cur.splice(ix, 1); else cur.push(i);
                onChange(cur);
              }}
              className="mt-0.5 min-w-5 min-h-5"
            />
            <span className="font-bold w-5 shrink-0">{String.fromCharCode(65 + i)}.</span>
            <span className="text-sm flex-1">{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone?: "ok" | "warn" | "bad" }) {
  const c = tone === "ok" ? "text-ok" : tone === "warn" ? "text-accent" : tone === "bad" ? "text-bad" : "";
  return (
    <div className="card p-4">
      <div className="text-xs text-muted">{label}</div>
      <div className={cn("text-2xl font-extrabold mt-1", c)}>{value}</div>
    </div>
  );
}

function checkAnswer(q: Q, a: number | number[] | string): boolean {
  if (q.type === "NAT") {
    const n = typeof a === "number" ? a : parseFloat(String(a));
    if (!Number.isFinite(n)) return false;
    return Math.abs(n - (q.answer as number)) <= (q.tolerance ?? 0);
  }
  if (q.type === "MSQ") {
    const picked = Array.isArray(a) ? [...a].sort() : [];
    const correct = [...(q.answer as number[])].sort();
    return picked.length === correct.length && picked.every((v, i) => v === correct[i]);
  }
  return a === q.answer;
}
