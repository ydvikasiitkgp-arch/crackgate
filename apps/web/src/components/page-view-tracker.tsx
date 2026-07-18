"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function PageViewTracker({ userId }: { userId?: string | null }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    // ponytail: fire-and-forget beacon, errors are silent
    fetch("/api/track/pageview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: pathname, userId: userId ?? null }),
      keepalive: true,
    }).catch(() => {});
  }, [pathname, userId]);

  return null;
}
