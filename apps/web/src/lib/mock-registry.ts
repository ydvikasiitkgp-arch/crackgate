// Unified mock resolver — bridges the GATE mock catalogue (`MOCKS`) and the CIL
// MT question bank (`CIL_MOCK_BANK`) behind one lookup. Used by the runner page
// and the attempts grading API so both exam families share one code path while
// keeping their distinct gating (plan-tier vs per-discipline entitlement) and
// marking rules (GATE negative marking vs CIL none).

import { MOCKS } from "@/data/mocks";
import { CIL_MOCK_BANK, cilMockIds } from "@/data/cil-mock-bank";
import { ONGC_MOCK_BANK, ongcMockIds } from "@/data/ongc-mock-bank";
import { CE_MOCKS } from "@/data/gate/civil/mocks";
import { ES_MOCKS } from "@/data/gate/environment/mocks";
import { GG_MOCKS } from "@/data/gate/geology/mocks";
import { STATE_MOCKS } from "@/data/state/mocks";
import { DIPLOMA_MOCKS } from "@/data/diploma/mocks";
import type { Question } from "@/lib/grading";

export type MockGate =
  | { type: "plan"; tier: "free" | "subject" | "premium" }
  | { type: "entitlement"; exam: "PSU"; subject: string }
  | { type: "entitlement"; exam: "GATE"; subject: string; freeTrial?: boolean }
  | { type: "entitlement"; exam: "DIPLOMA"; subject: string };

export type ResolvedMock = {
  id: string;
  title: string;
  questions: Question[];
  durationSec: number;
  negativeMarking: boolean;
  gate: MockGate;
};

/** Resolve a mock id to its questions, duration, marking rule and access gate. */
export function resolveMock(id: string): ResolvedMock | null {
  if (id.startsWith("ce-mock-")) {
    const m = CE_MOCKS.find((x) => (x as { id: string }).id === id) as
      | { id: string; title: string; tier?: string; duration?: number; questions: unknown[] }
      | undefined;
    if (!m) return null;
    return {
      id: m.id,
      title: m.title,
      questions: m.questions as unknown as Question[],
      durationSec: (m.duration ?? 180) * 60,
      negativeMarking: true,
      gate: { type: "entitlement", exam: "GATE", subject: "civil", freeTrial: m.tier === "free" },
    };
  }

  if (id.startsWith("es-mock-")) {
    const m = ES_MOCKS.find((x) => (x as { id: string }).id === id) as
      | { id: string; title: string; tier?: string; duration?: number; questions: unknown[] }
      | undefined;
    if (!m) return null;
    return {
      id: m.id,
      title: m.title,
      questions: m.questions as unknown as Question[],
      durationSec: (m.duration ?? 180) * 60,
      negativeMarking: true,
      gate: { type: "entitlement", exam: "GATE", subject: "environment", freeTrial: m.tier === "free" },
    };
  }

  if (id.startsWith("gg-mock-")) {
    const m = GG_MOCKS.find((x) => (x as { id: string }).id === id) as
      | { id: string; title: string; tier?: string; duration?: number; questions: unknown[] }
      | undefined;
    if (!m) return null;
    return {
      id: m.id,
      title: m.title,
      questions: m.questions as unknown as Question[],
      durationSec: (m.duration ?? 180) * 60,
      negativeMarking: true,
      gate: { type: "entitlement", exam: "GATE", subject: "geology", freeTrial: m.tier === "free" },
    };
  }

  if (id.startsWith("ongc-")) {
    const set = ONGC_MOCK_BANK.get(id);
    if (!set) return null;
    return {
      id,
      title: set.title,
      questions: set.questions,
      durationSec: (set.durationMin ?? 120) * 60,
      negativeMarking: set.negativeMarking ?? false,
      gate: { type: "entitlement", exam: "PSU", subject: set.slug },
    };
  }

  if (id.startsWith("cil-")) {
    const set = CIL_MOCK_BANK.get(id);
    if (!set) return null;
    return {
      id,
      title: set.title,
      questions: set.questions,
      durationSec: (set.durationMin ?? 180) * 60,
      negativeMarking: set.negativeMarking ?? false,
      gate: { type: "entitlement", exam: "PSU", subject: set.slug },
    };
  }

  // WCL mocks — entitlement-gated per exam (₹399 unlocks all 19 pro mocks).
  if (id.startsWith("diploma-wcl-sirdar-")) {
    const m = DIPLOMA_MOCKS.find((x) => (x as { id: string }).id === id) as
      | { id: string; title: string; tier?: string; duration?: number; questions: unknown[] }
      | undefined;
    if (!m) return null;
    return {
      id: m.id,
      title: m.title,
      questions: m.questions as unknown as Question[],
      durationSec: (m.duration ?? 120) * 60,
      negativeMarking: false,
      gate: { type: "entitlement", exam: "DIPLOMA", subject: "wcl-sirdar" },
    };
  }

  if (id.startsWith("diploma-wcl-foreman-")) {
    const m = DIPLOMA_MOCKS.find((x) => (x as { id: string }).id === id) as
      | { id: string; title: string; tier?: string; duration?: number; questions: unknown[] }
      | undefined;
    if (!m) return null;
    return {
      id: m.id,
      title: m.title,
      questions: m.questions as unknown as Question[],
      durationSec: (m.duration ?? 120) * 60,
      negativeMarking: false,
      gate: { type: "entitlement", exam: "DIPLOMA", subject: "wcl-af-electrical" },
    };
  }

  // NCL mocks — entitlement-gated per exam (₹399 unlocks all 19 pro mocks).
  if (id.startsWith("diploma-ncl-sirdar-")) {
    const m = DIPLOMA_MOCKS.find((x) => (x as { id: string }).id === id) as
      | { id: string; title: string; tier?: string; duration?: number; questions: unknown[] }
      | undefined;
    if (!m) return null;
    return {
      id: m.id,
      title: m.title,
      questions: m.questions as unknown as Question[],
      durationSec: (m.duration ?? 120) * 60,
      negativeMarking: false,
      gate: { type: "entitlement", exam: "DIPLOMA", subject: "ncl-mining-sirdar" },
    };
  }

  if (id.startsWith("diploma-ncl-surveyor-")) {
    const m = DIPLOMA_MOCKS.find((x) => (x as { id: string }).id === id) as
      | { id: string; title: string; tier?: string; duration?: number; questions: unknown[] }
      | undefined;
    if (!m) return null;
    return {
      id: m.id,
      title: m.title,
      questions: m.questions as unknown as Question[],
      durationSec: (m.duration ?? 120) * 60,
      negativeMarking: false,
      gate: { type: "entitlement", exam: "DIPLOMA", subject: "ncl-surveyor" },
    };
  }

  // Legacy STATE / DIPLOMA (coal-sirdar, overman — plan-tier gated).
  if (id.startsWith("state-") || id.startsWith("diploma-")) {
    const isState = id.startsWith("state-");
    const pool = isState ? STATE_MOCKS : DIPLOMA_MOCKS;
    const m = pool.find((x) => (x as { id: string }).id === id) as
      | { id: string; title: string; tier?: string; duration?: number; questions: unknown[] }
      | undefined;
    if (!m) return null;
    // Map tier: "pro" → "subject" (WCL mocks use "pro" for paid tier)
    const tier = m.tier === "free" ? "free" : m.tier === "premium" ? "premium" : "subject";
    return {
      id: m.id,
      title: m.title,
      questions: m.questions as unknown as Question[],
      durationSec: (m.duration ?? (isState ? 150 : 120)) * 60,
      negativeMarking: isState,
      gate: { type: "plan", tier },
    };
  }

  const m = MOCKS.find((x) => (x as { id: string }).id === id) as
    | { id: string; title: string; tier: "free" | "subject" | "premium"; duration?: number; questions: unknown[] }
    | undefined;
  if (!m) return null;
  return {
    id: m.id,
    title: m.title,
    questions: m.questions as unknown as Question[],
    durationSec: (m.duration ?? 180) * 60,
    negativeMarking: true,
    gate: { type: "plan", tier: m.tier },
  };
}

/** Every resolvable mock id (GATE catalogue + CE mocks + shipped CIL sets + STATE/DIPLOMA). */
export function allMockIds(): string[] {
  return [
    ...MOCKS.map((m) => (m as { id: string }).id),
    ...CE_MOCKS.map((m) => (m as { id: string }).id),
    ...ES_MOCKS.map((m) => (m as { id: string }).id),
    ...GG_MOCKS.map((m) => (m as { id: string }).id),
    ...cilMockIds(),
    ...ongcMockIds(),
    ...STATE_MOCKS.map((m) => (m as { id: string }).id),
    ...DIPLOMA_MOCKS.map((m) => (m as { id: string }).id),
  ];
}
