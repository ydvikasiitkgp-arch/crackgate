"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { PSU_COMPANIES, type PsuCompany } from "@/data/psu";

type Leaf = { href: string; label: string; soon?: boolean };

const SECTION_PILLS: Leaf[] = [
  { href: "/gate", label: "GATE" },
  { href: "/psu", label: "PSU" },
  { href: "/state", label: "State" },
  { href: "/diploma", label: "Diploma" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
];

/* ------------------------------------------------------------------ */
/* PSU bottom-sheet panel (portal to body)                            */
/* ------------------------------------------------------------------ */

function PsuSheet({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState<string | null>(null);

  // Escape key dismiss
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const toggleExpand = useCallback((slug: string) => {
    setExpanded((prev) => (prev === slug ? null : slug));
  }, []);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 cg-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface cg-sheet"
        role="dialog"
        aria-label="PSU recruitment exams"
      >
        {/* Handle + close */}
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface px-5 pt-3 pb-2 border-b border-line/50">
          <div className="mx-auto h-1 w-10 rounded-full bg-line/60" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-canvas transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Header */}
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-base font-bold text-ink">PSU Recruitment</h2>
          <p className="mt-0.5 text-xs text-muted">Public sector exam mock tests</p>
        </div>

        {/* Company list */}
        <div className="px-3 pb-6 pt-1 space-y-1.5">
          {PSU_COMPANIES.map((c) => (
            <PsuCompanyCard
              key={c.slug}
              company={c}
              pathname={pathname}
              expanded={expanded === c.slug}
              onToggle={toggleExpand}
              onClose={onClose}
            />
          ))}
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Individual company card                                            */
/* ------------------------------------------------------------------ */

function PsuCompanyCard({
  company: c,
  pathname,
  expanded,
  onToggle,
  onClose,
}: {
  company: PsuCompany;
  pathname: string | null;
  expanded: boolean;
  onToggle: (slug: string) => void;
  onClose: () => void;
}) {
  const hasChildren = !!c.children?.length;
  const isActive = pathname === `/psu/${c.slug}` || pathname?.startsWith(`/psu/${c.slug}/`);
  const isExpanded = hasChildren && expanded;

  // Parent with children (e.g. CIL)
  if (hasChildren) {
    const anyChildActive = c.children!.some(
      (ch) => pathname === `/psu/${ch.slug}` || pathname?.startsWith(`/psu/${ch.slug}/`),
    );
    return (
      <div className="rounded-xl border border-line/60 overflow-hidden">
        {/* Parent row — tappable to expand */}
        <button
          type="button"
          onClick={() => onToggle(c.slug)}
          className={cn(
            "flex w-full items-center justify-between px-4 py-3 transition-colors",
            anyChildActive ? "bg-brand/5" : "active:bg-canvas",
          )}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-xs font-bold text-ink border border-line/40">
              {c.short.slice(0, 2)}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink truncate">{c.short}</div>
              <div className="text-xs text-muted truncate">{c.name}</div>
            </div>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("shrink-0 text-muted transition-transform duration-200", isExpanded && "rotate-180")}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        {/* Children — slide open */}
        {isExpanded && (
          <div className="border-t border-line/40 bg-canvas/30">
            {c.children!.map((child) =>
              child.live ? (
                <Link
                  key={child.slug}
                  href={`/psu/${child.slug}`}
                  onClick={onClose}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 transition-colors border-b border-line/30 last:border-b-0",
                    pathname === `/psu/${child.slug}` || pathname?.startsWith(`/psu/${child.slug}/`)
                      ? "bg-brand/5"
                      : "active:bg-canvas",
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink">{child.short}</div>
                      <div className="text-xs text-muted truncate">{child.name}</div>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted/50 shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </Link>
              ) : (
                <div
                  key={child.slug}
                  className="flex items-center justify-between px-4 py-3 opacity-50 border-b border-line/30 last:border-b-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-1.5 w-1.5 rounded-full bg-muted/40 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-ink/60">{child.short}</div>
                      <div className="text-xs text-muted/60 truncate">{child.name}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-muted/60 bg-muted/10 px-2 py-0.5 rounded-full">Soon</span>
                </div>
              ),
            )}
          </div>
        )}
      </div>
    );
  }

  // Standalone company (ONGC, NMDC, etc.)
  return (
    <Link
      href={c.live ? `/psu/${c.slug}` : "#"}
      onClick={c.live ? onClose : undefined}
      className={cn(
        "flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
        c.live
          ? cn(
              "border-line/60",
              isActive ? "bg-brand/5 border-brand/20" : "active:bg-canvas",
            )
          : "border-line/30 opacity-50 pointer-events-none",
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-canvas text-xs font-bold text-ink border border-line/40">
          {c.short.slice(0, 2)}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-ink truncate">{c.short}</div>
          <div className="text-xs text-muted truncate">{c.name}</div>
        </div>
      </div>
      {c.live ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted/50 shrink-0">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      ) : (
        <span className="text-[10px] font-medium text-muted/60 bg-muted/10 px-2 py-0.5 rounded-full">Soon</span>
      )}
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile section bar                                                 */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Diploma bottom-sheet panel                                         */
/* ------------------------------------------------------------------ */

function DiplomaSheet({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isWclActive = pathname === "/diploma/wcl" || pathname?.startsWith("/diploma/wcl/");

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 cg-overlay" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[80dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface cg-sheet"
        role="dialog"
        aria-label="Diploma exams"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-surface px-5 pt-3 pb-2 border-b border-line/50">
          <div className="mx-auto h-1 w-10 rounded-full bg-line/60" />
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-3 flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-canvas transition-colors"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="px-5 pt-4 pb-2">
          <h2 className="text-base font-bold text-ink">Diploma Level Exams</h2>
          <p className="mt-0.5 text-xs text-muted">DGMS competency certificates</p>
        </div>
        <div className="px-3 pb-6 pt-1 space-y-1.5">
          <Link
            href="/diploma/wcl"
            onClick={onClose}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl border transition-colors",
              isWclActive
                ? "border-brand/20 bg-brand/5"
                : "border-line/60 active:bg-canvas",
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-line/40 bg-canvas">
                <img src="/images/wcl/wcl-logo.webp" alt="WCL" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-ink">WCL</div>
                <div className="text-xs text-muted truncate">Western Coalfields Limited · 2 exams</div>
              </div>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-muted/50 shrink-0">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}

export function MobileSectionBar() {
  const pathname = usePathname();
  const [psuOpen, setPsuOpen] = useState(false);
  const [diplomaOpen, setDiplomaOpen] = useState(false);

  const isPsuActive = pathname?.startsWith("/psu");
  const isDiplomaActive = pathname?.startsWith("/diploma");

  return (
    <div className="md:hidden border-t border-line">
      <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2">
        {SECTION_PILLS.map((l) => {
          if (l.href === "/psu") {
            return (
              <div key="psu" className="relative">
                <button
                  type="button"
                  onClick={() => setPsuOpen(true)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-1",
                    isPsuActive ? "bg-brand text-white" : "bg-canvas text-ink hover:bg-brand/10",
                  )}
                  aria-haspopup="dialog"
                  aria-expanded={psuOpen}
                >
                  PSU
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {psuOpen && typeof window !== "undefined" && createPortal(
                  <PsuSheet onClose={() => setPsuOpen(false)} />,
                  document.body,
                )}
              </div>
            );
          }

          if (l.href === "/diploma") {
            return (
              <div key="diploma" className="relative">
                <button
                  type="button"
                  onClick={() => setDiplomaOpen(true)}
                  className={cn(
                    "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap transition inline-flex items-center gap-1",
                    isDiplomaActive ? "bg-brand text-white" : "bg-canvas text-ink hover:bg-brand/10",
                  )}
                  aria-haspopup="dialog"
                  aria-expanded={diplomaOpen}
                >
                  Diploma
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {diplomaOpen && typeof window !== "undefined" && createPortal(
                  <DiplomaSheet onClose={() => setDiplomaOpen(false)} />,
                  document.body,
                )}
              </div>
            );
          }

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
  if (/^\/mocks\/(cil-|ongc-|ce-mock-|gg-mock-|es-mock-|state-|diploma-)/.test(pathname)) return false;
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
