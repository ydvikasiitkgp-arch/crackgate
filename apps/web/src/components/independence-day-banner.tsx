import Link from "next/link";
import {
  INDEPENDENCE_DAY_ACTIVE,
  INDEPENDENCE_DAY_DISCOUNT,
  INDEPENDENCE_DAY_PROMO_CODE,
} from "@/lib/celebration";

export function IndependenceDayBanner() {
  if (!INDEPENDENCE_DAY_ACTIVE) return null;

  return (
    <div className="relative z-50" aria-live="polite">
      {/* Smooth tricolour accent line at very top */}
      <div
        aria-hidden
        className="h-[1px] w-full"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, #FF9933 15%, #ffffff 40%, #138808 60%, #138808 85%, transparent 95%)',
          opacity: 0.85
        }}
      />
      <div
        aria-hidden
        className="h-[1px] w-full"
        style={{
          background: 'linear-gradient(90deg, transparent 5%, #FF9933 15%, #ffffff 40%, #138808 60%, #138808 85%, transparent 95%)',
          opacity: 0.85
        }}
      />

      {/* Single-line centered promo bar */}
      <div className="bg-[#0f172a]/95 backdrop-blur-sm border-b border-white/5">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-2.5 text-sm">
          <span className="text-xl shrink-0" aria-hidden>🇮🇳</span>
          <span className="font-medium text-white">
            Independence Day Offer — {INDEPENDENCE_DAY_DISCOUNT.replace("up to", "Up to")} on Pro & Premium All-Access with code
          </span>
          <code className="rounded bg-white/10 px-2 py-0.5 font-mono text-sm font-bold text-[#FFD66B] shrink-0">
            {INDEPENDENCE_DAY_PROMO_CODE}
          </code>
          <Link
            href="/pricing"
            className="rounded-lg bg-gradient-to-r from-[#FF9933] via-[#FF9933] to-[#138808] px-5 py-1.5 text-sm font-semibold text-white shadow-[0_2px_8px_rgba(255,153,51,0.35)] hover:shadow-[0_4px_16px_rgba(255,153,51,0.45)] transition-shadow duration-200"
          >
            Claim Offer
          </Link>
        </div>
      </div>
    </div>
  );
}