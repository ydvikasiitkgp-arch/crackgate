import Link from "next/link";
import { ONGC_ROWS } from "@/data/ongc";
import { ONGC_PATTERN } from "@/data/ongc-mocks";
import { NewsletterForm } from "@/components/newsletter-form";
import dynamic from "next/dynamic";

const PsuOngcHero = dynamic(() => import("@/components/psu-ongc-hero").then((m) => m.PsuOngcHero));

export const metadata = {
  title: "PSU · ONGC CBT · CrackGate",
  description:
    "Crack ONGC CBT recruitment exam. Tailored mock tests for Mechanical, Petroleum, Chemical, Instrumentation and Geology with official exam pattern.",
  alternates: { canonical: "/psu/ongc" },
};

export default function PsuOngcPage() {
  return (
    <>
      <PsuOngcHero />

      {/* DISCIPLINE CARDS */}
      <section id="disciplines" className="max-w-7xl mx-auto px-5 py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Mock series by discipline</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Pick your discipline to open its dedicated <b>15-mock ONGC series</b> in the official{" "}
              {ONGC_PATTERN.questions} Q · {ONGC_PATTERN.durationMin / 60} hr CBT pattern.
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ONGC_ROWS.map((r) => (
            <Link
              key={r.slug}
              href={`/psu/ongc/${r.slug}`}
              className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-pop"
            >
              <div className="flex items-center justify-between">
                <span className="badge bg-[#003580]/15 text-[#003580] dark:text-blue-300">CBT</span>
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

      {/* NEWSLETTER */}
      <section className="border-t border-line bg-paper/40">
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h3 className="text-xl font-bold text-ink">Get ONGC CBT exam updates</h3>
          <p className="mt-2 text-sm text-muted">
            New mock releases, notification alerts, and prep tips for ONGC recruitment — once a week.
          </p>
          <div className="mt-5 flex justify-center">
            <NewsletterForm source="psu-ongc" />
          </div>
        </div>
      </section>
    </>
  );
}
