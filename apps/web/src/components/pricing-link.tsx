"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LIVE_SUBJECT_SLUGS = ["civil", "geology", "environment"];

/**
 * "Pricing" link that carries the current GATE subject through (?subject=).
 * Bare on global pages (homepage, blog…) where there is no subject context.
 */
export function PricingLink({
  className,
  onClick,
  children,
}: {
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const subject = LIVE_SUBJECT_SLUGS.find((s) => pathname.startsWith(`/gate/${s}`));
  return (
    <Link href={subject ? `/pricing?subject=${subject}` : "/pricing"} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}
