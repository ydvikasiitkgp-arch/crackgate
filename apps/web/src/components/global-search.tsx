"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

const QUICK_LINKS = [
  { label: "GATE Mining", href: "/gate/mining" },
  { label: "GATE Civil", href: "/gate/civil" },
  { label: "GATE Geology", href: "/gate/geology" },
  { label: "GATE Environment", href: "/gate/environment" },
  { label: "PSU Coal India", href: "/psu/cil" },
  { label: "Mock Tests", href: "/mocks" },
  { label: "Practice", href: "/practice" },
  { label: "State Exams", href: "/state" },
  { label: "Diploma", href: "/diploma" },
];

export function GlobalSearch({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { setOpen(false); setQuery(""); }
    }
    if (open) {
      document.addEventListener("keydown", onKey);
      return () => document.removeEventListener("keydown", onKey);
    }
  }, [open]);

  // Keyboard shortcut: Cmd/Ctrl + K to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const filtered = query.trim()
    ? QUICK_LINKS.filter((l) =>
        l.label.toLowerCase().includes(query.toLowerCase())
      )
    : QUICK_LINKS;

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        setOpen(false);
        setQuery("");
      }
    },
    [query, router],
  );

  return (
    <>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={`inline-flex items-center justify-center w-9 h-9 rounded-lg border border-line text-muted hover:text-ink hover:bg-canvas transition-colors ${className}`}
      >
        <Search size={16} aria-hidden />
      </button>

      {/* Search overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setOpen(false); setQuery(""); }}
          />

          {/* Panel */}
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-line bg-surface shadow-pop overflow-hidden" style={{ animation: "cg-zoom-in 150ms ease-out" }}>
            <form onSubmit={handleSubmit} className="flex items-center border-b border-line">
              <Search size={18} className="ml-4 text-muted shrink-0" aria-hidden />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search topics, exams, or pages..."
                className="flex-1 bg-transparent px-3 py-4 text-sm text-ink placeholder:text-muted outline-none"
              />
              <kbd className="mr-3 hidden sm:inline-flex items-center gap-1 rounded-md border border-line bg-canvas px-2 py-0.5 text-[10px] font-medium text-muted">
                ESC
              </kbd>
              <button
                type="button"
                onClick={() => { setOpen(false); setQuery(""); }}
                className="mr-3 p-1 rounded-md text-muted hover:text-ink hover:bg-canvas transition-colors"
              >
                <X size={16} aria-hidden />
              </button>
            </form>

            {/* Quick links */}
            <div className="max-h-72 overflow-y-auto p-2">
              <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-muted">
                Quick links
              </p>
              {filtered.length > 0 ? (
                filtered.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => { setOpen(false); setQuery(""); }}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-canvas transition-colors"
                  >
                    <Search size={14} className="text-muted shrink-0" aria-hidden />
                    {l.label}
                  </a>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-muted">
                  No matching pages found.
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="border-t border-line px-4 py-2.5 flex items-center justify-between text-[11px] text-muted">
              <span>
                <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px]">Enter</kbd>{" "}
                to search
              </span>
              <span>
                <kbd className="rounded border border-line bg-canvas px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>{" "}
                to toggle
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
