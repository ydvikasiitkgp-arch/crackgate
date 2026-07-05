import type { MetadataRoute } from "next";

// Public, indexable routes only. Auth/functional routes (admin, dashboard,
// login, pay, result, settings, api) are intentionally excluded.
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://crackgate.in";
  const now = new Date();

  const routes: { path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }[] = [
    { path: "/", changeFrequency: "weekly", priority: 1.0 },
    { path: "/gate", changeFrequency: "weekly", priority: 0.9 },
    { path: "/mocks", changeFrequency: "weekly", priority: 0.9 },
    { path: "/practice", changeFrequency: "weekly", priority: 0.9 },
    { path: "/aits", changeFrequency: "weekly", priority: 0.8 },
    { path: "/pricing", changeFrequency: "monthly", priority: 0.9 },
    { path: "/psu", changeFrequency: "monthly", priority: 0.8 },
    { path: "/state", changeFrequency: "monthly", priority: 0.8 },
    { path: "/diploma", changeFrequency: "monthly", priority: 0.7 },
    { path: "/study", changeFrequency: "monthly", priority: 0.8 },
    { path: "/gate/mining", changeFrequency: "weekly", priority: 0.9 },
    { path: "/gate/civil", changeFrequency: "weekly", priority: 0.9 },
    { path: "/gate/geology", changeFrequency: "weekly", priority: 0.9 },
    { path: "/gate/environment", changeFrequency: "weekly", priority: 0.9 },
    { path: "/psu/cil", changeFrequency: "monthly", priority: 0.8 },
    { path: "/learn", changeFrequency: "monthly", priority: 0.8 },
    { path: "/resources", changeFrequency: "monthly", priority: 0.8 },
    { path: "/news", changeFrequency: "weekly", priority: 0.6 },
    { path: "/about", changeFrequency: "yearly", priority: 0.5 },
    { path: "/faq", changeFrequency: "monthly", priority: 0.6 },
    { path: "/contact", changeFrequency: "yearly", priority: 0.5 },
    { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
    { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
    { path: "/refund", changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
