import Link from "next/link";
import { auth } from "@/lib/auth";
import { getLearnSyllabus, type LearnTier } from "@/data/learn";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Learn & Solve — GATE MN Syllabus, Section by Section",
  description:
    "Master the GATE Mining (MN) syllabus the way it is officially structured — six sections, each broken into sub-topics with an IIT-style breakdown, formula matrix, traps, and a progressive 3-tier question suite with worked solutions.",
  alternates: { canonical: "/learn" },
};

type Plan = "free" | "pro" | "premium";

// Learn & Solve is free for everyone — no plan gating.
function canAccess(_tier: LearnTier, _plan: Plan, _isAdmin: boolean): boolean {
  return true;
}

function tierBadge(_tier: LearnTier) {
  return { label: "FREE", cls: "badge-free" };
}

export default async function LearnIndex() {
  const session = await auth();
  const plan = ((session?.user as { plan?: Plan } | undefined)?.plan) ?? "free";
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  const syllabus = getLearnSyllabus();
  const totalLive = syllabus.reduce((n, s) => n + s.liveCount, 0);

  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold mb-3">
          📚 LEARN &amp; SOLVE ENGINE
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold">The GATE MN Syllabus, Section by Section</h1>
        <p className="text-muted mt-3 max-w-3xl">
          Organised exactly like the official syllabus — six sections, each split into its sub-topics.
          Every live sub-topic opens an <b>IIT-style module</b>: the core principle, a complete{" "}
          <b>formula matrix</b>, the common <b>traps</b>, and a progressive <b>3-tier question suite</b>{" "}
          (basic → medium → hard) with worked solutions revealed on submit.
        </p>
        <p className="text-xs text-muted mt-3">
          {totalLive} sub-topic{totalLive === 1 ? "" : "s"} live · more added every week across all six sections.
        </p>
      </header>

      <Link
        href="/learn/insights"
        className="group flex items-center justify-between gap-4 card p-5 mb-10 hover:border-brand hover:shadow-sm transition"
      >
        <div className="flex items-start gap-4">
          <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-brand/10 text-xl">📊</div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold group-hover:text-brand">Exam Insights — Topic &amp; Trend Analysis</h2>
              <span className="badge badge-pro">NEW</span>
            </div>
            <p className="text-sm text-muted mt-0.5">
              See exactly what GATE MN has asked across 15 papers — topic distribution, year trends,
              question formats, conceptual gaps and a personalised prep plan.
            </p>
          </div>
        </div>
        <span className="text-brand text-xl shrink-0 group-hover:translate-x-0.5 transition">→</span>
      </Link>

      <div className="space-y-10">
        {syllabus.map((sec) => (
          <section key={sec.id} className="card p-6">
            <div className="flex items-start gap-4">
              <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-brand/10 text-brand font-extrabold text-lg">
                {sec.id}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-extrabold">{sec.title}</h2>
                  <span className="text-[11px] text-muted">
                    {sec.liveCount}/{sec.subtopics.length} live
                  </span>
                </div>
                <p className="text-sm text-muted mt-0.5">{sec.summary}</p>
              </div>
            </div>

            <ul className="mt-5 grid sm:grid-cols-2 gap-2.5">
              {sec.subtopics.map((st) => {
                const topic = st.topic;
                if (!topic) {
                  return (
                    <li
                      key={st.title}
                      className="flex items-center justify-between gap-2 rounded-lg border border-line bg-canvas/40 px-3 py-2.5"
                    >
                      <span className="text-sm text-muted">{st.title}</span>
                      <span className="text-[10px] uppercase tracking-wide text-muted/70 shrink-0">
                        Coming soon
                      </span>
                    </li>
                  );
                }
                const unlocked = canAccess(topic.tier, plan, isAdmin);
                const badge = tierBadge(topic.tier);
                const href = unlocked ? `/learn/${topic.slug}` : "/pricing";
                return (
                  <li key={st.title}>
                    <Link
                      href={href}
                      className="group flex items-center justify-between gap-2 rounded-lg border border-line bg-surface px-3 py-2.5 hover:border-brand hover:shadow-sm transition"
                    >
                      <span className="min-w-0">
                        <span className="text-sm font-medium group-hover:text-brand">
                          {unlocked ? "" : "🔒 "}
                          {st.title}
                          <span className="text-[11px] text-muted font-normal ml-1.5">
                            · {topic.questions.length} Q
                          </span>
                        </span>
                        {st.highlight && (
                          <span className="block text-[11px] text-muted mt-0.5 truncate">
                            {st.highlight}
                          </span>
                        )}
                      </span>
                      <span className={`badge ${badge.cls} shrink-0`}>{badge.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
