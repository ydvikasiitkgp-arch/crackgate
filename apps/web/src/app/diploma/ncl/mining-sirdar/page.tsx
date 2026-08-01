import Link from "next/link";
import Image from "next/image";
import { NCL_SIRDAR_MOCKS, NCL_SIRDAR_PRICING } from "@/data/diploma/ncl-sirdar-mocks";
import { Breadcrumb } from "@/components/breadcrumb";
import { ShareOnWhatsApp } from "@/components/share-on-whatsapp";
import { NewsletterForm } from "@/components/newsletter-form";
import { AddToCartBtn } from "@/components/add-to-cart-btn";
import { UnlockNowBtn } from "@/components/unlock-now-btn";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasEntitlement } from "@/lib/entitlements";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "NCL Mining Sirdar Mock Tests · CrackGate",
  description:
    "20 full-length mock tests for NCL Mining Sirdar (T&S Gr. C) CBT exam — 100 MCQs each, no negative marking, based on CMR 2017 syllabus.",
  alternates: { canonical: "/diploma/ncl/mining-sirdar" },
};

const SYLLABUS = [
  "Opencast Coal Mine Working & Bench Formation",
  "Explosives & Shot Firing in Mines",
  "Safety Issues in Opencast Workings",
  "Reclamation Operations in Opencast Mining",
  "Safety Management Plan",
  "CMR 2017 — Duties of Sirdar & Shot Firer",
  "Mines Rules 1955, Vocational Training Rules 1966",
  "Mines Rescue Rules 1985 & DGMS Circulars",
  "Writing of Reports",
  "General Knowledge — India & International Relations",
  "General Awareness — Sports, Defense, Books",
  "Reasoning, Verbal & Mental Ability",
  "Quantitative Aptitude",
];

const NCL_FACTS = [
  ["CMD", "Manish Kumar"],
  ["HQ", "Singrauli, Madhya Pradesh"],
  ["Founded", "1985"],
  ["Parent", "Coal India Limited (CIL)"],
  ["Status", "Miniratna"],
  ["Districts", "Singrauli (MP) & Sonebhadra (UP)"],
];

export default async function NclMiningSirdarPage() {
  const session = await auth();
  const userId = (session?.user as { id?: string } | undefined)?.id;
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin";
  const unlocked = isAdmin || (await hasEntitlement(userId ?? "", "DIPLOMA", "ncl-mining-sirdar"));

  const attempts = userId
    ? await db.attempt.findMany({
        where: { userId, kind: "mock" },
        select: { id: true, refId: true, takenAt: true },
      })
    : [];
  const completedIds = new Set(attempts.filter(a => a.refId.startsWith("diploma-ncl-sirdar-mock-")).map(a => a.refId));
  const attemptMap = new Map(attempts.map(a => [a.refId, { id: a.id, takenAt: a.takenAt }]));

  const liveCount = NCL_SIRDAR_MOCKS.length;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-[#1a3a5c] text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/cil/coal-mine-bg.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-15"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a3a5c] via-[#1a3a5c]/90 to-[#1a3a5c]/60" />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 py-14 lg:py-16">
          <div className="flex items-start justify-between">
            <Breadcrumb className="text-white/50 [&_a]:hover:text-white [&_span]:text-white" crumbs={[
              { label: "Home", href: "/" },
              { label: "Diploma", href: "/diploma" },
              { label: "NCL", href: "/diploma/ncl" },
              { label: "Mining Sirdar" },
            ]} />
            <ShareOnWhatsApp />
          </div>
          <div className="flex items-center gap-3 mt-4">
            <span className="badge border border-blue-300/30 bg-blue-300/10 text-blue-300">
              T&S Gr. C · NCL Recruitment · 254 Posts
            </span>
          </div>
          <h1 className="mt-3 text-4xl lg:text-5xl font-extrabold leading-tight">
            NCL Mining Sirdar
          </h1>
          <p className="mt-4 max-w-2xl text-white/80">
            20 full-length mock tests matching the NCL CBT pattern — 100 MCQs, 100 marks,
            120 minutes, no negative marking. Section A (Technical 70Q) + Section B (General 30Q).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href="#mocks" className="cg-neon inline-flex items-center gap-2 rounded-lg border border-blue-400/70 bg-blue-400/10 px-5 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-400/20">
              View all mocks <span aria-hidden>↓</span>
            </a>
            <Link href="/diploma/ncl" className="btn bg-white/10 text-white border border-white/30 hover:bg-white/20">
              All NCL exams
            </Link>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Stat value="100" label="MCQs" />
            <Stat value="120" label="Minutes" />
            <Stat value="0" label="Negative marking" />
            <Stat value="20" label="Mock tests" />
          </div>
        </div>
      </section>

      {/* MOCK PLAN */}
      <section id="mocks" className="max-w-7xl mx-auto px-5 py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-ink">Mining Sirdar — {liveCount} Full-length Mock Tests</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted">
              Complete NCL Mining Sirdar series: <b>Section A: 70 Technical MCQs</b> (opencast, explosives, safety, CMR 2017) +{" "}
              <b>Section B: 30 General MCQs</b> (GK, reasoning, aptitude). 120 min, no negative marking.
            </p>
          </div>
          <span className="badge badge-pro shrink-0">
            {liveCount} of {liveCount} live
          </span>
        </div>

        {unlocked ? (
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-ok/30 bg-ok/10 px-4 py-3 text-sm">
            <span aria-hidden className="text-ok">✓</span>
            <span className="font-semibold text-ink">Mining Sirdar series unlocked.</span>
            <span className="text-muted">All {liveCount} mocks are open — start any set below.</span>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-2xl border border-blue-400/30 bg-gradient-to-r from-blue-950 to-slate-900 text-white">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div className="flex items-start gap-3">
                <span aria-hidden className="mt-0.5 text-2xl">🔒</span>
                <div>
                  <h3 className="text-lg font-extrabold">Unlock all {liveCount} Mining Sirdar mocks</h3>
                  <p className="mt-1 max-w-xl text-sm text-white/70">
                    Full official NCL CBT pattern — {liveCount} complete 100-question papers
                    covering Technical + General sections. One payment, valid through the recruitment cycle.
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-1 sm:items-end">
                <div className="text-right">
                  <span className="text-3xl font-extrabold">₹{NCL_SIRDAR_PRICING.pro}</span>
                </div>
                <div className="flex items-center gap-2">
                  <UnlockNowBtn
                    exam="DIPLOMA"
                    subject="ncl-mining-sirdar"
                    plan="pro"
                    label="Unlock now"
                    className="cg-neon inline-flex items-center justify-center gap-2 rounded-lg border border-blue-400/70 bg-blue-400/10 px-6 py-3 text-sm font-semibold text-blue-100 transition hover:bg-blue-400/20"
                  />
                  <AddToCartBtn exam="DIPLOMA" subject="ncl-mining-sirdar" variant="light" size="md" />
                </div>
                <span className="text-[11px] text-white/50">Pay via UPI · access in a few hours</span>
              </div>
            </div>
          </div>
        )}

        {completedIds.size > 0 && (
          <p className="text-sm text-muted mt-6">
            {completedIds.size} / {liveCount} completed · {liveCount - completedIds.size} remaining
          </p>
        )}

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {NCL_SIRDAR_MOCKS.map((m) => {
            const done = completedIds.has(m.id);
            return (
              <div key={m.id} className="card relative flex flex-col p-5">
                <span className={`badge absolute right-4 top-4 ${done ? "bg-ok/10 text-ok" : unlocked ? "bg-brand/10 text-brand" : "badge-pro"}`}>
                  {done ? "✓ Completed" : unlocked ? "Ready" : "Locked"}
                </span>
                <div className="text-xs font-mono text-brand">{m.title}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted">
                  <span className="rounded-md bg-canvas px-2 py-1">{m.questions.length} Q</span>
                  <span className="rounded-md bg-canvas px-2 py-1">{m.duration} min</span>
                  <span className="rounded-md bg-canvas px-2 py-1">{m.totalMarks} marks</span>
                </div>
                {done ? (
                  <Link href={`/result/${attemptMap.get(m.id)!.id}`} className="btn btn-ghost mt-4 w-full justify-center">
                    Review Answers →
                  </Link>
                ) : unlocked ? (
                  <Link href={`/mocks/${m.id}`} className="btn btn-primary mt-4 w-full justify-center">
                    Start Mock
                  </Link>
                ) : (
                  <UnlockNowBtn
                    exam="DIPLOMA"
                    subject="ncl-mining-sirdar"
                    plan="pro"
                    label="Unlock to access"
                    className="btn btn-ghost mt-4 w-full justify-center gap-2"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SYLLABUS */}
      <section className="max-w-7xl mx-auto px-5 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Syllabus Coverage</h2>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm text-muted">
          {SYLLABUS.map((topic) => (
            <div key={topic} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
              {topic}
            </div>
          ))}
        </div>
      </section>

      {/* NCL QUICK FACTS */}
      <section className="max-w-7xl mx-auto px-5 pb-16">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">NCL Quick Facts</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
          {NCL_FACTS.map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg border border-line bg-surface px-3 py-2">
              <span className="text-muted">{k}</span>
              <span className="font-medium text-ink">{v}</span>
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-line bg-paper/40">
        <div className="max-w-3xl mx-auto px-5 py-12 text-center">
          <h3 className="text-lg font-bold text-ink">Get NCL Mining Sirdar exam updates</h3>
          <p className="mt-1 text-sm text-muted">
            New mock releases, NCL notification alerts, and prep tips — once a week.
          </p>
          <div className="mt-4 flex justify-center">
            <NewsletterForm source="diploma-ncl-sirdar" />
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/5 px-4 py-3">
      <div className="text-2xl font-extrabold text-white">{value}</div>
      <div className="text-xs text-white/60">{label}</div>
    </div>
  );
}
