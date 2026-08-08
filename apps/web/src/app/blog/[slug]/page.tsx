import { notFound } from "next/navigation";
import { BLOG_POSTS, getBlogPost } from "@/data/blog";
import { BlogArticle } from "@/components/blog-shared";

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog · CrackGate" };
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      images: [{ url: `/api/og?subject=Blog&title=${encodeURIComponent(post.title)}`, alt: post.title }],
      publishedTime: post.date,
      authors: [post.author],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return <BlogArticle post={post} indexHref="/blog" indexLabel="All posts" crumbLabel="Blog" canonical={`/blog/${slug}`} />;
}
