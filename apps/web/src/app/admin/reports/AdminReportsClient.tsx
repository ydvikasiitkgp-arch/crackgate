"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MathText } from "@/components/math-text";
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Filter,
  X,
  Search,
  CheckSquare,
  Square,
  Trash2,
  Loader2,
  ExternalLink,
  StickyNote,
  Clock,
} from "lucide-react";

const STATUSES = ["pending", "reviewed", "resolved", "dismissed"] as const;
const ISSUE_TYPES = ["factual_error", "typo", "unclear_explanation", "wrong_answer", "other"] as const;

const SUBJECT_LABELS: Record<string, string> = {
  mining: "Mining Engineering (MN)",
  civil: "Civil Engineering (CE)",
  environment: "Environmental Science and Engineering (ES)",
  geology: "Geology and Geophysics (GG)",
  geomatics: "Geomatics Engineering (GE)",
  textile: "Textile Engineering and Fibre Science (TF)",
  "life-sciences": "Life Sciences (XL)",
  ecology: "Ecology and Evolution (EY)",
  agricultural: "Agricultural Engineering (AG)",
  electrical: "Electrical",
  mechanical: "Mechanical",
  system: "System",
  "e-and-t": "E&T",
  "industrial-engineering": "Industrial Engg.",
  "rpsc-ame": "RPSC AME",
  "cgpsc-mining-officer": "CGPSC Mining Officer",
  "coal-sirdar": "Coal Sirdar",
  "coal-overman": "Coal Overman",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; darkBg: string; darkText: string; icon: typeof AlertTriangle }> = {
  pending:  { label: "Pending",  color: "text-amber-800",  bg: "bg-amber-50 border-amber-200",  darkBg: "dark:bg-amber-950 dark:border-amber-800",  darkText: "dark:text-amber-300",  icon: AlertTriangle },
  reviewed: { label: "Reviewed", color: "text-blue-800",   bg: "bg-blue-50 border-blue-200",    darkBg: "dark:bg-blue-950 dark:border-blue-800",    darkText: "dark:text-blue-300",   icon: Eye },
  resolved: { label: "Resolved", color: "text-emerald-800", bg: "bg-emerald-50 border-emerald-200", darkBg: "dark:bg-emerald-950 dark:border-emerald-800", darkText: "dark:text-emerald-300", icon: CheckCircle2 },
  dismissed: { label: "Dismissed", color: "text-slate-500", bg: "bg-slate-50 border-slate-200", darkBg: "dark:bg-slate-800 dark:border-slate-700",  darkText: "dark:text-slate-400",  icon: XCircle },
};

const ISSUE_COLORS: Record<string, string> = {
  factual_error:       "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
  typo:                "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  unclear_explanation: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
  wrong_answer:        "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  other:               "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
};

function getAging(createdAt: string): { label: string; color: string } {
  const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400_000);
  if (days === 0) return { label: "Today", color: "text-muted" };
  if (days === 1) return { label: "1 day", color: "text-muted" };
  if (days <= 3) return { label: `${days} days`, color: "text-muted" };
  if (days <= 7) return { label: `${days} days`, color: "text-amber-600 dark:text-amber-400" };
  if (days <= 14) return { label: `${days} days`, color: "text-orange-600 dark:text-orange-400" };
  return { label: `${days} days`, color: "text-bad" };
}

type Report = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  mockRefId: string;
  questionKey: string;
  questionStem: string | null;
  exam: string;
  subject: string;
  issueType: string;
  description: string;
  status: string;
  adminNote: string | null;
  reviewedBy: string | null;
  reportCount: number;
  reporterCount: number;
  createdAt: string;
};

export function AdminReportsClient({
  reports,
  pagination,
  filters,
  filterOptions,
  globalCounts,
}: {
  reports: Report[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
  filters: { status?: string; issueType?: string; exam?: string; subject?: string; search?: string };
  filterOptions: { exams: string[]; subjects: string[] };
  globalCounts: { pending: number; multiReport: number };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(!!(filters.status || filters.issueType || filters.exam || filters.subject));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{ title: string; message: string; onConfirm: () => void } | null>(null);
  const [searchInput, setSearchInput] = useState(filters.search ?? "");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const focusedIndex = useRef(-1);

  const showToast = useCallback((type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/admin/reports?${params.toString()}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setFilter("search", searchInput.trim());
  }

  function goToPage(p: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/admin/reports?${params.toString()}`);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        showToast("success", `Marked as ${status}`);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error ?? "Failed to update");
      }
    } catch {
      showToast("error", "Network error — try again");
    } finally {
      setUpdatingId(null);
    }
  }

  async function saveNote(id: string) {
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminNote: noteInput.trim() }),
      });
      if (res.ok) {
        showToast("success", "Note saved");
        setEditingNoteId(null);
        router.refresh();
      } else {
        showToast("error", "Failed to save note");
      }
    } catch {
      showToast("error", "Network error");
    } finally {
      setSavingNote(false);
    }
  }

  async function batchUpdate(status: string) {
    const ids = [...selected];
    if (ids.length === 0) return;
    setBatchLoading(true);
    try {
      const res = await fetch("/api/admin/reports", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      });
      if (res.ok) {
        showToast("success", `${ids.length} report${ids.length > 1 ? "s" : ""} marked as ${status}`);
        setSelected(new Set());
        setConfirmDialog(null);
        router.refresh();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast("error", data.error ?? "Batch update failed");
      }
    } catch {
      showToast("error", "Network error — try again");
    } finally {
      setBatchLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    if (selected.size === reports.length) setSelected(new Set());
    else setSelected(new Set(reports.map((r) => r.id)));
  }

  // Keyboard navigation
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      const cards = listRef.current?.querySelectorAll("[data-report-card]");
      if (!cards || cards.length === 0) return;

      if (e.key === "j" || e.key === "J") {
        e.preventDefault();
        focusedIndex.current = Math.min(focusedIndex.current + 1, cards.length - 1);
        (cards[focusedIndex.current] as HTMLElement).focus();
      } else if (e.key === "k" || e.key === "K") {
        e.preventDefault();
        focusedIndex.current = Math.max(focusedIndex.current - 1, 0);
        (cards[focusedIndex.current] as HTMLElement).focus();
      } else if (e.key === "Enter" && focusedIndex.current >= 0) {
        const id = reports[focusedIndex.current]?.id;
        if (id) setExpandedId((prev) => prev === id ? null : id);
      } else if (e.key === "r" && focusedIndex.current >= 0) {
        const r = reports[focusedIndex.current];
        if (r && r.status === "pending") updateStatus(r.id, "reviewed");
      } else if (e.key === "d" && focusedIndex.current >= 0) {
        const r = reports[focusedIndex.current];
        if (r && r.status === "pending") updateStatus(r.id, "dismissed");
      } else if (e.key === "Escape") {
        setExpandedId(null);
        setConfirmDialog(null);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [reports, updateStatus]);

  const hasFilters = filters.status || filters.issueType || filters.exam || filters.subject || filters.search;

  // Determine which batch actions are available
  const selectedStatuses = useMemo(() => {
    return new Set(selected.size > 0 ? reports.filter((r) => selected.has(r.id)).map((r) => r.status) : []);
  }, [selected, reports]);
  const canBatchResolve = selected.size > 0 && (selectedStatuses.has("pending") || selectedStatuses.has("reviewed"));
  const canBatchDismiss = selected.size > 0 && selectedStatuses.has("pending");

  // Pagination — deduplicated sliding window
  const pageNumbers = useMemo(() => {
    const { page: current, totalPages } = pagination;
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: number[] = [];
    const addPage = (p: number) => { if (p >= 1 && p <= totalPages && !pages.includes(p)) pages.push(p); };
    addPage(1);
    for (let i = Math.max(2, current - 1); i <= Math.min(totalPages - 1, current + 1); i++) addPage(i);
    addPage(totalPages);
    return pages;
  }, [pagination]);

  return (
    <>
      {/* Toast */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className={cn(
            "fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-pop text-sm font-semibold animate-in slide-in-from-top-2",
            toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white",
          )}
        >
          {toast.message}
        </div>
      )}

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
          <button className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setConfirmDialog(null)} />
          <div className="relative bg-surface rounded-2xl border border-line shadow-pop w-full max-w-sm mx-4 p-6">
            <h3 id="confirm-title" className="font-bold text-lg">{confirmDialog.title}</h3>
            <p className="text-sm text-muted mt-2">{confirmDialog.message}</p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirmDialog(null)} className="btn btn-ghost text-sm">Cancel</button>
              <button onClick={confirmDialog.onConfirm} disabled={batchLoading} className="btn btn-primary text-sm">
                {batchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary chips — global counts */}
      <div className="flex flex-wrap gap-3 mt-6">
        <button
          aria-pressed={filters.status === "pending"}
          onClick={() => setFilter("status", filters.status === "pending" ? "" : "pending")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition min-h-[44px]",
            filters.status === "pending"
              ? "bg-amber-100 border-amber-300 text-amber-900 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300"
              : "bg-surface border-line hover:border-amber-300",
          )}
        >
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <span>{globalCounts.pending}</span>
          <span className="font-normal text-muted">pending</span>
        </button>
        <button
          aria-pressed={filters.status === "reviewed"}
          onClick={() => setFilter("status", filters.status === "reviewed" ? "" : "reviewed")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition min-h-[44px]",
            filters.status === "reviewed"
              ? "bg-blue-100 border-blue-300 text-blue-900 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300"
              : "bg-surface border-line hover:border-blue-300",
          )}
        >
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>{pagination.total}</span>
          <span className="font-normal text-muted">reviewed</span>
        </button>
        <button
          aria-pressed={filters.status === "resolved"}
          onClick={() => setFilter("status", filters.status === "resolved" ? "" : "resolved")}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition min-h-[44px]",
            filters.status === "resolved"
              ? "bg-emerald-100 border-emerald-300 text-emerald-900 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300"
              : "bg-surface border-line hover:border-emerald-300",
          )}
        >
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{pagination.total}</span>
          <span className="font-normal text-muted">resolved</span>
        </button>
        <button
          onClick={() => setFilter("status", "")}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-semibold transition bg-surface border-line hover:border-rose-300 min-h-[44px]"
        >
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span>{globalCounts.multiReport}</span>
          <span className="font-normal text-muted">multi-report</span>
        </button>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface border border-line min-h-[44px]">
          <span className="text-sm font-semibold">{pagination.total}</span>
          <span className="text-sm text-muted font-normal">total</span>
        </div>
      </div>

      {/* Search + Filter row */}
      <div className="flex items-center gap-2 mt-5">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <label htmlFor="report-search" className="sr-only">Search reports</label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            id="report-search"
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search question, email, description..."
            className="input pl-9 pr-9 text-sm"
          />
          {searchInput && (
            <button type="button" onClick={() => { setSearchInput(""); setFilter("search", ""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition border shrink-0 min-h-[44px]",
            showFilters || hasFilters
              ? "bg-brand/10 text-brand border-brand/20 dark:bg-brand/20"
              : "bg-surface border-line text-muted hover:text-ink"
          )}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="ml-1 w-5 h-5 rounded-full bg-brand text-white text-xs grid place-items-center font-bold">
              {[filters.status, filters.issueType, filters.exam, filters.subject, filters.search].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasFilters && (
          <button
            onClick={() => { setSearchInput(""); router.push("/admin/reports"); }}
            className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-bad hover:bg-rose-50 dark:hover:bg-rose-950 transition shrink-0 min-h-[44px]"
          >
            <X className="w-3.5 h-3.5" />
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-xs text-muted">Active:</span>
          {filters.search && (
            <button onClick={() => { setSearchInput(""); setFilter("search", ""); }} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition">
              &quot;{filters.search}&quot; <X className="w-3 h-3" />
            </button>
          )}
          {filters.exam && (
            <button onClick={() => setFilter("exam", "")} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition">
              {filters.exam} <X className="w-3 h-3" />
            </button>
          )}
          {filters.subject && (
            <button onClick={() => setFilter("subject", "")} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition">
              {SUBJECT_LABELS[filters.subject] ?? filters.subject} <X className="w-3 h-3" />
            </button>
          )}
          {filters.status && (
            <button onClick={() => setFilter("status", "")} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition">
              {filters.status} <X className="w-3 h-3" />
            </button>
          )}
          {filters.issueType && (
            <button onClick={() => setFilter("issueType", "")} className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-brand/10 text-brand border border-brand/20 hover:bg-brand/20 transition">
              {filters.issueType.replace(/_/g, " ")} <X className="w-3 h-3" />
            </button>
          )}
        </div>
      )}

      {/* Filter panel */}
      {showFilters && (
        <div className="mt-3 p-4 rounded-xl bg-surface border border-line grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label htmlFor="filter-exam" className="text-xs font-semibold text-muted uppercase tracking-wider">Exam</label>
            <select id="filter-exam" value={filters.exam ?? ""} onChange={(e) => setFilter("exam", e.target.value)} className="input mt-1 text-sm">
              <option value="">All exams</option>
              {filterOptions.exams.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filter-subject" className="text-xs font-semibold text-muted uppercase tracking-wider">Subject</label>
            <select id="filter-subject" value={filters.subject ?? ""} onChange={(e) => setFilter("subject", e.target.value)} className="input mt-1 text-sm">
              <option value="">All subjects</option>
              {filterOptions.subjects.map((s) => <option key={s} value={s}>{SUBJECT_LABELS[s] ?? s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filter-status" className="text-xs font-semibold text-muted uppercase tracking-wider">Status</label>
            <select id="filter-status" value={filters.status ?? ""} onChange={(e) => setFilter("status", e.target.value)} className="input mt-1 text-sm">
              <option value="">All statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="filter-issue" className="text-xs font-semibold text-muted uppercase tracking-wider">Issue Type</label>
            <select id="filter-issue" value={filters.issueType ?? ""} onChange={(e) => setFilter("issueType", e.target.value)} className="input mt-1 text-sm">
              <option value="">All issue types</option>
              {ISSUE_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 px-4 py-3 rounded-xl bg-brand/5 border border-brand/20 dark:bg-brand/10 dark:border-brand/30">
          <span className="text-sm font-semibold">{selected.size} selected</span>
          <div className="flex items-center gap-2 ml-auto">
            {canBatchDismiss && (
              <button
                disabled={batchLoading}
                onClick={() => setConfirmDialog({
                  title: `Dismiss ${selected.size} report${selected.size > 1 ? "s" : ""}?`,
                  message: "This will mark the selected reports as dismissed. You can change this later.",
                  onConfirm: () => batchUpdate("dismissed"),
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 transition min-h-[44px]"
              >
                <Trash2 className="w-3.5 h-3.5" /> Dismiss
              </button>
            )}
            {canBatchResolve && (
              <button
                disabled={batchLoading}
                onClick={() => setConfirmDialog({
                  title: `Resolve ${selected.size} report${selected.size > 1 ? "s" : ""}?`,
                  message: "This will mark the selected reports as resolved.",
                  onConfirm: () => batchUpdate("resolved"),
                })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 transition min-h-[44px]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
              </button>
            )}
            <button onClick={() => setSelected(new Set())} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-muted hover:text-ink transition min-h-[44px]">
              Clear selection
            </button>
          </div>
        </div>
      )}

      {/* Report cards */}
      <div ref={listRef} className="mt-5 space-y-3">
        {/* Select all header */}
        {reports.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-2">
            <button
              onClick={toggleSelectAll}
              aria-checked={selected.size === reports.length}
              role="checkbox"
              className="text-muted hover:text-ink transition shrink-0 min-w-[44px] min-h-[44px] grid place-items-center"
            >
              {selected.size === reports.length ? (
                <CheckSquare className="w-5 h-5 text-brand" />
              ) : selected.size > 0 ? (
                <div className="w-5 h-5 rounded border-2 border-brand bg-brand/20 grid place-items-center">
                  <div className="w-2 h-0.5 bg-brand rounded" />
                </div>
              ) : (
                <Square className="w-5 h-5" />
              )}
            </button>
            <span className="text-xs text-muted">
              {selected.size > 0 ? `${selected.size} of ${reports.length} selected` : "Select all"}
            </span>
          </div>
        )}

        {reports.map((r, idx) => {
          const st = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.pending;
          const StatusIcon = st.icon;
          const isExpanded = expandedId === r.id;
          const isSelected = selected.has(r.id);
          const aging = r.status === "pending" ? getAging(r.createdAt) : null;

          return (
            <div
              key={r.id}
              data-report-card
              tabIndex={0}
              className={cn(
                "rounded-xl border transition-all focus:outline-2 focus:outline-brand/50",
                isSelected
                  ? "border-brand/40 bg-brand/5 dark:border-brand/30 dark:bg-brand/10"
                  : r.status === "pending"
                    ? "border-amber-200 bg-white dark:border-amber-800 dark:bg-slate-800"
                    : "border-line bg-surface",
                r.reporterCount > 1 && r.status === "pending" && !isSelected && "ring-1 ring-rose-200 dark:ring-rose-800",
              )}
            >
              {/* Card header */}
              <div className="flex items-start gap-3 p-4">
                {/* Checkbox */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleSelect(r.id); }}
                  aria-checked={isSelected}
                  role="checkbox"
                  className="mt-0.5 text-muted hover:text-brand transition shrink-0 min-w-[44px] min-h-[44px] grid place-items-center"
                >
                  {isSelected ? <CheckSquare className="w-5 h-5 text-brand" /> : <Square className="w-5 h-5" />}
                </button>

                {/* Expand */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : r.id)}
                  aria-expanded={isExpanded}
                  className="mt-0.5 text-muted hover:text-ink transition shrink-0 min-w-[44px] min-h-[44px] grid place-items-center"
                >
                  {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </button>

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="font-mono text-xs text-muted">
                      {r.mockRefId}:Q{Number(r.questionKey) + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-brand/10 text-brand dark:bg-brand/20">
                      {r.exam}
                    </span>
                    <span className="px-2 py-0.5 rounded text-xs font-medium text-muted">
                      {SUBJECT_LABELS[r.subject] ?? r.subject}
                    </span>
                    <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold border", ISSUE_COLORS[r.issueType] ?? ISSUE_COLORS.other)}>
                      {r.issueType.replace(/_/g, " ")}
                    </span>
                    {r.reporterCount > 1 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800">
                        {r.reporterCount} users reported
                      </span>
                    )}
                    {aging && (
                      <span className={cn("flex items-center gap-1 text-xs font-medium", aging.color)}>
                        <Clock className="w-3 h-3" />
                        {aging.label}
                      </span>
                    )}
                  </div>
                  {r.questionStem && (
                    <div className="text-sm text-ink/80 leading-relaxed line-clamp-2">
                      <MathText>{r.questionStem}</MathText>
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted">
                    {r.userName && <span className="font-medium text-ink">{r.userName}</span>}
                    <span>{r.userEmail}</span>
                    <span>·</span>
                    <span>{new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>

                {/* Status badge + links */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/reports?search=${encodeURIComponent(r.questionKey)}`}
                    title="View all reports for this question"
                    className="p-2 rounded-lg text-muted hover:text-brand hover:bg-brand/10 transition min-w-[44px] min-h-[44px] grid place-items-center"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                  <span className={cn("flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border", st.bg, st.color, st.darkBg, st.darkText)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {st.label}
                  </span>
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-0 border-t border-line/50">
                  <div className="grid sm:grid-cols-2 gap-4 mt-3">
                    <div>
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Reporter&apos;s description</h4>
                      <p className="text-sm text-ink leading-relaxed bg-canvas rounded-lg p-3">{r.description}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider mb-1.5">Question stem</h4>
                      {r.questionStem ? (
                        <div className="text-sm text-ink/80 leading-relaxed bg-canvas rounded-lg p-3">
                          <MathText>{r.questionStem}</MathText>
                        </div>
                      ) : (
                        <p className="text-sm text-muted italic bg-canvas rounded-lg p-3">Question not found in bank</p>
                      )}
                    </div>
                  </div>

                  {/* Admin note */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <h4 className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-1">
                        <StickyNote className="w-3.5 h-3.5" /> Admin note
                      </h4>
                      {r.reviewedBy && (
                        <span className="text-xs text-muted">Reviewed by {r.reviewedBy}</span>
                      )}
                    </div>
                    {editingNoteId === r.id ? (
                      <div className="flex gap-2">
                        <textarea
                          value={noteInput}
                          onChange={(e) => setNoteInput(e.target.value)}
                          placeholder="Add a note about this report..."
                          className="input text-sm resize-none flex-1"
                          rows={2}
                          autoFocus
                        />
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => saveNote(r.id)}
                            disabled={savingNote}
                            className="btn btn-primary text-xs min-h-[44px]"
                          >
                            {savingNote ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Save"}
                          </button>
                          <button
                            onClick={() => setEditingNoteId(null)}
                            className="btn btn-ghost text-xs min-h-[44px]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => { setEditingNoteId(r.id); setNoteInput(r.adminNote ?? ""); }}
                        className="text-sm bg-canvas rounded-lg p-3 cursor-pointer hover:bg-paper transition min-h-[44px] flex items-center"
                      >
                        {r.adminNote || <span className="text-muted italic">Click to add a note...</span>}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-line/50">
                    <span className="text-xs text-muted mr-auto">
                      {r.reportCount} total report{r.reportCount !== 1 ? "s" : ""} · {r.reporterCount} unique reporter{r.reporterCount !== 1 ? "s" : ""}
                    </span>
                    {r.status === "pending" && (
                      <>
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "reviewed")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800 transition disabled:opacity-50 min-h-[44px]"
                        >
                          Mark reviewed
                        </button>
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "resolved")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 transition disabled:opacity-50 min-h-[44px]"
                        >
                          Resolve
                        </button>
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => updateStatus(r.id, "dismissed")}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 transition disabled:opacity-50 min-h-[44px]"
                        >
                          Dismiss
                        </button>
                      </>
                    )}
                    {r.status === "reviewed" && (
                      <button
                        disabled={updatingId === r.id}
                        onClick={() => updateStatus(r.id, "resolved")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800 transition disabled:opacity-50 min-h-[44px]"
                      >
                        Resolve
                      </button>
                    )}
                    {(r.status === "resolved" || r.status === "dismissed") && (
                      <button
                        disabled={updatingId === r.id}
                        onClick={() => updateStatus(r.id, "pending")}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800 transition disabled:opacity-50 min-h-[44px]"
                      >
                        Re-open
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {reports.length === 0 && (
          <div className="text-center py-16 text-muted">
            <div className="text-4xl mb-3" role="img" aria-label="Search">🔍</div>
            <p className="text-lg font-semibold">No reports found</p>
            <p className="text-sm mt-1">
              {hasFilters
                ? "Try adjusting your filters or clearing them to see all reports."
                : "When users report issues with questions, they'll appear here."}
            </p>
            {hasFilters && (
              <button onClick={() => { setSearchInput(""); router.push("/admin/reports"); }} className="btn btn-ghost text-sm mt-4">
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <nav className="flex justify-center items-center gap-3 mt-8" aria-label="Pagination">
          <button
            disabled={pagination.page <= 1}
            onClick={() => goToPage(pagination.page - 1)}
            className="btn btn-ghost text-sm disabled:opacity-50 min-h-[44px]"
          >
            ← Prev
          </button>
          <div className="flex gap-1">
            {pageNumbers.map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                aria-current={p === pagination.page ? "page" : undefined}
                className={cn(
                  "w-11 h-11 rounded-lg text-sm font-medium transition",
                  p === pagination.page
                    ? "bg-brand text-white"
                    : "text-muted hover:bg-slate-100 dark:hover:bg-slate-800",
                )}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => goToPage(pagination.page + 1)}
            className="btn btn-ghost text-sm disabled:opacity-50 min-h-[44px]"
          >
            Next →
          </button>
        </nav>
      )}

      {/* Keyboard shortcuts hint */}
      <p className="text-xs text-muted text-center mt-6">
        Keyboard: <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono">J</kbd>/<kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono">K</kbd> navigate · <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono">Enter</kbd> expand · <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono">R</kbd> review · <kbd className="px-1.5 py-0.5 rounded bg-surface border border-line font-mono">D</kbd> dismiss
      </p>
    </>
  );
}
