import Link from "next/link";
import { notFound } from "next/navigation";
import { CIL_ROWS, getCilDiscipline, CIL_RECRUITMENT_URL } from "@/data/cil";
import { CilMockPlan } from "@/components/cil-mock-plan";
import { Breadcrumb } from "@/components/breadcrumb";
import { ShareOnWhatsApp } from "@/components/share-on-whatsapp";
import { auth } from "@/lib/auth";
import { hasEntitlement } from "@/lib/entitlements";

// Entitlement is per-user, so this page must render per-request.
export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CIL_ROWS.map((r) => ({ discipline: r.slug }));
}

export async function generateMetadata(props: { params: Promise<{ discipline: string }> }) {
  const { discipline } = await props.params;
  const row = getCilDiscipline(discipline);
  if (!row) {
    return { title: "CIL · CrackGate", description: "Coal India Limited Management Trainee exam preparation with discipline-specific mock tests." };
  }
  return {
    title: `CIL ${row.discipline} · Mock Series · CrackGate`,
    description: `Crack Coal India Management Trainee ${row.discipline} exam. ${row.qualification}. Practice with mock tests tailored to the CIL exam pattern.`,
  };
}

export default async function CilDisciplinePage(props: { params: Promise<{ discipline: string }> }) {
  const { discipline } = await props.params;
  const row = getCilDiscipline(discipline);
  if (!row) notFound();

  // Per-discipline access: a CIL purchase records an Entitlement(exam="PSU",
  // subject=<slug>). Admins (role) see everything unlocked.
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const unlocked = isAdmin || (await hasEntitlement(userId ?? "", "PSU", row.slug));

  return (
    <>
      <section className="bg-gradient-to-r from-blue-950 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-5 py-14 lg:py-16">
          <div className="flex items-start justify-between">
            <Breadcrumb crumbs={[
              { label: "Home", href: "/" },
              { label: "PSU", href: "/psu" },
              { label: "CIL", href: "/psu/cil" },
              { label: row.discipline },
            ]} />
            <ShareOnWhatsApp />
          </div>
          <span className="badge mt-4 border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
            Post Code {row.code}
          </span>
          <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold leading-tight">
            CIL {row.discipline} — Management Trainee
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">{row.qualification}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={CIL_RECRUITMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cg-neon inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
            >
              Official Notification <span aria-hidden>↗</span>
            </a>
            <Link
              href="/psu/cil"
              className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20"
            >
              All disciplines
            </Link>
          </div>
        </div>
      </section>

      <CilMockPlan discipline={row.discipline} slug={row.slug} unlocked={unlocked} />
    </>
  );
}
