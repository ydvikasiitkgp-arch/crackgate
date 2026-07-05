import Link from "next/link";
import { auth } from "@/lib/auth";
import { MOCKS } from "@/data/mocks";
import { PRACTICE } from "@/data/practice";
import { GateWindow } from "@/components/hero-carousel";

export const metadata = {
  title: "GATE Mining (MN) · CrackGate",
  description:
    "Complete GATE Mining Engineering preparation — 20 full-length mocks, 2000+ practice questions, IIT-authored learn modules, SWOT analytics, and NTA-style exam portal.",
  alternates: { canonical: "/gate/mining" },
};
export const dynamic = "force-dynamic";

export default async function GateMiningPage() {
  const session = await auth();
  const practiceQs = PRACTICE.reduce((s, sub) => s + sub.questions.length, 0);
  const subjectsCount = PRACTICE.length;
  const mocksCount = MOCKS.length;

  return (
    <>
      {/* ---------- HERO (GATE MN 2027 banner) ---------- */}
      <section className="relative bg-slate-950 text-white">
        <div className="relative min-h-[680px] lg:min-h-[720px]">
          <GateWindow practiceQs={practiceQs} mocksCount={mocksCount} subjectsCount={subjectsCount} />
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <h2 className="text-3xl font-extrabold text-center">Everything you need to crack GATE MN.</h2>
        <p className="mt-3 text-muted text-center max-w-2xl mx-auto">
          Hyper-focused on mining. No generic content, no padding — every question is graded automatically with detailed solutions.
        </p>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Feature icon="🧪" title={`${mocksCount} Full-length Mocks`} desc="Exam-pattern papers with section-wise analysis and subject SWOT. First mock free." />
          <Feature icon="📚" title={`${practiceQs}+ Practice Questions`} desc="Topic-wise practice across all subjects, each with worked solutions and instant grading." />
          <Feature icon="📊" title="SWOT Analytics" desc="Subject-wise strengths/weaknesses graphs. Time spent per question. Accuracy trend." />
          <Feature icon="🎯" title="NTA-style Live Portal" desc="Identical look to the real CBT — palette, mark-for-review, timer, auto-submit." />
          <Feature icon="🛡️" title="Server-side Grading" desc="Scores are computed on our servers — tamper-proof. Detailed report after every attempt." />
          <Feature icon="📱" title="Mobile-first" desc="Practice on phone or laptop — your progress syncs across devices." />
        </div>
      </section>

      {/* ---------- ABOUT US ---------- */}
      <section className="max-w-7xl mx-auto px-5 py-20">
        <div className="text-center">
          <span className="badge bg-brand/10 text-brand">About us</span>
          <h2 className="mt-3 text-3xl font-extrabold text-ink">Built by toppers, for every serious aspirant.</h2>
          <p className="mt-3 text-muted max-w-2xl mx-auto">
            CrackGate is created by IIT Kharagpur alumni who&apos;ve cracked GATE themselves — and now help thousands
            of aspirants reach the same goal. Every question, solution and analytic is crafted by experts who
            know exactly what it takes to succeed.
          </p>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 max-w-3xl mx-auto">
          <TeamCard initials="VY" name="Vikas Yadav" role="Founder" credentials="M.Tech, IIT Kharagpur" />
          <TeamCard initials="VK" name="Vishal Kumar" role="Co-founder" credentials="B.Tech, BIT Sindri · M.Tech, IIT Kharagpur · Coal India Limited" />
        </div>
        <div className="mt-8 text-center">
          <Link href="/about" className="text-sm font-semibold text-brand hover:underline">
            Read our story →
          </Link>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      {!session?.user && (
        <section className="bg-slate-900 text-white">
          <div className="max-w-3xl mx-auto px-5 py-16 text-center">
            <h2 className="text-3xl font-extrabold">Start your free mock now.</h2>
            <p className="mt-3 text-slate-300">No credit card. Takes 5 seconds with Google.</p>
            <Link href="/login" className="btn btn-accent btn-lg mt-6 inline-flex">Continue with Google →</Link>
          </div>
        </section>
      )}
    </>
  );
}

function TeamCard({ initials, name, role, credentials }: { initials: string; name: string; role: string; credentials: string }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="shrink-0 w-14 h-14 rounded-full bg-brand/10 text-brand grid place-items-center font-bold text-lg">
        {initials}
      </div>
      <div className="min-w-0">
        <div className="font-bold text-ink">{name}</div>
        <div className="text-xs uppercase tracking-wider text-muted font-semibold">{role}</div>
        <div className="text-sm text-ink/80 mt-1">{credentials}</div>
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card p-6">
      <div className="text-3xl">{icon}</div>
      <h3 className="mt-3 font-bold">{title}</h3>
      <p className="mt-2 text-sm text-muted">{desc}</p>
    </div>
  );
}
