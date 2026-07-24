import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { fmtDate } from "@/lib/utils";
import { SubjectMasteryPanel } from "@/components/subject-mastery-panel";
import dynamicImport from "next/dynamic";

const ScoreTrendChart = dynamicImport(() => import("@/components/score-trend-chart").then((m) => m.ScoreTrendChart));
import { PercentilePanel } from "@/components/percentile-panel";
import { SwotAnalysisPanel } from "@/components/swot-analysis-panel";
import { EngagementStats } from "@/components/engagement-stats";
import { TimePerformanceChart } from "@/components/time-performance-chart";
import { DailyTargetRing } from "@/components/daily-target-ring";
import { Sparkline } from "@/components/sparkline";
import { RankLine } from "@/components/rank-line";
import { TodayFocusCard } from "@/components/today-focus";
import { WeekStatus } from "@/components/week-status";
import { DashboardTabs, type DashboardTab } from "@/components/dashboard-tabs";
import { SubjectChipGrid } from "@/components/subject-chip-grid";
import { MistakesVault } from "@/components/mistakes-vault";
import { AttemptDetailModal, type AttemptRow } from "@/components/attempt-detail-modal";
import { AttemptRowOpener } from "@/components/attempt-row-opener";
import { MOCKS } from "@/data/mocks";
import {
  buildSyllabusMap,
  nextBestActions,
  miniSwot,
  trendDelta,
  daysUntilGate,
  predictAir,
  weekActivity,
  whyTodaysFocus,
  nextScheduledMock,
  type SubjectMastery,
} from "@/lib/dashboard-data";
import { getUserEntitlements } from "@/lib/entitlements";
import { resolveDashboardTracks, pickActiveTrack } from "@/lib/dashboard-tracks";
import { TrackSwitcher } from "@/components/track-switcher";
import { ChooseExam } from "@/components/choose-exam";
import { CilDashboard, type CilAttempt } from "@/components/cil-dashboard";
import { CivilDashboard, type CivilAttempt } from "@/components/civil-dashboard";
import { CourseHub, type CourseStats } from "@/components/course-hub";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const userId = session.user.id;
  const isAdmin = session.user.role === "admin";
  const sp = await searchParams;

  // Scope the dashboard to the user's owned track(s). No track → neutral chooser.
  const entitlements = await getUserEntitlements(userId);
  const tracks = resolveDashboardTracks(entitlements, isAdmin);
  if (tracks.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-5 py-12">
        <ChooseExam firstName={session.user.name?.split(" ")[0] ?? "Aspirant"} />
      </div>
    );
  }
  const activeTrack = pickActiveTrack(tracks, sp.track)!;

  const since90 = new Date(Date.now() - 90 * 86_400_000);
  const since30 = new Date(Date.now() - 30 * 86_400_000);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [allAttempts, activityCount, latest, practiceToday, practiceBySubject, weekEvents] = await Promise.all([
    db.attempt.findMany({
      where: { userId },
      orderBy: { takenAt: "desc" },
      take: 50,
    }),
    db.activity.count({ where: { userId } }),
    db.user.findUnique({ where: { id: userId } }),
    db.activity.count({
      where: { userId, type: "practice_attempt", ts: { gte: startOfToday } },
    }),
    db.activity.findMany({
      where: { userId, type: "practice_attempt", ts: { gte: since90 } },
      select: { payload: true, ts: true },
    }),
    db.activity.findMany({
      where: { userId, ts: { gte: since30 } },
      select: { ts: true },
    }),
  ]);

  // ── Per-track stats for the CourseHub ──────────────────────────────
  const courseStats = computeCourseStats(allAttempts);

  // ── CIL (PSU) track — dedicated view, return early. ─────────────────
  if (activeTrack.kind === "cil") {
    const cilAttempts: CilAttempt[] = allAttempts
      .filter((a) => a.refId.startsWith(`cil-${activeTrack.subject}-`))
      .map((a) => ({
        id: a.id,
        refId: a.refId,
        refTitle: a.refTitle,
        score: a.score,
        total: a.total,
        takenAt: a.takenAt,
        breakdown: (a.breakdown as Record<string, { scored: number; total: number }>) ?? {},
      }));
    return (
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">
        <CourseHub tracks={tracks} activeKey={activeTrack.key} stats={courseStats} firstName={latest?.name?.split(" ")[0] ?? "Aspirant"} />
        <TrackSwitcher tracks={tracks} activeKey={activeTrack.key} />
        <CilDashboard track={activeTrack} attempts={cilAttempts} />
      </div>
    );
  }

  // ── GATE Civil (CE) track — dedicated view, return early. ───────────
  if (activeTrack.kind === "civil") {
    const ceAttempts: CivilAttempt[] = allAttempts
      .filter((a) => a.refId.startsWith("ce-mock-"))
      .map((a) => ({
        id: a.id,
        refId: a.refId,
        refTitle: a.refTitle,
        score: a.score,
        total: a.total,
        takenAt: a.takenAt,
        breakdown: (a.breakdown as Record<string, { scored: number; total: number }>) ?? {},
      }));
    return (
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">
        <CourseHub tracks={tracks} activeKey={activeTrack.key} stats={courseStats} firstName={latest?.name?.split(" ")[0] ?? "Aspirant"} />
        <TrackSwitcher tracks={tracks} activeKey={activeTrack.key} />
        <CivilDashboard track={activeTrack} attempts={ceAttempts} />
      </div>
    );
  }

  // ── Owned but no content yet (e.g. GATE Civil) — minimal placeholder. ─
  if (activeTrack.kind === "soon") {
    return (
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">
        <CourseHub tracks={tracks} activeKey={activeTrack.key} stats={courseStats} firstName={latest?.name?.split(" ")[0] ?? "Aspirant"} />
        <TrackSwitcher tracks={tracks} activeKey={activeTrack.key} />
        <div className="card p-10 text-center">
          <div className="text-3xl">🚧</div>
          <h1 className="text-xl font-extrabold mt-3">{activeTrack.label}</h1>
          <p className="text-sm text-muted mt-2 max-w-md mx-auto">
            Your access is active — full mocks, practice and analytics for this track are on the way.
          </p>
        </div>
      </div>
    );
  }

  // ── GATE Mining track (default) — rich dashboard below. ─────────────
  // Scope analytics to GATE content only (exclude any CIL attempts).
  const attempts = allAttempts.filter((a) => !a.refId.startsWith("cil-"));

  // ---------- Aggregations ----------
  const totalAttempts = attempts.length;
  const avgScore = totalAttempts
    ? Math.round(attempts.reduce((s, a) => s + (a.score / a.total) * 100, 0) / totalAttempts)
    : 0;
  const bestScore = totalAttempts
    ? Math.round(Math.max(...attempts.map((a) => (a.score / a.total) * 100)))
    : 0;

  const subjMap: Record<string, { scored: number; total: number }> = {};
  for (const a of attempts) {
    const b = (a.breakdown as Record<string, { scored: number; total: number }>) ?? {};
    for (const [k, v] of Object.entries(b)) {
      subjMap[k] ??= { scored: 0, total: 0 };
      subjMap[k].scored += v.scored;
      subjMap[k].total += v.total;
    }
  }

  const practiceCounts: Record<string, number> = {};
  let questionsToday = practiceToday;
  for (const row of practiceBySubject) {
    const p = (row.payload as { subject?: string } | null) ?? {};
    const slug = (p.subject ?? "").toString().toLowerCase().replace(/\s+/g, "-");
    if (slug) practiceCounts[slug] = (practiceCounts[slug] ?? 0) + 1;
  }
  for (const a of attempts) {
    if (a.takenAt >= startOfToday) questionsToday += a.total;
  }

  const syllabus = buildSyllabusMap(subjMap, practiceCounts);

  const attemptedMockIds = new Set(attempts.filter((a) => a.kind === "mock").map((a) => a.refId));
  const actions = nextBestActions(attemptedMockIds, syllabus);
  const swot = miniSwot(syllabus);
  const delta = trendDelta(attempts.map((a) => ({ takenAt: a.takenAt, score: a.score, total: a.total })));

  const trendPoints = [...attempts]
    .reverse()
    .slice(-12)
    .map((a) => (a.total ? Math.round((a.score / a.total) * 100) : 0));

  const firstName = latest?.name?.split(" ")[0] ?? "Aspirant";
  const gateDays = daysUntilGate();

  // ---------- Phase A derivations ----------
  const prediction = predictAir(
    attempts.map((a) => ({ takenAt: a.takenAt, score: a.score, total: a.total, kind: a.kind })),
  );
  const week = weekActivity(weekEvents);
  const streak = computeStreak(weekEvents.map((e) => e.ts));
  const focus = whyTodaysFocus(syllabus);
  const followUps = buildFollowUps(actions, attemptedMockIds, focus.subjectSlug);
  const upcomingMock = nextScheduledMock(
    attemptedMockIds,
    MOCKS.map((m) => ({ id: (m as { id: string }).id, title: (m as { title: string }).title })),
  );
  const revisionQueueCount = estimateRevisionQueue(syllabus);

  // ---------- Tab bodies ----------
  const planTab = (
    <PlanTab
      firstName={firstName}
      questionsToday={questionsToday}
      syllabus={syllabus}
      swot={swot}
      delta={delta}
      trendPoints={trendPoints}
    />
  );

  const performanceTab = (
    <div className="space-y-8">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Attempts" value={totalAttempts} />
        <StatCard label="Avg Score" value={`${avgScore}%`} />
        <StatCard label="Best Score" value={`${bestScore}%`} />
        <StatCard label="Activity events" value={activityCount} />
      </div>

      <div className="card p-6">
        <div className="flex justify-between items-end flex-wrap gap-2">
          <div>
            <h2 className="font-bold text-lg">Score trend</h2>
            <p className="text-sm text-muted">Mock accuracy over time, with running average.</p>
          </div>
          <span className="text-xs text-muted">Last {Math.min(attempts.length, 50)} attempts</span>
        </div>
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

      <PercentilePanel />
      <TimePerformanceChart />
    </div>
  );

  const masteryTab = (
    <div className="space-y-8">
      <SubjectChipGrid syllabus={syllabus} />
      <SubjectMasteryPanel />
      <SwotAnalysisPanel />
    </div>
  );

  // Serialise attempts for the client modal (Date -> ISO, Json -> typed record)
  const attemptRows: AttemptRow[] = attempts.slice(0, 20).map((a) => ({
    id: a.id,
    kind: a.kind as "mock" | "pyq",
    refId: a.refId,
    refTitle: a.refTitle,
    score: a.score,
    total: a.total,
    correct: a.correct,
    wrong: a.wrong,
    skipped: a.skipped,
    durationSec: a.durationSec,
    takenAt: a.takenAt.toISOString(),
    breakdown: (a.breakdown as Record<string, { scored: number; total: number }>) ?? {},
  }));

  const mocksTab = (
    <div className="space-y-8">
      <div className="card p-6">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-extrabold">Recent attempts</h2>
            <p className="text-sm text-muted">Click any row for the full breakdown.</p>
          </div>
          {upcomingMock && (
            <Link href={`/mocks/${upcomingMock.id}`} className="btn btn-primary btn-sm">
              Take {upcomingMock.title.replace(/—.*$/, "").trim()}
            </Link>
          )}
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-muted text-left border-b border-line">
              <tr>
                <th className="py-2">Paper</th>
                <th className="py-2">Type</th>
                <th className="py-2">Score</th>
                <th className="py-2">Accuracy</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {attemptRows.map((a) => {
                const pct = a.total ? Math.round((a.score / a.total) * 100) : 0;
                return (
                  <AttemptRowOpener key={a.id} id={a.id}>
                    <td className="py-2.5 font-medium">{a.refTitle}</td>
                    <td className="py-2.5"><span className="badge">{a.kind.toUpperCase()}</span></td>
                    <td className="py-2.5 tabular-nums">{a.score} / {a.total}</td>
                    <td className="py-2.5 tabular-nums">
                      <span className={pct >= 60 ? "text-ok" : pct >= 40 ? "text-accent" : "text-bad"}>{pct}%</span>
                    </td>
                    <td className="py-2.5 text-muted">{fmtDate(new Date(a.takenAt))}</td>
                  </AttemptRowOpener>
                );
              })}
              {attemptRows.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-sm text-muted">No attempts yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AttemptDetailModal attempts={attemptRows} />
    </div>
  );

  const mistakesTab = <MistakesVault />;

  const calendarTab = (
    <div className="space-y-8">
      <EngagementStats />
      <div className="card p-6 text-center">
        <div className="text-sm font-bold text-muted uppercase tracking-wider">Coming next</div>
        <h3 className="text-lg font-extrabold mt-2">14-week countdown calendar</h3>
        <p className="text-sm text-muted mt-2 max-w-md mx-auto">
          Visual week-by-week plan to GATE with subject milestones and full-syllabus checkpoints.
        </p>
      </div>
    </div>
  );

  const tabs: DashboardTab[] = [
    { key: "plan",        label: "Plan",        content: planTab },
    { key: "performance", label: "Performance", content: performanceTab },
    { key: "mastery",     label: "Mastery",     content: masteryTab },
    { key: "mistakes",    label: "Mistakes",    badge: revisionQueueCount, content: mistakesTab },
    { key: "mocks",       label: "Mocks",       content: mocksTab },
    { key: "calendar",    label: "Calendar",    content: calendarTab },
  ];

  // ---------- Render ----------
  return (
    <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">
      <CourseHub tracks={tracks} activeKey={activeTrack.key} stats={courseStats} firstName={firstName} />
      <TrackSwitcher tracks={tracks} activeKey={activeTrack.key} />

      {/* Tier 1 — Where do I stand? */}
      <RankLine
        prediction={prediction}
        daysToGate={gateDays}
        targetAir={latest?.targetRank ?? 100}
        data-track-section="dashboard:rank"
      />

      {/* Tier 2 — What do I do now?  &  How am I doing? */}
      <section className="grid lg:grid-cols-[1.55fr_1fr] gap-5" data-track-section="dashboard:focus">
        <TodayFocusCard focus={focus} followUps={followUps} />
        <WeekStatus
          week={week}
          streak={streak}
          revisionQueueCount={revisionQueueCount}
          nextMock={upcomingMock}
        />
      </section>

      {/* Tier 3 — Deeper dive */}
      <DashboardTabs tabs={tabs} />
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Plan tab — kept richer than other tabs since it's the default landing
// ────────────────────────────────────────────────────────────────────
function PlanTab({
  firstName,
  questionsToday,
  syllabus,
  swot,
  delta,
  trendPoints,
}: {
  firstName: string;
  questionsToday: number;
  syllabus: SubjectMastery[];
  swot: ReturnType<typeof miniSwot>;
  delta: ReturnType<typeof trendDelta>;
  trendPoints: number[];
}) {
  return (
    <div className="space-y-8">
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-5">
        <DailyTargetRing done={questionsToday} />
        <aside className="card p-6">
          <h3 className="text-base font-extrabold">
            Hey {firstName}, your edge
          </h3>
          {swot.strengths.length === 0 && swot.weaknesses.length === 0 ? (
            <p className="text-sm text-muted mt-3">
              Take one mock to see your strongest and weakest subjects.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <div className="text-xs uppercase tracking-wide text-ok font-semibold">Strengths</div>
                {swot.strengths.length === 0 && <div className="text-sm text-muted mt-2">—</div>}
                <ul className="mt-2 space-y-1.5 text-sm">
                  {swot.strengths.map((s) => (
                    <li key={s.name} className="flex justify-between gap-2">
                      <span className="truncate">{s.name}</span>
                      <span className="font-semibold text-ok shrink-0 tabular-nums">{s.accuracy}%</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs uppercase tracking-wide text-bad font-semibold">Focus on</div>
                {swot.weaknesses.length === 0 && <div className="text-sm text-muted mt-2">—</div>}
                <ul className="mt-2 space-y-1.5 text-sm">
                  {swot.weaknesses.map((s) => (
                    <li key={s.name} className="flex justify-between gap-2">
                      <span className="truncate">{s.name}</span>
                      <span className="font-semibold text-bad shrink-0 tabular-nums">{s.accuracy}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {delta && (
            <div className="mt-5 pt-5 border-t border-line">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wide text-muted">7-day trend</div>
                  <div className="text-2xl font-extrabold mt-0.5 tabular-nums">
                    {delta.thisWeekAvg}%
                    <span className={`text-sm font-semibold ml-2 ${delta.delta >= 0 ? "text-ok" : "text-bad"}`}>
                      {delta.delta >= 0 ? "▲" : "▼"} {Math.abs(delta.delta)} pts
                    </span>
                  </div>
                </div>
                <Sparkline values={trendPoints} />
              </div>
            </div>
          )}
        </aside>
      </section>

      <section>
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-extrabold">Syllabus snapshot</h2>
          <Link href="/dashboard?tab=mastery" className="text-xs font-semibold text-brand hover:underline">
            Open full map →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
          {syllabus.slice(0, 10).map((s) => <SyllabusTile key={s.slug} s={s} />)}
        </div>
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function computeStreak(timestamps: Date[]): number {
  if (!timestamps.length) return 0;
  const keys = new Set(
    timestamps.map((t) => {
      const d = new Date(t);
      d.setHours(0, 0, 0, 0);
      return d.toISOString().slice(0, 10);
    }),
  );
  const todayD = new Date();
  todayD.setHours(0, 0, 0, 0);
  const yesterdayD = new Date(todayD.getTime() - 86_400_000);
  const todayKey = todayD.toISOString().slice(0, 10);
  const yKey = yesterdayD.toISOString().slice(0, 10);

  let cursor: Date | null = keys.has(todayKey) ? todayD : keys.has(yKey) ? yesterdayD : null;
  let streak = 0;
  while (cursor) {
    const k = cursor.toISOString().slice(0, 10);
    if (!keys.has(k)) break;
    streak += 1;
    cursor = new Date(cursor.getTime() - 86_400_000);
  }
  return streak;
}

function estimateRevisionQueue(syllabus: SubjectMastery[]): number {
  // Estimate ≈ wrong answers in attempted subjects = attempted × (1 − accuracy/100)
  let q = 0;
  for (const s of syllabus) {
    if (s.attempted > 0) q += Math.round(s.attempted * (1 - s.accuracy / 100));
  }
  return q;
}

function buildFollowUps(
  actions: ReturnType<typeof nextBestActions>,
  attemptedMockIds: Set<string>,
  currentFocusSlug: string | null,
): { href: string; label: string; sub: string }[] {
  const out: { href: string; label: string; sub: string }[] = [];

  out.push({
    href: "/practice?mode=daily10",
    label: "Daily 10",
    sub: "Mixed quiz · ~7 min",
  });

  const mockTitle = actions.recommendedMockTitle.replace(/^Mock Test \d+\s*[—-]\s*/, "");
  out.push({
    href: `/mocks/${actions.recommendedMockId}`,
    label: attemptedMockIds.has(actions.recommendedMockId) ? "Retry recommended mock" : "Take recommended mock",
    sub: `${mockTitle} · 65 Q · 3 h`,
  });

  if (actions.weakestSubject && actions.weakestSubject.slug !== currentFocusSlug) {
    out.push({
      href: `/practice/${actions.weakestSubject.slug}`,
      label: `Drill ${actions.weakestSubject.name}`,
      sub: `${actions.weakestSubject.accuracy}% accuracy · 10 Qs`,
    });
  }

  return out.slice(0, 4);
}

// ────────── small server components ──────────

function SyllabusTile({ s }: { s: SubjectMastery }) {
  const dots = 5;
  const filled = s.attempted === 0 ? 0 : Math.max(1, Math.round((s.accuracy / 100) * dots));
  const tone =
    s.status === "strong" ? "var(--ok)" :
    s.status === "ok"     ? "var(--accent)" :
    s.status === "weak"   ? "var(--bad)" : "rgb(148,163,184)";
  return (
    <Link
      href={`/practice/${s.slug}`}
      className="rounded-xl border border-line p-3.5 hover:border-brand hover:shadow-sm transition block"
    >
      <div className="text-sm font-bold leading-tight line-clamp-2 min-h-[2.5rem]">{s.name}</div>
      <div className="flex gap-1 mt-2.5">
        {Array.from({ length: dots }).map((_, i) => (
          <span
            key={i}
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: i < filled ? tone : "rgb(226,232,240)" }}
          />
        ))}
      </div>
      <div className="text-xs text-muted mt-2 tabular-nums">
        {s.attempted === 0
          ? <span>Not started</span>
          : <span><span className="font-semibold" style={{ color: tone }}>{s.accuracy}%</span> · {s.attempted} Qs</span>}
      </div>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card p-5">
      <div className="text-3xl font-extrabold tabular-nums">{value}</div>
      <div className="text-sm text-muted mt-0.5">{label}</div>
    </div>
  );
}

// ── Per-track stats from attempts (reused by CourseHub) ────────────
const TRACK_PREFIX_MAP: Record<string, string> = {
  "cil-civil": "PSU-civil", "cil-electrical": "PSU-electrical",
  "cil-mechanical": "PSU-mechanical", "cil-system": "PSU-system",
  "cil-e-and-t": "PSU-e-and-t", "cil-geology": "PSU-geology",
  "cil-industrial-engineering": "PSU-industrial-engineering", "cil-mining": "PSU-mining",
  "ce-mock": "GATE-civil", "gg-mock": "GATE-geology", "es-mock": "GATE-environment",
  "mn-mock": "GATE-mining", "mn-pyq": "GATE-mining", "mock": "GATE-mining",
  "pyq": "GATE-mining", "diploma": "DIPLOMA-general", "state": "STATE-general",
};

function resolveTrackKey(refId: string): string | null {
  for (const [prefix, key] of Object.entries(TRACK_PREFIX_MAP)) {
    if (refId.startsWith(prefix + "-") || refId === prefix) return key;
  }
  return null;
}

function computeCourseStats(
  attempts: { refId: string; score: number; total: number; takenAt: Date }[],
): Record<string, CourseStats> {
  const since14d = new Date(Date.now() - 14 * 86_400_000);
  const map: Record<string, { attempts: number; totalScored: number; totalQ: number; lastPracticed: Date | null; daily: Record<string, number> }> = {};

  for (const a of attempts) {
    const key = resolveTrackKey(a.refId);
    if (!key) continue;
    const t = map[key] ??= { attempts: 0, totalScored: 0, totalQ: 0, lastPracticed: null, daily: {} };
    t.attempts++;
    t.totalScored += a.score;
    t.totalQ += a.total;
    if (!t.lastPracticed || a.takenAt > t.lastPracticed) t.lastPracticed = a.takenAt;
    if (a.takenAt >= since14d) {
      const day = a.takenAt.toISOString().slice(0, 10);
      t.daily[day] = (t.daily[day] ?? 0) + 1;
    }
  }

  const result: Record<string, CourseStats> = {};
  for (const [key, t] of Object.entries(map)) {
    const sparkline: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10);
      sparkline.push(t.daily[d] ?? 0);
    }
    result[key] = {
      attempts: t.attempts,
      accuracy: t.totalQ > 0 ? Math.round((t.totalScored / t.totalQ) * 100) : 0,
      lastPracticed: t.lastPracticed?.toISOString() ?? null,
      sparkline,
    };
  }
  return result;
}
