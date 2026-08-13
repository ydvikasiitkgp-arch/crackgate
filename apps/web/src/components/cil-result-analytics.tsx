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
 * CIL-specific post-test analytics shown on the result page: per-section
 * accuracy and time pacing.
 */
export function CilResultAnalytics({ data }: { data: CilResultData }) {
  const { sections, time } = data;

  return (
    <div className="mt-8 space-y-6 text-left">
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
