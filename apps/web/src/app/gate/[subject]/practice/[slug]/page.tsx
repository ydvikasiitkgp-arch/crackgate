import Link from "next/link";
import { notFound } from "next/navigation";
import { getGateSubject } from "@/data/gate/registry";
import { PracticeRunner } from "@/components/practice-runner";
import { auth } from "@/lib/auth";
import { hasEntitlement } from "@/lib/entitlements";

export const dynamic = "force-dynamic";


export async function generateMetadata(props: { params: Promise<{ subject: string; slug: string }> }) {
  const { subject, slug } = await props.params;
  return { alternates: { canonical: `/gate/${subject}/practice/${slug}` } };
}

export default async function SubjectPracticeRunnerPage(
  props: { params: Promise<{ subject: string; slug: string }> },
) {
  const { subject, slug } = await props.params;
  const meta = getGateSubject(subject);
  if (!meta) notFound();
  const s = meta.practice.find((x) => x.slug === slug);
  if (!s) notFound();

  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const unlocked = isAdmin || (uid ? await hasEntitlement(uid, meta.accessExam, meta.accessSubject) : false);

  if (!unlocked) {
    return <PracticeLocked subject={subject} exam={meta.accessExam} accessSubject={meta.accessSubject} code={meta.code} label={meta.label} name={s.name} loggedIn={!!session?.user} />;
  }

  return <PracticeRunner slug={s.slug} name={s.name} />;
}

function PracticeLocked({
  subject, exam, accessSubject, code, label, name, loggedIn,
}: { subject: string; exam: string; accessSubject: string; code: string; label: string; name: string; loggedIn: boolean }) {
  const payHref = `/pay/upi?plan=pro&exam=${exam}&subject=${accessSubject}`;
  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-2xl font-extrabold">{name} practice needs the {code} pass</h1>
      <p className="text-muted mt-3">
        Subject-wise practice is part of the <b>GATE {label}</b> pass. Unlock once to get the full
        question bank with instant solutions through GATE 2027.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
        <Link href={payHref} className="btn btn-primary">⭐ Unlock {code}</Link>
        <Link href={`/gate/${subject}/practice`} className="btn btn-ghost border border-line">← Back to subjects</Link>
      </div>
      {!loggedIn && (
        <p className="text-xs text-muted mt-5">
          Already unlocked {code}? <Link href={`/login?next=/gate/${subject}/practice`} className="underline">Sign in</Link>.
        </p>
      )}
    </div>
  );
}
