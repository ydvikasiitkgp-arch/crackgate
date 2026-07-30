import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { resolveMock } from "@/lib/mock-registry";
import { ResultReview } from "@/components/result-review";
import { CilResultAnalytics } from "@/components/cil-result-analytics";
import { buildCilResultData } from "@/lib/cil-analytics";

export const dynamic = "force-dynamic";

type Answer = number | number[] | string | null | undefined;

/** Re-load the source question bank for an attempt so we can show the answer
 *  key. Mirrors the loader in /api/attempts (refId → mock id). Covers both the
 *  GATE catalogue and the CIL MT bank via the shared resolver. */
function loadBank(kind: string, refId: string): unknown[] | null {
  if (kind === "mock") {
    return resolveMock(refId)?.questions ?? null;
  }
  return null;
}

export default async function ResultPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const session = await auth();
  if (!session?.user) return null;

  const att = await db.attempt.findUnique({ where: { id } });
  if (!att || att.userId !== session.user.id) notFound();

  const pct = att.total ? Math.round((att.score / att.total) * 100) : 0;
  const breakdown = (att.breakdown as Record<string, { scored: number; total: number }>) ?? {};
  const bank = loadBank(att.kind, att.refId);
  const answers = (att.answersJson as Record<string, Answer>) ?? {};

  // CIL MT attempts get the dedicated cut-off / leaderboard / section analytics.
  const isCil = att.kind === "mock" && att.refId.startsWith("cil-");
  const cilData = isCil && bank
    ? await buildCilResultData(att, bank as never)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">

      <div className="card p-6 sm:p-10 text-center">
        <p className="text-xs uppercase tracking-wide text-muted">{att.kind.toUpperCase()} · Result</p>
        <h1 className="text-xl sm:text-2xl font-extrabold mt-1">{att.refTitle}</h1>
        <div className="text-5xl sm:text-6xl font-extrabold text-accent mt-6">{att.score} <span className="text-2xl text-muted">/ {att.total}</span></div>
        <div className="text-lg mt-2">{pct}% accuracy</div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          <Cell label="Correct" value={att.correct} color="text-ok" bg="bg-emerald-50 dark:bg-emerald-500/15" />
          <Cell label="Wrong" value={att.wrong} color="text-bad" bg="bg-rose-50 dark:bg-rose-500/15" />
          <Cell label="Skipped" value={att.skipped} color="text-muted" bg="bg-slate-50 dark:bg-slate-700/40" />
          <Cell label="Time" value={Math.round(att.durationSec / 60) + "m"} color="text-brand" bg="bg-blue-50 dark:bg-blue-500/15" />
        </div>

        <div className="mt-8 text-left">
          <h3 className="font-bold mb-3">Subject SWOT</h3>
          <div className="space-y-2">
            {Object.entries(breakdown).map(([k, v]) => {
              const p = v.total ? Math.round((v.scored / v.total) * 100) : 0;
              return (
                <div key={k}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{k}</span><span className="font-semibold">{v.scored} / {v.total}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full" style={{
                      width: `${Math.max(2, p)}%`,
                      background: p >= 70 ? "var(--ok)" : p >= 40 ? "var(--accent)" : "var(--bad)",
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {cilData && <CilResultAnalytics data={cilData} />}

      {bank && <ResultReview questions={bank as never} answers={answers} itemStats={cilData?.itemStats ?? null} mockRefId={att.refId} />}

    </div>
  );
}

function Cell({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-xl p-3 sm:p-4`}>
      <div className={`text-xl sm:text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-muted mt-0.5">{label}</div>
    </div>
  );
}
