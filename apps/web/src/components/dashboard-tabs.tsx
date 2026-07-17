"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect, useTransition, type ReactNode } from "react";

export type DashboardTab = {
  key: string;
  label: string;
  badge?: number;
  content: ReactNode;
};

/**
 * URL-synced tab switcher. Reads `?tab=<key>` from search params; falls back
 * to the first tab. Updates the URL with shallow `router.replace` so the
 * back-button still works and panels keep scroll position.
 */
export function DashboardTabs({ tabs }: { tabs: DashboardTab[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("tab") ?? tabs[0]?.key ?? "";
  const [active, setActive] = useState(initial);
  const [, startTransition] = useTransition();

  // Keep state in sync if user uses back/forward
  useEffect(() => {
    const fromUrl = params.get("tab") ?? tabs[0]?.key ?? "";
    if (fromUrl !== active) setActive(fromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const onSelect = useCallback(
    (key: string) => {
      setActive(key);
      const sp = new URLSearchParams(Array.from(params.entries()));
      if (key === tabs[0]?.key) sp.delete("tab");
      else sp.set("tab", key);
      const qs = sp.toString();
      startTransition(() => {
        router.replace(qs ? `?${qs}` : "?", { scroll: false });
      });
    },
    [router, params, tabs],
  );

  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div
        role="tablist"
        aria-label="Dashboard sections"
        className="flex items-center gap-1 border-b border-line overflow-x-auto -mx-1 px-1 scrollbar-thin"
      >
        {tabs.map((t) => {
          const isActive = t.key === active;
          return (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={isActive}
              aria-controls={`tabpanel-${t.key}`}
              id={`tab-${t.key}`}
              onClick={() => onSelect(t.key)}
              data-track={`tab:${t.key}`}
              className={`relative shrink-0 px-3 sm:px-4 py-2.5 text-sm font-semibold transition-colors
                ${isActive ? "text-ink" : "text-muted hover:text-ink"}`}
            >
              <span className="inline-flex items-center gap-2">
                {t.label}
                {typeof t.badge === "number" && t.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px]
                                   px-1 rounded-full bg-bad/10 text-bad text-[10px] font-bold tabular-nums">
                    {t.badge}
                  </span>
                )}
              </span>
              {isActive && (
                <span
                  aria-hidden
                  className="absolute left-2 right-2 -bottom-px h-0.5 bg-brand rounded-full"
                />
              )}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`tabpanel-${current?.key}`}
        aria-labelledby={`tab-${current?.key}`}
        className="pt-6"
      >
        {current?.content}
      </div>
    </div>
  );
}
