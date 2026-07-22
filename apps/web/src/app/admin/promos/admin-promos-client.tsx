"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, Plus, X, Loader2, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

type Promo = {
  id: string;
  code: string;
  type: string;
  value: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
};

type Props = {
  promos: Promo[];
  admin: { email: string; source: string };
};

export default function AdminPromosClient({ promos, admin }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  // Form state
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "flat">("percent");
  const [value, setValue] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  function flash(type: "ok" | "err", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const r = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          type,
          value: Number(value),
          maxUses: maxUses ? Number(maxUses) : null,
          expiresAt: expiresAt || null,
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Failed");
      flash("ok", `Created promo code: ${data.code}`);
      setShowForm(false);
      setCode(""); setValue(""); setMaxUses(""); setExpiresAt("");
      router.refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(id: string, current: boolean) {
    try {
      await fetch(`/api/admin/promos/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ active: !current }),
      });
      router.refresh();
    } catch { /* non-critical */ }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this promo code? This cannot be undone.")) return;
    try {
      const r = await fetch(`/api/admin/promos/${id}`, { method: "DELETE" });
      if (r.ok) {
        flash("ok", "Promo code deleted");
        router.refresh();
      }
    } catch { /* non-critical */ }
  }

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className={`fixed top-20 right-6 z-50 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg ${toast.type === "ok" ? "bg-ok text-white" : "bg-err text-white"}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-ink">Promo Codes</h1>
          <p className="text-sm text-muted mt-1">Create and manage discount codes for checkout.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary text-sm gap-1.5">
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? "Cancel" : "New Code"}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="card p-5 mb-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Code</label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. FIRST10"
                className="input w-full uppercase tracking-wider"
                maxLength={30}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as "percent" | "flat")} className="input w-full">
                <option value="percent">% off</option>
                <option value="flat">Flat ₹ off (paise)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">
                {type === "percent" ? "Percentage (e.g. 10 = 10%)" : "Amount in paise (e.g. 5000 = ₹50)"}
              </label>
              <input
                required
                type="number"
                min={1}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Max uses (blank = unlimited)</label>
              <input
                type="number"
                min={1}
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="Unlimited"
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Expires (blank = never)</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
          {error && <p className="text-xs text-err">{error}</p>}
          <button type="submit" disabled={busy || !code.trim() || !value} className="btn btn-primary text-sm gap-1.5">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create Code
          </button>
        </form>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted border-b border-line">
              <tr>
                <th className="text-left py-3 px-4">Code</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Value</th>
                <th className="text-left py-3 px-4 hidden sm:table-cell">Uses</th>
                <th className="text-left py-3 px-4 hidden md:table-cell">Expires</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-right py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted text-sm">
                    No promo codes yet. Create one above.
                  </td>
                </tr>
              ) : (
                promos.map((p) => (
                  <tr key={p.id} className="hover:bg-paper/50">
                    <td className="py-3 px-4 font-mono font-semibold text-ink">{p.code}</td>
                    <td className="py-3 px-4 text-muted capitalize">{p.type}</td>
                    <td className="py-3 px-4 font-semibold text-ink">
                      {p.type === "percent" ? `${p.value}%` : `₹${Math.round(p.value / 100)}`}
                    </td>
                    <td className="py-3 px-4 text-muted hidden sm:table-cell">
                      {p.usedCount}{p.maxUses != null ? ` / ${p.maxUses}` : ""}
                    </td>
                    <td className="py-3 px-4 text-muted text-xs hidden md:table-cell">
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString("en-IN") : "Never"}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${p.active ? "bg-ok/15 text-ok" : "bg-muted/15 text-muted"}`}>
                        {p.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => toggleActive(p.id, p.active)} className="p-1.5 rounded-lg hover:bg-paper text-muted hover:text-ink transition" title={p.active ? "Deactivate" : "Activate"}>
                          {p.active ? <ToggleRight className="w-4 h-4 text-ok" /> : <ToggleLeft className="w-4 h-4" />}
                        </button>
                        <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
