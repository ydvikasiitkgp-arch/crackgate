"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { PSU_COMPANIES } from "@/data/psu";

type Leaf = { href: string; label: string; soon?: boolean };
type Section = { label: string; href?: string; soon?: boolean; children?: Leaf[] };

const SECTIONS: Section[] = [
  {
    label: "GATE",
    children: [
      { href: "/gate/mining", label: "Mining (MN)" },
      { href: "/gate/civil", label: "Civil (CE)" },
      { href: "/gate/geology", label: "Geology (GG)" },
      { href: "/gate/environment", label: "Environment (ES)" },
    ],
  },
  {
    label: "PSU",
    children: PSU_COMPANIES.map((c) => ({
      href: c.live ? `/psu/${c.slug}` : "",
      label: `${c.short} — ${c.name}`,
      soon: !c.live,
    })),
  },
  { label: "State Level Exam", href: "/state" },
  { label: "Diploma", href: "/diploma" },
  { label: "News", href: "/news" },
  { label: "About us", href: "/about" },
];

// Top-level destinations for the always-visible pill strip.
const SECTION_PILLS: Leaf[] = [
  { href: "/gate", label: "GATE" },
  { href: "/psu/cil", label: "PSU" },
  { href: "/state", label: "State" },
  { href: "/diploma", label: "Diploma" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
];

export function MobileNav({ authed }: { authed: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg border border-line bg-surface text-ink shadow-sm hover:bg-canvas active:scale-95 transition"
      >
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          {open ? (
            <><path d="M6 6l12 12" /><path d="M18 6L6 18" /></>
          ) : (
            <><path d="M4 7h16" /><path d="M4 12h16" /><path d="M4 17h16" /></>
          )}
        </svg>
      </button>

      {/* Overlay + panel */}
      <div
        className={cn(
          "md:hidden fixed inset-0 z-50 transition",
          open ? "visible" : "invisible pointer-events-none",
        )}
        aria-hidden={!open}
      >
        <div
          onClick={() => setOpen(false)}
          className={cn("absolute inset-0 bg-ink/40 transition-opacity", open ? "opacity-100" : "opacity-0")}
        />
        <nav
          className={cn(
            "absolute inset-0 bg-surface",
            "flex flex-col transition-transform duration-200",
            open ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="h-16 flex items-center justify-between px-5 border-b border-line">
            <span className="font-bold">Menu</span>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="w-10 h-10 inline-flex items-center justify-center rounded-lg hover:bg-canvas"
            >
              <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M6 6l12 12" /><path d="M18 6L6 18" />
              </svg>
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
            {SECTIONS.map((s) => {
              if (!s.children) {
                const active = pathname === s.href || pathname.startsWith((s.href ?? "\0") + "/");
                return (
                  <li key={s.label}>
                    <Link
                      href={s.href!}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-4 py-3 text-base font-semibold",
                        active ? "bg-brand/10 text-brand" : "text-ink hover:bg-canvas",
                      )}
                    >
                      {s.label}
                      {s.soon && <span className="badge badge-pro">Soon</span>}
                    </Link>
                  </li>
                );
              }
              return (
                <li key={s.label}>
                  <p className="px-4 pb-1 text-xs font-bold uppercase tracking-wide text-muted">{s.label}</p>
                  <ul className="space-y-0.5">
                    {s.children.map((l) => {
                      const active = pathname === l.href || pathname.startsWith(l.href + "/");
                      if (l.soon || !l.href) {
                        return (
                          <li key={l.label}>
                            <div className="flex items-center justify-between rounded-lg px-4 py-2.5 text-base font-medium text-muted">
                              {l.label}
                              <span className="badge badge-pro">Soon</span>
                            </div>
                          </li>
                        );
                      }
                      return (
                        <li key={l.href}>
                          <Link
                            href={l.href}
                            className={cn(
                              "flex items-center justify-between rounded-lg px-4 py-2.5 text-base font-medium",
                              active ? "bg-brand/10 text-brand" : "text-ink hover:bg-canvas",
                            )}
                          >
                            {l.label}
                            {l.soon && <span className="badge badge-pro">Soon</span>}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
}

/**
 * Always-visible, horizontally-scrollable strip of section pills.
 * Shown only on mobile (md:hidden) directly under the header row so the
 * primary sections are discoverable without opening the drawer.
 */
export function MobileSectionBar() {
  const pathname = usePathname();
  return (
    <div className="md:hidden border-t border-line">
      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2">
        {SECTION_PILLS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition",
                active ? "bg-brand text-white" : "bg-canvas text-ink hover:bg-brand/10",
              )}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/**
 * The self-contained GATE Mining mini-site spans these route prefixes. On
 * these paths the global header is hidden and the Mining header is shown.
 */
const MINING_SITE_PREFIXES = ["/gate/mining", "/learn", "/practice", "/mocks", "/aits", "/pricing"];

/**
 * Newer GATE subjects live under /gate/<slug>/* with their own SubjectHeader
 * (rendered by the subject layout). On these paths the global header is hidden
 * but the Mining header is NOT shown. Keep in sync with liveGateSubjects().
 */
const LIVE_SUBJECT_PREFIXES = ["/gate/civil", "/gate/geology", "/gate/environment"];

function isMiningSite(pathname: string | null): boolean {
  if (!pathname) return false;
  // Mocks for non-Mining tracks use the shared runner but belong to their own
  // track, so they keep the global header (PSU / subject nav) rather than the
  // Mining header. Only Mining mocks (/mocks/mn-*) are part of the Mining
  // mini-site. Exclude every other known mock-id prefix here.
  if (/^\/mocks\/(cil-|ce-mock-|gg-mock-|es-mock-|state-|diploma-)/.test(pathname)) return false;
  return MINING_SITE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** True on a live per-subject mini-site (e.g. /gate/civil/*). */
function isLiveSubjectSite(pathname: string | null): boolean {
  if (!pathname) return false;
  return LIVE_SUBJECT_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

/** Renders children only OUTSIDE the Mining mini-site (i.e. the global header). */
export function HideOnMiningSite({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return isMiningSite(pathname) || isLiveSubjectSite(pathname) ? null : <>{children}</>;
}

/** Renders children only INSIDE the Mining mini-site (i.e. the Mining header). */
export function ShowOnMiningSite({ children }: { children: React.ReactNode }) {
  return isMiningSite(usePathname()) ? <>{children}</> : null;
}
