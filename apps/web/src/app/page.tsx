import Link from "next/link";
import { MOCKS } from "@/data/mocks";
import { PRACTICE } from "@/data/practice";
import { getGateSubject } from "@/data/gate/registry";
import dynamic from "next/dynamic";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { CilAdBanner } from "@/components/cil-ad-banner";


const HeroCarousel = dynamic(() => import("@/components/hero-carousel").then((m) => m.HeroCarousel));
import { NewsletterForm } from "@/components/newsletter-form";
export const metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const practiceQs = PRACTICE.reduce((s, sub) => s + sub.questions.length, 0);
  const subjectsCount = PRACTICE.length;
  const mocksCount = MOCKS.length;

  const civil = getGateSubject("civil");
  const civilStats = {
    practiceQs: civil?.practice.reduce((s, sub) => s + sub.questions.length, 0) ?? 0,
    mocksCount: civil?.mocks.length ?? 0,
    learnCount: civil?.learnTopics.length ?? 0,
    subjectsCount: civil?.practice.length ?? 0,
  };

  const geology = getGateSubject("geology");
  const geologyStats = {
    practiceQs: geology?.practice.reduce((s, sub) => s + sub.questions.length, 0) ?? 0,
    mocksCount: geology?.mocks.length ?? 0,
    learnCount: geology?.learnTopics.length ?? 0,
    subjectsCount: geology?.practice.length ?? 0,
  };

  const environment = getGateSubject("environment");
  const environmentStats = {
    practiceQs: environment?.practice.reduce((s, sub) => s + sub.questions.length, 0) ?? 0,
    mocksCount: environment?.mocks.length ?? 0,
    learnCount: environment?.learnTopics.length ?? 0,
    subjectsCount: environment?.practice.length ?? 0,
  };

  return (
    <>
      {/* ---------- HERO (multi-window carousel) ---------- */}
      <HeroCarousel
        practiceQs={practiceQs}
        mocksCount={mocksCount}
        subjectsCount={subjectsCount}
        civil={civilStats}
        geology={geologyStats}
        environment={environmentStats}
      />

      {/* ---------- CIL recruitment ad ---------- */}
      <div className="pt-10">
        <CilAdBanner />
      </div>

      {/* ---------- FEATURES ---------- */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center">
          <span className="badge bg-brand/10 text-brand">Why CrackGate</span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-ink">
            Everything you need to crack GATE.
          </h2>
          <p className="mt-3 text-muted max-w-2xl mx-auto">
            Hyper-focused on mining. No generic content, no padding — every question is graded
            automatically with detailed solutions.
          </p>
        </div>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature
            icon="🧪"
            tint="indigo"
            title={`${mocksCount} Full-length Mocks`}
            desc="Exam-pattern papers with section-wise analysis and subject SWOT. First mock free."
          />
          <Feature
            icon="📚"
            tint="emerald"
            title={`${practiceQs}+ Practice Questions`}
            desc="Topic-wise practice across every subject — each with worked solutions and instant grading."
          />
          <Feature
            icon="📊"
            tint="sky"
            title="SWOT Analytics"
            desc="Subject-wise strength & weakness graphs, time-per-question, and your accuracy trend over time."
          />
          <Feature
            icon="🎯"
            tint="amber"
            title="NTA-style Live Portal"
            desc="Pixel-identical to the real CBT — question palette, mark-for-review, timer and auto-submit."
          />
          <Feature
            icon="🛡️"
            tint="rose"
            title="Server-side Grading"
            desc="Scores are computed on our servers — tamper-proof, with a detailed report after every attempt."
          />
          <Feature
            icon="📱"
            tint="violet"
            title="Mobile-first"
            desc="Practice on phone or laptop — your progress syncs seamlessly across every device."
          />
        </div>
      </section>

      {/* ---------- NEWSLETTER ---------- */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="text-center">
          <span className="badge bg-brand/10 text-brand">Stay updated</span>
          <h2 className="mt-3 text-2xl font-extrabold text-ink">Get exam tips & updates</h2>
          <p className="mt-2 text-muted max-w-xl mx-auto text-sm">
            New mock releases, GATE notification reminders, and prep strategies — once a week, no spam.
          </p>
        </div>
        <div className="mt-6 flex justify-center">
          <NewsletterForm source="landing" />
        </div>
      </section>

      {/* Floating WhatsApp chat — landing page only */}
      <WhatsAppButton />
    </>
  );
}

function Feature({ icon, title, desc, tint }: { icon: string; title: string; desc: string; tint: keyof typeof TINTS }) {
  return (
    <div className="card group p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className={`w-12 h-12 rounded-xl grid place-items-center text-2xl transition-transform duration-200 group-hover:scale-110 ${TINTS[tint]}`}>
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

// Static class strings so Tailwind can see them at build time (no interpolation).
const TINTS = {
  indigo:  "bg-indigo-500/10  text-indigo-500",
  emerald: "bg-emerald-500/10 text-emerald-500",
  sky:     "bg-sky-500/10     text-sky-500",
  amber:   "bg-amber-500/10   text-amber-500",
  rose:    "bg-rose-500/10    text-rose-500",
  violet:  "bg-violet-500/10  text-violet-500",
} as const;
