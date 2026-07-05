export type Crumb = { label: string; href?: string };

export function BreadcrumbJsonLd({ crumbs }: { crumbs: Crumb[] }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `https://crackgate.in${c.href}` } : {}),
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <BreadcrumbJsonLd crumbs={crumbs} />
      <nav aria-label="Breadcrumb" className="mb-4">
        <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          {crumbs.map((c, i) => {
            const isLast = i === crumbs.length - 1;
            return (
              <li key={c.label} className="flex items-center gap-1.5">
                {i > 0 && <span aria-hidden>/</span>}
                {c.href && !isLast ? (
                  <a href={c.href} className="hover:text-ink transition-colors">
                    {c.label}
                  </a>
                ) : (
                  <span className={isLast ? "text-ink font-medium" : ""}>{c.label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
