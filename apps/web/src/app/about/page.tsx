import Link from "next/link";
import {
  Target,
  BookOpen,
  BarChart3,
  Users,
  Heart,
  Shield,
  Zap,
} from "lucide-react";

export const metadata = {
  title: "About Us",
  description:
    "CrackGate is a test-prep platform built for serious GATE and PSU aspirants by IIT Kharagpur alumni. Original, exam-aligned questions designed to build real conceptual understanding.",
  alternates: { canonical: "/about" },
};

const stats = [
  { value: "21,000+", label: "Questions", icon: BookOpen },
  { value: "60+", label: "Mock Tests", icon: Target },
  { value: "4", label: "Exam Tracks", icon: BarChart3 },
  { value: "100%", label: "Free Core", icon: Heart },
];

const differentiators = [
  {
    icon: Target,
    title: "Original questions, not recycled copies",
    description:
      "Every question on CrackGate is crafted from scratch and mapped to the latest GATE and PSU syllabus. No outdated problems, no random collections — only material that reflects what you'll actually face on exam day.",
  },
  {
    icon: Zap,
    title: "Built for conceptual clarity",
    description:
      "We don't believe in rote memorization. Our questions are designed to test understanding, not recall. Each problem pushes you to think through the concept — so you're prepared for any variation the exam throws at you.",
  },
  {
    icon: BarChart3,
    title: "Aligned to real exam standards",
    description:
      "Same marking scheme. Same negative marking. Same time pressure. Our mocks replicate the actual GATE and PSU exam experience down to the finest detail, so nothing feels new when it matters most.",
  },
];

const values = [
  {
    icon: Shield,
    title: "Quality over quantity",
    description:
      "We'd rather have 1,000 excellent questions than 10,000 mediocre ones. Every solution is reviewed for accuracy, relevance, and clarity before it goes live.",
  },
  {
    icon: Heart,
    title: "Education shouldn't be gatekept",
    description:
      "We keep the core platform free because we believe every serious aspirant deserves access to quality preparation material, regardless of financial background.",
  },
  {
    icon: Users,
    title: "Built by aspirants, for aspirants",
    description:
      "We know the struggle because we've been there. Every feature, every question, every mock test is designed with the student's perspective at the center.",
  },
];

export default function About() {
  return (
    <div className="text-ink">
      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="max-w-4xl mx-auto px-5 py-20 text-center">
          <span className="inline-block rounded-full bg-brand/20 text-brand px-4 py-1 text-xs font-bold uppercase tracking-wider">
            About CrackGate
          </span>
          <h1 className="mt-6 text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
            Crafting questions that build
            <br />
            real understanding.
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            CrackGate is a test preparation platform built by IIT Kharagpur alumni who understand
            that quality questions are the foundation of serious exam preparation.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="max-w-5xl mx-auto px-5 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card p-5 text-center">
                <div className="mx-auto w-10 h-10 rounded-full bg-brand/10 text-brand grid place-items-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-2xl font-extrabold text-ink">{stat.value}</div>
                <div className="text-sm text-muted mt-1">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── The Story ── */}
      <section className="max-w-3xl mx-auto px-5 py-20">
        <div className="text-center">
          <span className="badge bg-brand/10 text-brand">Our Journey</span>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">
            Born from academic rigor and a commitment to excellence.
          </h2>
        </div>
        <div className="mt-10 space-y-5 text-ink/80 leading-relaxed">
          <p>
            The CrackGate team — engineers and educators with deep roots in India's
            mining and public-sector exam ecosystem — share a common belief: that the
            quality of practice material determines the quality of preparation.
            After experiencing firsthand how subpar questions can derail even the most
            dedicated students, they set out to create something different.
          </p>
          <p>
            With a methodical, precision-driven approach to question design, the team brings
            methodical, precision-driven approach to question design. Every problem on CrackGate
            is original, hand-crafted, and meticulously reviewed to ensure it aligns with the
            latest GATE and PSU examination standards.
          </p>
          <p>
            We are a young platform, and we are transparent about that. We don't have years of
            success stories to showcase yet. What we do have is an unwavering commitment to
            quality — and the academic foundation to deliver on it. We believe that when you
            get the questions right, the results follow.
          </p>
        </div>
      </section>

      {/* ── What Sets Us Apart ── */}
      <section className="bg-paper/50">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="text-center">
            <span className="badge bg-brand/10 text-brand">Our Differentiator</span>
            <h2 className="mt-3 text-3xl font-extrabold text-ink">
              What makes CrackGate different
            </h2>
            <p className="mt-3 text-muted max-w-2xl mx-auto">
              In a market flooded with recycled content, we chose a harder path — building
              original, exam-aligned material from the ground up.
            </p>
          </div>
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {differentiators.map((d) => {
              const Icon = d.icon;
              return (
                <div key={d.title} className="card p-6">
                  <div className="w-11 h-11 rounded-lg bg-brand/10 text-brand grid place-items-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-ink">{d.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{d.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="bg-paper/50">
        <div className="max-w-5xl mx-auto px-5 py-20">
          <div className="text-center">
            <span className="badge bg-brand/10 text-brand">Our Principles</span>
            <h2 className="mt-3 text-3xl font-extrabold text-ink">
              Three commitments we never compromise on
            </h2>
          </div>
          <div className="mt-12 grid sm:grid-cols-3 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card p-6 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-brand/10 text-brand grid place-items-center mb-4">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-ink text-lg">{v.title}</h3>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white">
        <div className="max-w-3xl mx-auto px-5 py-16 text-center">
          <h2 className="text-3xl font-extrabold">
            Ready to experience quality preparation?
          </h2>
          <p className="mt-3 text-slate-300 max-w-xl mx-auto">
            No sign-up required. No credit card. Take a mock test and see the difference
            that original, well-crafted questions make.
          </p>
          <Link
            href="/"
            className="btn btn-accent btn-lg mt-8 inline-flex"
          >
            Try a Free Mock Test &rarr;
          </Link>
        </div>
      </section>
    </div>
  );
}




