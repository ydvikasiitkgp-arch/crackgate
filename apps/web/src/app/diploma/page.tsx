import { Metadata } from "next";
import Link from "next/link";
import { DIPLOMA_MOCKS } from "@/data/diploma/mocks";

export const metadata: Metadata = {
  title: "Diploma Level Exams · CrackGate",
  description:
    "Prepare for mining diploma-level exams — Coal Sirdar, Overman, and other DGMS-certified competency tests. Practice with exam-pattern mocks and question banks.",
  alternates: { canonical: "/diploma" },
};

export default function DiplomaExamsPage() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-20">
      <div className="text-center">
        <span className="badge bg-brand/10 text-brand">Diploma Level Exams</span>
        <h1 className="mt-4 text-4xl font-extrabold text-ink">Diploma exam prep.</h1>
        <p className="mt-4 text-lg text-muted">
          Preparation for diploma-level mining &amp; engineering recruitment — polytechnic boards, DGMS competency
          certificates and junior-level technical roles.
        </p>
      </div>

      {/* WCL — Featured */}
      <div className="mt-12 rounded-2xl border-2 border-emerald-500/30 bg-emerald-500/5 p-6">
        <div className="flex items-center gap-3">
          <span className="badge bg-emerald-600 text-white">Live</span>
          <h2 className="text-lg font-bold text-ink">WCL Diploma Exams</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          20 full-length mocks each for Mining Sirdar and Assistant Foreman (Electrical) —
          100 MCQs, 120 min, no negative marking. ₹399 per exam.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/diploma/wcl"
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
          >
            View All WCL Exams →
          </Link>
        </div>
      </div>

      {/* NCL — Featured */}
      <div className="mt-8 rounded-2xl border-2 border-blue-500/30 bg-blue-500/5 p-6">
        <div className="flex items-center gap-3">
          <span className="badge bg-blue-600 text-white">New</span>
          <h2 className="text-lg font-bold text-ink">NCL Diploma Exams</h2>
        </div>
        <p className="mt-2 text-sm text-muted">
          20 full-length mocks each for Mining Sirdar (254 posts) and Surveyor (5 posts) —
          100 MCQs, 120 min, no negative marking. ₹399 per exam. Advt. 2026/246.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            href="/diploma/ncl"
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View All NCL Exams →
          </Link>
          <a
            href="https://www.nclcil.in/data-listing/pages/recruitment"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-blue-300 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700"
          >
            Apply on NCL →
          </a>
        </div>
      </div>

      {/* Other Diploma Mocks */}
      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Other diploma mocks</h2>
        <ul className="mt-4 space-y-3">
          {DIPLOMA_MOCKS.map((m) => (
            <li key={m.id}>
              <Link
                href={`/mocks/${m.id}`}
                className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 transition hover:border-brand/40 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-ink group-hover:text-brand">{m.title}</p>
                  <p className="mt-1 text-sm text-muted">
                    {m.questions.length} questions · {m.totalMarks} marks · {m.duration} min
                  </p>
                </div>
                <span aria-hidden className="text-brand transition group-hover:translate-x-0.5">→</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted">
          More diploma-level exams are being curated. New syllabi and question banks are added regularly.
        </p>
      </div>
    </section>
  );
}
