import {
  FileCheck,
  Megaphone,
  PenTool,
  Brain,
  Globe,
  Award,
  Sparkles,
  ExternalLink,
} from "lucide-react";

export const metadata = {
  title: "Careers — CrackGate",
  description:
    "Join CrackGate as an intern. We're hiring Questions Evaluators, Marketing & Sales, Content Creators and more. Remote, flexible, certificate provided.",
  alternates: { canonical: "/about/careers" },
};

const positions = [
  {
    icon: Brain,
    title: "AI/ML Engineer",
    description:
      "Work on recommendation engines, question classification, and personalized learning paths that power CrackGate's smart test prep.",
    tags: ["Remote", "Flexible hours"],
  },
  {
    icon: FileCheck,
    title: "Questions Evaluator",
    description:
      "Review GATE & PSU questions for accuracy, relevance, and difficulty alignment. Help us maintain the quality standard that sets CrackGate apart.",
    tags: ["Remote", "Flexible hours"],
  },
  {
    icon: Megaphone,
    title: "Marketing & Sales",
    description:
      "Grow CrackGate's user base through social media campaigns, campus outreach, and digital marketing strategies targeting GATE & PSU aspirants.",
    tags: ["Remote", "Flexible hours"],
  },
  {
    icon: PenTool,
    title: "Content Creator",
    description:
      "Create study notes, exam analysis, blog posts, and educational content that helps GATE & PSU aspirants prepare smarter.",
    tags: ["Remote", "Flexible hours"],
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: "Learn from IIT KGP alumni",
    description: "Work directly with founders from one of India's top institutions.",
  },
  {
    icon: Globe,
    title: "Work from anywhere",
    description: "Fully remote — contribute from any city in India.",
  },
  {
    icon: Award,
    title: "Certificate of completion",
    description: "Official internship certificate from CrackGate.",
  },
];

export default function CareersPage() {
  return (
    <div className="text-ink">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-5 py-20 text-center">
          <span className="inline-block rounded-full bg-brand/20 text-brand px-4 py-1 text-xs font-bold uppercase tracking-wider">
            Join CrackGate
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight leading-tapered">
            Build India&apos;s best
            <br />
            test prep platform.
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We&apos; a young team solving a real problem — quality exam preparation
            for GATE &amp; PSU aspirants. We&apos; hiring interns who want to make
            a meaningful impact.
          </p>
        </div>
      </section>

      {/* Open positions */}
      <section className="max-w-5xl mx-auto px-5 -mt-6">
        <div className="text-center mb-10">
          <span className="badge bg-brand/10 text-brand">Open Positions</span>
          <h2 className="mt-3 text-2xl font-extrabold text-ink">
            Roles we&apos;re hiring for
          </h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {positions.map((pos) => {
            const Icon = pos.icon;
            return (
              <div key={pos.title} className="card p-6 flex flex-col">
                <div className="w-11 h-11 rounded-lg bg-brand/10 text-brand grid place-items-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-ink text-lg">{pos.title}</h3>
                <p className="mt-2 text-sm text-muted leading-relaxed flex-1">
                  {pos.description}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {pos.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-ok/10 border border-ok/20 px-2.5 py-0.5 text-[11px] font-semibold text-ok"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href="#apply"
                  className="mt-4 text-sm font-semibold text-brand hover:underline"
                >
                  Apply now →
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* Why join us */}
      <section className="bg-paper/50 mt-16">
        <div className="max-w-5xl mx-auto px-5 py-16">
          <div className="text-center mb-10">
            <span className="badge bg-brand/10 text-brand">Why Join Us</span>
            <h2 className="mt-3 text-2xl font-extrabold text-ink">
              What you get
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {benefits.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.title} className="card p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 text-brand grid place-items-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-ink">{b.title}</h3>
                  <p className="mt-2 text-sm text-muted">{b.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Apply — Google Form */}
      <section id="apply" className="scroll-mt-24">
        <div className="relative bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-800 text-white overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_60%)]" />
          <div className="relative max-w-2xl mx-auto px-5 py-20 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand/20 text-brand px-4 py-1.5 text-xs font-bold uppercase tracking-wider border border-brand/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand" />
              </span>
              We&apos;re hiring
            </span>
            <h2 className="mt-6 text-3xl md:text-4xl font-extrabold tracking-tight">
              Ready to build with us?
            </h2>
            <p className="mt-4 text-lg text-slate-300 max-w-lg mx-auto">
              Applications are open for all roles. Fill our quick application
              form — we review every submission within 3-5 working days.
            </p>
            <a
              href="https://forms.gle/jqiSv7KGkLq93Ltb7"
              target="_blank"
              rel="noopener noreferrer"
              className="cg-shimmer mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all"
            >
              Apply Now
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* After you apply */}
      <section className="bg-paper/50">
        <div className="max-w-2xl mx-auto px-5 py-16">
          <div className="text-center mb-8">
            <span className="badge bg-brand/10 text-brand">Process</span>
            <h2 className="mt-3 text-2xl font-extrabold text-ink">
              After you apply
            </h2>
          </div>
          <div className="space-y-4">
            {[
              "We review your application (within 3-5 days)",
              "Shortlisted candidates get a WhatsApp/email invite",
              "Quick discussion with the founders",
              "Welcome aboard!",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-brand text-white text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <span className="text-sm text-ink/80 pt-0.5">{step}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
