import type { CilResultData } from "@/lib/cil-analytics";

function fmtMin(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-canvas p-3">
      <div className="text-xl font-extrabold tabular-nums">{value}</div>
      <div className="text-[11px] text-muted mt-0.5">
        {label}
        {sub ? ` · ${sub}` : ""}
      </div>
    </div>
  );
}

/**
 * CIL-specific post-test analytics shown on the result page: peer comparison
 * ("better than X%"), per-section accuracy and time pacing.
 */
export function CilResultAnalytics({ data }: { data: CilResultData }) {
  const { leaderboard, sections, time } = data;

  return (
    <div className="mt-8 space-y-6 text-left">
      {/* Peer comparison */}
      <section className="bg-surface rounded-xl border border-line p-5">
        <h3 className="font-bold text-lg">Where you stand</h3>
        {leaderboard.peerCount > 1 && leaderboard.percentile != null ? (
          <div
            className={`mt-3 rounded-xl border p-5 text-center ${
              leaderboard.percentile >= 70
                ? "border-ok/30 bg-ok/5"
                : leaderboard.percentile >= 40
                  ? "border-accent/30 bg-accent/5"
                  : "border-bad/30 bg-bad/5"
            }`}
          >
            <div
              className={`text-3xl font-extrabold tabular-nums ${
                leaderboard.percentile >= 70
                  ? "text-ok"
                  : leaderboard.percentile >= 40
                    ? "text-accent"
                    : "text-bad"
              }`}
            >
              Better than {leaderboard.percentile}%
            </div>
            <div className="text-xs text-muted mt-1">
              of {leaderboard.peerCount - 1} other candidates who attempted this
              set
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted mt-2">
            You’re among the first to attempt this set — a peer comparison
            unlocks once more candidates finish.
          </p>
        )}
      </section>

      {/* Section + time analytics */}
      <section className="bg-surface rounded-xl border border-line p-5">
        <h3 className="font-bold text-lg">Section &amp; time analysis</h3>
        <div className="mt-3 space-y-2">
          {sections.map((s) => (
            <div key={s.name}>
              <div className="flex justify-between text-sm mb-1">
                <span>{s.name}</span>
                <span className="font-semibold tabular-nums">
                  {s.scored} / {s.total} · {s.pct}%
                </span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full"
                  style={{
                    width: `${Math.max(2, s.pct)}%`,
                    background: s.pct >= 70 ? "var(--ok)" : s.pct >= 40 ? "var(--accent)" : "var(--bad)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
          <Stat label="Time taken" value={fmtMin(time.spentSec)} sub={`ideal ~${fmtMin(time.idealSec)}`} />
          <Stat label="Attempted" value={`${time.attempted}`} sub="questions" />
          <Stat
            label="Avg / question"
            value={`${time.avgSecPerQ}s`}
            sub={time.spentSec <= time.idealSec ? "good pace" : "slower than ideal"}
          />
        </div>
      </section>
    </div>
  );
}
