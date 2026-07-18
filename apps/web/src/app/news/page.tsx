export const metadata = {
  title: "News & Notifications · CrackGate",
  description:
    "Latest GATE, PSU and mining engineering exam notifications. Coal India Limited recruitment, DGMS updates, and important exam dates for mining professionals.",
  alternates: { canonical: "/news" },
};


export default function NewsPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-5 pt-14">
        <span className="badge bg-brand/10 text-brand dark:bg-brand/20">News &amp; Notifications</span>
        <h1 className="mt-4 text-4xl font-extrabold text-ink dark:text-white">Latest updates</h1>
        <p className="mt-3 max-w-2xl text-muted dark:text-slate-400">
          Recruitment alerts, exam notifications and platform updates for GATE, PSU, State-level and Diploma aspirants.
        </p>
      </section>

      {/* ONGC Featured Recruitment Alert — Premium */}
      <section className="max-w-7xl mx-auto px-5 mt-10">
        <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-orange-50 shadow-lg shadow-amber-100/40 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-slate-700 dark:shadow-none">
          {/* Decorative corner accent */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-orange-200/15 rounded-full blur-3xl" />

          <div className="relative flex flex-col lg:flex-row">
            {/* Left — Brand Bar */}
            <div className="lg:w-72 shrink-0 relative overflow-hidden p-6 sm:p-8 flex flex-col items-center justify-center text-center lg:min-h-[420px]">
              {/* Background image with overlay */}
              <img
                src="/images/ongc/oil-rig-bg.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#003366]/95 via-[#002244]/90 to-[#001a33]/95" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src="/images/ongc/ongc-logo.png"
                  alt="ONGC Logo"
                  className="w-20 h-20 lg:w-24 lg:h-24 object-contain mb-4 drop-shadow-lg"
                />
                <p className="text-white/90 font-extrabold text-xl tracking-wide">ONGC</p>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-1">A Maharatna Company</p>

                <div className="mt-6 w-full">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Applications Open</p>
                    <p className="text-white font-extrabold text-lg">17 July 2026</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Content */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">ONGC Recruitment 2026</h3>
                    <span className="hidden sm:inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-sm text-muted">Graduate Trainee — Engineers &amp; Geologists (E1 Level)</p>
                  <p className="text-xs text-muted/60 mt-0.5">Advt. No. 2/2026 (R&amp;P)</p>
                </div>
                <span className="sm:hidden inline-flex items-center gap-1.5 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider w-fit">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Live
                </span>
              </div>

              {/* Callout */}
              <div className="bg-amber-100/50 border border-amber-200/60 rounded-xl px-5 py-3.5 mb-6 dark:bg-amber-900/20 dark:border-amber-800/40">
                <p className="text-sm text-amber-900 leading-relaxed dark:text-amber-200">
                  ONGC is conducting its <strong>own Computer-Based Test (CBT)</strong> — <strong>not through GATE</strong>.
                  Selection: <strong>CBT (85%) + Interview (15%)</strong>.
                </p>
              </div>

              {/* Concerned Domains */}
              <div className="mb-6">
                <p className="text-[11px] font-bold text-muted/50 uppercase tracking-[0.15em] mb-3 dark:text-slate-400">Concerned Domains</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Mechanical", color: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40" },
                    { name: "Petroleum", color: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40" },
                    { name: "Chemical", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/40" },
                    { name: "Instrumentation", color: "bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/40" },
                    { name: "Geology", color: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/40" },
                  ].map((d) => (
                    <span key={d.name} className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border ${d.color}`}>
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3H9V6h2v4z" /></svg>
                    <span className="text-[10px] font-bold text-muted/50 uppercase tracking-wider">Pay Scale</span>
                  </div>
                  <p className="font-extrabold text-ink text-sm dark:text-white">₹60,000–₹1,80,000</p>
                  <p className="text-[10px] text-muted/60 mt-0.5 dark:text-slate-400">E1 Grade + Allowances</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3H9V6h2v4z" /></svg>
                    <span className="text-[10px] font-bold text-muted/50 uppercase tracking-wider">Selection</span>
                  </div>
                  <p className="font-extrabold text-ink text-sm dark:text-white">CBT + Interview</p>
                  <p className="text-[10px] text-muted/60 mt-0.5 dark:text-slate-400">85% CBT · 15% Interview</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3H9V6h2v4z" /></svg>
                    <span className="text-[10px] font-bold text-muted/50 uppercase tracking-wider">Fee</span>
                  </div>
                  <p className="font-extrabold text-ink text-sm dark:text-white">₹1,000 (GEN/EWS/OBC)</p>
                  <p className="text-[10px] text-muted/60 mt-0.5 dark:text-slate-400">Free for SC/ST/PwBD</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://www.ongcindia.com/web/eng/detail?assetEntry=84777603&assetClassPK=84777498"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold px-7 py-3 rounded-xl hover:from-amber-600 hover:to-orange-600 hover:shadow-lg hover:shadow-amber-200/50 transition-all duration-200 text-sm"
                >
                  Apply Now
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
                <a
                  href="https://www.ongcindia.com/web/eng/detail?assetEntry=84777603&assetClassPK=84777498"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 text-amber-700 font-bold px-7 py-3 rounded-xl border-2 border-amber-200 hover:bg-amber-50 hover:border-amber-300 transition-all duration-200 text-sm dark:text-amber-400 dark:border-amber-700 dark:hover:bg-amber-900/20 dark:hover:border-amber-600"
                >
                  View Full Advertisement
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CIL Featured Recruitment Alert — Premium */}
      <section className="max-w-7xl mx-auto px-5 mt-8">
        <div className="relative overflow-hidden rounded-3xl border border-green-200/60 bg-gradient-to-br from-green-50 via-white to-emerald-50 shadow-lg shadow-green-100/40 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 dark:border-slate-700 dark:shadow-none">
          {/* Decorative corner accent */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-green-200/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-emerald-200/15 rounded-full blur-3xl" />

          <div className="relative flex flex-col lg:flex-row">
            {/* Left — Brand Bar */}
            <div className="lg:w-72 shrink-0 relative overflow-hidden p-6 sm:p-8 flex flex-col items-center justify-center text-center lg:min-h-[420px]">
              {/* Background image with overlay */}
              <img
                src="/images/cil/coal-mine-bg.jpg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#1a5c1a]/95 via-[#0d4d0d]/90 to-[#0a3d0a]/95" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center">
                <img
                  src="/images/cil/cil-logo.png"
                  alt="Coal India Logo"
                  className="w-20 h-20 lg:w-24 lg:h-24 object-contain mb-4 drop-shadow-lg"
                />
                <p className="text-white/90 font-extrabold text-xl tracking-wide">Coal India</p>
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] mt-1">A Maharatna Company</p>

                <div className="mt-6 w-full">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/10">
                    <p className="text-white/50 text-[10px] uppercase tracking-widest mb-1">Vacancies</p>
                    <p className="text-white font-extrabold text-lg">660 Posts</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Content */}
            <div className="flex-1 p-6 sm:p-8 lg:p-10">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight dark:text-white">CIL Recruitment 2026</h3>
                    <span className="hidden sm:inline-flex items-center gap-1.5 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      Live
                    </span>
                  </div>
                  <p className="text-sm text-muted dark:text-slate-400">Management Trainee — E-1 Grade · Advt. No. 03/2026</p>
                </div>
                <span className="sm:hidden inline-flex items-center gap-1.5 bg-green-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider w-fit">
                  <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                  Live
                </span>
              </div>

              {/* Callout */}
              <div className="bg-green-100/50 border border-green-200/60 rounded-xl px-5 py-3.5 mb-6 dark:bg-green-900/20 dark:border-green-800/40">
                <p className="text-sm text-green-900 leading-relaxed dark:text-green-200">
                  Selection based <strong>entirely on CBT</strong> — <strong>no interview</strong>.
                  Two papers: General (100 marks) + Professional Knowledge (100 marks). 3 hours.
                </p>
              </div>

              {/* Disciplines */}
              <div className="mb-6">
                <p className="text-[11px] font-bold text-muted/50 uppercase tracking-[0.15em] mb-3 dark:text-slate-400">9 Disciplines</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Mining", color: "bg-slate-100 text-slate-700 border-slate-200/60 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600" },
                    { name: "Mechanical", color: "bg-blue-50 text-blue-700 border-blue-200/60 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/40" },
                    { name: "Electrical", color: "bg-yellow-50 text-yellow-700 border-yellow-200/60 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800/40" },
                    { name: "Civil", color: "bg-orange-50 text-orange-700 border-orange-200/60 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/40" },
                    { name: "E&T", color: "bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/40" },
                    { name: "System (CS/IT)", color: "bg-violet-50 text-violet-700 border-violet-200/60 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800/40" },
                    { name: "Geology", color: "bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40" },
                    { name: "Industrial Engg.", color: "bg-cyan-50 text-cyan-700 border-cyan-200/60 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/40" },
                    { name: "Rajbhasha", color: "bg-pink-50 text-pink-700 border-pink-200/60 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800/40" },
                  ].map((d) => (
                    <span key={d.name} className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg border ${d.color}`}>
                      {d.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3H9V6h2v4z" /></svg>
                    <span className="text-[10px] font-bold text-muted/50 uppercase tracking-wider dark:text-slate-400">Pay Scale</span>
                  </div>
                  <p className="font-extrabold text-ink text-sm dark:text-white">₹60,000–₹1,80,000</p>
                  <p className="text-[10px] text-muted/60 mt-0.5 dark:text-slate-400">E-1 Grade · CTC ₹14–20 LPA</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3H9V6h2v4z" /></svg>
                    <span className="text-[10px] font-bold text-muted/50 uppercase tracking-wider dark:text-slate-400">Selection</span>
                  </div>
                  <p className="font-extrabold text-ink text-sm dark:text-white">CBT Only</p>
                  <p className="text-[10px] text-muted/60 mt-0.5 dark:text-slate-400">No interview · 200 marks</p>
                </div>
                <div className="bg-white border border-slate-100 rounded-xl px-4 py-3 shadow-sm dark:bg-slate-800 dark:border-slate-700">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11H9v-2h2v2zm0-3H9V6h2v4z" /></svg>
                    <span className="text-[10px] font-bold text-muted/50 uppercase tracking-wider dark:text-slate-400">Fee</span>
                  </div>
                  <p className="font-extrabold text-ink text-sm dark:text-white">₹1,180 (GEN/OBC/EWS)</p>
                  <p className="text-[10px] text-muted/60 mt-0.5 dark:text-slate-400">Free for SC/ST/PwBD</p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="https://cdn.digialm.com/EForms/configuredHtml/1258/97495/Index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold px-7 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 hover:shadow-lg hover:shadow-green-200/50 transition-all duration-200 text-sm"
                >
                  Apply Now
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
                <a
                  href="https://www.coalindia.in/career-cil/jobs-coal-india/recruitment-of-management-trainee-through-computer-based-test-cbt-26/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 text-green-700 font-bold px-7 py-3 rounded-xl border-2 border-green-200 hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-sm dark:text-green-400 dark:border-green-700 dark:hover:bg-green-900/20 dark:hover:border-green-600"
                >
                  View Notification
                  <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>



      
    </>
  );
}
