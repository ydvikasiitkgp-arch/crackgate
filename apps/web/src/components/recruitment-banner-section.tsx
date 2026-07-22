import Link from "next/link";

/**
 * Homepage recruitment alert section — NCL + WCL diploma-level exams.
 * Compact cards that drive users to prep pages.
 */
export function RecruitmentBannerSection() {
  return (
    <section className="max-w-7xl mx-auto px-5 py-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="badge bg-red-500/10 text-red-600">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse inline-block mr-1" />
          Live Recruitment
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-ink">
          Diploma-Level Coal Sector Openings
        </h2>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {/* NCL Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50 via-white to-indigo-50 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-slate-700">
          {/* Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-300/15 rounded-full blur-3xl" />

          <div className="relative p-6">
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-blue-200/40 bg-white shadow-sm flex items-center justify-center">
                  <img src="/images/ncl/ncl-logo.png" alt="NCL" className="w-9 h-9 object-contain" />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink text-lg leading-tight">NCL Recruitment</h3>
                  <p className="text-xs text-muted">Northern Coalfields Limited</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                Live
              </span>
            </div>

            {/* Key info */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/80 border border-blue-100 rounded-lg px-3 py-2 text-center dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold">Vacancies</p>
                <p className="font-extrabold text-ink text-sm dark:text-white">259</p>
              </div>
              <div className="bg-white/80 border border-blue-100 rounded-lg px-3 py-2 text-center dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold">Posts</p>
                <p className="font-extrabold text-ink text-sm dark:text-white">2</p>
              </div>
              <div className="bg-white/80 border border-blue-100 rounded-lg px-3 py-2 text-center dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold">Deadline</p>
                <p className="font-extrabold text-red-600 text-sm">05 Aug</p>
              </div>
            </div>

            {/* Posts */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200/50 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40">Mining Sirdar (254)</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200/50 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/40">Surveyor (5)</span>
            </div>

            {/* Exam pattern */}
            <p className="text-xs text-muted mb-4 leading-relaxed">
              CBT Only · No interview · <strong>100 MCQs · 100 marks · 90 min · No negative marking</strong>
            </p>

            {/* CTAs */}
            <div className="flex gap-2">
              <Link href="/diploma/ncl" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold px-4 py-2.5 rounded-lg text-sm hover:from-blue-700 hover:to-indigo-700 transition-all">
                Start Prep →
              </Link>
              <a href="https://www.nclcil.in/data-listing/pages/recruitment" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-blue-700 font-semibold px-4 py-2.5 rounded-lg border-2 border-blue-200 hover:bg-blue-50 transition-all text-sm dark:text-blue-400 dark:border-blue-700">
                Apply ↗
              </a>
            </div>
          </div>
        </div>

        {/* WCL Card */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 via-white to-green-50 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-slate-700">
          {/* Glow */}
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-300/15 rounded-full blur-3xl" />

          <div className="relative p-6">
            {/* Header row */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-emerald-200/40 bg-white shadow-sm flex items-center justify-center">
                  <img src="/images/wcl/wcl-logo.webp" alt="WCL" className="w-9 h-9 object-contain" />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink text-lg leading-tight">WCL Recruitment</h3>
                  <p className="text-xs text-muted">Western Coalfields Limited</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                <span className="w-1 h-1 bg-white rounded-full animate-pulse" />
                Live
              </span>
            </div>

            {/* Key info */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 text-center dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold">Vacancies</p>
                <p className="font-extrabold text-ink text-sm dark:text-white">444</p>
              </div>
              <div className="bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 text-center dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold">Posts</p>
                <p className="font-extrabold text-ink text-sm dark:text-white">2</p>
              </div>
              <div className="bg-white/80 border border-emerald-100 rounded-lg px-3 py-2 text-center dark:bg-slate-800 dark:border-slate-700">
                <p className="text-[10px] text-muted/60 uppercase tracking-wider font-semibold">Deadline</p>
                <p className="font-extrabold text-red-600 text-sm">10 Aug</p>
              </div>
            </div>

            {/* Posts */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/50 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/40">Mining Sirdar (220)</span>
              <span className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-yellow-50 text-yellow-700 border border-yellow-200/50 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/40">AF Electrical (224)</span>
            </div>

            {/* Exam pattern */}
            <p className="text-xs text-muted mb-4 leading-relaxed">
              CBT Only · No interview · <strong>100 MCQs · 100 marks · 120 min · No negative marking</strong>
            </p>

            {/* CTAs */}
            <div className="flex gap-2">
              <Link href="/diploma/wcl" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold px-4 py-2.5 rounded-lg text-sm hover:from-emerald-700 hover:to-green-700 transition-all">
                Start Prep →
              </Link>
              <a href="https://westerncoal.in/en/career/recruitment" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1.5 text-emerald-700 font-semibold px-4 py-2.5 rounded-lg border-2 border-emerald-200 hover:bg-emerald-50 transition-all text-sm dark:text-emerald-400 dark:border-emerald-700">
                Apply ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
