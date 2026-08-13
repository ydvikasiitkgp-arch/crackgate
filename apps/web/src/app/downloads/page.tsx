import Link from "next/link";
import { DOWNLOAD_ITEMS } from "@/data/downloads";
import { Breadcrumb } from "@/components/breadcrumb";

export const metadata = {
  title: "Downloads · CrackGate",
  description:
    "Downloadable exam patterns, syllabus sheets and reference materials for GATE Mining, PSU exams, CIL MT, DGMS mining safety, NCL/WCL diploma exams and state mining exams — plus official links.",
  alternates: { canonical: "/downloads" },
};

const CATEGORY_ORDER = ["GATE", "PSU — CIL", "CIL DGMS", "Diploma — NCL", "Diploma — WCL", "State Exams"];

export default function DownloadsPage() {
  const categories = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: DOWNLOAD_ITEMS.filter((d) => d.category === cat),
  }));

  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <Breadcrumb crumbs={[{ label: "Home", href: "/" }, { label: "Downloads" }]} />
      <h1 className="mt-4 text-3xl font-extrabold">Downloads &amp; Important Links</h1>
      <p className="mt-2 text-muted">
        Printable exam-pattern sheets, syllabus references and official links for GATE, PSU (CIL MT),
        DGMS mining safety, NCL/WCL diploma and state-level mining exams. Open a sheet and save it as
        PDF from your browser.
      </p>

      {categories.map(({ cat, items }) => (
        <section key={cat} className="mt-10">
          <h2 className="text-2xl font-bold">{cat}</h2>
          <div className="mt-4 space-y-4">
            {items.map((d) => (
              <div key={d.slug} className="card p-6">
                <Link href={`/downloads/${d.slug}`} className="text-lg font-bold hover:text-brand transition-colors">
                  {d.title}
                </Link>
                <p className="text-sm text-muted mt-1.5 leading-relaxed">{d.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/downloads/${d.slug}`} className="btn btn-primary text-sm">
                    Open / Save as PDF
                  </Link>
                </div>
                <div className="mt-4 pt-4 border-t border-line">
                  <h3 className="text-xs font-semibold text-muted uppercase tracking-wide">Important links</h3>
                  <ul className="mt-2 space-y-1.5">
                    {d.links.map((l) => (
                      <li key={l.href + l.label} className="text-sm">
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
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}