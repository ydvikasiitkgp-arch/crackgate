"use client";

import { useEffect, useRef } from "react";
import { useTrackSection } from "@/hooks/use-track";

/**
 * Attach to a section div to track when it scrolls into viewport.
 * Sends one event per section per page load (deduplicates via ref).
 *
 * Usage: <section ref={useTrackSectionView("pricing-plans", userId)}>
 */
export function useTrackSectionView(sectionName: string, userId?: string | null) {
  const track = useTrackSection(userId);
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current) return;

    const el = document.getElementById(sectionName);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !sent.current) {
          sent.current = true;
          track(sectionName);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [sectionName, track]);

  // Return a ref callback that also sets the id
  return (el: HTMLElement | null) => {
    if (el && !el.id) el.id = sectionName;
  };
}
