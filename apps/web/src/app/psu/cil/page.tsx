import Link from "next/link";
import { CIL_ROWS } from "@/data/cil";
import { CIL_PATTERN } from "@/data/cil-mocks";
import { CilAdBanner } from "@/components/cil-ad-banner";
import { PsuCilHero } from "@/components/psu-cil-hero";

export const metadata = {
  title: "PSU · Coal India Limited (CIL) · CrackGate",
  description:
    "Crack Coal India Limited Management Trainee exam. Tailored question banks for mining, civil, electrical, mechanical disciplines with mock tests based on CIL exam pattern.",
};

export default function PsuCilPage() {
  return (
    <>
      {/* HERO (2-slide carousel: overview + homepage CIL eligibility/seats window) */}
      <PsuCilHero />

      {/* DISCIPLINE CARDS */}
      <section id="disciplines" className="max-w-7xl mx-auto px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Eligibility &amp; mock series by discipline</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Pick your discipline to open its dedicated <b>10-mock CIL series</b> in the official{" "}
              {CIL_PATTERN.questions} Q · {CIL_PATTERN.durationMin / 60} hr pattern.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CIL_ROWS.map((r) => (
            <Link
              key={r.code}
              href={`/psu/cil/${r.slug}`}
              className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-pop"
            >
              <div className="flex items-center justify-between">
                <span className="badge bg-cyan-400/15 text-cyan-700 dark:text-cyan-300">Post Code {r.code}</span>
                <span className="badge badge-pro">15 mocks</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{r.discipline}</h3>
              <p className="mt-2 flex-1 text-sm text-muted leading-snug">{r.qualification}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                Open mock series <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <CilAdBanner className="pb-16" />
    </>
  );
}
