"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { whatsappLink } from "@/lib/contact";

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

const STATUSES = ["new", "reviewed", "shortlisted", "rejected"] as const;

const STATUS_COLORS: Record<string, string> = {
  new: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  reviewed: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  shortlisted: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export function CareerDetailModal({
  application,
  onClose,
  onUpdated,
}: {
  application: Application;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [status, setStatus] = useState(application.status);
  const [notes, setNotes] = useState(application.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const notesRef = useRef<HTMLTextAreaElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const saveStatus = useCallback(async (newStatus: string) => {
    setStatus(newStatus);
    setSaving(true);
    await fetch(`/api/admin/careers/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setSaving(false);
    showToast(`Status updated to ${newStatus}`);
    onUpdated();
  }, [application.id, onUpdated]);

  const saveNotes = useCallback(async () => {
    setSaving(true);
    await fetch(`/api/admin/careers/${application.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setSaving(false);
    showToast("Notes saved");
  }, [application.id, notes]);

  const deleteApp = useCallback(async () => {
    if (!confirm("Delete this application permanently?")) return;
    await fetch(`/api/admin/careers/${application.id}`, { method: "DELETE" });
    onUpdated();
  }, [application.id, onUpdated]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg bg-surface border-l border-line shadow-pop overflow-y-auto animate-in slide-in-from-right"
      >
        {/* Toast */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl bg-ok text-white shadow-pop text-sm font-semibold animate-in slide-in-from-top-2">
            {toast}
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-10 bg-surface border-b border-line px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-brand/10 text-brand text-sm font-bold flex items-center justify-center">
              {initials(application.name)}
            </div>
            <div>
              <h2 className="text-lg font-extrabold">{application.name}</h2>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-paper transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Contact */}
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Contact</h3>
            <div className="space-y-2">
              <a href={`mailto:${application.email}`} className="flex items-center gap-2 text-sm text-brand hover:underline">
                ✉ {application.email}
              </a>
              <a href={`tel:${application.phone}`} className="flex items-center gap-2 text-sm text-brand hover:underline">
                ☎ {application.phone}
              </a>
              {application.portfolio && (
                <a href={application.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand hover:underline">
                  🔗 Portfolio
                </a>
              )}
            </div>
          </section>

          {/* Role & Timeline */}
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted text-xs">Role</div>
                <div className="font-semibold">{application.role}</div>
              </div>
              <div>
                <div className="text-muted text-xs">Applied</div>
                <div className="font-semibold">{formatDate(application.createdAt)}</div>
              </div>
              {application.reviewedAt && (
                <div>
                  <div className="text-muted text-xs">Reviewed</div>
                  <div className="font-semibold">{formatDate(application.reviewedAt)}</div>
                </div>
              )}
            </div>
          </section>

          {/* Application Message */}
          {application.message && (
            <section>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Message</h3>
              <div className="card p-4 text-sm leading-relaxed text-ink whitespace-pre-wrap">
                {application.message}
              </div>
            </section>
          )}

          {/* Status Changer */}
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => saveStatus(s)}
                  disabled={saving || status === s}
                  className={`px-3 py-2.5 rounded-lg text-xs font-semibold transition min-h-[44px] cursor-pointer ${
                    status === s
                      ? `${STATUS_COLORS[s]} ring-2 ring-current`
                      : "bg-paper border border-line text-muted hover:bg-canvas"
                  } disabled:opacity-50`}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* Admin Notes */}
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Admin Notes</h3>
            <textarea
              ref={notesRef}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              onBlur={saveNotes}
              placeholder="Add private notes about this candidate..."
              rows={4}
              className="input w-full text-sm resize-y"
            />
            <div className="text-[10px] text-muted mt-1">Auto-saves on blur</div>
          </section>

          {/* Quick Actions */}
          <section>
            <h3 className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Quick Actions</h3>
            <div className="flex gap-2 flex-wrap">
              <a
                href={`mailto:${application.email}?subject=CrackGate Career Application — ${application.role}`}
                target="_blank"
                rel="noopener noreferrer"
                className="badge bg-brand/10 text-brand px-3 py-2 text-xs font-semibold hover:bg-brand/20 transition-colors"
              >
                ✉ Send Email
              </a>
              <a
                href={whatsappLink(`Hi ${application.name}, regarding your application for ${application.role} at CrackGate...`)}
                target="_blank"
                rel="noopener noreferrer"
                className="badge bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-3 py-2 text-xs font-semibold hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
              >
                💬 WhatsApp
              </a>
              <button
                onClick={deleteApp}
                className="badge bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-2 text-xs font-semibold hover:bg-red-200 dark:hover:bg-red-800 transition-colors cursor-pointer"
              >
                🗑 Delete
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
