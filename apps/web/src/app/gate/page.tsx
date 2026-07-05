import Link from "next/link";

export const metadata = {
  title: "GATE Tracks · CrackGate",
  description:
    "Choose your GATE exam track — Mining Engineering (MN), Civil Engineering (CE), Geology & Geophysics (GG), or Environmental Science (ES). Full-length mocks, topic-wise practice, and IIT-authored content.",
  alternates: { canonical: "/gate" },
};

type Branch = {
  code: string;
  discipline: string;
  href: string;
  blurb: string;
  live: boolean;
};

const GATE_BRANCHES: Branch[] = [
  {
    code: "MN",
    discipline: "Mining (MN)",
    href: "/gate/mining",
    blurb: "Full-length mocks, topic-wise practice, AITS and SWOT analytics — built to exam-grade standard.",
    live: true,
  },
  {
    code: "CE",
    discipline: "Civil (CE)",
    href: "/gate/civil",
    blurb: "Full-length mocks, topic-wise practice, Learn & Solve modules and AITS — built to exam-grade standard.",
    live: true,
  },
  {
    code: "GG",
    discipline: "Geology (GG)",
    href: "/gate/geology",
    blurb: "Full GATE Geology & Geophysics prep — Learn, topic-wise practice, full-length mocks and AITS, built to exam-grade standard.",
    live: true,
  },
  {
    code: "ES",
    discipline: "Environment (ES)",
    href: "/gate/environment",
    blurb: "Full GATE Environmental Science & Engineering prep — Learn, Practice, Mocks and AITS, built to exam-grade standard.",
    live: true,
  },
];

export default function GateIndexPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-slate-950 text-white">
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 py-16 lg:py-24">
          <span className="badge border border-cyan-300/30 bg-cyan-300/10 text-cyan-300">
            GATE Test Prep
          </span>
          <h1 className="mt-4 text-4xl lg:text-6xl font-extrabold leading-[1.05]">
            Choose your
            <span className="block text-cyan-300">GATE discipline</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">
            Dedicated GATE preparation tracks — full-length mocks, topic-wise practice and SWOT analytics.
            Pick your branch to get started.
          </p>
        </div>
      </section>

      {/* BRANCH CARDS */}
      <section className="max-w-7xl mx-auto px-5 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {GATE_BRANCHES.map((b) => (
            <Link
              key={b.code}
              href={b.href}
              className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-pop"
            >
              <div className="flex items-center justify-between">
                <span className="badge bg-cyan-400/15 text-cyan-700 dark:text-cyan-300">GATE {b.code}</span>
                <span className={b.live ? "badge bg-emerald-400/15 text-emerald-700 dark:text-emerald-300" : "badge badge-pro"}>
                  {b.live ? "Live" : "Soon"}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{b.discipline}</h3>
              <p className="mt-2 flex-1 text-sm text-muted leading-snug">{b.blurb}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                {b.live ? "Open track" : "Preview track"} <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
