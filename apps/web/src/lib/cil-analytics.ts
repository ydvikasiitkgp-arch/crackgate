// Server-side post-test analytics for CIL Management Trainee mock attempts.
// Computes a peer leaderboard (rank / percentile / top / average), per-section
// accuracy, time-vs-ideal pacing, and a per-question item analysis
// (percent-correct + discrimination index) from the pool of all attempts on the
// same set. Pure data — rendered by <CilResultAnalytics/>.

import { db } from "@/lib/db";
import { isQuestionCorrect, type Question, type AnswerMap } from "@/lib/grading";

/** Resolved CIL questions carry section/estSec/difficulty at runtime (from the
 *  JSON bank) even though the shared {@link Question} type omits them. */
type DiffQuestion = Question & {
  section?: string;
  estSec?: number;
  difficulty?: "easy" | "medium" | "hard";
};

export type CilLeaderboard = {
  peerCount: number;
  percentile: number | null;
};

export type CilItemStat = {
  /** % of attempts that answered this question correctly. */
  pCorrect: number;
  attempts: number;
  /** Top-27% minus bottom-27% correctness (item discrimination), or null. */
  discrimination: number | null;
};

export type CilResultData = {
  score: number;
  total: number;
  pct: number;
  durationSec: number;
  leaderboard: CilLeaderboard;
  sections: { name: string; scored: number; total: number; pct: number }[];
  time: { spentSec: number; idealSec: number; attempted: number; avgSecPerQ: number };
  itemStats: CilItemStat[] | null;
};

const EST_FALLBACK: Record<string, number> = { easy: 40, medium: 70, hard: 110 };

/** Minimum distinct attempts before per-question item analysis is meaningful. */
const MIN_ITEM_SAMPLE = 12;

type AttemptRow = {
  id: string;
  userId: string;
  refId: string;
  score: number;
  total: number;
  durationSec: number;
  breakdown: unknown;
  answersJson: unknown;
};

function answeredAt(answers: Record<string, unknown>, i: number): boolean {
  const a = answers[String(i)];
  if (a === undefined || a === null || a === "") return false;
  if (Array.isArray(a) && a.length === 0) return false;
  return true;
}

export async function buildCilResultData(
  att: AttemptRow,
  questions: DiffQuestion[],
): Promise<CilResultData> {
  const score = att.score;
  const total = att.total;
  const pct = total ? Math.round((score / total) * 100) : 0;

  // ---- Section accuracy from the stored per-subject breakdown ----
  const breakdown = (att.breakdown as Record<string, { scored: number; total: number }>) ?? {};
  const secMap = new Map<string, { scored: number; total: number }>();
  for (const [subject, v] of Object.entries(breakdown)) {
    const sec = subject.split("·")[0].trim() || subject; // "Paper-I" / "Paper-II"
    const cur = secMap.get(sec) ?? { scored: 0, total: 0 };
    cur.scored += v.scored;
    cur.total += v.total;
    secMap.set(sec, cur);
  }
  const sections = [...secMap.entries()].map(([name, v]) => ({
    name,
    scored: +v.scored.toFixed(2),
    total: v.total,
    pct: v.total ? Math.round((v.scored / v.total) * 100) : 0,
  }));

  // ---- Time taken vs ideal pacing ----
  const myAnswers = (att.answersJson as Record<string, unknown>) ?? {};
  let attempted = 0;
  let idealSec = 0;
  questions.forEach((q, i) => {
    if (answeredAt(myAnswers, i)) attempted++;
    idealSec += q.estSec ?? EST_FALLBACK[q.difficulty ?? "medium"] ?? 70;
  });
  const time = {
    spentSec: att.durationSec,
    idealSec,
    attempted,
    avgSecPerQ: attempted ? Math.round(att.durationSec / attempted) : 0,
  };

  // ---- Peer pool for this set (leaderboard + item analysis) ----
  const peers = (await db.attempt.findMany({
    where: { refId: att.refId },
    select: { userId: true, score: true, answersJson: true },
    take: 5000,
  })) as { userId: string; score: number; answersJson: unknown }[];

  const bestByUser = new Map<string, number>();
  for (const p of peers) {
    const prev = bestByUser.get(p.userId);
    if (prev === undefined || p.score > prev) bestByUser.set(p.userId, p.score);
  }
  const peerScores = [...bestByUser.values()];
  const peerCount = peerScores.length;
  const myBest = bestByUser.get(att.userId) ?? score;
  const below = peerScores.filter((s) => s < myBest).length;
  const leaderboard: CilLeaderboard = {
    peerCount,
    percentile: peerCount > 1 ? Math.round((below / (peerCount - 1)) * 100) : null,
  };

  // ---- Per-question item analysis (only with a usable sample) ----
  let itemStats: CilItemStat[] | null = null;
  if (peers.length >= MIN_ITEM_SAMPLE) {
    const n = questions.length;
    const correctAll = new Array<number>(n).fill(0);
    const ranked = [...peers].sort((a, b) => b.score - a.score);
    const groupSize = Math.max(1, Math.floor(ranked.length * 0.27));
    const topGroup = ranked.slice(0, groupSize);
    const bottomGroup = ranked.slice(ranked.length - groupSize);
    const topCorrect = new Array<number>(n).fill(0);
    const botCorrect = new Array<number>(n).fill(0);

    const tally = (ansJson: unknown, acc: number[]) => {
      const ans = (ansJson as Record<string, unknown>) ?? {};
      questions.forEach((q, i) => {
        if (isQuestionCorrect(q, ans[String(i)] as AnswerMap[number])) acc[i]++;
      });
    };
    for (const p of peers) tally(p.answersJson, correctAll);
    for (const p of topGroup) tally(p.answersJson, topCorrect);
    for (const p of bottomGroup) tally(p.answersJson, botCorrect);

    itemStats = questions.map((_, i) => ({
      pCorrect: Math.round((correctAll[i] / peers.length) * 100),
      attempts: peers.length,
      discrimination: +(topCorrect[i] / groupSize - botCorrect[i] / groupSize).toFixed(2),
    }));
  }

  return {
    score,
    total,
    pct,
    durationSec: att.durationSec,
    leaderboard,
    sections,
    time,
    itemStats,
  };
}
