import { Metadata } from "next";
import Link from "next/link";
import { DIPLOMA_MOCKS } from "@/data/diploma/mocks";

export const metadata: Metadata = {
  title: "Diploma Level Exams · CrackGate",
  description:
    "Prepare for mining diploma-level exams — Coal Sirdar, Overman, and other DGMS-certified competency tests. Practice with exam-pattern mocks and question banks.",
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

      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Available mock tests</h2>
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
