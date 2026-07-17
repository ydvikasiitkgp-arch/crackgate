// CrackGate — Exam & Subject catalog (single source of truth).
//
// Drives the admin payments dashboard (grant form + filters) and payment
// attribution. Each subject can be `live` (purchasable / content available) or
// "coming soon". Pricing is per-subject so different tracks can diverge later;
// today only GATE → Mining is live.
//
// NOTE: This catalog governs *attribution & access records*. Wiring entitlements
// into mock/practice/AITS gating is a separate follow-up — see /admin notes.

import { CIL_ROWS } from "./cil";
import { ONGC_ROWS } from "./ongc";

export type ExamTrack = "GATE" | "PSU" | "STATE" | "DIPLOMA";

export type SubjectPrice = {
  /** Pro tier price in paise (e.g. 49900 = ₹499). */
  proPaise: number;
  /** Premium tier price in paise (e.g. 89900 = ₹899). */
  premiumPaise: number;
};

export type CatalogSubject = {
  /** URL/storage-safe identifier, unique within its exam. */
  slug: string;
  /** Human label shown in the UI. */
  label: string;
  /** Whether the subject is purchasable / has live content today. */
  live: boolean;
  /** Per-subject pricing. Present for live subjects; optional for "soon". */
  price?: SubjectPrice;
};

export type CatalogExam = {
  exam: ExamTrack;
  /** Display label for the exam track. */
  label: string;
  subjects: CatalogSubject[];
};

// Default GATE pricing (currently uniform across GATE subjects).
const GATE_PRICE: SubjectPrice = { proPaise: 49900, premiumPaise: 89900 };

// STATE / DIPLOMA recruitment-exam pricing (lower band than GATE).
const STATE_PRICE: SubjectPrice = { proPaise: 29900, premiumPaise: 49900 };
const DIPLOMA_PRICE: SubjectPrice = { proPaise: 19900, premiumPaise: 34900 };

export const CATALOG: CatalogExam[] = [
  {
    exam: "GATE",
    label: "GATE",
    subjects: [
      { slug: "mining", label: "Mining Engineering (MN)", live: true, price: GATE_PRICE },
      { slug: "civil", label: "Civil Engineering (CE)", live: true, price: GATE_PRICE },
      { slug: "geology", label: "Geology and Geophysics (GG)", live: true, price: GATE_PRICE },
      { slug: "environment", label: "Environmental Science and Engineering (ES)", live: true, price: GATE_PRICE },
      { slug: "geomatics", label: "Geomatics Engineering (GE)", live: false, price: GATE_PRICE },
      { slug: "textile", label: "Textile Engineering and Fibre Science (TF)", live: false, price: GATE_PRICE },
      { slug: "life-sciences", label: "Life Sciences (XL)", live: false, price: GATE_PRICE },
      { slug: "ecology", label: "Ecology and Evolution (EY)", live: false, price: GATE_PRICE },
      { slug: "agricultural", label: "Agricultural Engineering (AG)", live: false, price: GATE_PRICE },
    ],
  },
  {
    exam: "PSU",
    label: "PSU · Coal India (CIL)",
    // PSU CIL disciplines are not live yet — recorded for attribution only.
    subjects: CIL_ROWS.map((r) => ({
      slug: r.slug,
      label: r.discipline,
      live: false,
    })),
  },
  {
    exam: "PSU",
    label: "PSU · ONGC",
    subjects: ONGC_ROWS.map((r) => ({
      slug: r.slug,
      label: r.discipline,
      live: false,
    })),
  },
  {
    exam: "STATE",
    label: "State Level",
    subjects: [
      {
        slug: "rpsc-ame",
        label: "Assistant Mining Engineer (RPSC, Rajasthan)",
        live: true,
        price: STATE_PRICE,
      },
      // Researched, content pending — recorded for attribution only.
      { slug: "cgpsc-mining-officer", label: "Mining Officer / Inspector (CGPSC, Chhattisgarh)", live: false },
      { slug: "general", label: "General", live: false },
    ],
  },
  {
    exam: "DIPLOMA",
    label: "Diploma",
    subjects: [
      {
        slug: "coal-sirdar-overman",
        label: "Mining Sirdar / Jr. Overman (Coalfields CBT)",
        live: true,
        price: DIPLOMA_PRICE,
      },
      { slug: "general", label: "General", live: false },
    ],
  },
];

/** All valid exam-track codes, in display order. */
export const EXAM_TRACKS: ExamTrack[] = CATALOG.map((e) => e.exam);

/** Look up an exam entry by its track code. */
export function getExam(exam: string): CatalogExam | undefined {
  return CATALOG.find((e) => e.exam === exam);
}

/** Look up a subject within an exam by slug. */
export function getSubject(
  exam: string,
  subject: string,
): CatalogSubject | undefined {
  return getExam(exam)?.subjects.find((s) => s.slug === subject);
}

/** Flat list of every exam+subject pair (for filters / iteration). */
export function allSubjects(): { exam: ExamTrack; subject: CatalogSubject }[] {
  return CATALOG.flatMap((e) =>
    e.subjects.map((s) => ({ exam: e.exam, subject: s })),
  );
}

/** Only the exam+subject pairs that are live (purchasable today). */
export function liveSubjects(): { exam: ExamTrack; subject: CatalogSubject }[] {
  return allSubjects().filter((x) => x.subject.live);
}

/** Resolve a subject's price, falling back to GATE default when unset. */
export function subjectPrice(exam: string, subject: string): SubjectPrice {
  return getSubject(exam, subject)?.price ?? GATE_PRICE;
}

/** Human label for an exam+subject pair, e.g. "GATE · Mining (MN)". */
export function subjectLabel(exam: string, subject: string): string {
  const e = getExam(exam);
  const s = e?.subjects.find((x) => x.slug === subject);
  return `${e?.label ?? exam} · ${s?.label ?? subject}`;
}

/** The default exam+subject used for backfill / legacy rows (GATE Mining). */
export const DEFAULT_EXAM: ExamTrack = "GATE";
export const DEFAULT_SUBJECT = "mining";
