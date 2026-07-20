"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  FileText,
  GraduationCap,
  Landmark,
  Newspaper,
  FlaskConical,
  BarChart3,
  Trophy,
  Shield,
  MapPin,
  Briefcase,
  Search,
  ArrowRight,
  Clock,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { liveGateSubjects, getGateSubject } from "@/data/gate/registry";
import { PSU_COMPANIES } from "@/data/psu";
import { LEARN_TOPICS } from "@/data/learn";
import { STUDY_NOTES } from "@/data/study-notes";
import { BLOG_POSTS } from "@/data/blog";
import { useKeyboardNavigation } from "@/hooks/use-keyboard-navigation";

/* ── Command type ─────────────────────────────────────────────────── */

type Command = {
  id: string;
  label: string;
  description?: string;
  icon: LucideIcon;
  href: string;
  category: string;
};

/* ── Build command list from site data ────────────────────────────── */

function buildCommands(): Command[] {
  const cmds: Command[] = [];

  // GATE subjects
  for (const slug of liveGateSubjects()) {
    const s = getGateSubject(slug);
    if (!s) continue;
    cmds.push({
      id: `gate-${slug}`,
      label: `GATE ${s.label} (${s.code})`,
      description: s.blurb,
      icon: GraduationCap,
      href: `/gate/${slug}`,
      category: "Exam Tracks",
    });
  }

  // PSU companies (live only)
  for (const c of PSU_COMPANIES) {
    if (c.live) {
      cmds.push({
        id: `psu-${c.slug}`,
        label: `${c.short} — ${c.name}`,
        icon: Landmark,
        href: `/psu/${c.slug}`,
        category: "Exam Tracks",
      });
    }
    if (c.children) {
      for (const ch of c.children) {
        if (ch.live) {
          cmds.push({
            id: `psu-${ch.slug}`,
            label: `${ch.short} — ${ch.name}`,
            icon: Landmark,
            href: `/psu/${ch.slug}`,
            category: "Exam Tracks",
          });
        }
      }
    }
  }

  // Prep tools
  cmds.push(
    { id: "mocks", label: "Mock Tests", description: "Full-length GATE Mining mocks", icon: FileText, href: "/mocks", category: "Preparation" },
    { id: "practice", label: "Practice", description: "Topic-wise question bank", icon: BarChart3, href: "/practice", category: "Preparation" },
    { id: "aits", label: "All India Test Series", description: "Scheduled competitive mocks", icon: Trophy, href: "/aits", category: "Preparation" },
    { id: "learn", label: "Learn Modules", description: "Topic-wise theory & practice", icon: BookOpen, href: "/learn", category: "Preparation" },
    { id: "study", label: "Study Notes", description: "Revision notes & formula sheets", icon: FlaskConical, href: "/study", category: "Preparation" },
  );

  // Learn topics (indexed for search)
  for (const t of LEARN_TOPICS.slice(0, 60)) {
    cmds.push({
      id: `learn-${t.slug}`,
      label: t.title,
      description: `${t.subject} · ${t.tier}`,
      icon: BookOpen,
      href: `/learn/${t.slug}`,
      category: "Learn Topics",
    });
  }

  // Study notes
  for (const n of STUDY_NOTES) {
    cmds.push({
      id: `study-${n.slug}`,
      label: n.title,
      description: n.subject,
      icon: FlaskConical,
      href: `/study/${n.slug}`,
      category: "Study Notes",
    });
  }

  // Blog posts
  for (const p of BLOG_POSTS) {
    cmds.push({
      id: `blog-${p.slug}`,
      label: p.title,
      description: p.tags.join(", "),
      icon: Newspaper,
      href: `/blog/${p.slug}`,
      category: "Blog",
    });
  }

  // Quick links
  cmds.push(
    { id: "pricing", label: "Pricing", description: "Plans & features", icon: Briefcase, href: "/pricing", category: "Quick Links" },
    { id: "about", label: "About Us", icon: Shield, href: "/about", category: "Quick Links" },
    { id: "faq", label: "FAQ", icon: Search, href: "/faq", category: "Quick Links" },
    { id: "contact", label: "Contact", icon: Search, href: "/contact", category: "Quick Links" },
    { id: "state", label: "State Exams", icon: MapPin, href: "/state", category: "Quick Links" },
    { id: "diploma", label: "Diploma Exams", description: "WCL · NCL", icon: Shield, href: "/diploma", category: "Quick Links" },
    { id: "news", label: "News", icon: Newspaper, href: "/news", category: "Quick Links" },
  );

  return cmds;
}

const ALL_COMMANDS = buildCommands();

/* ── Recently visited (localStorage) ──────────────────────────────── */

const RECENT_KEY = "cg-recent";
const MAX_RECENT = 5;

function getRecent(): { label: string; href: string }[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecent(href: string, label: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    const items: { label: string; href: string }[] = raw ? JSON.parse(raw) : [];
    const next = [{ label, href }, ...items.filter((i) => i.href !== href)].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
}

/* ── Fuzzy filter ─────────────────────────────────────────────────── */

function matchesQuery(cmd: Command, q: string): boolean {
  if (!q) return true;
  const lower = q.toLowerCase();
  return (
    cmd.label.toLowerCase().includes(lower) ||
    (cmd.description?.toLowerCase().includes(lower) ?? false) ||
    cmd.category.toLowerCase().includes(lower)
  );
}

/* ── Imperative open event (for mobile drawer) ────────────────────── */

const CMD_PALETTE_OPEN = "cg:cmd-palette:open";

export function openCommandPalette() {
  window.dispatchEvent(new CustomEvent(CMD_PALETTE_OPEN));
}

/* ── Component ────────────────────────────────────────────────────── */

export function CommandPalette({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input on open
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Lock body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Cmd/Ctrl + K global shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQuery("");
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Imperative open (mobile drawer dispatches this event)
  useEffect(() => {
    function onOpen() {
      setOpen(true);
      setQuery("");
    }
    window.addEventListener(CMD_PALETTE_OPEN, onOpen);
    return () => window.removeEventListener(CMD_PALETTE_OPEN, onOpen);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
  }, []);

  // Recently visited
  const [recent, setRecent] = useState<{ label: string; href: string }[]>([]);
  useEffect(() => {
    if (open) setRecent(getRecent());
  }, [open]);

  const isSearching = query.trim().length > 0;

  // Filtered results
  const filtered = useMemo(() => {
    if (!isSearching) return [];
    return ALL_COMMANDS.filter((c) => matchesQuery(c, query));
  }, [query, isSearching]);

  // Group filtered by category
  const groups = useMemo(() => {
    const map = new Map<string, Command[]>();
    for (const cmd of filtered) {
      const arr = map.get(cmd.category) || [];
      arr.push(cmd);
      map.set(cmd.category, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Flat visible items for keyboard nav
  type VisibleItem = { id: string; label: string; href: string };
  const visibleItems: VisibleItem[] = useMemo(() => {
    if (isSearching) return filtered;
    return recent.map((r) => ({ id: `recent-${r.href}`, ...r }));
  }, [isSearching, filtered, recent]);

  // Navigate
  const navigateTo = useCallback(
    (href: string, label: string) => {
      addRecent(href, label);
      router.push(href);
      close();
    },
    [router, close],
  );

  // Keyboard navigation
  const { selectedIndex, setSelectedIndex, listRef, onKeyDown } = useKeyboardNavigation(
    visibleItems.length,
    (idx) => {
      const item = visibleItems[idx];
      if (item) navigateTo(item.href, item.label);
    },
    close,
  );

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => { setOpen(true); setQuery(""); }}
        aria-label="Search (⌘K)"
        className={cn(
          "inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-line text-muted",
          "hover:text-ink hover:bg-canvas transition-colors text-sm",
          className,
        )}
      >
        <Search size={15} aria-hidden />
        <span className="hidden sm:inline text-xs text-muted/70">⌘K</span>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[18vh] px-4"
          data-cmd-palette
          onKeyDown={onKeyDown}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden="true"
          />

          {/* Panel */}
          <div className="relative w-full max-w-xl rounded-2xl border border-line bg-surface shadow-pop overflow-hidden" style={{ animation: "cg-zoom-in 120ms ease-out" }}>
            {/* Search input */}
            <div className="flex items-center border-b border-line px-4">
              <Search size={18} className="text-muted shrink-0" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search exams, topics, pages..."
                className="flex-1 bg-transparent px-3 py-4 text-sm text-ink placeholder:text-muted outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center rounded-md border border-line bg-canvas px-2 py-0.5 text-[10px] font-medium text-muted">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2" role="listbox">
              {/* Idle: show recently visited only */}
              {!isSearching && recent.length > 0 && (
                <CommandGroup label="Recently Visited">
                  {recent.map((item, i) => (
                    <CommandItem
                      key={`recent-${item.href}`}
                      icon={Clock}
                      label={item.label}
                      href={item.href}
                      selected={selectedIndex === i}
                      onClick={() => navigateTo(item.href, item.label)}
                      onMouseEnter={() => setSelectedIndex(i)}
                    />
                  ))}
                </CommandGroup>
              )}

              {/* Typing: show filtered results */}
              {isSearching && groups.map(([category, cmds]) => (
                <CommandGroup key={category} label={category}>
                  {cmds.map((cmd) => {
                    const flatIdx = visibleItems.indexOf(cmd);
                    return (
                      <CommandItem
                        key={cmd.id}
                        icon={cmd.icon}
                        label={cmd.label}
                        description={cmd.description}
                        href={cmd.href}
                        selected={selectedIndex === flatIdx}
                        onClick={() => navigateTo(cmd.href, cmd.label)}
                        onMouseEnter={() => setSelectedIndex(flatIdx)}
                      />
                    );
                  })}
                </CommandGroup>
              ))}

              {/* Empty search */}
              {isSearching && filtered.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted">
                  No results for &ldquo;{query}&rdquo;
                </div>
              )}

              {/* Idle with no recent */}
              {!isSearching && recent.length === 0 && (
                <div className="px-4 py-10 text-center text-sm text-muted">
                  Start typing to search exams, topics, and pages...
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-4 py-2.5 flex items-center justify-between text-[11px] text-muted">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px]">↑</kbd>
                  <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px]">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
                  select
                </span>
              </div>
              <span className="flex items-center gap-1">
                <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px]">esc</kbd>
                close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Sub-components ───────────────────────────────────────────────── */

function CommandGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label}>
      <p className="px-4 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted/70">
        {label}
      </p>
      {children}
    </div>
  );
}

function CommandItem({
  icon: Icon,
  label,
  description,
  href,
  selected,
  onClick,
  onMouseEnter,
}: {
  icon: LucideIcon;
  label: string;
  description?: string;
  href: string;
  selected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-2.5 text-left transition-colors",
        selected ? "bg-brand/8 text-ink" : "text-ink hover:bg-canvas",
      )}
    >
      <Icon size={16} className={cn("shrink-0", selected ? "text-brand" : "text-muted")} aria-hidden />
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium truncate block">{label}</span>
        {description && (
          <span className="text-xs text-muted truncate block">{description}</span>
        )}
      </div>
      <ArrowRight
        size={14}
        className={cn(
          "shrink-0 transition-opacity",
          selected ? "opacity-100 text-brand" : "opacity-0",
        )}
        aria-hidden
      />
    </button>
  );
}
