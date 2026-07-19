// WCL (Western Coalfields Limited) exam tracks — the diploma-level
// recruitment exams CrackGate prepares for. Today both Mining Sirdar
// and Assistant Foreman (Electrical) are live with 20 mocks each.

export type WclExam = {
  /** URL segment under /diploma/wcl (e.g. "mining-sirdar"). */
  slug: string;
  /** Short label shown in nav. */
  short: string;
  /** Full exam name. */
  name: string;
  /** Whether the track has live content. */
  live: boolean;
  /** Total mocks available. */
  mockCount: number;
  /** Number of free mocks. */
  freeMocks: number;
  /** Price in INR for all pro mocks (one-time). */
  price: number;
};

export const WCL_EXAMS: WclExam[] = [
  {
    slug: "mining-sirdar",
    short: "Mining Sirdar",
    name: "WCL Mining Sirdar",
    live: true,
    mockCount: 20,
    freeMocks: 0,
    price: 399,
  },
  {
    slug: "assistant-foreman-electrical",
    short: "Asst. Foreman (Electrical)",
    name: "WCL Assistant Foreman (Electrical)",
    live: true,
    mockCount: 20,
    freeMocks: 0,
    price: 399,
  },
];

export function wclExamHref(e: WclExam): string | undefined {
  return e.live ? `/diploma/wcl/${e.slug}` : undefined;
}
