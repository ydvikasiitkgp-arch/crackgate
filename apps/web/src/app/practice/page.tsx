import Link from "next/link";
import { PRACTICE } from "@/data/practice";
import { auth } from "@/lib/auth";

export const metadata = {
  title: "Practice — Subject-wise Question Bank",
  description:
    "Topic-wise practice questions for GATE Mining Engineering. Geomechanics, mine ventilation, mineral processing, maths, and more with instant grading and worked solutions.",
  alternates: { canonical: "/practice" },
};

export default async function PracticeIndex() {
  const session = await auth();
  const plan    = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  const hasAccess = plan === "pro" || plan === "premium";
  const total   = PRACTICE.reduce((n, s) => n + s.questions.length, 0);
  const totalLabel = total.toLocaleString("en-IN");

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <header className="text-center mb-10">
        <h1 className="text-3xl lg:text-4xl font-extrabold">Subject-wise Practice</h1>
        <p className="text-muted mt-3 max-w-2xl mx-auto">
          {totalLabel} questions across {PRACTICE.length} subjects · easy / medium / hard difficulty · solutions revealed after each answer.
        </p>
        <p className="text-xs text-muted mt-2">
          Aligned with the GATE MN syllabus (which mirrors B.Tech Mining curricula at
          IIT(ISM) Dhanbad, IIT-BHU, IIT-KGP, NIT-Rourkela).
        </p>
        {!hasAccess && (
          <div className="mt-5 inline-block bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-4 py-2 text-sm">
            🔒 Practice is a <b>Pro</b> feature. <Link href="/pricing" className="underline font-semibold">Upgrade to unlock all {totalLabel} questions</Link>.
          </div>
        )}
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {PRACTICE.map((s) => {
          const e = s.questions.filter((q) => q.difficulty === "easy").length;
          const m = s.questions.filter((q) => q.difficulty === "medium").length;
          const h = s.questions.filter((q) => q.difficulty === "hard").length;
          return (
            <div key={s.slug} className="card p-6 flex flex-col">
              <h2 className="text-lg font-bold flex-1">{s.name}</h2>
              <p className="text-sm text-muted mt-2">{s.questions.length} questions</p>
              <div className="flex gap-1.5 mt-3 text-xs">
                <span className="badge bg-emerald-50 text-emerald-700">{e} easy</span>
                <span className="badge bg-amber-50 text-amber-700">{m} med</span>
                <span className="badge bg-rose-50 text-rose-700">{h} hard</span>
              </div>
              {hasAccess ? (
                <Link href={`/practice/${s.slug}`} className="btn btn-primary w-full mt-5">
                  Practice →
                </Link>
              ) : (
                <Link href="/pricing" className="btn btn-ghost border border-line w-full mt-5">
                  🔒 Unlock with Pro
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
