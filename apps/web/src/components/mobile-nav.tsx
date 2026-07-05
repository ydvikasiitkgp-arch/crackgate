"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type Leaf = { href: string; label: string; soon?: boolean };

// Top-level destinations for the always-visible pill strip.
const SECTION_PILLS: Leaf[] = [
  { href: "/gate", label: "GATE" },
  { href: "/psu/cil", label: "PSU" },
  { href: "/state", label: "State" },
  { href: "/diploma", label: "Diploma" },
  { href: "/news", label: "News" },
  { href: "/about", label: "About" },
];


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
