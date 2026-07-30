// Track resolution for the dashboard.
//
// A user's dashboard is scoped to a *track* — a coherent exam+subject unit they
// own (e.g. GATE · Mining, or PSU · CIL Electrical). This module turns a user's
// entitlements (plus admin status) into the list of tracks they can view and
// picks the active one from the `?track=` query param.
//
// Only tracks that have shipped content render a rich dashboard:
//  - "mining" → GATE Mining (full practice + mocks + syllabus)
//  - "cil"    → a PSU · CIL discipline (mock series + section analytics)
// Any other owned entitlement is surfaced as a "soon" track so a purchase is
// never hidden, but its body shows a "content on the way" placeholder.

import type { UserEntitlement } from "@/lib/entitlements";
import { getExam, subjectLabel, CATALOG, type ExamTrack } from "@/data/catalog";
import { cilLiveSetNos } from "@/data/cil-mock-bank";
import { ongcLiveSetNos } from "@/data/ongc-mock-bank";
import { getCilDiscipline } from "@/data/cil";
import { getOngcDiscipline } from "@/data/ongc";

export type DashboardTrackKind = "mining" | "cil" | "civil" | "ongc" | "diploma" | "soon";

export type DashboardTrack = {
  /** URL-safe key used in `?track=`, e.g. "gate-mining", "psu-electrical". */
  key: string;
  exam: ExamTrack;
  /** Subject slug within the exam (e.g. "mining", "electrical"). */
  subject: string;
  /** Human label, e.g. "GATE · Mining (MN)". */
  label: string;
  /** Short label for the switcher pill, e.g. "Mining (MN)" or "CIL · Electrical". */
  shortLabel: string;
  kind: DashboardTrackKind;
};

/** Build the stable track key for an exam+subject pair. */
export function trackKey(exam: string, subject: string): string {
  return `${exam}-${subject}`.toLowerCase();
}

function kindFor(exam: string, subject: string): DashboardTrackKind {
  if (exam === "GATE" && subject === "mining") return "mining";
  if (exam === "GATE" && subject === "civil") return "civil";
  if (exam === "PSU" && cilLiveSetNos(subject).size > 0) return "cil";
  if (exam === "PSU" && ongcLiveSetNos(subject).size > 0) return "ongc";
  if (exam === "DIPLOMA") return "diploma";
  return "soon";
}

function shortLabelFor(exam: string, subject: string): string {
  if (exam === "PSU") {
    const cil = getCilDiscipline(subject);
    if (cil) return `CIL · ${cil.discipline}`;
    const ongc = getOngcDiscipline(subject);
    if (ongc) return `ONGC · ${ongc.discipline}`;
    return `PSU · ${subject}`;
  }
  const s = getExam(exam)?.subjects.find((x) => x.slug === subject);
  return s?.label ?? subject;
}

function toTrack(exam: string, subject: string): DashboardTrack {
  return {
    key: trackKey(exam, subject),
    exam: exam as ExamTrack,
    subject,
    label: subjectLabel(exam, subject),
    shortLabel: shortLabelFor(exam, subject),
    kind: kindFor(exam, subject),
  };
}

/** Every track that has shipped content (used for admin preview + the chooser). */
export function allContentTracks(): DashboardTrack[] {
  const tracks: DashboardTrack[] = [toTrack("GATE", "mining"), toTrack("GATE", "civil")];
  for (const e of CATALOG.filter((x) => x.exam === "PSU")) {
    for (const s of e.subjects) {
      if (cilLiveSetNos(s.slug).size > 0 || ongcLiveSetNos(s.slug).size > 0)
        tracks.push(toTrack("PSU", s.slug));
    }
  }
  return tracks;
}

/**
 * Resolve which tracks a user can view on their dashboard.
 *
 * - Admins see every track that has content (so the founder can preview them).
 * - Everyone else sees one track per active (non-expired) entitlement.
 * Returns an empty array when a non-admin user owns nothing → caller shows the
 * neutral "choose your exam" state.
 */
export function resolveDashboardTracks(
  entitlements: UserEntitlement[],
  isAdmin: boolean,
): DashboardTrack[] {
  if (isAdmin) return allContentTracks();

  const seen = new Set<string>();
  const tracks: DashboardTrack[] = [];
  for (const e of entitlements) {
    if (e.expired) continue;
    const key = trackKey(e.exam, e.subject);
    if (seen.has(key)) continue;
    seen.add(key);
    tracks.push(toTrack(e.exam, e.subject));
  }
  return tracks;
}

/** Pick the active track from a requested key, falling back to the first owned. */
export function pickActiveTrack(
  tracks: DashboardTrack[],
  requestedKey: string | undefined,
): DashboardTrack | null {
  if (tracks.length === 0) return null;
  if (requestedKey) {
    const match = tracks.find((t) => t.key === requestedKey);
    if (match) return match;
  }
  return tracks[0];
}
