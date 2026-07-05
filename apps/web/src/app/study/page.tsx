import Link from "next/link";
import { STUDY_NOTES, STUDY_NOTE_PLAN, type StudyNoteTier } from "@/data/study-notes";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Study Notes — Elite GATE MN Revision, Section by Section",
  description:
    "Premium IIT-style GATE Mining revision notes: a decade of trend analysis (2017–2026), a complete SI formula matrix, the exact paper-setter traps, and worked 2-mark core examples for every core subject area.",
  alternates: { canonical: "/study" },
};

// Study Notes are free for everyone — no plan gating.
function tierBadge(_tier: StudyNoteTier) {
  return { label: "FREE", cls: "badge-free" };
}

export default async function StudyNotesIndex() {
  return (
    <div className="max-w-5xl mx-auto px-5 py-12">
      <header className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold mb-3">
          📒 STUDY NOTES
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold">Elite GATE MN Revision Notes</h1>
        <p className="text-muted mt-3 max-w-3xl">
          Each note is authored like an <b>IIT professor&apos;s last-mile revision sheet</b> — a decade of{" "}
          <b>trend analysis (2017–2026)</b>, a complete <b>SI formula matrix</b> with a strict variable index,
          the exact <b>paper-setter traps</b>, and deeply worked <b>2-mark core examples</b>. Every note
          is <b>completely free</b> — no plan required.
        </p>
        <p className="text-xs text-muted mt-3">
          {STUDY_NOTES.length} note{STUDY_NOTES.length === 1 ? "" : "s"} live · more subject areas added
          every week.
        </p>
      </header>

      {/* Live notes */}
      <div className="space-y-3">
        {STUDY_NOTES.map((note) => {
          const unlocked = true;
          const badge = tierBadge(note.tier);
          return (
            <Link
              key={note.slug}
              href={`/study/${note.slug}`}
              className="group flex items-start justify-between gap-4 card p-5 hover:border-brand hover:shadow-sm transition"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] uppercase tracking-wide text-muted font-semibold">
                    {note.subject}
                  </span>
                  {note.updated && (
                    <span className="text-[11px] text-muted">· Reviewed {note.updated}</span>
                  )}
                </div>
                <h2 className="text-lg font-extrabold group-hover:text-brand mt-0.5">
                  {unlocked ? "" : "🔒 "}
                  {note.title}
                </h2>
                <p className="text-sm text-muted mt-1">{note.blurb}</p>
              </div>
              <span className={`badge ${badge.cls} shrink-0`}>{badge.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Coming soon */}
      {STUDY_NOTE_PLAN.length > 0 && (
        <>
          <h3 className="text-sm font-bold text-muted uppercase tracking-wide mt-10 mb-3">Coming soon</h3>
          <ul className="grid sm:grid-cols-2 gap-2.5">
            {STUDY_NOTE_PLAN.map((p) => (
              <li
                key={p.title}
                className="flex items-start justify-between gap-2 rounded-lg border border-line bg-canvas/40 px-3 py-2.5"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{p.title}</span>
                  <span className="block text-[11px] text-muted mt-0.5 truncate">{p.highlight}</span>
                </span>
                <span className="text-[10px] uppercase tracking-wide text-muted/70 shrink-0 mt-0.5">
                  Soon
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
