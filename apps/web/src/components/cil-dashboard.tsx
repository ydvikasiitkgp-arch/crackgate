import Link from "next/link";
import dynamic from "next/dynamic";
import { fmtDate, fmtMin } from "@/lib/utils";
import { CIL_MOCK_BANK } from "@/data/cil-mock-bank";
import { getCilDiscipline } from "@/data/cil";
import { CIL_PATTERN } from "@/data/cil-mocks";
import type { DashboardTrack } from "@/lib/dashboard-tracks";

const ScoreTrendChart = dynamic(() => import("@/components/score-trend-chart").then((m) => m.ScoreTrendChart));

export type CilAttempt = {
  id: string;
  refId: string;
  refTitle: string;
  score: number;
  total: number;
  takenAt: Date;
  durationSec: number;
  breakdown: Record<string, { scored: number; total: number }>;
};

/**
 * CIL (PSU · Coal India MT) dashboard view. Mirrors the depth the user asked
 * for: track-correct branding, KPIs + score trend + section accuracy from the
 * user's own mock attempts, and the discipline's full mock series. No practice
 * drills (CIL has no practice bank yet).
 */
export function CilDashboard({
  track,
  attempts,
}: {
  track: DashboardTrack;
  attempts: CilAttempt[];
}) {
  const disc = getCilDiscipline(track.subject);
  const sets = [...CIL_MOCK_BANK.values()]
    .filter((s) => s.slug === track.subject)
    .sort((a, b) => a.no - b.no);
  const attemptedIds = new Set(attempts.map((a) => a.refId));
  const attemptByRefId = new Map<string, CilAttempt>();
  for (const a of attempts) {
    if (!attemptByRefId.has(a.refId)) attemptByRefId.set(a.refId, a);
  }

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

  // Section accuracy aggregated across this discipline's attempts.
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

  const nextSet = sets.find((s) => !attemptedIds.has(s.id)) ?? sets[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-brand">
              PSU · Coal India Limited · Management Trainee
            </div>
            <h1 className="text-2xl font-extrabold mt-1">{disc?.discipline ?? track.subject} — CIL MT</h1>
            <p className="text-sm text-muted mt-1">
              {CIL_PATTERN.questions} questions · {Math.round(CIL_PATTERN.durationMin / 60)} h · no negative marking
              {disc ? ` · ${disc.seats} vacancies` : ""}
            </p>
          </div>
          {nextSet && (
            <Link href={`/mocks/${nextSet.id}`} className="btn btn-primary btn-sm">
              {attemptedIds.has(nextSet.id) ? "Retake" : "Start"} {nextSet.title.replace(/—.*$/, "").trim()}
            </Link>
          )}
        </div>
      </section>

      {/* KPIs */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Mocks attempted" value={`${attemptedIds.size} / ${sets.length}`} />
        <StatCard label="Avg score" value={`${avgScore}%`} />
        <StatCard label="Best score" value={`${bestScore}%`} />
        <StatCard label="Avg time" value={fmtMin(avgSec)} />
      </div>

      {/* Score trend */}
      {totalAttempts > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-lg">Score trend</h2>
          <p className="text-sm text-muted">Your CIL {disc?.discipline ?? ""} mock accuracy over time.</p>
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
          <p className="text-sm text-muted">Where you&apos;re strong and where to focus, across attempted sets.</p>
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
          <h2 className="font-bold text-lg">{disc?.discipline ?? track.subject} mock series</h2>
          <span className="text-xs text-muted">{sets.length} sets</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
          {sets.map((s) => {
            const attempt = attemptByRefId.get(s.id);
            const done = !!attempt;
            const pct = attempt?.total ? Math.round((attempt.score / attempt.total) * 100) : 0;
            return (
              <Link
                key={s.id}
                href={done ? `/result/${attempt!.id}` : `/mocks/${s.id}`}
                className={`rounded-xl border p-4 transition block ${
                  done
                    ? "border-ok/30 bg-ok/5 opacity-80 hover:opacity-100"
                    : "border-line hover:border-brand hover:shadow-pop"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-sm font-bold text-brand">Set {String(s.no).padStart(2, "0")}</span>
                  {s.no >= 11 && <span className="badge">Advanced</span>}
                  {done ? (
                    <span className="text-xs font-semibold text-ok">✓ {pct}%</span>
                  ) : (
                    <span className="text-xs text-muted">○</span>
                  )}
                </div>
                <div className="text-xs text-muted mt-2 line-clamp-2">{s.title}</div>
                {done ? (
                  <div className="text-xs text-muted mt-1">
                    {attempt!.score}/{attempt!.total} · {fmtMin(attempt!.durationSec)} · {fmtDate(attempt!.takenAt)}
                  </div>
                ) : (
                  <div className="text-xs text-muted mt-1">Not started</div>
                )}
              </Link>
            );
          })}
          {sets.length === 0 && (
            <p className="text-sm text-muted">Sets for this discipline are coming soon.</p>
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
