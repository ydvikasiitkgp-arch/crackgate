"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { CareerDetailModal } from "./CareerDetailModal";

type Application = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  message: string | null;
  portfolio: string | null;
  status: string;
  notes: string | null;
  reviewedAt: string | null;
  createdAt: string;
};

type Props = {
  applications: Application[];
  kpis: {
    total: number;
    newCount: number;
    thisWeekCount: number;
    shortlistedCount: number;
    roleBreakdown: Record<string, number>;
  };
  adminName: string;
};

const ROLES = ["Questions Evaluator", "Marketing & Sales", "Content Creator", "Other"] as const;
const STATUSES = ["new", "reviewed", "shortlisted", "rejected"] as const;

const ROLE_COLORS: Record<string, string> = {
  "Questions Evaluator": "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Marketing & Sales": "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  "Content Creator": "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400",
  Other: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  reviewed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  shortlisted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function timeGroup(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const dayMs = 86400000;
  if (diff < dayMs && d.getDate() === now.getDate()) return "Today";
  if (diff < 2 * dayMs) return "Yesterday";
  if (diff < 7 * dayMs) return "This Week";
  return "Earlier";
}

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function exportCsv(apps: Application[]) {
  const headers = ["Name", "Email", "Phone", "Role", "Status", "Message", "Portfolio", "Applied"];
  const rows = apps.map((a) => [
    a.name, a.email, a.phone, a.role, a.status,
    (a.message ?? "").replace(/"/g, '""'),
    a.portfolio ?? "",
    new Date(a.createdAt).toLocaleDateString("en-IN"),
  ]);
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `career-applications-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function CareersClient({ applications, kpis, adminName }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = applications;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q),
      );
    }
    if (roleFilter) list = list.filter((a) => a.role === roleFilter);
    if (statusFilter) list = list.filter((a) => a.status === statusFilter);
    return list;
  }, [applications, search, roleFilter, statusFilter]);

  const grouped = useMemo(() => {
    const groups = new Map<string, Application[]>();
    for (const app of filtered) {
      const g = timeGroup(app.createdAt);
      const arr = groups.get(g) ?? [];
      arr.push(app);
      groups.set(g, arr);
    }
    return groups;
  }, [filtered]);

  const groupOrder = ["Today", "Yesterday", "This Week", "Earlier"];

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((a) => a.id)));
  }, [selected.size, filtered]);

  const bulkAction = useCallback(async (status: string) => {
    const ids = [...selected];
    await Promise.all(
      ids.map((id) =>
        fetch(`/api/admin/careers/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status }),
        }),
      ),
    );
    setSelected(new Set());
    showToast(`Marked ${ids.length} as ${status}`);
    router.refresh();
  }, [selected, router]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-10">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-ok text-white shadow-pop text-sm font-semibold animate-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Career Applications</h1>
          <p className="text-muted mt-1">Manage incoming job applications</p>
        </div>
        <button
          onClick={() => exportCsv(filtered)}
          className="badge bg-surface border border-line px-3 py-2 text-sm font-medium hover:bg-paper transition-colors cursor-pointer"
        >
          Export CSV ({filtered.length})
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
        <AdminKpiCard label="Total" value={kpis.total} icon="Users" tone="brand" />
        <AdminKpiCard
          label="New"
          value={kpis.newCount}
          icon="Zap"
          tone="accent"
          subtitle={kpis.newCount > 0 ? "Needs review" : "All caught up"}
        />
        <AdminKpiCard label="This Week" value={kpis.thisWeekCount} icon="Clock" tone="ok" />
        <AdminKpiCard label="Shortlisted" value={kpis.shortlistedCount} icon="Flag" tone="ok" />
      </div>

      {/* Role Breakdown Bar */}
      {Object.keys(kpis.roleBreakdown).length > 0 && (
        <div className="mt-6 card p-4">
          <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Applications by Role</div>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
            {ROLES.map((role) => {
              const count = kpis.roleBreakdown[role] ?? 0;
              if (!count) return null;
              const pct = (count / kpis.total) * 100;
              return (
                <div
                  key={role}
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor:
                      role === "Questions Evaluator" ? "#6366f1" :
                      role === "Marketing & Sales" ? "#06b6d4" :
                      role === "Content Creator" ? "#8b5cf6" : "#94a3b8",
                  }}
                  title={`${role}: ${count}`}
                />
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            {ROLES.map((role) => {
              const count = kpis.roleBreakdown[role] ?? 0;
              if (!count) return null;
              return (
                <span key={role} className="flex items-center gap-1.5 text-xs text-muted">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        role === "Questions Evaluator" ? "#6366f1" :
                        role === "Marketing & Sales" ? "#06b6d4" :
                        role === "Content Creator" ? "#8b5cf6" : "#94a3b8",
                    }}
                  />
                  {role} ({count})
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input flex-1 min-w-0"
        />
        <div className="flex gap-2 flex-wrap">
          {ROLES.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(roleFilter === role ? null : role)}
              className={`px-3 py-2 rounded-lg border text-xs font-semibold transition min-h-[44px] cursor-pointer ${
                roleFilter === role
                  ? "bg-brand/10 text-brand border-brand/20"
                  : "border-line text-muted hover:bg-paper"
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Chips */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(statusFilter === s ? null : s)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
              statusFilter === s
                ? `${STATUS_COLORS[s]} ring-1 ring-current`
                : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Bulk Actions */}
      {selected.size > 0 && (
        <div className="mt-4 px-4 py-3 rounded-xl bg-brand/5 border border-brand/20 flex items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-brand">{selected.size} selected</span>
          <button onClick={() => bulkAction("reviewed")} className="badge bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 px-3 py-1.5 text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer">
            Mark Reviewed
          </button>
          <button onClick={() => bulkAction("shortlisted")} className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-1.5 text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800 cursor-pointer">
            Shortlist
          </button>
          <button onClick={() => bulkAction("rejected")} className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1.5 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-800 cursor-pointer">
            Reject
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted hover:text-ink cursor-pointer">
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      <div className="mt-6 card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted uppercase tracking-wider border-b border-line">
              <tr>
                <th className="px-3 sm:px-6 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-line cursor-pointer"
                  />
                </th>
                <th className="px-3 sm:px-6 py-3 text-left">Status</th>
                <th className="px-3 sm:px-6 py-3 text-left">Applicant</th>
                <th className="px-3 sm:px-6 py-3 text-left">Role</th>
                <th className="px-3 sm:px-6 py-3 text-left hidden md:table-cell">Contact</th>
                <th className="px-3 sm:px-6 py-3 text-left hidden lg:table-cell">Portfolio</th>
                <th className="px-3 sm:px-6 py-3 text-left">Applied</th>
                <th className="px-3 sm:px-6 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <div className="text-muted text-sm">No applications found</div>
                    <div className="text-xs text-muted mt-1">
                      {applications.length === 0
                        ? "No one has applied yet. Share the careers page!"
                        : "Try adjusting your filters."}
                    </div>
                  </td>
                </tr>
              ) : (
                groupOrder.map((groupName) => {
                  const apps = grouped.get(groupName);
                  if (!apps || apps.length === 0) return null;
                  return (
                    <Fragment key={groupName}>
                      <tr>
                        <td colSpan={8} className="px-3 sm:px-6 py-2 bg-paper/50">
                          <span className="text-xs font-semibold text-muted uppercase tracking-wider">
                            {groupName} ({apps.length})
                          </span>
                        </td>
                      </tr>
                      {apps.map((app) => (
                        <tr
                          key={app.id}
                          className="hover:bg-paper/50 transition-colors cursor-pointer group"
                          onClick={() => setDetailId(app.id)}
                        >
                          <td className="px-3 sm:px-6 py-3" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={selected.has(app.id)}
                              onChange={() => toggleSelect(app.id)}
                              className="rounded border-line cursor-pointer"
                            />
                          </td>
                          <td className="px-3 sm:px-6 py-3">
                            <span className="relative inline-flex items-center gap-1.5">
                              {app.status === "new" && (
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                                </span>
                              )}
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[app.status] ?? STATUS_COLORS.new}`}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                              </span>
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                                {initials(app.name)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-ink truncate">{app.name}</div>
                                <div className="text-xs text-muted truncate md:hidden">{app.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[app.role] ?? ROLE_COLORS.Other}`}>
                              {app.role}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 hidden md:table-cell">
                            <div className="text-xs text-muted truncate max-w-[200px]">{app.email}</div>
                            <div className="text-xs text-muted">{app.phone}</div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 hidden lg:table-cell">
                            {app.portfolio ? (
                              <a
                                href={app.portfolio}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-brand text-xs hover:underline"
                              >
                                Link
                              </a>
                            ) : (
                              <span className="text-xs text-muted">—</span>
                            )}
                          </td>
                          <td className="px-3 sm:px-6 py-3">
                            <span className="text-xs text-muted">{relativeTime(app.createdAt)}</span>
                          </td>
                          <td className="px-3 sm:px-6 py-3">
                            <span className="text-muted opacity-0 group-hover:opacity-100 transition-opacity text-xs">
                              →
                            </span>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {detailId && (
        <CareerDetailModal
          application={applications.find((a) => a.id === detailId)!}
          onClose={() => setDetailId(null)}
          onUpdated={() => {
            setDetailId(null);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}

// Fragment import
import { Fragment } from "react";
