import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export type TrackStats = {
  attempts: number;
  accuracy: number;
  lastPracticed: string | null;
  sparkline: number[];
};

const TRACK_PREFIXES: Record<string, { exam: string; subject: string }> = {
  "cil-civil":       { exam: "PSU", subject: "civil" },
  "cil-electrical":  { exam: "PSU", subject: "electrical" },
  "cil-mechanical":  { exam: "PSU", subject: "mechanical" },
  "cil-system":      { exam: "PSU", subject: "system" },
  "cil-e-and-t":     { exam: "PSU", subject: "e-and-t" },
  "cil-geology":     { exam: "PSU", subject: "geology" },
  "cil-industrial-engineering": { exam: "PSU", subject: "industrial-engineering" },
  "cil-mining":      { exam: "PSU", subject: "mining" },
  "ce-mock":         { exam: "GATE", subject: "civil" },
  "gg-mock":         { exam: "GATE", subject: "geology" },
  "es-mock":         { exam: "GATE", subject: "environment" },
  "mn-mock":         { exam: "GATE", subject: "mining" },
  "mn-pyq":          { exam: "GATE", subject: "mining" },
  "mock":            { exam: "GATE", subject: "mining" },
  "pyq":             { exam: "GATE", subject: "mining" },
  "diploma":         { exam: "DIPLOMA", subject: "general" },
  "state":           { exam: "STATE", subject: "general" },
};

function trackKeyForRefId(refId: string): string | null {
  for (const [prefix, { exam, subject }] of Object.entries(TRACK_PREFIXES)) {
    if (refId.startsWith(prefix + "-") || refId === prefix) {
      return `${exam}-${subject}`;
    }
  }
  return null;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }

    const userId = session.user.id;
    const since14d = new Date(Date.now() - 14 * 86_400_000);

    const attempts = await db.attempt.findMany({
      where: { userId },
      orderBy: { takenAt: "desc" },
      select: { refId: true, score: true, total: true, takenAt: true },
    });

    const tracks: Record<string, { attempts: number; totalScored: number; totalQ: number; lastPracticed: Date | null; daily: Record<string, number> }> = {};

    for (const a of attempts) {
      const key = trackKeyForRefId(a.refId);
      if (!key) continue;
      const t = tracks[key] ??= { attempts: 0, totalScored: 0, totalQ: 0, lastPracticed: null, daily: {} };
      t.attempts++;
      t.totalScored += a.score;
      t.totalQ += a.total;
      if (!t.lastPracticed || a.takenAt > t.lastPracticed) t.lastPracticed = a.takenAt;
      if (a.takenAt >= since14d) {
        const day = a.takenAt.toISOString().slice(0, 10);
        t.daily[day] = (t.daily[day] ?? 0) + 1;
      }
    }

    const result: Record<string, TrackStats> = {};
    for (const [key, t] of Object.entries(tracks)) {
      const sparkline: number[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
        sparkline.push(t.daily[d] ?? 0);
      }
      result[key] = {
        attempts: t.attempts,
        accuracy: t.totalQ > 0 ? Math.round((t.totalScored / t.totalQ) * 100) : 0,
        lastPracticed: t.lastPracticed?.toISOString() ?? null,
        sparkline,
      };
    }

    return NextResponse.json({ tracks: result }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("GET /api/user/stats:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
