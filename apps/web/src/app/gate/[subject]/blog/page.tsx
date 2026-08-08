import Link from "next/link";
import { getGateSubject, KNOWN_COMING_SOON } from "@/data/gate/registry";
import { getBlogPostsForSubject } from "@/data/blog";
import { BlogPostCard } from "@/components/blog-shared";

export async function generateMetadata(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  const label = meta?.label ?? subject.charAt(0).toUpperCase() + subject.slice(1);
  return {
    title: `GATE ${label} Blog · CrackGate`,
    description: `GATE ${label} strategy guides, study plans and exam tips — written by IIT Kharagpur alumni.`,
    alternates: { canonical: `/gate/${subject}/blog` },
  };
}

export default async function GateSubjectBlog(props: { params: Promise<{ subject: string }> }) {
  const { subject } = await props.params;
  const meta = getGateSubject(subject);
  const label = meta?.label ?? (KNOWN_COMING_SOON.has(subject) ? subject : undefined);
  const code = meta?.code ?? subject.slice(0, 3).toUpperCase();
  const posts = getBlogPostsForSubject(subject);
  const title = label ? `GATE ${label} (${code})` : `GATE ${subject.charAt(0).toUpperCase() + subject.slice(1)}`;

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-ink">{title} Blog</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Strategy guides, study plans and exam tips for {title} aspirants — separate from the global
        CrackGate blog so you only see what&apos;s relevant to this paper.
      </p>

      <div className="mt-10 grid gap-6">
        {posts.length > 0 ? (
          posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} href={`/gate/${subject}/blog/${post.slug}`} />
          ))
        ) : (
          <div className="card p-8 text-center">
            <p className="text-lg font-semibold text-ink">No posts yet for {title}</p>
            <p className="mt-2 text-sm text-muted">
              We&apos;re authoring subject-specific guides right now. Meanwhile, check out the{" "}
              <Link href="/blog" className="text-brand hover:underline">global CrackGate blog</Link>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
