// NCL (Northern Coalfields Limited) exam tracks — diploma-level
// recruitment exams. Mining Sirdar (254 posts) and Surveyor (5 posts).
// Advt. No. NCL/SING/HR/Direct-Recruitment/2026-27/246 dated 10.07.2026.

export type NclExam = {
  slug: string;
  short: string;
  name: string;
  live: boolean;
  mockCount: number;
  freeMocks: number;
  price: number;
};

export const NCL_EXAMS: NclExam[] = [
  {
    slug: "mining-sirdar",
    short: "Mining Sirdar",
    name: "NCL Mining Sirdar T&S Gr. C",
    live: true,
    mockCount: 20,
    freeMocks: 0,
    price: 399,
  },
  {
    slug: "surveyor",
    short: "Surveyor (Mining)",
    name: "NCL Surveyor T&S Gr. B",
    live: true,
    mockCount: 20,
    freeMocks: 0,
    price: 399,
  },
];

export function nclExamHref(e: NclExam): string | undefined {
  return e.live ? `/diploma/ncl/${e.slug}` : undefined;
}
