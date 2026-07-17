"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PSU_COMPANIES } from "@/data/psu";

type Branch = { label: string; href: string };

const GATE_BRANCHES: Branch[] = [
  { label: "Mining Engineering (MN)", href: "/gate/mining" },
  { label: "Civil Engineering (CE)", href: "/gate/civil" },
  { label: "Geology and Geophysics (GG)", href: "/gate/geology" },
  { label: "Environmental Science and Engineering (ES)", href: "/gate/environment" },
  { label: "Geomatics Engineering (GE)", href: "/gate/geomatics" },
  { label: "Textile Engineering and Fibre Science (TF)", href: "/gate/textile" },
  { label: "Life Sciences (XL)", href: "/gate/life-sciences" },
  { label: "Ecology and Evolution (EY)", href: "/gate/ecology" },
  { label: "Agricultural Engineering (AG)", href: "/gate/agricultural" },
];

export function MegaNav() {
  const [open, setOpen] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const pathname = usePathname() ?? "";
  const ref = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const subCloseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close on route change
  useEffect(() => { setOpen(null); setOpenSub(null); }, [pathname]);

  // Escape + outside click
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(null); setOpenSub(null); }
    }
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(null);
        setOpenSub(null);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  const openMenu = (id: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(id);
    setOpenSub(null);
  };
  const scheduleClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => { setOpen(null); setOpenSub(null); }, 120);
  };

  const openSubMenu = (slug: string) => {
    if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
    setOpenSub(slug);
  };
  const scheduleSubClose = () => {
    if (subCloseTimer.current) clearTimeout(subCloseTimer.current);
    subCloseTimer.current = setTimeout(() => setOpenSub(null), 100);
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
  const triggerCls = (id: string, activeHrefs: string[]) =>
    cn(
      "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
      open === id || activeHrefs.some(isActive)
        ? "text-brand bg-brand/5"
        : "text-ink/70 hover:text-brand hover:bg-canvas",
    );

  return (
    <div ref={ref} className="hidden md:flex items-center gap-1 ml-4">
      {/* GATE */}
      <div className="relative" onMouseEnter={() => openMenu("gate")} onMouseLeave={scheduleClose}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open === "gate"}
          onClick={() => setOpen(open === "gate" ? null : "gate")}
          className={triggerCls("gate", ["/gate", "/learn", "/practice", "/mocks", "/aits", "/study", "/pricing"])}
        >
          GATE <Chevron open={open === "gate"} />
        </button>
        {open === "gate" && (
          <Panel className="w-72">
            {GATE_BRANCHES.map((b) => (
              <Link
                key={b.href}
                href={b.href}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  isActive(b.href) ? "text-brand bg-brand/5" : "text-ink hover:bg-canvas",
                )}
              >
                {b.label}
              </Link>
            ))}
          </Panel>
        )}
      </div>

      {/* PSU */}
      <div className="relative" onMouseEnter={() => openMenu("psu")} onMouseLeave={scheduleClose}>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open === "psu"}
          onClick={() => setOpen(open === "psu" ? null : "psu")}
          className={triggerCls("psu", ["/psu"])}
        >
          PSU <Chevron open={open === "psu"} />
        </button>
        {open === "psu" && (
          <Panel className="w-72">
            <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
              Recruitment by company
            </p>
            {PSU_COMPANIES.map((c) =>
              c.children ? (
                <div
                  key={c.slug}
                  className="relative"
                  onMouseEnter={() => openSubMenu(c.slug)}
                  onMouseLeave={scheduleSubClose}
                >
                  <div
                    className={cn(
                      "flex items-center justify-between gap-3 rounded-md px-3 py-2 cursor-default",
                      openSub === c.slug ? "bg-canvas" : "hover:bg-canvas",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-ink">{c.short}</span>
                      <span className="block truncate text-xs text-muted">{c.name}</span>
                    </span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted shrink-0"
                      aria-hidden
                    >
                      <polyline points="9 6 15 12 9 18" />
                    </svg>
                  </div>

                  {/* Sub-panel — opens to the right */}
                  {openSub === c.slug && (
                    <div
                      role="menu"
                      className="absolute left-full top-0 ml-2 w-56 rounded-xl border border-line bg-surface p-2 shadow-pop"
                      onMouseEnter={() => { if (subCloseTimer.current) clearTimeout(subCloseTimer.current); }}
                      onMouseLeave={scheduleSubClose}
                    >
                      <p className="px-2 pb-1 text-[11px] font-bold uppercase tracking-wide text-muted">
                        {c.short} Programs
                      </p>
                      {c.children.map((child) =>
                        child.live ? (
                          <Link
                            key={child.slug}
                            href={`/psu/${child.slug}`}
                            className={cn(
                              "flex items-center justify-between gap-3 rounded-md px-3 py-2",
                              isActive(`/psu/${child.slug}`) ? "bg-brand/5" : "hover:bg-canvas",
                            )}
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-ink">{child.short}</span>
                              <span className="block truncate text-xs text-muted">{child.name}</span>
                            </span>
                          </Link>
                        ) : (
                          <div
                            key={child.slug}
                            className="flex cursor-default items-center justify-between gap-3 rounded-md px-3 py-2 opacity-70"
                          >
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-ink/70">{child.short}</span>
                              <span className="block truncate text-xs text-muted">{child.name}</span>
                            </span>
                            <span className="badge badge-pro shrink-0">Soon</span>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ) : c.live ? (
                <Link
                  key={c.slug}
                  href={`/psu/${c.slug}`}
                  className={cn(
                    "flex items-center justify-between gap-3 rounded-md px-3 py-2",
                    isActive(`/psu/${c.slug}`) ? "bg-brand/5" : "hover:bg-canvas",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink">{c.short}</span>
                    <span className="block truncate text-xs text-muted">{c.name}</span>
                  </span>
                </Link>
              ) : (
                <div
                  key={c.slug}
                  className="flex cursor-default items-center justify-between gap-3 rounded-md px-3 py-2 opacity-70"
                >
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-ink/70">{c.short}</span>
                    <span className="block truncate text-xs text-muted">{c.name}</span>
                  </span>
                  <span className="badge badge-pro shrink-0">Soon</span>
                </div>
              ),
            )}
          </Panel>
        )}
      </div>

      {/* State Level */}
      <Link href="/state" className={triggerCls("state", ["/state"])}>
        State Level Exam
      </Link>

      {/* Diploma */}
      <Link href="/diploma" className={triggerCls("diploma", ["/diploma"])}>
        Diploma
      </Link>

      {/* Blog */}
      <Link href="/blog" className={triggerCls("blog", ["/blog"])}>
        Blog
      </Link>

      {/* News */}
      <Link href="/news" className={triggerCls("news", ["/news"])}>
        News
      </Link>

      {/* About */}
      <Link href="/about" className={triggerCls("about", ["/about"])}>
        About Us
      </Link>
    </div>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      role="menu"
      className={cn(
        "absolute left-0 top-full mt-1 rounded-xl border border-line bg-surface p-3 shadow-pop",
        className,
      )}
    >
      {children}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("transition-transform", open && "rotate-180")}
      aria-hidden
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
