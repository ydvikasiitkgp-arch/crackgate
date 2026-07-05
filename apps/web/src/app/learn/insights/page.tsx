import Link from "next/link";
import { PyqAnalyticsDashboard } from "@/components/pyq-analytics-dashboard";
import { PYQ_YEARS, MIN_YEAR, MAX_YEAR, PYQ_TOTAL } from "@/data/pyq-analytics";

export const metadata = {
  title: "GATE MN Exam Insights — Topic & Trend Analysis of Previous Papers",
  description:
    "Interactive analysis of GATE Mining (MN) previous-year papers: topic-wise distribution, year-by-year trends, question-type and marks split, conceptual gaps, trend prediction and a personalised prep plan — all from factual exam metadata.",
  alternates: { canonical: "/learn/insights" },
};

export default function LearnInsights() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <header className="mb-8">
        <Link href="/learn" className="text-sm text-brand hover:underline">← Back to Learn</Link>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold mt-3 mb-3 ml-0 block w-fit">
          📊 EXAM INSIGHTS
        </div>
        <h1 className="text-3xl lg:text-4xl font-extrabold">GATE MN — Topic &amp; Trend Analysis</h1>
        <p className="text-muted mt-3 max-w-3xl">
          What has GATE Mining actually asked, and where should you spend your hours? This dashboard
          analyses <b>{PYQ_TOTAL}</b> questions across <b>{PYQ_YEARS.length}</b> papers
          ({MIN_YEAR}–{MAX_YEAR}) — topic distribution, year-by-year trends, question formats,
          conceptual gaps, a next-paper projection and a personalised prep plan. Use the filters to
          slice by year, section, type and marks; export any view to CSV.
        </p>
      </header>

      <PyqAnalyticsDashboard />
    </div>
  );
}
