"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { QuestionTypeTag } from "@/components/question-extras";
import { QuestionFigure, type QuestionFigure as Figure } from "@/components/question-figure";
import { MathText } from "@/components/math-text";
import { ReportIssueModal } from "@/components/report-issue-modal";
import type { CilItemStat } from "@/lib/cil-analytics";

/* A question as stored in the mock / PYQ banks. */
type ReviewQuestion =
  | { id?: string; type: "MCQ"; marks: number; subject: string; stem: string; options: string[]; answer: number; solution?: string; figure?: Figure }
  | { id?: string; type: "MSQ"; marks: number; subject: string; stem: string; options: string[]; answer: number[]; solution?: string; figure?: Figure }
  | { id?: string; type: "NAT"; marks: number; subject: string; stem: string; answer: number; tolerance?: number; solution?: string; figure?: Figure };

type Answer = number | number[] | string | null | undefined;

// ponytail: tolerate legacy letter answers ("A"-"D") in addition to numeric indices.
const LETTER_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
function normalizeAnswer(a: Answer): Answer {
  if (typeof a === "string" && a.length === 1 && LETTER_IDX[a] !== undefined) return LETTER_IDX[a];
  return a;
}

function isAnswered(a: Answer) {
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}

function isCorrect(q: ReviewQuestion, a: Answer): boolean {
  if (!isAnswered(a)) return false;
  if (q.type === "NAT") {
    const v = typeof a === "string" ? parseFloat(a) : (a as number);
    return !Number.isNaN(v) && Math.abs(v - q.answer) <= (q.tolerance ?? 0);
  }
  if (q.type === "MSQ") {
    const exp = [...q.answer].sort();
    const got = Array.isArray(a) ? [...a].sort() : [];
    return exp.length === got.length && exp.every((v, k) => v === got[k]);
  }
  return normalizeAnswer(a) === q.answer;
}

function deltaFor(q: ReviewQuestion, a: Answer): number {
  if (!isAnswered(a)) return 0;
  if (isCorrect(q, a)) return q.marks;
  return q.type === "MCQ" ? -(q.marks / 3) : 0;
}

/**
 * Answer key shown only after a mock / PYQ attempt is submitted — never during
 * the exam. Lists every question with the candidate's response, the correct
 * answer and the full worked solution (GATE pattern).
 */
export function ResultReview({
  questions, answers, itemStats, mockRefId, correct, wrong, skipped,
}: {
  questions: ReviewQuestion[];
  answers: Record<string, Answer>;
  itemStats?: (CilItemStat | undefined)[] | null;
  mockRefId: string;
  correct: number;
  wrong: number;
  skipped: number;
}) {
  const [filter, setFilter] = useState<"all" | "correct" | "wrong" | "skipped">("all");
  const [reportKey, setReportKey] = useState<string | null>(null);
  const total = correct + wrong + skipped;

  const rows = questions.map((q, i) => {
    const a = answers[String(i)];
    const answered = isAnswered(a);
    return { q, a, i, answered, correct: answered && isCorrect(q, a), delta: deltaFor(q, a) };
  });

  const shown = rows.filter((r) =>
    filter === "all" ? true : filter === "correct" ? r.answered && r.correct : filter === "wrong" ? r.answered && !r.correct : !r.answered
  );

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <h3 className="font-bold text-lg mr-auto">Answer key &amp; solutions</h3>
        <button onClick={() => setFilter("all")} className={cn("rounded-md px-3 py-1.5 text-xs font-bold transition", filter === "all" ? "bg-brand text-white" : "bg-blue-50 dark:bg-blue-500/15 text-brand hover:bg-blue-100 dark:hover:bg-blue-500/25")}>All {total}</button>
        <button onClick={() => setFilter("correct")} className={cn("rounded-md px-3 py-1.5 text-xs font-bold transition", filter === "correct" ? "bg-emerald-600 text-white" : "bg-emerald-50 dark:bg-emerald-500/15 text-ok hover:bg-emerald-100 dark:hover:bg-emerald-500/25")}>Correct {correct}</button>
        <button onClick={() => setFilter("wrong")} className={cn("rounded-md px-3 py-1.5 text-xs font-bold transition", filter === "wrong" ? "bg-rose-600 text-white" : "bg-rose-50 dark:bg-rose-500/15 text-bad hover:bg-rose-100 dark:hover:bg-rose-500/25")}>Wrong {wrong}</button>
        <button onClick={() => setFilter("skipped")} className={cn("rounded-md px-3 py-1.5 text-xs font-bold transition", filter === "skipped" ? "bg-slate-600 text-white" : "bg-slate-50 dark:bg-slate-700/40 text-muted hover:bg-slate-100 dark:hover:bg-slate-700/60")}>Skipped {skipped}</button>
      </div>

      <div className="space-y-5">
        {shown.map(({ q, a, i, answered, correct: isCorrect, delta }) => (
          <article key={i} className="bg-surface rounded-xl border border-line p-5 text-left">
            <div className="flex items-center gap-2 flex-wrap text-sm mb-3">
              <span className="badge bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200 font-bold">Q{i + 1}</span>
              <QuestionTypeTag type={q.type} />
              <span className="badge bg-brand/10 text-brand">{q.subject}</span>
              <span className="badge font-bold">{q.marks} mark{q.marks > 1 ? "s" : ""}</span>
              {itemStats?.[i] && (
                <span
                  className={cn(
                    "badge font-semibold",
                    itemStats[i]!.pCorrect < 35
                      ? "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
                  )}
                  title={`${itemStats[i]!.attempts} attempts on this set`}
                >
                  👥 {itemStats[i]!.pCorrect}% correct{itemStats[i]!.pCorrect < 35 ? " · 🪤 trap" : ""}
                </span>
              )}
              <span className={cn(
                "ml-auto px-2 py-0.5 rounded text-xs font-bold tabular-nums",
                !answered ? "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300" : isCorrect ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-200" : "bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-200"
              )}>
                {!answered ? "Not attempted" : `${isCorrect ? "✓ Correct" : "✗ Incorrect"} · ${delta >= 0 ? "+" : ""}${delta.toFixed(2)}`}
              </span>
            </div>

            <MathText className="text-base leading-relaxed">{q.stem}</MathText>
            {q.figure && <QuestionFigure figure={q.figure} />}

            <div className="mt-4">
              {q.type === "NAT" ? (
                <div className="text-sm space-y-1">
                  <div>Your answer: <b className="font-mono">{answered ? String(a) : "—"}</b></div>
                  <div className="text-emerald-700 dark:text-emerald-300">Correct answer: <b className="font-mono">{q.answer}</b>{q.tolerance != null && <span className="text-muted"> (±{q.tolerance})</span>}</div>
                </div>
              ) : (
                <div className="space-y-2">
                  {q.options.map((opt, oi) => {
                    const right = q.type === "MSQ" ? q.answer.includes(oi) : q.answer === oi;
                    const picked = q.type === "MSQ"
                      ? Array.isArray(a) && a.includes(oi)
                      : normalizeAnswer(a) === oi;
                    const wrongPick = picked && !right;
                    return (
                      <div
                        key={oi}
                        className={cn(
                          "flex items-start gap-3 rounded-lg border p-3 text-sm",
                          right && "border-ok bg-emerald-50 dark:bg-emerald-500/15",
                          wrongPick && "border-bad bg-rose-50 dark:bg-rose-500/15",
                          !right && !wrongPick && "border-line",
                        )}
                      >
                        <span className="font-bold w-5">{String.fromCharCode(65 + oi)}.</span>
                        <MathText className="flex-1">{opt}</MathText>
                        {right && <span className="text-ok font-bold">✓</span>}
                        {wrongPick && <span className="text-bad font-bold">your pick ✗</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {q.solution && (
              <div className="mt-4 rounded-lg bg-canvas p-4 text-sm">
                <p className="font-semibold text-brand">Solution</p>
                <MathText className="mt-1.5 leading-relaxed cg-solution">{q.solution}</MathText>
              </div>
            )}

            <button
              onClick={() => setReportKey(q.id ?? String(i))}
              className="mt-3 text-xs text-muted hover:text-brand transition"
            >
              🚩 Report issue
            </button>
          </article>
        ))}
        {shown.length === 0 && (
          <p className="text-sm text-muted text-center py-6">Nothing to show for this filter. 🎉</p>
        )}
      </div>

      <ReportIssueModal
        open={reportKey !== null}
        onClose={() => setReportKey(null)}
        questionKey={reportKey ?? ""}
        mockRefId={mockRefId}
      />
    </div>
  );
}
