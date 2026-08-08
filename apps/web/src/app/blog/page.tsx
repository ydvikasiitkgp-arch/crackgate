import { BLOG_POSTS } from "@/data/blog";
import { BlogPostCard } from "@/components/blog-shared";

export const metadata = {
  title: "Blog · CrackGate",
  description:
    "GATE Mining, PSU Coal India, and mining engineering exam tips — strategy guides, study plans, syllabus breakdowns, and career advice from IIT Kharagpur alumni.",
  alternates: { canonical: "/blog" },
};

export default function BlogIndex() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <h1 className="text-4xl font-extrabold tracking-tight text-ink">CrackGate Blog</h1>
      <p className="mt-3 text-muted max-w-2xl">
        Exam strategies, study plans, and career guidance for GATE Mining, PSU Coal India, and
        mining engineering aspirants — written by IIT Kharagpur alumni who&apos;ve been through it.
      </p>

      <div className="mt-10 grid gap-6">
        {BLOG_POSTS.map((post) => (
          <BlogPostCard key={post.slug} post={post} href={`/blog/${post.slug}`} />
        ))}
      </div>
    </div>
  );
}
