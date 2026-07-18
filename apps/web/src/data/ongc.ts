// ONGC CBT recruitment disciplines.
// Pattern: 85 MCQ · 120 min · No negative marking.
// Sections: Domain Knowledge (40), Aptitude (25), General Awareness (10), English (10).

export type OngcRow = {
  slug: string;
  discipline: string;
  qualification: string;
  vacancies: { ur: number; obc: number; sc: number; st: number; ews: number; total: number };
};

export const ONGC_ROWS: OngcRow[] = [
  { slug: "ongc-petroleum", discipline: "Petroleum Engineering", qualification: "Graduate Degree in Petroleum Engineering with minimum 60% marks", vacancies: { ur: 4, obc: 2, sc: 2, st: 0, ews: 1, total: 9 } },
  { slug: "ongc-mechanical", discipline: "Mechanical Engineering", qualification: "Graduate Degree in Mechanical Engineering with minimum 60% marks", vacancies: { ur: 12, obc: 6, sc: 5, st: 1, ews: 3, total: 27 } },
  { slug: "ongc-chemical", discipline: "Chemical Engineering", qualification: "Graduate Degree in Chemical Engineering with minimum 60% marks", vacancies: { ur: 4, obc: 4, sc: 1, st: 0, ews: 1, total: 10 } },
  { slug: "ongc-instrumentation", discipline: "Instrumentation Engineering", qualification: "Graduate Degree in Instrumentation Engineering with minimum 60% marks", vacancies: { ur: 2, obc: 0, sc: 0, st: 0, ews: 0, total: 2 } },
  { slug: "ongc-geology", discipline: "Geology", qualification: "Post Graduate Degree in Geology with minimum 60% marks", vacancies: { ur: 2, obc: 0, sc: 1, st: 0, ews: 1, total: 4 } },
];

/** Price to unlock a single ONGC discipline's 15-mock series, in paise (₹499). */
export const ONGC_PRICE_PAISE = 49900;
export const ONGC_PRICE_RUPEES = Math.round(ONGC_PRICE_PAISE / 100);

/** Look up an ONGC discipline by its URL slug. */
export function getOngcDiscipline(slug: string): OngcRow | undefined {
  return ONGC_ROWS.find((r) => r.slug === slug);
}

// Official ONGC recruitment notification (Advt. No. 1/2025 R&P).
export const ONGC_RECRUITMENT_URL =
  "https://www.ongcindia.com/web/eng/detail?assetEntry=84777603&assetClassPK=84777498";
