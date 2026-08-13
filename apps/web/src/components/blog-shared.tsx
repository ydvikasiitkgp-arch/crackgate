import Link from "next/link";
import type { BlogPost } from "@/data/blog";
import { Breadcrumb } from "@/components/breadcrumb";
import { ShareOnWhatsApp } from "@/components/share-on-whatsapp";
import { NewsletterForm } from "@/components/newsletter-form";
import { readTime } from "@/lib/read-time";

function fmt(date: string) {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function BlogPostCard({ post, href }: { post: BlogPost; href: string }) {
  return (
    <Link
      href={href}
      className="card p-6 hover:border-brand transition group"
    >
      <div className="flex flex-wrap gap-2 mb-2">
        {post.tags.map((t) => (
          <span key={t} className="badge bg-brand/10 text-brand text-xs">{t}</span>
        ))}
      </div>
      <h2 className="text-xl font-bold text-ink group-hover:text-brand transition-colors">
        {post.title}
      </h2>
      <p className="text-sm text-muted mt-2 leading-relaxed">{post.description}</p>
      <div className="flex items-center gap-3 mt-4 text-xs text-muted">
        <span>{post.author}</span>
        <span aria-hidden>·</span>
        <time dateTime={post.date}>{fmt(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{readTime(post.body)} min read</span>
      </div>
    </Link>
  );
}

export function BlogArticle({
  post,
  indexHref,
  indexLabel,
  crumbLabel,
  canonical,
}: {
  post: BlogPost;
  indexHref: string;
  indexLabel: string;
  crumbLabel: string;
  canonical: string;
}) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    author: { "@type": "Person", name: post.author },
    datePublished: post.date,
    dateModified: post.date,
    publisher: {
      "@type": "Organization",
      name: "CrackGate",
      url: "https://crackgate.in",
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": `https://crackgate.in${canonical}` },
  };

  const paragraphs = post.body.split("\n\n");
  const mins = readTime(post.body);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <article className="max-w-3xl mx-auto px-5 py-10">
        <div className="mb-8">
          <Breadcrumb crumbs={[
            { label: "Home", href: "/" },
            { label: crumbLabel, href: indexHref },
            { label: post.title },
          ]} />
          <div className="flex items-center justify-between">
            <Link href={indexHref} className="text-sm text-muted hover:text-ink">← {indexLabel}</Link>
            <ShareOnWhatsApp />
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {post.tags.map((t) => (
              <span key={t} className="badge bg-brand/10 text-brand text-xs">{t}</span>
            ))}
          </div>
          <h1 className="text-3xl lg:text-4xl font-extrabold mt-3 leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted">
            <span>{post.author}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.date}>{fmt(post.date)}</time>
            <span aria-hidden>·</span>
            <span>{mins} min read</span>
          </div>
          <p className="text-muted mt-4 text-lg leading-relaxed">{post.description}</p>
        </div>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          {paragraphs.map((p, i) => {
            if (p.startsWith("## ")) {
              return <h2 key={i} className="text-2xl font-bold mt-10 mb-4">{p.replace("## ", "")}</h2>;
            }
            if (p.startsWith("|")) {
              return <TableBlock key={i} text={p} />;
            }
            if (p.startsWith("**")) {
              return <p key={i} className="font-semibold text-ink mt-6 mb-2">{p.replace(/\*\*/g, "")}</p>;
            }
            return <p key={i} className="text-ink/90 leading-relaxed mb-4">{p}</p>;
          })}
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <Link href={indexHref} className="text-sm text-brand hover:underline">← Back to {indexLabel.toLowerCase()}</Link>
        </div>

        {post.cta && (
          <div className="mt-8 rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center">
            <h2 className="text-lg font-bold text-ink">{post.cta.label}</h2>
            <Link href={post.cta.href} className="btn btn-primary mt-4">
              Start preparing now →
            </Link>
          </div>
        )}
      </article>

      <div className="border-t border-line bg-paper/40">
        <div className="max-w-3xl mx-auto px-5 py-12 text-center">
          <h3 className="text-lg font-bold text-ink">Get exam tips & updates</h3>
          <p className="mt-1 text-sm text-muted">New posts, GATE notifications, and prep strategies — once a week.</p>
          <div className="mt-4 flex justify-center">
            <NewsletterForm source="blog" />
          </div>
        </div>
      </div>
    </>
  );
}

function TableBlock({ text }: { text: string }) {
  const rows = text.split("\n").filter(Boolean);
  const headers = rows[0]?.split("|").filter(Boolean).map((s) => s.trim()) ?? [];
  const data = rows.slice(2).map((r) => r.split("|").filter(Boolean).map((s) => s.trim()));
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-100">
            {headers.map((h) => <th key={h} className="px-4 py-2 text-left font-semibold">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-line">
              {row.map((cell, j) => <td key={j} className="px-4 py-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
