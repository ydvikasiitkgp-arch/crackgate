import Link from "next/link";
import { CIL_RECRUITMENT_URL } from "@/data/cil";

/**
 * Promotional banner for the latest Coal India Limited (CIL) recruitment.
 * Rendered on the homepage and on the /news page.
 */
export function CilAdBanner({ className = "" }: { className?: string }) {
  return (
    <div className={`max-w-7xl mx-auto px-5 ${className}`}>
      <div className="relative overflow-hidden rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-blue-950 via-slate-900 to-slate-950 p-6 shadow-pop sm:p-8">
        {/* glow accents */}
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-teal-400/10 blur-3xl" />

        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge bg-cyan-400/15 text-cyan-200">NEW · Recruitment</span>
              <span className="badge bg-amber-400/15 text-amber-200">PSU · CIL</span>
            </div>
            <h3 className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
              Coal India Limited — Management Trainee 2026
            </h3>
            <p className="mt-2 max-w-2xl text-sm text-white/70">
              Direct recruitment for MT across Mining, Civil, Electrical, Mechanical, Geology &amp; more.
              Check the official notification and start your targeted PSU prep now.
            </p>
          </div>
          <div className="flex shrink-0 flex-col gap-2 sm:items-end">
            <a
              href={CIL_RECRUITMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="cg-neon inline-flex items-center gap-2 rounded-lg border border-cyan-400/70 bg-cyan-400/10 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
            >
              View Official Notification <span aria-hidden>↗</span>
            </a>
            <Link
              href="/psu/cil"
              className="cg-pulse inline-flex items-center gap-2 rounded-lg border border-cyan-300 bg-gradient-to-r from-cyan-600 to-cyan-500 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-cyan-500 hover:to-cyan-400"
            >
              Explore CIL Prep <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
