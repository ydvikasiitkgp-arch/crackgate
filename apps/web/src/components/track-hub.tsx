import Link from "next/link";

export type TrackModule = {
  label: string;
  href: string;
  icon: string;
  desc: string;
};

/**
 * Reusable discipline hub used by GATE > Mining / Civil / Geology.
 * When `live` is true the module cards link out; otherwise they render as
 * dimmed "Coming soon" placeholders.
 */
export function TrackHub({
  discipline,
  subject,
  tagline,
  live,
  modules,
  badge,
}: {
  discipline: string;
  subject?: string;
  tagline: string;
  live: boolean;
  modules: TrackModule[];
  badge?: string;
}) {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand to-brand-2 text-white">
        <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-5 py-16 lg:py-24">
          <span className="badge bg-white/10 text-amber-300 border border-amber-300/30">
            {badge ?? `GATE 2027 · ${discipline}`}
          </span>
          <h1 className="mt-4 text-4xl lg:text-6xl font-extrabold leading-[1.05]">
            GATE {discipline}
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/80">{tagline}</p>

          {live ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="btn btn-accent btn-lg">Start free →</Link>
              <Link href="/mocks" className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
                Take a mock test
              </Link>
            </div>
          ) : (
            <div className="mt-7 inline-flex items-center gap-2 rounded-lg border border-amber-300/30 bg-amber-300/10 px-4 py-2.5 text-sm font-semibold text-amber-200">
              🚧 {discipline} content is on the way — check back soon.
            </div>
          )}
        </div>
      </section>

      {/* MODULES — the full learning track */}
      <section className="max-w-7xl mx-auto px-5 py-16 lg:py-20">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-ink">
            Everything you need to crack GATE {discipline}.
          </h2>
          <p className="mt-3 text-muted max-w-2xl mx-auto">
            One platform — Learn, Practice, Mocks, AITS and Notes — built end-to-end for the {discipline} syllabus.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m, i) =>
            live ? (
              <Link
                key={m.label}
                href={m.href}
                className="card group p-6 transition hover:-translate-y-1 hover:shadow-pop"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-2xl">
                  {m.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">
                  <span className="mr-2 text-muted/70">{String(i + 1).padStart(2, "0")}</span>
                  {m.label}
                </h3>
                <p className="mt-2 text-sm text-muted">{m.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  Open <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </span>
              </Link>
            ) : (
              <div key={m.label} aria-disabled className="card relative p-6 opacity-70">
                <span className="badge badge-pro absolute right-4 top-4">Coming soon</span>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-canvas text-2xl grayscale">
                  {m.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-ink">{m.label}</h3>
                <p className="mt-2 text-sm text-muted">{m.desc}</p>
              </div>
            ),
          )}
        </div>

        {/* CLOSING CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-r from-brand to-brand-2 px-6 py-10 text-center text-white sm:px-10">
          {live ? (
            <>
              <h3 className="text-2xl font-extrabold">Ready to start your GATE {discipline} prep?</h3>
              <p className="mt-2 text-white/80">Create a free account — no card required.</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/login" className="btn btn-accent btn-lg">Get started free</Link>
                <Link href={subject ? `/pricing?subject=${subject}` : "/pricing"} className="btn bg-white/10 text-white border border-white/25 hover:bg-white/20 btn-lg">
                  View plans
                </Link>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-extrabold">{discipline} is launching soon.</h3>
              <p className="mt-2 text-white/80">In the meantime, explore our fully-live GATE tracks.</p>
              <div className="mt-6">
                <Link href="/gate" className="btn btn-accent btn-lg">Explore GATE tracks →</Link>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

/** Module set shared by every discipline hub (links differ per discipline). */
export const GATE_MODULES: TrackModule[] = [
  { label: "Learn", href: "/learn", icon: "📖", desc: "Full syllabus broken into bite-size topics with worked theory." },
  { label: "Practice", href: "/practice", icon: "📚", desc: "Topic-wise question banks with instant grading and solutions." },
  { label: "Mocks", href: "/mocks", icon: "🧪", desc: "Full-length exam-pattern papers with section-wise SWOT." },
  { label: "AITS", href: "/aits", icon: "🏆", desc: "All India Test Series — ranked, timed, live test windows." },
  { label: "Notes", href: "/study", icon: "📝", desc: "Concise revision notes and formula sheets per subject." },
  { label: "Pricing", href: "/pricing", icon: "💳", desc: "Free, Pro and Premium plans — start free, upgrade anytime." },
];
