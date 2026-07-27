/** Shared graders for MCQ / MSQ / NAT questions. Used server-side so users
 *  can't tamper with scores via DevTools. Mirrors the grading rules from the
 *  static `pyq.html` portal: +marks for correct MCQ/MSQ/NAT, −marks/3 for
 *  wrong MCQ, 0 for skipped or wrong MSQ/NAT (GATE pattern). */

import { natMatches } from "@/lib/nat";

// ponytail: tolerate legacy letter answers ("A"-"D") in addition to numeric indices.
// Prevents silent grading failures if new questions are added with the wrong format.
const LETTER_IDX: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
function normalizeAnswer(a: unknown): number | number[] | string | null | undefined {
  if (typeof a === "string" && a.length === 1 && LETTER_IDX[a] !== undefined) return LETTER_IDX[a];
  return a as number | number[] | string | null | undefined;
}

export type Question =
  | {
      type: "MCQ";
      marks: number;
      answer: number;
      options: string[];
      subject: string;
    }
  | {
      type: "MSQ";
      marks: number;
      answer: number[];
      options: string[];
      subject: string;
    }
  | {
      type: "NAT";
      marks: number;
      answer: number;
      tolerance?: number;
      acceptedRange?: { min: number; max: number };
      subject: string;
    };

export type AnswerMap = Record<number, number | number[] | string | null | undefined>;

function isAnswered(a: AnswerMap[number]) {
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}

/** Whether a single answer is correct for a question. Shared by the grader and
 *  post-test item analytics so both apply identical MCQ/MSQ/NAT rules. */
export function isQuestionCorrect(q: Question, a: AnswerMap[number]): boolean {
  if (!isAnswered(a)) return false;
  if (q.type === "NAT") {
    const v = typeof a === "string" ? parseFloat(a) : (a as number);
    return natMatches(q, v);
  }
  if (q.type === "MSQ") {
    const exp = [...q.answer].sort();
    const got = Array.isArray(a) ? [...a].sort() : [];
    return exp.length === got.length && exp.every((v, k) => v === got[k]);
  }
  return normalizeAnswer(a) === q.answer;
}

export function grade(
  questions: Question[],
  answers: AnswerMap,
  opts: { negativeMarking?: boolean } = {},
) {
  // GATE applies −marks/3 on a wrong MCQ; CIL MT (and other PSU CBTs) have
  // no negative marking. Default true preserves the existing GATE behaviour.
  const negativeMarking = opts.negativeMarking ?? true;
  let correct = 0,
    wrong = 0,
    skipped = 0,
    scored = 0,
    total = 0;
  const perSubject: Record<string, { scored: number; total: number }> = {};

  questions.forEach((q, i) => {
    total += q.marks;
    perSubject[q.subject] ??= { scored: 0, total: 0 };
    perSubject[q.subject].total += q.marks;

    const a = answers[i];
    if (!isAnswered(a)) {
      skipped++;
      return;
    }
    let ok = false;
    if (q.type === "NAT") {
      const v = typeof a === "string" ? parseFloat(a) : (a as number);
      ok = natMatches(q, v);
    } else if (q.type === "MSQ") {
      const exp = [...q.answer].sort();
      const got = Array.isArray(a) ? [...a].sort() : [];
      ok = exp.length === got.length && exp.every((v, k) => v === got[k]);
    } else {
      ok = normalizeAnswer(a) === q.answer;
    }

    if (ok) {
      correct++;
      scored += q.marks;
      perSubject[q.subject].scored += q.marks;
    } else {
      wrong++;
      if (q.type === "MCQ" && negativeMarking) {
        scored -= q.marks / 3; // GATE negative marking
        perSubject[q.subject].scored -= q.marks / 3;
      }
    }
  });

  return {
    correct,
    wrong,
    skipped,
    scored: +scored.toFixed(2),
    total,
    breakdown: perSubject,
    accuracy: total ? Math.round((scored / total) * 100) : 0,
  };
}
