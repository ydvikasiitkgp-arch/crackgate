import Link from "next/link";
import { notFound } from "next/navigation";
import { getLearnTopic, LEARN_TOPICS } from "@/data/learn";
import { LearnEngine } from "@/components/learn-engine";
import { Breadcrumb } from "@/components/breadcrumb";
import { ShareOnWhatsApp } from "@/components/share-on-whatsapp";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const t = getLearnTopic(slug);
  if (!t) return { title: "Learn & Solve" };
  return {
    title: `${t.title} — Learn & Solve`,
    description: t.blurb,
  };
}

export default async function LearnTopicPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const topic = getLearnTopic(slug);
  if (!topic) notFound();

  // Learn modules are free for everyone — no plan or login required.

  return (
    <div className="max-w-3xl mx-auto px-5 py-10">
      <div className="mb-6">
        <Breadcrumb crumbs={[
          { label: "Home", href: "/" },
          { label: "Learn", href: "/learn" },
          { label: topic.title },
        ]} />
        <div className="flex items-center justify-between">
          <Link href="/learn" className="text-sm text-muted hover:text-ink">← All topics</Link>
          <ShareOnWhatsApp />
        </div>
        <div className="text-xs text-muted mt-3">{topic.subject}</div>
        <h1 className="text-2xl lg:text-3xl font-extrabold mt-0.5">{topic.title}</h1>
        <p className="text-muted mt-2">{topic.blurb}</p>
      </div>

      <LearnEngine topic={topic} />
    </div>
  );
}

export function generateStaticParams() {
  return LEARN_TOPICS.map((t) => ({ slug: t.slug }));
}
