/**
 * GATE subject registry — the single source of truth that maps a GATE subject
 * slug (e.g. "civil") to its content modules (practice, mocks, learn, aits) and
 * access metadata. New subjects register here once their content exists;
 * until then they are absent and render as "coming soon".
 */
import type { PracticeSubject } from "@/data/practice";
import type { LearnTopic, LearnSyllabusSection, LearnSyllabusSubtopic } from "@/data/learn";
import type { AitsTest } from "@/data/aits";

import { PRACTICE as MN_PRACTICE } from "@/data/practice";
import { MOCKS as MN_MOCKS } from "@/data/mocks";
import { LEARN_TOPICS as MN_LEARN_TOPICS, getLearnTopic as getMiningLearnTopic, getLearnSyllabus as getMiningLearnSyllabus } from "@/data/learn";
import { AITS as MN_AITS } from "@/data/aits";

import { CE_PRACTICE } from "@/data/gate/civil/practice";
import { CE_MOCKS } from "@/data/gate/civil/mocks";
import { CE_LEARN_TOPICS, getCivilLearnTopic, getCivilLearnSyllabus } from "@/data/gate/civil/learn";
import { CE_AITS } from "@/data/gate/civil/aits";

import { GG_PRACTICE } from "@/data/gate/geology/practice";
import { GG_MOCKS } from "@/data/gate/geology/mocks";
import { GG_LEARN_TOPICS, getGeoLearnTopic, getGeoLearnSyllabus } from "@/data/gate/geology/learn";
import { GG_AITS } from "@/data/gate/geology/aits";

import { ES_PRACTICE } from "@/data/gate/environment/practice";
import { ES_MOCKS } from "@/data/gate/environment/mocks";
import { ES_LEARN_TOPICS, getEnvLearnTopic, getEnvLearnSyllabus } from "@/data/gate/environment/learn";
import { ES_AITS } from "@/data/gate/environment/aits";

export type GateMock = {
  id: string;
  title: string;
  tier: "free" | "subject" | "premium";
  duration?: number;
  totalMarks?: number;
  sections?: { name: string; count: number; marks: number }[];
  questions: unknown[];
};

export type CeResolvedSubtopic = LearnSyllabusSubtopic & { topic?: LearnTopic };
export type ResolvedSyllabusSection = Omit<LearnSyllabusSection, "subtopics"> & {
  subtopics: CeResolvedSubtopic[];
  liveCount: number;
};

export interface GateSubject {
  /** URL slug under /gate/<slug>. */
  slug: string;
  /** Display label, e.g. "Civil Engineering". */
  label: string;
  /** Short code shown in chips, e.g. "CE". */
  code: string;
  /** One-line description for the subject home hero. */
  blurb: string;
  /** Entitlement exam key for access checks. */
  accessExam: "GATE";
  /** Entitlement subject key for access checks. */
  accessSubject: string;
  /** Content modules. */
  practice: PracticeSubject[];
  mocks: readonly GateMock[];
  learnTopics: LearnTopic[];
  getLearnTopic: (topicSlug: string) => LearnTopic | undefined;
  getLearnSyllabus: () => ResolvedSyllabusSection[];
  aits: AitsTest[];
}

const SUBJECTS: Record<string, GateSubject> = {
  mining: {
    slug: "mining",
    label: "Mining Engineering",
    code: "MN",
    blurb:
      "Full GATE Mining (MN) preparation — topic-wise learning, an exam-grade practice bank, full-length mocks and a scheduled All India Test Series.",
    accessExam: "GATE",
    accessSubject: "mining",
    practice: MN_PRACTICE,
    mocks: MN_MOCKS as unknown as readonly GateMock[],
    learnTopics: MN_LEARN_TOPICS,
    getLearnTopic: getMiningLearnTopic,
    getLearnSyllabus: getMiningLearnSyllabus,
    aits: MN_AITS,
  },
  civil: {
    slug: "civil",
    label: "Civil Engineering",
    code: "CE",
    blurb:
      "Full GATE Civil (CE) preparation — topic-wise learning, an exam-grade practice bank, full-length mocks and a scheduled All India Test Series.",
    accessExam: "GATE",
    accessSubject: "civil",
    practice: CE_PRACTICE,
    mocks: CE_MOCKS as unknown as readonly GateMock[],
    learnTopics: CE_LEARN_TOPICS,
    getLearnTopic: getCivilLearnTopic,
    getLearnSyllabus: getCivilLearnSyllabus,
    aits: CE_AITS,
  },
  geology: {
    slug: "geology",
    label: "Geology and Geophysics",
    code: "GG",
    blurb:
      "Full GATE Geology & Geophysics (GG) preparation — topic-wise learning, an exam-grade practice bank, full-length mocks and a scheduled All India Test Series.",
    accessExam: "GATE",
    accessSubject: "geology",
    practice: GG_PRACTICE,
    mocks: GG_MOCKS as unknown as readonly GateMock[],
    learnTopics: GG_LEARN_TOPICS,
    getLearnTopic: getGeoLearnTopic,
    getLearnSyllabus: getGeoLearnSyllabus,
    aits: GG_AITS,
  },
  environment: {
    slug: "environment",
    label: "Environmental Science and Engineering",
    code: "ES",
    blurb:
      "Full GATE Environmental Science & Engineering (ES) preparation — topic-wise learning, an exam-grade practice bank, full-length mocks and a scheduled All India Test Series.",
    accessExam: "GATE",
    accessSubject: "environment",
    practice: ES_PRACTICE,
    mocks: ES_MOCKS as unknown as readonly GateMock[],
    learnTopics: ES_LEARN_TOPICS,
    getLearnTopic: getEnvLearnTopic,
    getLearnSyllabus: getEnvLearnSyllabus,
    aits: ES_AITS,
  },
};

/** Subjects that have a fully-built mini-site at /gate/<slug>. */
export function liveGateSubjects(): string[] {
  return Object.keys(SUBJECTS);
}

/** Resolve a subject slug to its registry entry (or undefined if not live). */
export function getGateSubject(slug: string): GateSubject | undefined {
  return SUBJECTS[slug];
}

/** Subjects known to the catalogue but not yet built (render "coming soon"). */
export const KNOWN_COMING_SOON = new Set<string>([
  "aerospace",           // AE  - Aerospace Engineering
  "agricultural",        // AG  - Agricultural Engineering
  "architecture",        // AR  - Architecture and Planning
  "biomedical",          // BM  - Biomedical Engineering
  "biotechnology",       // BT  - Biotechnology
  "chemistry",           // CY  - Chemistry
  "ecology",             // EY  - Ecology and Evolution
  "geomatics",           // GE  - Geomatics Engineering
  "mathematics",         // MA  - Mathematics
  "metallurgical",       // MT  - Metallurgical Engineering
  "naval",               // NM  - Naval Architecture and Marine Engineering
  "petroleum",           // PE  - Petroleum Engineering
  "physics",             // PH  - Physics
  "statistics",          // ST  - Statistics
  "textile",             // TF  - Textile Engineering and Fibre Science
  "engineering-sciences",// XE  - Engineering Sciences
  "humanities",          // XH  - Humanities and Social Sciences
  "life-sciences",       // XL  - Life Sciences
]);
