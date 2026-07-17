"use client";

import { useCallback } from "react";
import { usePathname } from "next/navigation";

function send(event: { type: string; path: string; element?: string; meta?: Record<string, unknown>; userId?: string | null }) {
  fetch("/api/track/pageview", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true,
  }).catch(() => {});
}

/** Fire-and-forget click tracker. Attach via onClick or wrap a component. */
export function useTrackClick(userId?: string | null) {
  const pathname = usePathname();

  return useCallback(
    (element: string, meta?: Record<string, unknown>) => {
      send({ type: "click", path: pathname, element, meta, userId });
    },
    [pathname, userId],
  );
}

/** Fire-and-forget section view tracker. Call when a section enters viewport. */
export function useTrackSection(userId?: string | null) {
  const pathname = usePathname();

  return useCallback(
    (element: string, meta?: Record<string, unknown>) => {
      send({ type: "section_view", path: pathname, element, meta, userId });
    },
    [pathname, userId],
  );
}
