import Link from "next/link";
import { fmtDate, fmtMin } from "@/lib/utils";
import type { DashboardTrack } from "@/lib/dashboard-tracks";

export type DiplomaAttempt = {
  id: string;
  refId: string;
  refTitle: string;
  score: number;
  total: number;
  takenAt: Date;
  durationSec: number;
  breakdown: Record<string, { scored: number; total: number }>;
};

/** Maps entitlement subject → refId prefix for each diploma track. */
const DIPLOMA_PREFIX_MAP: Record<string, { prefix: string; totalMocks: number; minutes: number; pattern: string; mockIds?: string[] }> = {
  "ncl-mining-sirdar": { prefix: "diploma-ncl-sirdar-mock-", totalMocks: 20, minutes: 90, pattern: "100 MCQ · 90 min · No negative marking" },
  "ncl-surveyor": { prefix: "diploma-ncl-surveyor-mock-", totalMocks: 20, minutes: 120, pattern: "100 MCQ · 120 min · No negative marking" },
  "wcl-sirdar": { prefix: "diploma-wcl-sirdar-mock-", totalMocks: 20, minutes: 120, pattern: "100 MCQ · 120 min · No negative marking" },
  "wcl-af-electrical": { prefix: "diploma-wcl-foreman-mock-", totalMocks: 20, minutes: 120, pattern: "100 MCQ · 120 min · No negative marking" },
  "coal-sirdar-overman": {
    prefix: "diploma-coal-sirdar-mock-",
    totalMocks: 2,
    minutes: 120,
    pattern: "100 MCQ · 120 min · No negative marking",
    mockIds: ["diploma-coal-sirdar-mock-01", "diploma-coal-overman-mock-01"],
  },
};

export function DiplomaDashboard({
  track,
  attempts,
}: {
  track: DashboardTrack;
  attempts: DiplomaAttempt[];
}) {
  const meta = DIPLOMA_PREFIX_MAP[track.subject];
  const prefix = meta?.prefix ?? `diploma-${track.subject}-mock-`;
  const totalMocks = meta?.totalMocks ?? 20;
  const pattern = meta?.pattern ?? "100 MCQ · 100 marks · No negative marking";

  const attemptedIds = new Set(attempts.map((a) => a.refId));
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts
    ? Math.round(attempts.reduce((s, a) => s + (a.total ? (a.score / a.total) * 100 : 0), 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts
    ? Math.round(Math.max(...attempts.map((a) => (a.total ? (a.score / a.total) * 100 : 0))))
    : 0;
  const avgSec = totalAttempts
    ? Math.round(attempts.reduce((s, a) => s + (a.durationSec ?? 0), 0) / totalAttempts)
    : 0;

  // Section accuracy aggregated across this track's attempts.
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

  // Build attempt lookup by refId (first match = most recent from query order)
  const attemptByRefId = new Map<string, DiplomaAttempt>();
  for (const a of attempts) {
    if (!attemptByRefId.has(a.refId)) attemptByRefId.set(a.refId, a);
  }

  // Build mock list
  const refIds = meta?.mockIds ?? Array.from({ length: totalMocks }, (_, i) => `${prefix}${String(i + 1).padStart(2, "0")}`);
  const mocks = refIds.map((refId, i) => {
    const no = i + 1;
    return { no, refId, attempt: attemptByRefId.get(refId) ?? null };
  });

  const nextMock = mocks.find((m) => !m.attempt);

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-brand">
              Diploma · {track.label}
            </div>
            <h1 className="text-2xl font-extrabold mt-1">{track.label}</h1>
            <p className="text-sm text-muted mt-1">{pattern}</p>
          </div>
          {nextMock && (
            <Link href={`/mocks/${nextMock.refId}`} className="btn btn-primary btn-sm">
              Take Mock {String(nextMock.no).padStart(2, "0")} →
            </Link>
          )}
        </div>
      </section>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Mocks completed" value={`${attemptedIds.size} / ${totalMocks}`} />
        <StatCard label="Avg score" value={`${avgScore}%`} />
        <StatCard label="Best score" value={`${bestScore}%`} />
        <StatCard label="Avg time" value={fmtMin(avgSec)} />
      </div>

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

      {/* Mock series grid */}
      <div className="card p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-bold text-lg">Mock series</h2>
          <span className="text-xs text-muted">{totalMocks} mocks</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-4">
          {mocks.map((m) => {
            const done = !!m.attempt;
            const pct = m.attempt?.total ? Math.round((m.attempt.score / m.attempt.total) * 100) : 0;
            return (
              <Link
                key={m.refId}
                href={done ? `/result/${m.attempt!.id}` : `/mocks/${m.refId}`}
                className={`rounded-xl border p-4 transition block ${
                  done
                    ? "border-ok/30 bg-ok/5 opacity-80 hover:opacity-100"
                    : "border-line hover:border-brand hover:shadow-pop"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-brand">
                    {String(m.no).padStart(2, "0")}
                  </span>
                  {done ? (
                    <span className="text-xs font-semibold text-ok">✓ {pct}%</span>
                  ) : (
                    <span className="text-xs text-muted">○</span>
                  )}
                </div>
                {done ? (
                  <div className="text-xs text-muted mt-2">
                    {m.attempt!.score}/{m.attempt!.total} · {fmtMin(m.attempt!.durationSec)} · {fmtDate(m.attempt!.takenAt)}
                  </div>
                ) : (
                  <div className="text-xs text-muted mt-2">Not started</div>
                )}
              </Link>
            );
          })}
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
