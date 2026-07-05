import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject } from "@/data/gate/registry";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasEntitlement } from "@/lib/entitlements";
import { isUnlocked } from "@/data/aits";

export const dynamic = "force-dynamic";

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  });
}

export async function generateMetadata(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) return { title: "AITS", description: "All India Test Series with national ranking and SWOT analysis for GATE preparation." };
  return {
    alternates: { canonical: "/gate/" + subject + "/aits" },
    title: `AITS — GATE ${meta.code} 2027 | CrackGate`,
    description: `All India Test Series for GATE ${meta.code} — ${meta.label}. Scheduled mock tests with national ranking, SWOT analysis, and benchmarking against peers.`,
  };
}

export default async function SubjectAitsPage(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) notFound();

  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  // AITS is the premium tier of the subject pass.
  const isPremium = isAdmin || (uid ? await hasEntitlement(uid, meta.accessExam, meta.accessSubject, "premium") : false);

  const tests = meta.aits;
  const refIds = tests.map((a) => a.mockRefId);
  const attempts = await db.attempt.findMany({
    where: { refId: { in: refIds }, kind: "mock" },
    select: { refId: true, userId: true, score: true, total: true },
    take: 50_000,
  });
  const perRef = new Map<string, { takers: Set<string>; maxPct: number }>();
  for (const a of attempts) {
    const cur = perRef.get(a.refId) ?? { takers: new Set<string>(), maxPct: 0 };
    cur.takers.add(a.userId);
    const pct = a.total ? (a.score / a.total) * 100 : 0;
    if (pct > cur.maxPct) cur.maxPct = pct;
    perRef.set(a.refId, cur);
  }

  const now = new Date();
  const payHref = `/pay/upi?plan=premium&exam=${meta.accessExam}&subject=${meta.accessSubject}`;

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <header className="text-center mb-10">
        <Link href={`/gate/${subject}`} className="text-sm text-muted hover:text-ink">← {meta.label} home</Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold mb-3 mt-4">
          💎 PREMIUM · ALL-INDIA TEST SERIES
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold">AITS · GATE {meta.code} 2027</h1>
        <p className="text-muted mt-3 max-w-2xl mx-auto">
          {tests.length} scheduled full-length tests. Compete on the same paper, on the same day, against every
          Premium subscriber across India. Percentile rankings published 24 hours after each test closes.
        </p>
      </header>

      {!isPremium && (
        <div className="card p-6 mb-8 border-2 border-amber-400 bg-amber-50">
          <div className="font-bold text-amber-900 text-lg">💎 Premium-only test series</div>
          <p className="text-sm text-amber-900 mt-2">
            AITS is included with the <b>{meta.code} Premium</b> pass. Upgrade to compete and get All-India percentile.
          </p>
          <Link href={payHref} className="btn btn-accent mt-3 inline-block">Upgrade to Premium</Link>
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {tests.map((t) => {
          const unlocked = isUnlocked(t, now) || isAdmin;
          const stat = perRef.get(t.mockRefId) ?? { takers: new Set(), maxPct: 0 };

          return (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-bold leading-tight">{t.title}</h2>
                {unlocked
                  ? <span className="badge badge-pro text-xs">LIVE</span>
                  : <span className="badge text-xs">SCHEDULED</span>}
              </div>
              <p className="text-xs text-muted mt-2">{t.syllabus}</p>

              <dl className="text-xs mt-4 space-y-1 text-muted">
                <div className="flex justify-between"><dt>Opens</dt><dd className="text-ink font-medium">{fmt(t.scheduledAt)}</dd></div>
                <div className="flex justify-between"><dt>Duration</dt><dd className="text-ink font-medium">{t.durationMin} min</dd></div>
                {unlocked && (
                  <>
                    <div className="flex justify-between"><dt>Takers so far</dt><dd className="text-ink font-medium">{stat.takers.size}</dd></div>
                    {stat.takers.size > 0 && (
                      <div className="flex justify-between"><dt>Top score</dt><dd className="text-ok font-bold">{Math.round(stat.maxPct)}%</dd></div>
                    )}
                  </>
                )}
              </dl>

              <div className="mt-4">
                {!unlocked ? (
                  <button disabled className="btn btn-ghost w-full opacity-60 cursor-not-allowed">
                    🔒 Opens {fmt(t.scheduledAt)}
                  </button>
                ) : !isPremium ? (
                  <Link href={payHref} className="btn btn-accent w-full">💎 Upgrade to attempt</Link>
                ) : (
                  <Link href={`/mocks/${t.mockRefId}`} className="btn btn-primary w-full">Start AITS →</Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
