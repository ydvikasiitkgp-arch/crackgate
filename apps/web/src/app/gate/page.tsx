import Link from "next/link";

export const metadata = {
  title: "GATE Tracks · CrackGate",
  description:
    "Choose your GATE exam track — Mining Engineering (MN), Civil Engineering (CE), Geology and Geophysics (GG), or Environmental Science and Engineering (ES). Full-length mocks, topic-wise practice, and IIT-authored content.",
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
    code: "AE",
    discipline: "Aerospace Engineering (AE)",
    href: "/gate/aerospace",
    blurb: "Full GATE Aerospace Engineering prep — coming soon.",
    live: false,
  },
  {
    code: "AG",
    discipline: "Agricultural Engineering (AG)",
    href: "/gate/agricultural",
    blurb: "Full GATE Agricultural Engineering prep — coming soon.",
    live: false,
  },
  {
    code: "AR",
    discipline: "Architecture and Planning (AR)",
    href: "/gate/architecture",
    blurb: "Full GATE Architecture and Planning prep — coming soon.",
    live: false,
  },
  {
    code: "BM",
    discipline: "Biomedical Engineering (BM)",
    href: "/gate/biomedical",
    blurb: "Full GATE Biomedical Engineering prep — coming soon.",
    live: false,
  },
  {
    code: "BT",
    discipline: "Biotechnology (BT)",
    href: "/gate/biotechnology",
    blurb: "Full GATE Biotechnology prep — coming soon.",
    live: false,
  },
  {
    code: "CE",
    discipline: "Civil Engineering (CE)",
    href: "/gate/civil",
    blurb: "Full-length mocks, topic-wise practice, Learn & Solve modules and AITS — built to exam-grade standard.",
    live: true,
  },
  {
    code: "CY",
    discipline: "Chemistry (CY)",
    href: "/gate/chemistry",
    blurb: "Full GATE Chemistry prep — coming soon.",
    live: false,
  },
  {
    code: "ES",
    discipline: "Environmental Science and Engineering (ES)",
    href: "/gate/environment",
    blurb: "Full GATE Environmental Science & Engineering prep — Learn, Practice, Mocks and AITS, built to exam-grade standard.",
    live: true,
  },
  {
    code: "EY",
    discipline: "Ecology and Evolution (EY)",
    href: "/gate/ecology",
    blurb: "Full GATE Ecology and Evolution prep — coming soon.",
    live: false,
  },
  {
    code: "GE",
    discipline: "Geomatics Engineering (GE)",
    href: "/gate/geomatics",
    blurb: "Full GATE Geomatics Engineering prep — coming soon.",
    live: false,
  },
  {
    code: "GG",
    discipline: "Geology and Geophysics (GG)",
    href: "/gate/geology",
    blurb: "Full GATE Geology & Geophysics prep — Learn, topic-wise practice, full-length mocks and AITS, built to exam-grade standard.",
    live: true,
  },
  {
    code: "MA",
    discipline: "Mathematics (MA)",
    href: "/gate/mathematics",
    blurb: "Full GATE Mathematics prep — coming soon.",
    live: false,
  },
  {
    code: "MN",
    discipline: "Mining Engineering (MN)",
    href: "/gate/mining",
    blurb: "Full-length mocks, topic-wise practice, AITS and SWOT analytics — built to exam-grade standard.",
    live: true,
  },
  {
    code: "MT",
    discipline: "Metallurgical Engineering (MT)",
    href: "/gate/metallurgical",
    blurb: "Full GATE Metallurgical Engineering prep — coming soon.",
    live: false,
  },
  {
    code: "NM",
    discipline: "Naval Architecture and Marine Engineering (NM)",
    href: "/gate/naval",
    blurb: "Full GATE Naval Architecture and Marine Engineering prep — coming soon.",
    live: false,
  },
  {
    code: "PE",
    discipline: "Petroleum Engineering (PE)",
    href: "/gate/petroleum",
    blurb: "Full GATE Petroleum Engineering prep — coming soon.",
    live: false,
  },
  {
    code: "PH",
    discipline: "Physics (PH)",
    href: "/gate/physics",
    blurb: "Full GATE Physics prep — coming soon.",
    live: false,
  },
  {
    code: "ST",
    discipline: "Statistics (ST)",
    href: "/gate/statistics",
    blurb: "Full GATE Statistics prep — coming soon.",
    live: false,
  },
  {
    code: "TF",
    discipline: "Textile Engineering and Fibre Science (TF)",
    href: "/gate/textile",
    blurb: "Full GATE Textile Engineering and Fibre Science prep — coming soon.",
    live: false,
  },
  {
    code: "XE",
    discipline: "Engineering Sciences (XE)",
    href: "/gate/engineering-sciences",
    blurb: "Full GATE Engineering Sciences prep — coming soon.",
    live: false,
  },
  {
    code: "XH",
    discipline: "Humanities and Social Sciences (XH)",
    href: "/gate/humanities",
    blurb: "Full GATE Humanities and Social Sciences prep — coming soon.",
    live: false,
  },
  {
    code: "XL",
    discipline: "Life Sciences (XL)",
    href: "/gate/life-sciences",
    blurb: "Full GATE Life Sciences prep — coming soon.",
    live: false,
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
