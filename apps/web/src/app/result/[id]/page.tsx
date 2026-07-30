import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveMock } from "@/lib/mock-registry";
import { ResultReview } from "@/components/result-review";
import { CilResultAnalytics } from "@/components/cil-result-analytics";
import { buildCilResultData } from "@/lib/cil-analytics";

export const dynamic = "force-dynamic";

function getListUrl(refId: string): string {
  if (refId.startsWith("cil-")) {
    const slug = refId.replace(/^cil-/, "").replace(/-\d+$/, "");
    return `/psu/cil/${slug}`;
  }
  if (refId.startsWith("ongc-")) {
    const slug = refId.replace(/-\d+$/, "");
    return `/psu/ongc/${slug}`;
  }
  if (refId.startsWith("diploma-wcl-sirdar-")) return "/diploma/wcl/mining-sirdar";
  if (refId.startsWith("diploma-wcl-foreman-")) return "/diploma/wcl/assistant-foreman-electrical";
  if (refId.startsWith("diploma-ncl-sirdar-")) return "/diploma/ncl/mining-sirdar";
  if (refId.startsWith("diploma-ncl-surveyor-")) return "/diploma/ncl/surveyor";
  if (refId.startsWith("state-")) return "/state";
  if (refId.startsWith("diploma-")) return "/diploma";
  return "/mocks";
}

function getNextMockId(refId: string): string | null {
  const match = refId.match(/^(.*?)(\d+)$/);
  if (!match) return null;
  const [, prefix, numStr] = match;
  const nextId = `${prefix}${String(Number(numStr) + 1).padStart(numStr.length, "0")}`;
  return resolveMock(nextId) ? nextId : null;
}

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

  // ponytail: approximation — avg marks per question, not per-question weights
  const mockInfo = resolveMock(att.refId);
  const negativeMarking = mockInfo?.negativeMarking ?? true;
  const attempted = att.correct + att.wrong;
  const marksPerQ = attempted > 0 ? att.total / attempted : 0;
  const negMarksLost = (negativeMarking && att.wrong > 0)
    ? +(att.wrong * marksPerQ / 3).toFixed(2)
    : 0;
  const attemptAccuracy = attempted > 0
    ? Math.round((att.correct / attempted) * 100)
    : 0;
  const actionItems: { type: "warn" | "good" | "info"; text: string }[] = [];
  for (const [subject, v] of Object.entries(breakdown)) {
    const p = v.total ? (v.scored / v.total) * 100 : 0;
    if (p < 40) {
      actionItems.push({ type: "warn", text: `${subject}: ${Math.round(p)}% — focus here` });
    } else if (p >= 70) {
      actionItems.push({ type: "good", text: `${subject}: strong at ${Math.round(p)}%` });
    }
  }
  if (negativeMarking && negMarksLost > 0) {
    actionItems.push({ type: "info", text: `Lost ${negMarksLost} marks to negative marking — attempt only when sure` });
  }

  const prevAtt = await db.attempt.findFirst({
    where: { userId: session.user.id, refId: att.refId, id: { not: att.id } },
    orderBy: { takenAt: "desc" },
    select: { score: true, total: true },
  });
  const prevPct = prevAtt?.total ? Math.round((prevAtt.score / prevAtt.total) * 100) : null;
  const scoreDelta = prevAtt ? att.score - prevAtt.score : null;
  const pctDelta = prevAtt && prevPct != null ? pct - prevPct : null;

  const listUrl = getListUrl(att.refId);
  const nextMockId = getNextMockId(att.refId);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-5 py-8 sm:py-12">

      <div className="card p-6 sm:p-10 text-center">
        <p className="text-xs uppercase tracking-wide text-muted">{att.kind.toUpperCase()} · Result</p>
        <h1 className="text-xl sm:text-2xl font-extrabold mt-1">{att.refTitle}</h1>
        <div className="text-5xl sm:text-6xl font-extrabold text-accent mt-6">{att.score} <span className="text-2xl text-muted">/ {att.total}</span></div>
        <div className="text-lg mt-2">{pct}% accuracy</div>

        <div className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-muted">
          <span>
            Attempt accuracy:{" "}
            <strong className={attemptAccuracy >= 70 ? "text-ok" : attemptAccuracy >= 40 ? "text-accent" : "text-bad"}>
              {attemptAccuracy}%
            </strong>
          </span>
          {negativeMarking && negMarksLost > 0 && (
            <span>
              Lost to guessing:{" "}
              <strong className="text-bad">−{negMarksLost}</strong>
            </span>
          )}
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

        {actionItems.length > 0 && (
          <div className="mt-8 text-left">
            <h3 className="font-bold mb-3">Action Items</h3>
            <div className="space-y-2">
              {actionItems.map((item) => (
                <div key={item.text} className="flex items-center gap-3 rounded-lg bg-canvas p-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    item.type === "warn"
                      ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      : item.type === "good"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                        : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                  }`}>
                    {item.type === "warn" ? "WEAK" : item.type === "good" ? "STRONG" : "TIP"}
                  </span>
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {prevAtt ? (
          <div className="mt-8 text-left">
            <h3 className="font-bold mb-3">Your Progress</h3>
            <div className="rounded-lg bg-canvas p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="text-center">
                  <p className="text-xs text-muted">Previous</p>
                  <p className="text-lg font-bold tabular-nums">{prevAtt.score} / {prevAtt.total}</p>
                  <p className="text-xs text-muted">({prevPct}%)</p>
                </div>
                <div className="text-2xl text-muted">→</div>
                <div className="text-center">
                  <p className="text-xs text-muted">This attempt</p>
                  <p className="text-lg font-bold tabular-nums">{att.score} / {att.total}</p>
                  <p className="text-xs text-muted">({pct}%)</p>
                </div>
              </div>
              {scoreDelta != null && (
                <p className={`mt-2 text-center text-sm font-semibold tabular-nums ${
                  scoreDelta > 0 ? "text-emerald-600 dark:text-emerald-400" : scoreDelta < 0 ? "text-red-600 dark:text-red-400" : "text-muted"
                }`}>
                  {scoreDelta > 0 ? "↑" : scoreDelta < 0 ? "↓" : "—"} {scoreDelta > 0 ? "+" : ""}{scoreDelta} marks{" "}
                  {pctDelta != null ? `(${pctDelta > 0 ? "+" : ""}${pctDelta}%)` : ""}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-8 text-left">
            <h3 className="font-bold mb-3">Your Progress</h3>
            <p className="rounded-lg bg-canvas p-4 text-sm text-muted">
              First attempt for this mock — take another to track improvement.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {nextMockId && (
            <Link href={`/mocks/${nextMockId}`} className="btn btn-primary">Try Next Mock →</Link>
          )}
          <Link href={listUrl} className="btn btn-ghost">View All Mocks</Link>
          <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
        </div>
      </div>

      {cilData && <CilResultAnalytics data={cilData} />}

      {bank && <ResultReview questions={bank as never} answers={answers} itemStats={cilData?.itemStats ?? null} mockRefId={att.refId} correct={att.correct} wrong={att.wrong} skipped={att.skipped} />}

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        {nextMockId && (
          <Link href={`/mocks/${nextMockId}`} className="btn btn-primary">Try Next Mock →</Link>
        )}
        <Link href={listUrl} className="btn btn-ghost">View All Mocks</Link>
        <Link href="/dashboard" className="btn btn-ghost">Dashboard</Link>
      </div>
    </div>
  );
}

