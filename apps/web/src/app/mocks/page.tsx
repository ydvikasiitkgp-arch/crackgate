import Link from "next/link";
import { MOCKS } from "@/data/mocks";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export const metadata = {
  title: "Mock Test Series",
  description:
    "Full-length GATE Mining Engineering mock tests with TCS iON-standard exam simulation. Server-side grading, sectional analysis, SWOT insights, and All India Rank comparison.",
};
export const dynamic = "force-dynamic";

type Plan = "free" | "pro" | "premium";
type Tier = "free" | "subject" | "premium";

function canAccess(tier: Tier, plan: Plan): boolean {
  if (tier === "free") return true;
  // Mocks are a Premium-only feature. Pro gets practice + the free Mock 1 only.
  return plan === "premium";
}

function tierBadge(tier: Tier) {
  if (tier === "free") return { label: "FREE", cls: "badge-pro" };
  return { label: "PREMIUM", cls: "badge-premium" };
}

export default async function MocksIndex() {
  const session = await auth();
  const userId = session?.user?.id;
  const plan = ((session?.user as { plan?: Plan } | undefined)?.plan) ?? "free";
  // Founders (admins) bypass every mock plan gate.
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const attempts = userId
    ? await db.attempt.findMany({
        where: { userId, kind: "mock" },
        select: { refId: true, score: true, total: true, takenAt: true },
        orderBy: { takenAt: "desc" },
      })
    : [];

  const bestByMock = new Map<string, { score: number; total: number; takenAt: Date; attempts: number }>();
  for (const a of attempts) {
    const existing = bestByMock.get(a.refId);
    if (!existing) {
      bestByMock.set(a.refId, { score: a.score, total: a.total, takenAt: a.takenAt, attempts: 1 });
    } else {
      existing.attempts += 1;
      if (a.score > existing.score) {
        existing.score = a.score;
        existing.total = a.total;
        existing.takenAt = a.takenAt;
      }
    }
  }

  // Not-attempted first, then attempted
  const sorted = [...MOCKS].sort((a, b) => {
    const ax = bestByMock.has(a.id) ? 1 : 0;
    const bx = bestByMock.has(b.id) ? 1 : 0;
    return ax - bx;
  });

  const totalMocks = MOCKS.length;
  const freeCount = MOCKS.filter((m) => (m as { tier: string }).tier === "free").length;
  const subjectCount = MOCKS.filter((m) => (m as { tier: string }).tier === "subject").length;
  const premiumCount = MOCKS.filter((m) => (m as { tier: string }).tier === "premium").length;

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      {/* HERO */}
      <header className="mb-10">
        <h1 className="text-3xl lg:text-4xl font-extrabold">GATE MN Test Series 2027</h1>
        <p className="text-muted mt-3 max-w-3xl">
          {totalMocks} curated full-length tests · <b>65 questions · 100 marks · 3 hours</b> · official GATE MN 2027 pattern.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-ink/80 max-w-2xl">
          <li>▸ NTA-style portal with live timer, question palette &amp; mark-for-review</li>
          <li>▸ Section A · General Aptitude (10 Q) + Section B · Technical (55 Q)</li>
          <li>▸ Auto-graded with negative marking (−⅓ for 1-mark MCQ, −⅔ for 2-mark MCQ)</li>
          <li>▸ Detailed SWOT after every attempt — weak topics, time leaks, percentile</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/mocks/${MOCKS[0].id}`} className="btn btn-primary">Try Mock 1 free →</Link>
          {plan === "free" && (
            <Link href="/pricing" className="btn btn-ghost">See plans &amp; pricing</Link>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
          <span><b className="text-ink">{freeCount}</b> free</span>
          <span><b className="text-ink">{subjectCount}</b> subject tests · Premium</span>
          <span><b className="text-ink">{premiumCount}</b> full-syllabus · Premium</span>
          {userId && (
            <span>✓ <b className="text-ink">{bestByMock.size}</b> / {totalMocks} attempted by you</span>
          )}
        </div>
      </header>

      {/* MOCK GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((m) => {
          const mm = m as { id: string; title: string; tier: Tier; duration?: number; questions: unknown[] };
          const unlocked = canAccess(mm.tier, plan) || isAdmin;
          const best = bestByMock.get(mm.id);
          return (
            <MockCard
              key={mm.id}
              id={mm.id}
              title={mm.title}
              tier={mm.tier}
              duration={mm.duration ?? 180}
              qCount={mm.questions.length}
              unlocked={unlocked}
              best={best}
            />
          );
        })}
      </div>
    </div>
  );
}

function MockCard({
  id, title, tier, duration, qCount, unlocked, best,
}: {
  id: string;
  title: string;
  tier: Tier;
  duration: number;
  qCount: number;
  unlocked: boolean;
  best?: { score: number; total: number; takenAt: Date; attempts: number };
}) {
  const badge = tierBadge(tier);
  const attempted = !!best;

  return (
    <div className={`card p-6 flex flex-col ${!unlocked ? "opacity-75" : ""}`}>
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-bold leading-snug">{title}</h3>
        <span className={`badge ${badge.cls} shrink-0`}>{badge.label}</span>
      </div>
      <p className="text-xs text-muted mt-2">
        {qCount} questions · 100 marks · {Math.round(duration / 60)} hours
      </p>

      <div className="mt-4 pt-4 border-t border-line text-sm flex-1">
        {!unlocked ? (
          <div className="flex items-center gap-2 text-muted">
            <span>🔒</span>
            <span>
              Requires <b className="text-ink">{tier === "premium" ? "Premium" : "Pro"}</b> plan
            </span>
          </div>
        ) : attempted ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-ok">✓</span>
              <span>
                Best: <b className="text-ink">{best!.score.toFixed(1)} / {best!.total}</b>
                <span className="text-muted"> · {((best!.score / best!.total) * 100).toFixed(0)}%</span>
              </span>
            </div>
            <div className="text-xs text-muted">
              {best!.attempts} attempt{best!.attempts > 1 ? "s" : ""} · last on {best!.takenAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-muted">
            <span>○</span>
            <span>Not attempted yet</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        {!unlocked ? (
          <Link href="/pricing" className="btn btn-ghost w-full">Upgrade to unlock</Link>
        ) : attempted ? (
          <Link href={`/mocks/${id}`} className="btn btn-ghost w-full">Retake</Link>
        ) : (
          <Link href={`/mocks/${id}`} className="btn btn-primary w-full">Start →</Link>
        )}
      </div>
    </div>
  );
}
