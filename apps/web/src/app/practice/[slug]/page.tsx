import Link from "next/link";
import { notFound } from "next/navigation";
import { PRACTICE } from "@/data/practice";
import { PracticeRunner } from "@/components/practice-runner";
import { auth } from "@/lib/auth";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  return { alternates: { canonical: `/practice/${slug}` } };
}

export const dynamic = "force-dynamic";

export default async function PracticeSubjectPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const s = PRACTICE.find((x) => x.slug === slug);
  if (!s) notFound();

  const session = await auth();
  const plan = (session?.user as { plan?: string } | undefined)?.plan ?? "free";
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const hasAccess = isAdmin || plan === "pro" || plan === "premium";
  if (!hasAccess) {
    return <PracticeLocked name={s.name} loggedIn={!!session?.user} />;
  }

  return <PracticeRunner slug={s.slug} name={s.name} />;
}

function PracticeLocked({ name, loggedIn }: { name: string; loggedIn: boolean }) {
  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center">
      <div className="text-5xl mb-4">🔒</div>
      <h1 className="text-2xl font-extrabold">{name} practice is a Pro feature</h1>
      <p className="text-muted mt-3">
        Subject-wise practice is available on the <b>Pro</b> and <b>Premium</b> plans.
        Upgrade once to unlock the full question bank with instant solutions through GATE 2027.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-7">
        <Link href="/pricing" className="btn btn-primary">⭐ Upgrade to unlock</Link>
        <Link href="/practice" className="btn btn-ghost border border-line">← Back to subjects</Link>
      </div>
      {!loggedIn && (
        <p className="text-xs text-muted mt-5">
          Already on Pro or Premium? <Link href={`/login?next=/practice`} className="underline">Sign in</Link>.
        </p>
      )}
    </div>
  );
}

