import Link from "next/link";
import {
  FileCheck,
  Megaphone,
  PenTool,
  Target,
  Globe,
  Award,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import CareersForm from "./careers-form";

export const metadata = {
  title: "Careers — CrackGate",
  description:
    "Join CrackGate as an intern. We're hiring Questions Evaluators, Marketing & Sales, Content Creators and more. Remote, flexible, certificate provided.",
  alternates: { canonical: "/about/careers" },
};

const positions = [
  {
    icon: FileCheck,
    title: "Questions Evaluator",
    description:
      "Review GATE & PSU questions for accuracy, relevance, and difficulty alignment. Help us maintain the quality standard that sets CrackGate apart.",
    tags: ["Remote", "Flexible hours", "Certificate"],
  },
  {
    icon: Megaphone,
    title: "Marketing & Sales",
    description:
      "Grow CrackGate's user base through social media campaigns, campus outreach, and digital marketing strategies targeting GATE & PSU aspirants.",
    tags: ["Remote", "Flexible hours", "Certificate"],
  },
  {
    icon: PenTool,
    title: "Content Creator",
    description:
      "Create study notes, exam analysis, blog posts, and educational content that helps GATE & PSU aspirants prepare smarter.",
    tags: ["Remote", "Portfolio required", "Certificate"],
  },
  {
    icon: Target,
    title: "Other Roles",
    description:
      "Have a skill we haven't listed? We're always open to talented people who want to contribute to India's test prep ecosystem.",
    tags: ["Flexible", "Any role", "Certificate"],
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

      {/* Application form */}
      <section id="apply" className="max-w-2xl mx-auto px-5 py-16 scroll-mt-24">
        <div className="text-center mb-8">
          <span className="badge bg-brand/10 text-brand">Apply</span>
          <h2 className="mt-3 text-2xl font-extrabold text-ink">
            Submit your application
          </h2>
          <p className="mt-2 text-sm text-muted">
            Fill in the form below. We review applications within 3-5 working days.
          </p>
        </div>
        <CareersForm />
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

      {/* CTA */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-2xl font-extrabold">
            Have questions before applying?
          </h2>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto">
            Reach out to us on WhatsApp — we&apos; happy to chat about the roles
            and what it&apos;s like to work with us.
          </p>
          <Link
            href="https://wa.me/917248556138?text=Hi!%20I%27m%20interested%20in%20the%20internship%20at%20CrackGate."
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-accent btn-lg mt-8 inline-flex"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Chat on WhatsApp
          </Link>
        </div>
      </section>
    </div>
  );
}
