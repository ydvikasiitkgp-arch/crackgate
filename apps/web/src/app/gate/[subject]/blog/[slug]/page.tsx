import { notFound } from "next/navigation";
import { getGateSubject } from "@/data/gate/registry";
import { getBlogPost, isBlogPostInSubject } from "@/data/blog";
import { BlogArticle } from "@/components/blog-shared";

export async function generateMetadata(props: { params: Promise<{ subject: string; slug: string }> }) {
  const { subject, slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post || !isBlogPostInSubject(post, subject)) return { title: "Blog · CrackGate" };
  const meta = getGateSubject(subject);
  const label = meta?.label ?? subject;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/gate/${subject}/blog/${slug}` },
    openGraph: {
      type: "article",
      images: [{ url: `/api/og?subject=GATE ${label}&title=${encodeURIComponent(post.title)}`, alt: post.title }],
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function GateSubjectBlogPost(props: { params: Promise<{ subject: string; slug: string }> }) {
  const { subject, slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post || !isBlogPostInSubject(post, subject)) notFound();

  const meta = getGateSubject(subject);
  const label = meta?.label ?? subject.charAt(0).toUpperCase() + subject.slice(1);

  return (
    <BlogArticle
      post={post}
      indexHref={`/gate/${subject}/blog`}
      indexLabel={`All ${label} posts`}
      crumbLabel={`${label} Blog`}
      canonical={`/gate/${subject}/blog/${slug}`}
    />
  );
}
