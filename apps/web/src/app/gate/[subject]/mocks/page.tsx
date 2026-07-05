import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject } from "@/data/gate/registry";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasEntitlement } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

type Tier = "free" | "subject" | "premium";

function tierBadge(tier: Tier) {
  if (tier === "free") return { label: "FREE", cls: "badge-pro" };
  if (tier === "subject") return { label: "SUBJECT", cls: "badge-pro" };
  return { label: "PREMIUM", cls: "badge-premium" };
}

export async function generateMetadata(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) return { title: "Mock Tests", description: "Full-length GATE mock tests with TCS iON-standard simulation. Server-side grading and SWOT analytics." };
  return {
    alternates: { canonical: "/gate/" + subject + "/mocks" },
    title: `GATE ${meta.code} Test Series 2027`,
    description: `Full-length GATE ${meta.code} mock tests with exam-pattern simulation, server-side grading, sectional analysis, and All India Rank comparison for ${meta.label}.`,
  };
}

export default async function SubjectMocksIndex(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) notFound();

  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const entitled = isAdmin || (uid ? await hasEntitlement(uid, meta.accessExam, meta.accessSubject) : false);

  const mocks = meta.mocks as ReadonlyArray<{ id: string; title: string; tier: Tier; duration?: number; questions: unknown[] }>;

  const attempts = uid
    ? await db.attempt.findMany({
        where: { userId: uid, kind: "mock", refId: { in: mocks.map((m) => m.id) } },
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

  const sorted = [...mocks].sort((a, b) => (bestByMock.has(a.id) ? 1 : 0) - (bestByMock.has(b.id) ? 1 : 0));
  const freeCount = mocks.filter((m) => m.tier === "free").length;
  const payHref = `/pay/upi?plan=premium&exam=${meta.accessExam}&subject=${meta.accessSubject}`;

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <header className="mb-10">
        <Link href={`/gate/${subject}`} className="text-sm text-muted hover:text-ink">← {meta.label} home</Link>
        <h1 className="text-3xl lg:text-4xl font-extrabold mt-4">GATE {meta.code} Test Series 2027</h1>
        <p className="text-muted mt-3 max-w-3xl">
          {mocks.length} curated full-length tests · <b>65 questions · 100 marks · 3 hours</b> · official GATE {meta.code} 2027 pattern.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-ink/80 max-w-2xl">
          <li>▸ NTA-style portal with live timer, question palette &amp; mark-for-review</li>
          <li>▸ Section A · General Aptitude (10 Q) + Section B · Technical (55 Q)</li>
          <li>▸ Auto-graded with negative marking (−⅓ for 1-mark MCQ, −⅔ for 2-mark MCQ)</li>
          <li>▸ Detailed SWOT after every attempt — weak topics, time leaks, percentile</li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/mocks/${mocks[0].id}`} className="btn btn-primary">Try Mock 1 free →</Link>
          {!entitled && <Link href={payHref} className="btn btn-ghost">Unlock the full series</Link>}
        </div>
        <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted">
          <span><b className="text-ink">{freeCount}</b> free</span>
          <span><b className="text-ink">{mocks.length - freeCount}</b> with the {meta.code} pass</span>
          {uid && <span>✓ <b className="text-ink">{bestByMock.size}</b> / {mocks.length} attempted by you</span>}
        </div>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {sorted.map((m) => {
          const unlocked = m.tier === "free" || entitled;
          const best = bestByMock.get(m.id);
          return (
            <MockCard
              key={m.id}
              id={m.id}
              title={m.title}
              tier={m.tier}
              code={meta.code}
              payHref={payHref}
              duration={m.duration ?? 180}
              qCount={m.questions.length}
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
  id, title, tier, code, payHref, duration, qCount, unlocked, best,
}: {
  id: string;
  title: string;
  tier: Tier;
  code: string;
  payHref: string;
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
      <p className="text-xs text-muted mt-2">{qCount} questions · 100 marks · {Math.round(duration / 60)} hours</p>

      <div className="mt-4 pt-4 border-t border-line text-sm flex-1">
        {!unlocked ? (
          <div className="flex items-center gap-2 text-muted">
            <span>🔒</span>
            <span>Requires the <b className="text-ink">{code} pass</b></span>
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
          <Link href={payHref} className="btn btn-accent w-full">⭐ Unlock {code}</Link>
        ) : attempted ? (
          <Link href={`/mocks/${id}`} className="btn btn-ghost w-full">Retake</Link>
        ) : (
          <Link href={`/mocks/${id}`} className="btn btn-primary w-full">Start →</Link>
        )}
      </div>
    </div>
  );
}
