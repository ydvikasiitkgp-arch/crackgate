import Link from "next/link";
import { CilAdBanner } from "@/components/cil-ad-banner";
import { CIL_RECRUITMENT_URL } from "@/data/cil";

export const metadata = {
  title: "News & Notifications · CrackGate",
  description:
    "Latest GATE, PSU and mining engineering exam notifications. Coal India Limited recruitment, DGMS updates, and important exam dates for mining professionals.",
  alternates: { canonical: "/news" },
};

type NewsItem = {
  tag: string;
  title: string;
  date: string;
  href: string;
  external?: boolean;
};

const NEWS: NewsItem[] = [
  {
    tag: "Recruitment",
    title: "Coal India Limited — Management Trainee 2026 notification",
    date: "Jun 2026",
    href: CIL_RECRUITMENT_URL,
    external: true,
  },
];

export default function NewsPage() {
  return (
    <>
      <section className="max-w-7xl mx-auto px-5 pt-14">
        <span className="badge bg-brand/10 text-brand">News &amp; Notifications</span>
        <h1 className="mt-4 text-4xl font-extrabold text-ink">Latest updates</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Recruitment alerts, exam notifications and platform updates for GATE Mining and PSU aspirants.
        </p>
      </section>

      <div className="mt-8">
        <CilAdBanner />
      </div>

      <section className="max-w-7xl mx-auto px-5 py-14">
        <div className="grid gap-4">
          {NEWS.map((n) => {
            const inner = (
              <div className="card flex items-center justify-between gap-4 p-5 transition hover:shadow-pop">
                <div>
                  <span className="badge badge-pro">{n.tag}</span>
                  <h3 className="mt-2 font-bold text-ink">{n.title}</h3>
                  <p className="mt-1 text-xs text-muted">{n.date}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-brand">
                  {n.external ? "Open ↗" : "View →"}
                </span>
              </div>
            );
            return n.external ? (
              <a key={n.title} href={n.href} target="_blank" rel="noopener noreferrer">
                {inner}
              </a>
            ) : (
              <Link key={n.title} href={n.href}>
                {inner}
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
