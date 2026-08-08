import Link from "next/link";
import { MOCKS } from "@/data/mocks";
import { PRACTICE } from "@/data/practice";
import { LEARN_TOPICS } from "@/data/learn";
import { AITS } from "@/data/aits";
import dynamicImport from "next/dynamic";

const GateWindow = dynamicImport(() => import("@/components/hero-carousel").then((m) => m.GateWindow));

export const metadata = {
  title: "GATE Mining (MN) · CrackGate",
  description:
    "Complete GATE Mining Engineering preparation — 20 full-length mocks, 2000+ practice questions, IIT-authored learn modules, SWOT analytics, and NTA-style exam portal.",
  alternates: { canonical: "/gate/mining" },
};
export const dynamic = "force-dynamic";

export default async function GateMiningPage() {
  const practiceQs = PRACTICE.reduce((s, sub) => s + sub.questions.length, 0);
  const subjectsCount = PRACTICE.length;
  const mocksCount = MOCKS.length;
  const learnCount = LEARN_TOPICS.length;
  const aitsCount = AITS.length;

  return (
    <>
      {/* ---------- HERO (GATE MN 2027 banner) ---------- */}
      <section className="relative bg-slate-950 text-white">
        <div className="relative min-h-[680px] lg:min-h-[720px]">
          <GateWindow practiceQs={practiceQs} mocksCount={mocksCount} subjectsCount={subjectsCount} />
        </div>
      </section>

      {/* ---------- ABOUT THE EXAM ---------- */}
      <section className="bg-paper/40 border-b border-line">
        <div className="max-w-7xl mx-auto px-3 sm:px-5 py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div>
              <span className="badge bg-brand/10 text-brand">About the exam</span>
              <h2 className="mt-3 text-2xl lg:text-3xl font-extrabold">GATE MN — Mining Engineering</h2>
              <p className="mt-4 text-muted leading-relaxed">
                Full GATE Mining (MN) preparation — topic-wise learning, an exam-grade practice bank, full-length mocks and a scheduled All India Test Series.
              </p>
              <div className="mt-4 text-sm text-muted space-y-2 leading-relaxed">
                <p>GATE Mining Engineering (MN) is a specialized paper with approximately 3,000–5,000 candidates appearing each year, making it one of the least competitive GATE papers with a favorable seat-to-candidate ratio. The syllabus spans six sections — Mining Geology, Mine Development &amp; Surveying; Geomechanics &amp; Ground Control; Mining Methods &amp; Machinery; Surface Environment, Mine Ventilation &amp; Underground Hazards; and Mineral Economics, Mine Planning &amp; Systems Engineering.</p>
                <p>The paper follows the standard 65-question, 100-mark, 3-hour pattern with General Aptitude (15 marks), Engineering Mathematics (~13 marks), and the core MN section (~72 marks). Top rankers (AIR 1–50) are recruited by Coal India Limited (CIL) and its subsidiaries — BCCL, CCL, WCL, SECL, ECL, NCL, and MCL — along with NMDC, NLC India, MECL, SCCL, MOIL, DVC, and HCL. Others pursue MTech at IITs, NITs, and IISc.</p>
                <p>Standard references include <em>Principles and Practices of Modern Coal Mining</em> by R.D. Singh, <em>Elements of Mining Technology</em> (Vol. 1, 2 &amp; 3) by D.J. Deshmukh, <em>Introductory Mining Engineering</em> and <em>Mine Ventilation and Air Conditioning</em> by Howard L. Hartman, <em>Rock Mechanics for Underground Mining</em> by B.H.G. Brady &amp; E.T. Brown, <em>Rock Mechanics and Strata Control</em> by B. Ravinder, <em>Fundamentals and Applications of Rock Mechanics</em> by D. Debasis &amp; Abhiram, <em>Principles and Practices of Rock Blasting</em> by V.K. Himanshu &amp; A.K. Mishra, <em>Engineering Geology</em> by Prabin Singh, <em>Principles of Engineering Geology</em> by K.M. Bangur, <em>Numerical Problems on Mine Ventilation</em> by L.C. Kaku, <em>Opencast Mining</em> by M. Vishnu, <em>Mine Safety Engineering</em> by V.V.R. Durga, <em>Complete Guide for Mining Engineers</em> by Dr. A.K. Gorai, and <em>GATE Solution in Mining Engineering</em> by Rupesh Kumar Sahu. For engineering mathematics, recommended texts are <em>Higher Engineering Mathematics</em> by B.S. Grewal, <em>Advanced Engineering Mathematics</em> by R.K. Jain &amp; S.R.K. Iyengar, <em>Advanced Engineering Mathematics</em> by Erwin Kreyszig, and <em>Advanced Engineering Mathematics</em> by H.K. Dass — all widely prescribed at IIT Kharagpur and IIT (ISM) Dhanbad.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <StatBox value={`${mocksCount}`} label="Full-length mocks" />
              <StatBox value={`${practiceQs.toLocaleString("en-IN")}+`} label="Practice questions" />
              <StatBox value={`${learnCount}`} label="Learn modules" />
              <StatBox value={`${aitsCount}`} label="AITS tests" />
            </div>
          </div>


        </div>
      </section>

      {/* ---------- MODULES ---------- */}
      <section className="max-w-7xl mx-auto px-3 sm:px-5 py-16 lg:py-20">
        <h2 className="text-3xl font-extrabold text-center">Your complete GATE MN track.</h2>
        <p className="mt-3 text-muted text-center max-w-2xl mx-auto">
          Everything is built specifically for Mining Engineering — no generic padding. Every question is
          auto-graded with a detailed solution.
        </p>
        <div className="mt-12 grid sm:grid-cols-2 gap-6">
          <Link href="/gate/mining/learn" className="group card p-6 flex items-start gap-4 hover:border-brand hover:shadow-sm transition">
            <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-brand/10 text-2xl">📚</div>
            <div>
              <h3 className="font-bold group-hover:text-brand">Learn &amp; Solve</h3>
              <p className="mt-1.5 text-sm text-muted">{learnCount} topic-wise modules with formula matrices, traps and worked 3-tier question suites.</p>
            </div>
            <span className="ml-auto text-brand text-xl shrink-0 group-hover:translate-x-0.5 transition">→</span>
          </Link>
          <Link href="/gate/mining/practice" className="group card p-6 flex items-start gap-4 hover:border-brand hover:shadow-sm transition">
            <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-brand/10 text-2xl">✍️</div>
            <div>
              <h3 className="font-bold group-hover:text-brand">Practice</h3>
              <p className="mt-1.5 text-sm text-muted">{practiceQs.toLocaleString("en-IN")}+ exam-grade questions across {subjectsCount} subjects, instantly graded with solutions.</p>
            </div>
            <span className="ml-auto text-brand text-xl shrink-0 group-hover:translate-x-0.5 transition">→</span>
          </Link>
          <Link href="/gate/mining/mocks" className="group card p-6 flex items-start gap-4 hover:border-brand hover:shadow-sm transition">
            <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-brand/10 text-2xl">🧪</div>
            <div>
              <h3 className="font-bold group-hover:text-brand">Mock Tests</h3>
              <p className="mt-1.5 text-sm text-muted">{mocksCount} full-length papers on the official GATE pattern — 65 Q · 100 marks · 3 hours.</p>
            </div>
            <span className="ml-auto text-brand text-xl shrink-0 group-hover:translate-x-0.5 transition">→</span>
          </Link>
          <Link href="/gate/mining/aits" className="group card p-6 flex items-start gap-4 hover:border-brand hover:shadow-sm transition">
            <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-brand/10 text-2xl">💎</div>
            <div>
              <h3 className="font-bold group-hover:text-brand">All India Test Series</h3>
              <p className="mt-1.5 text-sm text-muted">{aitsCount} scheduled tests with All-India percentile rankings.</p>
            </div>
            <span className="ml-auto text-brand text-xl shrink-0 group-hover:translate-x-0.5 transition">→</span>
          </Link>
          <Link href="/gate/mining/blog" className="group card p-6 flex items-start gap-4 hover:border-brand hover:shadow-sm transition">
            <div className="shrink-0 grid place-items-center w-12 h-12 rounded-xl bg-brand/10 text-2xl">📰</div>
            <div>
              <h3 className="font-bold group-hover:text-brand">Blog</h3>
              <p className="mt-1.5 text-sm text-muted">GATE Mining strategy guides, study plans and exam tips from IIT Kharagpur alumni.</p>
            </div>
            <span className="ml-auto text-brand text-xl shrink-0 group-hover:translate-x-0.5 transition">→</span>
          </Link>
        </div>
      </section>

      {/* ---------- FEATURES ---------- */}
      <section className="max-w-7xl mx-auto px-3 sm:px-5 py-16 lg:py-20">
        <h2 className="text-3xl font-extrabold text-center">Everything you need to crack GATE MN.</h2>
        <p className="mt-3 text-muted text-center max-w-2xl mx-auto">
          Hyper-focused on mining. No generic content, no padding — every question is graded automatically with detailed solutions.
        </p>
        <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Feature icon="🧪" title={`${mocksCount} Full-length Mocks`} desc="Exam-pattern papers with section-wise analysis and subject SWOT. First mock free." />
          <Feature icon="📚" title={`${practiceQs.toLocaleString("en-IN")}+ Practice Questions`} desc="Topic-wise practice across all subjects, each with worked solutions and instant grading." />
          <Feature icon="📊" title="SWOT Analytics" desc="Subject-wise strengths/weaknesses graphs. Time spent per question. Accuracy trend." />
          <Feature icon="🎯" title="NTA-style Live Portal" desc="Identical look to the real CBT — palette, mark-for-review, timer, auto-submit." />
          <Feature icon="🛡️" title="Server-side Grading" desc="Scores are computed on our servers — tamper-proof. Detailed report after every attempt." />
          <Feature icon="📱" title="Mobile-first" desc="Practice on phone or laptop — your progress syncs across devices." />
        </div>
      </section>

    </>
  );
}

function Feature({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="card group p-6 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="w-12 h-12 rounded-xl grid place-items-center bg-brand/10 text-2xl transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mt-4 font-bold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5 text-center">
      <div className="text-3xl font-extrabold text-brand">{value}</div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}
