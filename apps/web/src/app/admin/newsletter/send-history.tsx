"use client";

import { useState, useEffect, useCallback } from "react";

interface SendSummary {
  id: string;
  subject: string;
  sentAt: string;
  recipientCount: number;
  sentCount: number;
  failedCount: number;
  status: "completed" | "partial" | "failed";
}

interface SendItem {
  email: string;
  status: "delivered" | "failed";
  error: string | null;
}

type ItemFilter = "all" | SendItem["status"];

function statusBadge(status: SendSummary["status"]) {
  if (status === "failed") return <span className="text-xs font-bold text-bad bg-bad/10 rounded-full px-2.5 py-1">Failed</span>;
  if (status === "partial") return <span className="text-xs font-bold text-amber-600 bg-amber-500/10 rounded-full px-2.5 py-1">Partial</span>;
  return <span className="text-xs font-bold text-ok bg-emerald-500/10 rounded-full px-2.5 py-1">Delivered</span>;
}

export default function SendHistory({ refreshKey }: { refreshKey: number }) {
  const [sends, setSends] = useState<SendSummary[] | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<Map<string, SendItem[]>>(new Map());
  const [loadingItems, setLoadingItems] = useState<Set<string>>(new Set());
  const [itemFilters, setItemFilters] = useState<Map<string, ItemFilter>>(new Map());
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setItemFilter(id: string, filter: ItemFilter) {
    setItemFilters((prev) => new Map(prev).set(id, filter));
  }

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletter/sends", { cache: "no-store" });
      if (!res.ok) throw new Error("failed to load");
      const data = await res.json();
      setSends(data.sends);
    } catch {
      setError("Could not load send history.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  async function toggleDetails(id: string) {
    const next = new Set(expanded);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
      if (!items.has(id)) {
        setLoadingItems((prev) => new Set(prev).add(id));
        try {
          const res = await fetch(`/api/admin/newsletter/sends/${id}`, { cache: "no-store" });
          if (res.ok) {
            const data = await res.json();
            setItems((prev) => new Map(prev).set(id, data.items));
          }
        } finally {
          setLoadingItems((prev) => {
            const copy = new Set(prev);
            copy.delete(id);
            return copy;
          });
        }
      }
    }
    setExpanded(next);
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAll() {
    setSelected((prev) => {
      const all = sends?.map((s) => s.id) ?? [];
      const next = new Set(all);
      if (prev.size === all.length && all.length > 0) return new Set();
      return next;
    });
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} send${selected.size > 1 ? "s" : ""} and their results?`)) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/newsletter/sends", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: [...selected] }),
      });
      if (!res.ok) throw new Error("delete failed");
      setSelected(new Set());
      await load();
    } catch {
      setError("Could not delete. Try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-lg">Send history</h2>
        {sends && sends.length > 0 && (
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={sends.length > 0 && selected.size === sends.length}
                onChange={toggleAll}
                className="accent-brand"
              />
              Select all
            </label>
            <button
              onClick={deleteSelected}
              disabled={selected.size === 0 || deleting}
              className="text-xs font-semibold text-bad border border-bad/40 rounded-lg px-3 py-1.5 hover:bg-bad/10 disabled:opacity-40 transition-colors"
            >
              {deleting ? "Deleting…" : `Delete selected (${selected.size})`}
            </button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-bad mt-2">{error}</p>}

      {sends === null ? (
        <p className="text-sm text-muted mt-3">Loading…</p>
      ) : sends.length === 0 ? (
        <p className="text-sm text-muted italic mt-3">No sends yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {sends.map((s) => (
            <li key={s.id} className="rounded-lg border border-line bg-canvas/60">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <input
                  type="checkbox"
                  checked={selected.has(s.id)}
                  onChange={() => toggleSelect(s.id)}
                  className="accent-brand shrink-0"
                />
                <button onClick={() => toggleDetails(s.id)} className="flex-1 min-w-0 text-left group">
                  <div className="font-semibold text-sm truncate group-hover:text-brand transition-colors">
                    {s.subject}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    {new Date(s.sentAt).toLocaleString()} · {s.recipientCount} recipients · {s.sentCount} delivered ·{" "}
                    {s.failedCount} failed
                  </div>
                </button>
                {statusBadge(s.status)}
              </div>

              {expanded.has(s.id) && (
                <div className="border-t border-line px-4 py-3">
                  {loadingItems.has(s.id) ? (
                    <p className="text-xs text-muted">Loading…</p>
                  ) : (
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs text-muted">Status:</span>
                      <div className="flex rounded-lg border border-line p-0.5 bg-canvas text-xs font-medium">
                        {(["all", "delivered", "failed"] as const).map((f) => {
                          const current = itemFilters.get(s.id) ?? "all";
                          return (
                            <button
                              key={f}
                              type="button"
                              onClick={() => setItemFilter(s.id, f)}
                              className={`px-3 py-1 rounded-md transition capitalize ${
                                current === f ? "bg-brand text-white shadow-sm" : "text-muted hover:text-ink"
                              }`}
                            >
                              {f}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {!loadingItems.has(s.id) && (
                    <div className="max-h-72 overflow-y-auto rounded-lg border border-line">
                      <table className="w-full text-left text-xs">
                        <thead className="sticky top-0 bg-canvas text-muted">
                          <tr>
                            <th className="px-3 py-2 font-semibold">Status</th>
                            <th className="px-3 py-2 font-semibold">Email</th>
                            <th className="px-3 py-2 font-semibold">Error</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {(items.get(s.id) ?? [])
                            .filter((i) => (itemFilters.get(s.id) ?? "all") === "all" || i.status === (itemFilters.get(s.id) ?? "all"))
                            .map((i) => (
                            <tr key={i.email} className="align-top">
                              <td className="px-3 py-2 whitespace-nowrap">
                                {i.status === "delivered" ? (
                                  <span className="text-ok font-semibold">✓ Delivered</span>
                                ) : (
                                  <span className="text-bad font-semibold">✗ Failed</span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-mono break-all">{i.email}</td>
                              <td className="px-3 py-2 text-muted break-words">
                                {i.status === "delivered" ? "—" : (i.error ?? "unknown error")}
                              </td>
                            </tr>
                          ))}
                          {items.has(s.id) && items.get(s.id)!.length === 0 && (
                            <tr>
                              <td colSpan={3} className="px-3 py-4 text-center text-muted italic">No recipients.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
