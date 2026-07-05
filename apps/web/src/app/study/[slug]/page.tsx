import Link from "next/link";
import { notFound } from "next/navigation";
import { getStudyNote, STUDY_NOTES, type StudyNoteTier } from "@/data/study-notes";
import { StudyNoteView } from "@/components/study-note-view";
import { Breadcrumb } from "@/components/breadcrumb";
import { ShareOnWhatsApp } from "@/components/share-on-whatsapp";

export const dynamic = "force-dynamic";

// Study Notes are free for everyone — no plan gating.
function tierBadge(_tier: StudyNoteTier) {
  return { label: "FREE", cls: "badge-free" };
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const note = getStudyNote(slug);
  if (!note) return { title: "Study Notes" };
  return {
    title: `${note.title} — GATE MN Study Notes`,
    description: note.blurb,
  };
}

export default async function StudyNotePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const note = getStudyNote(slug);
  if (!note) notFound();

  // Study Notes are free for everyone — no plan or login required.
  const unlocked = true;
  const badge = tierBadge(note.tier);

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="mb-6">
        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          { label: "Study", href: "/study" },
          { label: note.title },
        ]} />
        <div className="flex items-center justify-between">
          <Link href="/study" className="text-sm text-muted hover:text-ink">← All notes</Link>
          <ShareOnWhatsApp />
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-xs text-muted">{note.subject}</span>
          <span className={`badge ${badge.cls}`}>{badge.label}</span>
          {note.updated && <span className="text-[11px] text-muted">· Reviewed {note.updated}</span>}
        </div>
        <h1 className="text-2xl lg:text-3xl font-extrabold mt-1">{note.title}</h1>
        <p className="text-muted mt-2">{note.blurb}</p>
      </div>

      <StudyNoteView note={note} unlocked={unlocked} />
    </div>
  );
}

export function generateStaticParams() {
  return STUDY_NOTES.map((n) => ({ slug: n.slug }));
}
