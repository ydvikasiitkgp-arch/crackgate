export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about CrackGate — mock tests, practice questions, scoring, exam coverage (GATE, PSU, Diploma, State), pricing plans, and how our test-prep platform works.",
  alternates: { canonical: "/faq" },
};
const QAs = [
  { q: "Which exams does CrackGate cover?",       a: "GATE (Mining, Civil, Geology, Environment, and more), PSU recruitment (CIL, ONGC), diploma-level exams (NCL, WCL), and state mining exams — all in one platform." },
  { q: "Is the first mock really free?",            a: "Yes. Sign in with Google and your first mock for any exam track is unlocked." },
  { q: "How is scoring done?",                      a: "Server-side. MCQ: +marks / −marks/3. NAT: ±tolerance, no negative. MSQ: all-or-nothing, no negative." },
  { q: "Will my progress sync across devices?",     a: "Yes. Once you sign in, all your attempts and analytics live in our database." },
  { q: "Can I get a refund?",                       a: "Yes — within 7 days if you've attempted ≤ 1 paid paper. See refund policy." },
  { q: "What is the difference between Free, Pro, and Premium?", a: "Free gives you limited mocks and practice. Pro unlocks full mock tests and subject-wise practice for one exam track. Premium gives you everything across all tracks." },
  { q: "Do you have diploma-level exam mocks?",     a: "Yes. We cover NCL Mining Sirdar, NCL Surveyor, WCL Mining Sirdar, and WCL Assistant Foreman — with 20 mocks each, built from official syllabus." },
];
export default function FAQ() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: QAs.map((x) => ({
      "@type": "Question",
      name: x.q,
      acceptedAnswer: { "@type": "Answer", text: x.a },
    })),
  };

  return (
    <div className="max-w-2xl mx-auto px-5 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1 className="text-3xl font-extrabold">Frequently asked questions</h1>
      <div className="mt-8 space-y-3">
        {QAs.map((x) => (
          <details key={x.q} className="card p-5">
            <summary className="font-semibold cursor-pointer">{x.q}</summary>
            <p className="text-sm text-muted mt-3">{x.a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
