"use client";

import { useEffect, useRef } from "react";

/**
 * Global section view tracker. Watches all elements with data-track-section
 * and fires one event per section when it scrolls into view (30% threshold).
 */
export function GlobalSectionTracker({ userId }: { userId?: string | null }) {
  const seen = useRef(new Set<string>());

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          const name = el.dataset.trackSection;
          if (!name || seen.current.has(name)) continue;
          seen.current.add(name);

          let meta: Record<string, unknown> | undefined;
          try {
            if (el.dataset.trackSectionMeta) meta = JSON.parse(el.dataset.trackSectionMeta);
          } catch {}

          fetch("/api/track/pageview", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "section_view", path: window.location.pathname, element: name, meta, userId }),
            keepalive: true,
          }).catch(() => {});
        }
      },
      { threshold: 0.3 },
    );

    const els = document.querySelectorAll<HTMLElement>("[data-track-section]");
    els.forEach((el) => observer.observe(el));

    // Re-observe on DOM changes (for dynamic content)
    const mutation = new MutationObserver(() => {
      document.querySelectorAll<HTMLElement>("[data-track-section]").forEach((el) => {
        if (!seen.current.has(el.dataset.trackSection!)) observer.observe(el);
      });
    });
    mutation.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutation.disconnect();
    };
  }, [userId]);

  return null;
}
