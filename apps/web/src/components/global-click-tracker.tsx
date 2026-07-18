"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Global click tracker. Attaches a delegated listener to document.
 * Elements with data-track="some-label" get tracked on click.
 * data-track-meta='{"key":"val"}' adds extra context.
 */
export function GlobalClickTracker({ userId }: { userId?: string | null }) {
  const pathname = usePathname();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      const el = (e.target as HTMLElement).closest<HTMLElement>("[data-track]");
      if (!el) return;
      const label = el.dataset.track;
      if (!label) return;

      let meta: Record<string, unknown> | undefined;
      try {
        if (el.dataset.trackMeta) meta = JSON.parse(el.dataset.trackMeta);
      } catch {}

      fetch("/api/track/pageview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "click", path: pathname, element: label, meta, userId }),
        keepalive: true,
      }).catch(() => {});
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [pathname, userId]);

  return null;
}
