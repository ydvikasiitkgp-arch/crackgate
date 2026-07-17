import Link from "next/link";
import { ONGC_RECRUITMENT_URL } from "@/data/ongc";

export function OngcAdBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`max-w-7xl mx-auto px-5 ${className}`}>
      <div className="relative overflow-hidden rounded-2xl border border-emerald-400/30 bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 shadow-pop sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-lime-400/10 blur-3xl" />

        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge bg-emerald-400/15 text-emerald-200">NEW · Recruitment</span>
              <span className="badge bg-amber-400/15 text-amber-200">PSU · ONGC</span>
            </div>
            <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
              Oil &amp; Natural Gas Corporation — CBT 2026
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Graduate-level recruitment across Mechanical, Petroleum, Chemical, Electrical, Geology, Geophysics &amp; Physics.
              Computer-based test with domain knowledge, aptitude, general awareness &amp; English sections.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <a
              href={ONGC_RECRUITMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cg-neon inline-flex items-center gap-2 rounded-lg border border-emerald-400/70 bg-emerald-400/10 px-5 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-400/20"
            >
              View Official Notification <span aria-hidden>↗</span>
            </a>
            <Link
              href="/psu/ongc"
              className="cg-pulse-emerald inline-flex items-center gap-2 rounded-lg border border-emerald-300 bg-gradient-to-r from-emerald-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-emerald-500 hover:to-emerald-400"
            >
              Explore ONGC Prep <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
