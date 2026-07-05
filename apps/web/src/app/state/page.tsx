import { Metadata } from "next";
import Link from "next/link";
import { STATE_MOCKS } from "@/data/state/mocks";

export const metadata: Metadata = {
  title: "State Level Exams · CrackGate",
  description:
    "Prepare for state-level mining engineering exams — RPSC Assistant Mining Engineer, Gujarat Mineral Development Corporation, and other state PSU recruitment tests.",
  alternates: { canonical: "/state" },
};

export default function StateExamsPage() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-20">
      <div className="text-center">
        <span className="badge bg-brand/10 text-brand">State Level Exams</span>
        <h1 className="mt-4 text-4xl font-extrabold text-ink">State-level exam prep.</h1>
        <p className="mt-4 text-lg text-muted">
          Preparation for state-level mining &amp; engineering recruitment — state PSCs, state mining boards and
          DGMS-linked roles.
        </p>
      </div>

      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Available mock tests</h2>
        <ul className="mt-4 space-y-3">
          {STATE_MOCKS.map((m) => (
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
          More state-level exams are being curated. New syllabi and question banks are added regularly.
        </p>
      </div>
    </section>
  );
}
