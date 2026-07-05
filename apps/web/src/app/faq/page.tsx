export const metadata = {
  title: "FAQ",
  description:
    "Frequently asked questions about CrackGate — free mocks, scoring rules, exam subjects, pricing plans, and how our GATE & PSU test-prep platform works.",
  alternates: { canonical: "/faq" },
};
const QAs = [
  { q: "Is CrackGate only for GATE Mining?",       a: "Yes — we don't dilute focus. Every mock is for the GATE MN paper." },
  { q: "Is the first mock really free?",            a: "Yes. Sign in with Google and Mock 01 is unlocked." },
  { q: "How is scoring done?",                      a: "Server-side. MCQ: +marks / −marks/3. NAT: ±tolerance, no negative. MSQ: all-or-nothing, no negative." },
  { q: "Will my progress sync across devices?",     a: "Yes. Once you sign in, all your attempts and analytics live in our database." },
  { q: "Can I get a refund?",                       a: "Yes — within 7 days if you've attempted ≤ 1 paid paper. See refund policy." },
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
