/** GET /api/mocks/fresh — generate a fresh GATE-style mock from the practice bank.
 *
 *  Premium-only. Returns ~65 questions following GATE MN structure:
 *    - 10 General Aptitude (mixed difficulty)
 *    - 25 one-mark questions (technical, mixed difficulty)
 *    - 30 two-mark questions (technical, weighted to medium/hard)
 *
 *  Each call returns a NEW shuffle (deterministic per ?seed= for share/replay).
 */
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { PRACTICE, type PracticeQuestion } from "@/data/practice";
import { getPostHogClient } from "@/lib/posthog";

export const runtime = "nodejs";

// Tiny seedable RNG (mulberry32) for replayable mocks
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pick(pool: PracticeQuestion[], n: number, rand: () => number): PracticeQuestion[] {
  return shuffle(pool, rand).slice(0, n);
}

export async function GET(req: Request) {
  try {
    const session = await auth();
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  if (plan !== "premium") {
    return NextResponse.json(
      { error: "premium_only", message: "Fresh Mock is a Premium-only feature." },
      { status: 402 },
    );
  }

  const url = new URL(req.url);
  const seedParam = url.searchParams.get("seed");
  const seed = seedParam ? parseInt(seedParam, 10) || Date.now() : Date.now();
  const rand = rng(seed);

  // Section A: General Aptitude — 10 Qs
  const ga = PRACTICE.find((s) => s.slug === "general-aptitude");
  const gaQs = ga ? pick(ga.questions, 10, rand) : [];

  // Pool: all technical subjects except GA
  const technical = PRACTICE.filter((s) => s.slug !== "general-aptitude").flatMap((s) => s.questions);

  // Section B: 25 one-mark Qs — mostly easy + medium
  const oneMarkPool = technical.filter((q) => q.difficulty === "easy" || q.difficulty === "medium");
  const oneMark = pick(oneMarkPool, 25, rand).map((q) => ({ ...q, marks: 1 as const }));

  // Section C: 30 two-mark Qs — medium + hard, with negative marking
  const twoMarkPool = technical.filter((q) => q.difficulty === "medium" || q.difficulty === "hard");
  const twoMark = pick(twoMarkPool, 30, rand).map((q) => ({ ...q, marks: 2 as const }));

  const questions = [
    ...gaQs.map((q) => ({ ...q, marks: 1 as const, section: "General Aptitude" as const })),
    ...oneMark.map((q) => ({ ...q, section: "Technical (1-mark)" as const })),
    ...twoMark.map((q) => ({ ...q, section: "Technical (2-mark)" as const })),
  ];

  const totalMarks = questions.reduce((s, q) => s + q.marks, 0);

  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (userId) {
    getPostHogClient()?.capture({
      distinctId: userId,
      event: "fresh_mock_generated",
      properties: {
        seed,
        total_questions: questions.length,
        total_marks: totalMarks,
        ga_count: gaQs.length,
        one_mark_count: oneMark.length,
        two_mark_count: twoMark.length,
      },
    });
  }

  return NextResponse.json({
    id: `fresh-${seed}`,
    seed,
    title: `Fresh Mock #${String(seed).slice(-6)}`,
    description: "GATE-pattern mock generated from your 906-question practice bank.",
    durationMin: 180,
    sections: [
      { name: "General Aptitude", count: gaQs.length, marks: gaQs.length },
      { name: "Technical (1-mark)", count: oneMark.length, marks: oneMark.length },
      { name: "Technical (2-mark)", count: twoMark.length, marks: twoMark.length * 2 },
    ],
    totalQuestions: questions.length,
    totalMarks,
    negativeMarking: { mcq1: -1 / 3, mcq2: -2 / 3, nat: 0, msq: 0 },
    questions,
  });
  } catch (error) {
    console.error("GET /api/mocks/fresh:", error);
    if (error instanceof Error) {
      getPostHogClient()?.captureException(error);
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
