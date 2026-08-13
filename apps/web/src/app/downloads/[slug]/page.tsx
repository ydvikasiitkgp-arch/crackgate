import { notFound } from "next/navigation";
import Link from "next/link";
import { DOWNLOAD_ITEMS, getDownloadItem } from "@/data/downloads";
import { Breadcrumb } from "@/components/breadcrumb";
import { PrintButton } from "@/components/print-button";

export function generateStaticParams() {
  return DOWNLOAD_ITEMS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const item = getDownloadItem(slug);
  if (!item) return { title: "Downloads · CrackGate" };
  return {
    title: `${item.title} · CrackGate Downloads`,
    description: item.description,
    alternates: { canonical: `/downloads/${slug}` },
  };
}

export default async function DownloadPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const item = getDownloadItem(slug);
  if (!item) notFound();

  return (
    <div className="max-w-3xl mx-auto px-5 py-16">
      <Breadcrumb crumbs={[
        { label: "Home", href: "/" },
        { label: "Downloads", href: "/downloads" },
        { label: item.title },
      ]} />
      <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="badge bg-brand/10 text-brand text-xs">{item.category}</span>
          <h1 className="mt-3 text-3xl font-extrabold leading-tight">{item.title}</h1>
          <p className="mt-3 text-muted leading-relaxed">{item.description}</p>
        </div>
        <PrintButton />
      </div>

      <div className="mt-10 space-y-8">
        {item.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-xl font-bold">{s.heading}</h2>
            <p className="mt-2 text-ink/90 leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-bold">Important links</h2>
        <ul className="mt-3 space-y-2">
          {item.links.map((l) => (
            <li key={l.href} className="text-sm">
              {l.external ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline">
                  {l.label} ↗
                </a>
              ) : (
                <Link href={l.href} className="text-brand hover:underline">{l.label}</Link>
              )}
              {l.note && <span className="text-muted"> — {l.note}</span>}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 border-t border-line pt-6">
        <Link href="/downloads" className="text-sm text-brand hover:underline">← All downloads</Link>
      </div>
    </div>
  );
}