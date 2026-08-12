import Link from "next/link";
import {
  INDEPENDENCE_DAY_ACTIVE,
  INDEPENDENCE_DAY_DISCOUNT,
  INDEPENDENCE_DAY_PROMO_CODE,
} from "@/lib/celebration";

export function IndependenceDayBanner() {
  if (!INDEPENDENCE_DAY_ACTIVE) return null;

  return (
    <div className="relative z-50">
      <div aria-hidden className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
      <div className="bg-[#0f172a] text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-2 text-center text-xs sm:text-sm">
          <span aria-hidden>🇮🇳</span>
          <span className="font-semibold">{`${INDEPENDENCE_DAY_DISCOUNT.replace("up to", "Up to")} on Pro & Premium All-Access`}</span>
          <span className="text-white/80">with code</span>
          <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm font-bold text-[#FFB84D]">
            {INDEPENDENCE_DAY_PROMO_CODE}
          </code>
          <Link
            href="/pricing"
            className="rounded-md bg-gradient-to-r from-[#FF9933] to-[#138808] px-3 py-1 font-bold text-white hover:brightness-110"
          >
            Claim offer
          </Link>
        </div>
      </div>
    </div>
  );
}