import Link from "next/link";

/**
 * CrackGate brand mark.
 *
 * The mark = a stylised "gate" (two pillars + arch) being *cracked* open by a
 * lightning bolt running down the middle. The metaphor: "crack the GATE exam".
 * Pure inline SVG so it's crisp at every size and themed by the gradient stops.
 */
export function BrandMark({ size = 36, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="cg-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--brand, #1e3a8a)" />
          <stop offset="100%" stopColor="var(--brand-2, #0c1f4d)" />
        </linearGradient>
      </defs>

      {/* rounded tile background */}
      <rect x="0" y="0" width="40" height="40" rx="9" fill="url(#cg-grad)" />

      {/* gate arch — two pillars + top arch, drawn in white */}
      <path
        d="M10 30 V18 a10 10 0 0 1 20 0 V30"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.55"
      />

      {/* the 'crack' — a sharp lightning bolt slicing through the gate */}
      <path
        d="M22.5 8 L15 22 H20 L17 32 L25.5 18 H20.5 L22.5 8 Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Wordmark — "CrackGate".
 * Use alongside <BrandMark /> in the header.
 */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-extrabold tracking-tight leading-none whitespace-nowrap ${className}`}>
      <span className="text-ink">Crack</span>
      <span className="text-brand">Gate</span>
    </span>
  );
}

/** Convenience: mark + wordmark wrapped in a Link to home. */
export function BrandLockup({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2.5 group" aria-label="CrackGate home">
      <BrandMark size={36} className="transition-transform group-hover:rotate-[-4deg]" />
      <Wordmark className="hidden sm:inline text-[17px]" />
    </Link>
  );
}
