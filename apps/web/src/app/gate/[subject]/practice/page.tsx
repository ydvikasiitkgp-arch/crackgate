import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject } from "@/data/gate/registry";
import { auth } from "@/lib/auth";
import { hasEntitlement } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) return { title: "Practice", description: "Topic-wise practice questions for GATE exams with instant grading and worked solutions." };
  return {
    alternates: { canonical: "/gate/" + subject + "/practice" },
    title: `Practice — GATE ${meta.code}`,
    description: `Topic-wise practice questions for GATE ${meta.code} — ${meta.label}. Instant grading, worked solutions, and performance tracking across all subjects.`,
  };
}

export default async function SubjectPracticeIndex(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) notFound();

  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const unlocked = isAdmin || (uid ? await hasEntitlement(uid, meta.accessExam, meta.accessSubject) : false);

  // General Aptitude is shared across all subjects and lives in its own legacy
  // track — keep the per-subject practice page focused on technical subjects.
  const subjects = meta.practice.filter((s) => s.slug !== "general-aptitude");
  const payHref = `/pay/upi?plan=pro&exam=${meta.accessExam}&subject=${meta.accessSubject}`;
  const totalQs = subjects.reduce((n, s) => n + s.questions.length, 0);
  const totalLabel = totalQs.toLocaleString("en-IN");

  return (
    <div className="max-w-7xl mx-auto px-5 py-12">
      <header className="text-center mb-10">
        <Link href={`/gate/${subject}`} className="text-sm text-muted hover:text-ink">← {meta.label} home</Link>
        <h1 className="text-3xl lg:text-4xl font-extrabold mt-4">Subject-wise Practice</h1>
        <p className="text-muted mt-3 max-w-2xl mx-auto">
          {totalLabel} questions across {subjects.length} {meta.code} subjects · easy / medium / hard difficulty · solutions revealed after each answer.
        </p>
        <p className="text-xs text-muted mt-2">
          Aligned with the official GATE {meta.code} 2027 syllabus and authored from the standard
          textbooks (Punmia, C.S. Reddy, Duggal, Gopal Ranjan, Subramanya, S.K. Garg, S.K. Khanna).
        </p>
        {!unlocked && (
          <div className="mt-5 inline-block bg-amber-50 border border-amber-200 text-amber-900 rounded-lg px-4 py-2 text-sm">
            🔒 Subject-wise practice is a <b>premium</b> feature. <Link href={payHref} className="underline font-semibold">Unlock all {totalLabel} {meta.code} questions</Link>.
          </div>
        )}
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map((s) => {
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
              {unlocked ? (
                <Link href={`/gate/${subject}/practice/${s.slug}`} className="btn btn-primary w-full mt-5">
                  Practice →
                </Link>
              ) : (
                <Link href={payHref} className="btn btn-ghost border border-line w-full mt-5">
                  🔒 Unlock {meta.code}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
