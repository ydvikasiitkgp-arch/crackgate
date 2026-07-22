/** Centralized combo definitions — single source of truth.
 *  All combo-related logic (UPI page, submit API, approve API, grant API,
 *  admin form) imports from here. If a combo changes, only this file needs updating. */

import { type ExamTrack } from "@/data/catalog";

export interface ComboEntitlement {
  exam: ExamTrack;
  subject: string;
}

export interface ComboDefinition {
  /** The slug used in query strings and UpiPayment.subject column. */
  slug: string;
  /** Human-friendly label shown in UI. */
  label: string;
  /** Price in paise. */
  pricePaise: number;
  /** Validity in months. */
  months: number;
  /** Entitlements created on approval. */
  entitlements: ComboEntitlement[];
}

export const COMBOS: Record<string, ComboDefinition> = {
  "combo-wcl-ncl-mining-sirdar": {
    slug: "combo-wcl-ncl-mining-sirdar",
    label: "WCL + NCL Mining Sirdar Combo",
    pricePaise: 59900,
    months: 18,
    entitlements: [
      { exam: "DIPLOMA", subject: "wcl-sirdar" },
      { exam: "DIPLOMA", subject: "ncl-mining-sirdar" },
    ],
  },
};

export type ComboKey = keyof typeof COMBOS;

/** Check if a subject slug is a combo. */
export function isComboSlug(slug: string): slug is ComboKey {
  return slug in COMBOS;
}

/** Get a combo definition by slug, or null. */
export function getCombo(slug: string): ComboDefinition | null {
  return COMBOS[slug as ComboKey] ?? null;
}

/** Friendly label for a combo slug, or the slug itself if not a combo. */
export function comboLabel(slug: string): string {
  return getCombo(slug)?.label ?? slug;
}

/** Friendly label for a combo's entitlements, e.g. "WCL Mining Sirdar + NCL Mining Sirdar". */
export function comboEntitlementLabels(slug: string): string[] {
  const c = getCombo(slug);
  if (!c) return [slug];
  return c.entitlements.map((e) => `${e.exam} · ${e.subject}`);
}

// ── Auto-discount combo groups ──────────────────────────────────────
// When 2+ items are in the cart, a 15% combo discount applies.

export const COMBO_DISCOUNT_PCT = 0.15;

export interface CartComboDiscount {
  label: string;
  originalTotalPaise: number;
  discountedTotalPaise: number;
  savingsPaise: number;
}

/** Calculate combo discounts for a set of cart items.
 *  Simple rule: 2+ items → 15% off the total. */
export function calculateComboDiscounts(
  items: { exam: string; subject: string }[],
): CartComboDiscount[] {
  if (items.length < 2) return [];

  const originalTotalPaise = items.reduce((sum, i) => {
    // We need prices — caller must pass pricePaise or we compute from catalog
    return sum + ((i as any).pricePaise ?? 0);
  }, 0);

  if (originalTotalPaise <= 0) return [];

  const savingsPaise = Math.round(originalTotalPaise * COMBO_DISCOUNT_PCT);
  const discountedTotalPaise = originalTotalPaise - savingsPaise;

  return [{
    label: "Combo Discount (15% off)",
    originalTotalPaise,
    discountedTotalPaise,
    savingsPaise,
  }];
}
