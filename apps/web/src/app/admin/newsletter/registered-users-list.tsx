"use client";

import { useState, useMemo } from "react";

interface RegisteredUser {
  email: string;
  name: string | null;
  phone: string | null;
  plan: string;
  isPaid: boolean;
  joinedAt: string;
}

interface Props {
  users: RegisteredUser[];
  selectedEmails: Map<string, string | null>;
  onSelectionChange: (emails: Map<string, string | null>) => void;
}

type PlanFilter = "all" | "free" | "paid";

export default function RegisteredUsersList({ users, selectedEmails, onSelectionChange }: Props) {
  const [planFilter, setPlanFilter] = useState<PlanFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return users.filter((u) => {
      if (planFilter === "paid" && !u.isPaid) return false;
      if (planFilter === "free" && u.isPaid) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!u.email.toLowerCase().includes(q) && !(u.name ?? "").toLowerCase().includes(q) && !(u.phone ?? "").includes(q)) return false;
      }
      return true;
    });
  }, [users, planFilter, search]);

  const filteredEmails = useMemo(() => new Set(filtered.map((u) => u.email)), [filtered]);
  const allSelected = filtered.length > 0 && filtered.every((u) => selectedEmails.has(u.email));
  const someSelected = filtered.some((u) => selectedEmails.has(u.email)) && !allSelected;

  const paidCount = users.filter((u) => u.isPaid).length;
  const freeCount = users.length - paidCount;

  function toggleAll() {
    if (allSelected) {
      const next = new Map(selectedEmails);
      filteredEmails.forEach((e) => next.delete(e));
      onSelectionChange(next);
    } else {
      const next = new Map(selectedEmails);
      filtered.forEach((u) => next.set(u.email, u.name?.trim() ? u.name : null));
      onSelectionChange(next);
    }
  }

  function toggle(user: RegisteredUser) {
    const next = new Map(selectedEmails);
    if (next.has(user.email)) {
      next.delete(user.email);
    } else {
      next.set(user.email, user.name?.trim() ? user.name : null);
    }
    onSelectionChange(next);
  }

  return (
    <div className="card overflow-hidden">
      <div className="p-5 border-b border-line">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-lg">Registered Users</h2>
          <span className="text-sm text-muted">{users.length} total</span>
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
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-xs ml-auto w-48"
          />
        </div>

        {selectedEmails.size > 0 && (
          <p className="text-xs text-muted mt-2">
            {selectedEmails.size} selected{filtered.length !== users.length ? ` (filtered from ${users.length})` : ""}
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
              <th className="py-2.5 px-3 font-medium">Name</th>
              <th className="hidden md:table-cell py-2.5 px-3 font-medium">Phone</th>
              <th className="py-2.5 px-3 font-medium">Plan</th>
              <th className="py-2.5 px-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.email} className="border-b border-line/60 hover:bg-canvas/30 transition-colors">
                <td className="py-2.5 px-4">
                  <input
                    type="checkbox"
                    checked={selectedEmails.has(u.email)}
                    onChange={() => toggle(u)}
                    className="accent-brand"
                  />
                </td>
                <td className="py-2.5 px-3 font-medium truncate max-w-[240px]">{u.email}</td>
                <td className="py-2.5 px-3 text-muted truncate max-w-[150px]">{u.name ?? "—"}</td>
                <td className="hidden md:table-cell py-2.5 px-3 text-muted text-xs">{u.phone ?? "—"}</td>
                <td className="py-2.5 px-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    u.isPaid
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-slate-50 text-slate-600 border border-slate-200"
                  }`}>
                    {u.isPaid ? "paid" : "free"}
                  </span>
                </td>
                <td className="py-2.5 px-3 text-muted whitespace-nowrap">
                  {new Date(u.joinedAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">
                  {users.length === 0 ? "No registered users yet." : "No users match the filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
