import Link from "next/link";
import type { DashboardTrack } from "@/lib/dashboard-tracks";
import { Sparkline } from "@/components/sparkline";

export type CourseStats = {
  attempts: number;
  accuracy: number;
  lastPracticed: string | null;
  sparkline: number[];
};

const TRACK_ACCENTS: Record<string, { border: string; gradient: string; badge: string }> = {
  mining:              { border: "border-l-indigo-500", gradient: "from-indigo-500/5",   badge: "bg-indigo-500/15 text-indigo-300" },
  civil:               { border: "border-l-sky-500",    gradient: "from-sky-500/5",      badge: "bg-sky-500/15 text-sky-300" },
  geology:             { border: "border-l-cyan-500",   gradient: "from-cyan-500/5",     badge: "bg-cyan-500/15 text-cyan-300" },
  environment:         { border: "border-l-emerald-500",gradient: "from-emerald-500/5",  badge: "bg-emerald-500/15 text-emerald-300" },
  electrical:          { border: "border-l-amber-500",  gradient: "from-amber-500/5",    badge: "bg-amber-500/15 text-amber-300" },
  mechanical:          { border: "border-l-orange-500", gradient: "from-orange-500/5",   badge: "bg-orange-500/15 text-orange-300" },
  system:              { border: "border-l-purple-500", gradient: "from-purple-500/5",   badge: "bg-purple-500/15 text-purple-300" },
  "e-and-t":           { border: "border-l-pink-500",   gradient: "from-pink-500/5",     badge: "bg-pink-500/15 text-pink-300" },
  geomatics:           { border: "border-l-teal-500",   gradient: "from-teal-500/5",     badge: "bg-teal-500/15 text-teal-300" },
  "ncl-mining-sirdar": { border: "border-l-indigo-500", gradient: "from-indigo-500/5",   badge: "bg-indigo-500/15 text-indigo-300" },
  "ncl-surveyor":      { border: "border-l-cyan-500",   gradient: "from-cyan-500/5",     badge: "bg-cyan-500/15 text-cyan-300" },
  "wcl-sirdar":        { border: "border-l-sky-500",    gradient: "from-sky-500/5",      badge: "bg-sky-500/15 text-sky-300" },
  "wcl-af-electrical": { border: "border-l-amber-500",  gradient: "from-amber-500/5",    badge: "bg-amber-500/15 text-amber-300" },
  "coal-sirdar-overman":{ border: "border-l-orange-500", gradient: "from-orange-500/5",  badge: "bg-orange-500/15 text-orange-300" },
};

function trackStyle(subject: string) {
  return TRACK_ACCENTS[subject] ?? { border: "border-l-indigo-500", gradient: "from-indigo-500/5", badge: "bg-indigo-500/15 text-indigo-300" };
}

function examLabel(exam: string): string {
  if (exam === "GATE") return "GATE";
  if (exam === "PSU") return "PSU";
  if (exam === "DIPLOMA") return "Diploma";
  return "State";
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function CourseHub({
  tracks,
  activeKey,
  stats,
  firstName,
}: {
  tracks: DashboardTrack[];
  activeKey: string;
  stats: Record<string, CourseStats>;
  firstName: string;
}) {
  return (
    <section className="space-y-4">
      {/* ── Header ── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight">
            {tracks.length === 1
              ? `Welcome back, ${firstName}`
              : `Your courses, ${firstName}`}
          </h2>
          <p className="text-sm text-muted mt-0.5">
            {tracks.length === 1
              ? "Pick up where you left off."
              : `${tracks.length} courses · Select one to dive in.`}
          </p>
        </div>
      </div>

      {/* ── Course cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tracks.map((t, i) => {
          const s = stats[t.key];
          const active = t.key === activeKey;
          const style = trackStyle(t.subject);
          return (
            <Link
              key={t.key}
              href={`/dashboard?track=${t.key}`}
              className={`group relative rounded-xl border-l-4 p-5 transition-all duration-200 animate-in fade-in ${
                active
                  ? `border border-brand/30 bg-gradient-to-br ${style.gradient} to-transparent shadow-sm`
                  : "border border-line hover:border-brand/30 hover:shadow-sm hover:-translate-y-0.5"
              } ${style.border}`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {/* Active indicator */}
              {active && tracks.length > 1 && (
                <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-brand animate-pulse" />
              )}

              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`badge text-[10px] font-bold uppercase ${style.badge}`}>
                      {examLabel(t.exam)}
                    </span>
                  </div>
                  <h3 className="text-sm font-extrabold mt-2 leading-tight line-clamp-2">
                    {t.label}
                  </h3>
                </div>
              </div>

              {/* Stats row */}
              {s ? (
                <div className="mt-4 space-y-3">
                  <div className="flex items-end justify-between gap-3">
                    <div className="space-y-1">
                      <div className="text-2xl font-extrabold tabular-nums leading-none">
                        {s.accuracy}
                        <span className="text-sm font-semibold text-muted">%</span>
                      </div>
                      <div className="text-[11px] text-muted">
                        {s.attempts} attempt{s.attempts !== 1 ? "s" : ""} · {relativeTime(s.lastPracticed)}
                      </div>
                    </div>
                    {s.sparkline.some((v) => v > 0) && (
                      <div className="shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Sparkline values={s.sparkline} width={80} height={28} stroke="var(--brand)" />
                      </div>
                    )}
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-line overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand transition-all duration-500"
                      style={{ width: `${Math.max(s.accuracy, 2)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-muted">No attempts yet</div>
              )}

              {/* Action button */}
              <div className="mt-4">
                <span className="flex items-center justify-center gap-2 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white group-hover:bg-brand/90 transition">
                  {s ? "Continue" : "Start"}
                  <span aria-hidden>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
