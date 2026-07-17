import Link from "next/link";
import dynamic from "next/dynamic";
import { fmtDate } from "@/lib/utils";
import { getGateSubject } from "@/data/gate/registry";
import type { DashboardTrack } from "@/lib/dashboard-tracks";

const ScoreTrendChart = dynamic(() => import("@/components/score-trend-chart").then((m) => m.ScoreTrendChart));

export type CivilAttempt = {
  id: string;
  refId: string;
  refTitle: string;
  score: number;
  total: number;
  takenAt: Date;
  breakdown: Record<string, { scored: number; total: number }>;
};

/**
 * GATE Civil (CE) dashboard view. Mirrors the CIL dashboard depth: track
 * branding, KPIs + score trend + section accuracy from the user's own CE mock
 * attempts, the full CE mock series, and quick links into Learn & Practice.
 */
export function CivilDashboard({
  track,
  attempts,
}: {
  track: DashboardTrack;
  attempts: CivilAttempt[];
}) {
  const meta = getGateSubject(track.subject);
  const mocks = (meta?.mocks ?? []) as ReadonlyArray<{ id: string; title: string; tier: string; questions: unknown[] }>;
  const attemptedIds = new Set(attempts.map((a) => a.refId));

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts
    ? Math.round(attempts.reduce((s, a) => s + (a.total ? (a.score / a.total) * 100 : 0), 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts
    ? Math.round(Math.max(...attempts.map((a) => (a.total ? (a.score / a.total) * 100 : 0))))
    : 0;

  // Section accuracy aggregated across this subject's attempts.
  const sectionMap: Record<string, { scored: number; total: number }> = {};
  for (const a of attempts) {
    for (const [name, v] of Object.entries(a.breakdown ?? {})) {
      sectionMap[name] ??= { scored: 0, total: 0 };
      sectionMap[name].scored += v.scored;
      sectionMap[name].total += v.total;
    }
  }
  const sections = Object.entries(sectionMap)
    .map(([name, v]) => ({ name, ...v, pct: v.total ? Math.round((v.scored / v.total) * 100) : 0 }))
    .sort((a, b) => a.pct - b.pct);

  const nextMock = mocks.find((m) => !attemptedIds.has(m.id)) ?? mocks[0];
  const code = meta?.code ?? "CE";
  const label = meta?.label ?? "Civil Engineering";

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-brand">
              GATE · Graduate Aptitude Test in Engineering
            </div>
            <h1 className="text-2xl font-extrabold mt-1">{label} ({code}) — GATE 2027</h1>
            <p className="text-sm text-muted mt-1">
              65 questions · 3 h · negative marking · {meta?.learnTopics.length ?? 0} learn modules ·{" "}
              {mocks.length} full-length mocks
            </p>
          </div>
          {nextMock && (
            <Link href={`/mocks/${nextMock.id}`} className="btn btn-primary btn-sm">
              {attemptedIds.has(nextMock.id) ? "Retake" : "Start"} next mock
            </Link>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href={`/gate/${track.subject}/learn`} className="btn btn-ghost btn-sm border border-line">📚 Learn</Link>
          <Link href={`/gate/${track.subject}/practice`} className="btn btn-ghost btn-sm border border-line">✍️ Practice</Link>
          <Link href={`/gate/${track.subject}/mocks`} className="btn btn-ghost btn-sm border border-line">🧪 Mocks</Link>
          <Link href={`/gate/${track.subject}/aits`} className="btn btn-ghost btn-sm border border-line">💎 AITS</Link>
        </div>
      </section>

      {/* KPIs */}
      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard label="Mocks attempted" value={`${attemptedIds.size} / ${mocks.length}`} />
        <StatCard label="Avg score" value={`${avgScore}%`} />
        <StatCard label="Best score" value={`${bestScore}%`} />
      </div>

      {/* Score trend */}
      {totalAttempts > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-lg">Score trend</h2>
          <p className="text-sm text-muted">Your GATE {code} mock accuracy over time.</p>
          <div className="mt-4">
            <ScoreTrendChart
              data={[...attempts].reverse().map((a) => ({
                date: fmtDate(a.takenAt),
                pct: a.total ? Math.round((a.score / a.total) * 100) : 0,
                score: a.score,
                total: a.total,
                title: a.refTitle,
              }))}
            />
          </div>
        </div>
      )}

      {/* Section accuracy */}
      {sections.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-lg">Section accuracy</h2>
          <p className="text-sm text-muted">Where you&apos;re strong and where to focus, across attempted mocks.</p>
          <div className="mt-4 space-y-3">
            {sections.map((s) => (
              <div key={s.name}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{s.name}</span>
                  <span className={`tabular-nums font-semibold ${s.pct >= 60 ? "text-ok" : s.pct >= 40 ? "text-accent" : "text-bad"}`}>
                    {s.pct}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-canvas overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.pct >= 60 ? "bg-ok" : s.pct >= 40 ? "bg-accent" : "bg-bad"}`}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mock series */}
      <div className="card p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold text-lg">{label} mock series</h2>
          <span className="text-xs text-muted">{mocks.length} mocks</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {mocks.map((m, i) => {
            const done = attemptedIds.has(m.id);
            return (
              <Link
                key={m.id}
                href={`/mocks/${m.id}`}
                className="rounded-xl border border-line p-4 hover:border-brand hover:shadow-pop transition block"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">Mock {String(i + 1).padStart(2, "0")}</span>
                  {m.tier === "free" && <span className="badge badge-pro">Free</span>}
                  {done && <span className="text-xs font-semibold text-ok">✓ done</span>}
                </div>
                <div className="text-xs text-muted mt-1 line-clamp-2">{m.title}</div>
              </Link>
            );
          })}
          {mocks.length === 0 && (
            <p className="text-sm text-muted">Mocks for this subject are coming soon.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className="text-2xl font-extrabold mt-1 tabular-nums">{value}</div>
    </div>
  );
}
