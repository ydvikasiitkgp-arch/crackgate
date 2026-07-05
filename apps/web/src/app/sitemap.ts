import type { MetadataRoute } from "next";
import { LEARN_TOPICS } from "@/data/learn";
import { STUDY_NOTES } from "@/data/study-notes";
import { CIL_ROWS } from "@/data/cil";
import { liveGateSubjects, getGateSubject } from "@/data/gate/registry";

const base = "https://crackgate.in";

function entry(path: string, freq: MetadataRoute.Sitemap[number]["changeFrequency"], priority: number): MetadataRoute.Sitemap[number] {
  return { url: `${base}${path}`, lastModified: new Date(), changeFrequency: freq, priority };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const routes: MetadataRoute.Sitemap = [

    // ── Landing / Core ──
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/gate`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // ── GATE Mining (MN) — legacy flat routes ──
    { url: `${base}/gate/mining`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/practice`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/mocks`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/aits`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/study`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },

    // ── GATE Mining (MN) — Learn topics ──
    ...LEARN_TOPICS.map((t) => ({
      url: `${base}/learn/${t.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // ── GATE Mining (MN) — Study notes ──
    ...STUDY_NOTES.map((n) => ({
      url: `${base}/study/${n.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // ── GATE Subject mini-sites (Civil, Geology, Environment) ──
    ...liveGateSubjects().flatMap((slug) => {
      const meta = getGateSubject(slug);
      if (!meta) return [];
      const subPages: MetadataRoute.Sitemap = [
        { url: `${base}/gate/${slug}`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
        { url: `${base}/gate/${slug}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${base}/gate/${slug}/practice`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${base}/gate/${slug}/mocks`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        { url: `${base}/gate/${slug}/aits`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
        // Per-subject learn topics
        ...meta.learnTopics.map((t) => ({
          url: `${base}/gate/${slug}/learn/${t.slug}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        })),
      ];
      return subPages;
    }),

    // ── PSU / CIL ──
    { url: `${base}/psu`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/psu/cil`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...CIL_ROWS.map((r) => ({
      url: `${base}/psu/cil/${r.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),

    // ── State & Diploma ──
    { url: `${base}/state`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/diploma`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },

    // ── Info pages ──
    { url: `${base}/resources`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/news`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },

    // ── Legal ──
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/refund`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  return routes;
}
