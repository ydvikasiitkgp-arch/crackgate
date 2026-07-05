import { notFound, redirect } from "next/navigation";
import { ExamPortal } from "@/components/exam-portal";
import { auth } from "@/lib/auth";
import { resolveMock } from "@/lib/mock-registry";
import { hasEntitlement } from "@/lib/entitlements";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  return { alternates: { canonical: `/mocks/${id}` } };
}

type Plan = "free" | "pro" | "premium";
type Tier = "free" | "subject" | "premium";

function canAccessPlan(tier: Tier, plan: Plan): boolean {
  if (tier === "free") return true;
  // GATE mocks are a Premium-only feature. Pro gets practice + the free Mock 1.
  return plan === "premium";
}

export default async function MockPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const m = resolveMock(id);
  if (!m) notFound();

  // Server-side access gate: don't let a user spend an hour on a locked mock
  // just to be 402'd at submission. Middleware already enforces auth.
  const session = await auth();
  const uid = (session?.user as { id?: string } | undefined)?.id ?? "";
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";

  if (!isAdmin) {
    if (m.gate.type === "plan") {
      const plan = ((session?.user as { plan?: Plan } | undefined)?.plan) ?? "free";
      if (!canAccessPlan(m.gate.tier, plan)) {
        redirect(`/pricing?gated=${m.id}&requires=premium`);
      }
    } else {
      // Free-trial mocks (e.g. the first CE mock) are open to any signed-in user.
      const freeTrial = m.gate.exam === "GATE" && m.gate.freeTrial === true;
      const ok = freeTrial || (await hasEntitlement(uid, m.gate.exam, m.gate.subject));
      if (!ok) {
        redirect(`/pay/upi?plan=pro&exam=${m.gate.exam}&subject=${m.gate.subject}`);
      }
    }
  }

  // PSU / CIL Management Trainee exams: no negative marking and no on-screen
  // calculator. GATE keeps both.
  const isPsuCil = m.gate.type === "entitlement" && m.gate.exam === "PSU";

  return (
    <ExamPortal
      kind="mock"
      refId={m.id}
      title={m.title}
      questions={m.questions as never}
      durationSec={m.durationSec}
      negativeMarking={m.negativeMarking}
      showCalculator={!isPsuCil}
      examLabel={
        isPsuCil
          ? "Coal India Limited — Management Trainee"
          : "GATE — Graduate Aptitude Test in Engineering"
      }
    />
  );
}

export const dynamic = "force-dynamic";

