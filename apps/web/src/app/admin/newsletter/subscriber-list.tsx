"use client";

import { useState, useMemo } from "react";

interface Subscriber {
  email: string;
  source: string;
  subscribedAt: string;
  plan: string | null;
  isPaid: boolean;
}

interface Props {
  subscribers: Subscriber[];
  selectedEmails: Map<string, string | null>;
  onSelectionChange: (emails: Map<string, string | null>) => void;
}

type PlanFilter = "all" | "free" | "paid";

export default function SubscriberList({ subscribers, selectedEmails, onSelectionChange }: Props) {
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (planFilter === "paid" && !s.isPaid) return false;
      if (planFilter === "free" && s.isPaid) return false;
      if (search && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [subscribers, planFilter, search]);

  const filteredEmails = useMemo(() => new Set(filtered.map((s) => s.email)), [filtered]);
  const allSelected = filtered.length > 0 && filtered.every((s) => selectedEmails.has(s.email));
  const someSelected = filtered.some((s) => selectedEmails.has(s.email)) && !allSelected;

  const paidCount = subscribers.filter((s) => s.isPaid).length;
  const freeCount = subscribers.length - paidCount;

  function toggleAll() {
    if (allSelected) {
      const next = new Map(selectedEmails);
      filteredEmails.forEach((e) => next.delete(e));
      onSelectionChange(next);
    } else {
      const next = new Map(selectedEmails);
      filteredEmails.forEach((e) => next.set(e, null));
      onSelectionChange(next);
    }
  }

  function toggle(email: string) {
    const next = new Map(selectedEmails);
    if (next.has(email)) {
      next.delete(email);
    } else {
      next.set(email, null);
    }
    onSelectionChange(next);
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-line">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Subscribers</h2>
          <span className="text-sm text-muted">{subscribers.length} total</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-line p-0.5 bg-canvas text-xs font-medium">
            {(["all", "free", "paid"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setPlanFilter(f)}
                className={`px-3 py-1 rounded-md transition capitalize ${
                  planFilter === f
                    ? "bg-brand text-white shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                {f}
                {f === "free" && ` (${freeCount})`}
                {f === "paid" && ` (${paidCount})`}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-xs ml-auto w-48"
          />
        </div>

        {selectedEmails.size > 0 && (
          <p className="text-xs text-muted mt-2">
            {selectedEmails.size} selected{filtered.length !== subscribers.length ? ` (filtered from ${subscribers.length})` : ""}
          </p>
        )}
      </div>

      <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="text-muted text-left border-b border-line bg-canvas/50 sticky top-0">
            <tr>
              <th className="py-2.5 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => { if (el) el.indeterminate = someSelected; }}
                  onChange={toggleAll}
                  className="accent-brand"
                />
              </th>
              <th className="py-2.5 px-3 font-medium">Email</th>
              <th className="py-2.5 px-3 font-medium">Status</th>
              <th className="py-2.5 px-3 font-medium">Source</th>
              <th className="py-2.5 px-3 font-medium">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.email} className="border-b border-line/60 hover:bg-canvas/30 transition-colors">
                <td className="py-2.5 px-4">
                  <input
                    type="checkbox"
                    checked={selectedEmails.has(s.email)}
                    onChange={() => toggle(s.email)}
                    className="accent-brand"
                  />
                </td>
                <td className="py-2.5 px-3 font-medium truncate max-w-[240px]">{s.email}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.isPaid
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-50 text-slate-600 border border-slate-200"
                  }`}>
                    {s.isPaid ? "paid" : "free"}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-muted truncate max-w-[120px]">{s.source}</td>
                <td className="py-2.5 px-3 text-muted whitespace-nowrap">
                  {new Date(s.subscribedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-muted">
                  {subscribers.length === 0 ? "No subscribers yet." : "No subscribers match the filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
