import { Metadata } from "next";
import Link from "next/link";
import { WCL_SIRDAR_MOCKS, WCL_SIRDAR_PRICING } from "@/data/diploma/wcl-mocks";

export const metadata: Metadata = {
  title: "WCL Mining Sirdar Mock Tests · CrackGate",
  description:
    "20 full-length mock tests for WCL Mining Sirdar (T&S Grade-C) CBT exam — 100 MCQs each, no negative marking, based on CMR 2017 syllabus.",
  alternates: { canonical: "/diploma/wcl/mining-sirdar" },
};

export default function WCLMiningSirdarPage() {
  return (
    <section className="max-w-3xl mx-auto px-5 py-20">
      <div className="text-center">
        <span className="badge bg-brand/10 text-brand">WCL Mining Sirdar</span>
        <h1 className="mt-4 text-4xl font-extrabold text-ink">
          WCL Mining Sirdar (T&S Grade-C)
        </h1>
        <p className="mt-4 text-lg text-muted">
          20 full-length mock tests matching the WCL CBT pattern — 100 MCQs, 100 marks,
          120 minutes, no negative marking. Syllabus mapped to DGMS Mining Sirdar
          Certificate of Competency under Coal Mines Regulations, 2017.
        </p>
      </div>

      {/* Exam Info */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["100", "MCQs per mock"],
          ["120", "Minutes"],
          ["0", "Negative marking"],
          ["20", "Mock tests"],
        ].map(([val, label]) => (
          <div key={label} className="rounded-lg border border-line bg-surface p-4 text-center">
            <p className="text-2xl font-bold text-ink">{val}</p>
            <p className="mt-1 text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      {/* Syllabus Coverage */}
      <div className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Syllabus Coverage
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-muted">
          {[
            "Explosives & Blasting",
            "Bord & Pillar / Depillaring",
            "Strata Control / SCAMP / Roof Bolting",
            "Stowing",
            "Opencast Working",
            "Drifting",
            "Mine Ventilation & Gases",
            "Mine Fires & Inundation",
            "Face Machineries (SDL/LHD/CM)",
            "Electrical & Haulage",
            "Duties of Sirdar / Statutory (CMR 2017)",
            "Mine Surveying",
            "Coal Dust / Rescue / Accidents",
            "Geology",
            "General Awareness & Aptitude",
          ].map((topic) => (
            <div key={topic} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
              {topic}
            </div>
          ))}
        </div>
      </div>

      {/* Mock List */}
      <div className="mt-12">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Mock Tests
        </h2>
        <ul className="mt-4 space-y-3">
          {WCL_SIRDAR_MOCKS.map((m) => {
            const isFree = m.tier === "free";
            return (
              <li key={m.id}>
                <Link
                  href={`/mocks/${m.id}`}
                  className="group flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-5 transition hover:border-brand/40 hover:shadow-sm"
                >
                  <div>
                    <p className="font-semibold text-ink group-hover:text-brand">
                      {m.title}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {m.questions.length} questions · {m.totalMarks} marks · {m.duration} min
                      {m.negativeMarking?.mcq1 === 0 ? " · No negative marking" : ""}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    {isFree ? (
                      <span className="badge bg-green-500/10 text-green-600">Free</span>
                    ) : (
                      <span className="badge bg-brand/10 text-brand">
                        ₹{(WCL_SIRDAR_PRICING.pro / 100).toFixed(0)}
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {/* WCL Facts */}
      <div className="mt-12 rounded-xl border border-line bg-surface p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          WCL Quick Facts
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
          {[
            ["CMD", "Dr. Hemant Sharad Pande"],
            ["HQ", "Nagpur, Maharashtra"],
            ["Founded", "1975"],
            ["Parent", "Coal India Limited (CIL)"],
            ["Status", "Miniratna (since 2007)"],
            ["Areas", "10"],
            ["Mines", "52 (19 UG + 33 OC)"],
            ["States", "Maharashtra & Madhya Pradesh"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg border border-line px-3 py-2">
              <span className="text-muted">{k}</span>
              <span className="font-medium text-ink">{v}</span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-muted">
        Back to{" "}
        <Link href="/diploma" className="text-brand hover:underline">
          Diploma Exams
        </Link>
      </p>
    </section>
  );
}
