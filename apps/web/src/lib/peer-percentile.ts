import { db } from "@/lib/db";

export type PeerRank = { percentile: number | null; peerCount: number };

/** Per-refId peer comparison for a user: the % of peers (deduped by best score
 *  per user) that the user's own best score beats. Mirrors the result-page
 *  leaderboard logic in lib/cil-analytics.ts. */
export async function peerPercentiles(
  refIds: string[],
  userId: string,
): Promise<Map<string, PeerRank>> {
  const map = new Map<string, PeerRank>();
  const uniq = [...new Set(refIds)];
  if (uniq.length === 0) return map;

  const peers = (await db.attempt.findMany({
    where: { refId: { in: uniq } },
    select: { refId: true, userId: true, score: true },
    take: 5000,
  })) as { refId: string; userId: string; score: number }[];

  const bestByRef = new Map<string, Map<string, number>>();
  for (const p of peers) {
    let m = bestByRef.get(p.refId);
    if (!m) bestByRef.set(p.refId, (m = new Map()));
    const prev = m.get(p.userId);
    if (prev === undefined || p.score > prev) m.set(p.userId, p.score);
  }

  for (const refId of uniq) {
    const scores = bestByRef.get(refId);
    const peerCount = scores?.size ?? 0;
    const myBest = scores?.get(userId);
    if (!scores || peerCount < 2 || myBest === undefined) {
      map.set(refId, { percentile: null, peerCount });
      continue;
    }
    const below = [...scores.values()].filter((s) => s < myBest).length;
    map.set(refId, {
      peerCount,
      percentile: Math.round((below / (peerCount - 1)) * 100),
    });
  }
  return map;
}
