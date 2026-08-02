"use client";

import { useState, useEffect, useCallback } from "react";

interface ScheduledSend {
  id: string;
  subject: string;
  scheduledAt: string;
  recipientCount: number;
  recipients: { email: string; name?: string | null }[];
  html: string;
}

export default function ScheduledSends({ refreshKey }: { refreshKey: number }) {
  const [schedules, setSchedules] = useState<ScheduledSend[] | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [rescheduling, setRescheduling] = useState<string | null>(null);
  const [newTime, setNewTime] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/newsletter/schedules", { cache: "no-store" });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setSchedules(data.schedules);
    } catch {
      setError("Could not load scheduled sends.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  function minSchedule() {
    const d = new Date(Date.now() + 3600_000);
    return d.toISOString().slice(0, 16);
  }

  async function reschedule(s: ScheduledSend) {
    if (!newTime) {
      setError("Pick a new date & time.");
      return;
    }
    setBusy(s.id);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/newsletter/schedules/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledAt: new Date(newTime).toISOString() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? `HTTP ${res.status}`);
        return;
      }
      setMessage(`“${s.subject}” rescheduled for ${new Date(data.scheduledFor).toLocaleString()}.`);
      setRescheduling(null);
      setNewTime("");
      await load();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-6">
      <h2 className="font-bold text-lg">Scheduled sends</h2>
      {error && <p className="text-sm text-bad mt-2">{error}</p>}
      {message && <p className="text-sm text-ok mt-2">{message}</p>}

      {schedules === null ? (
        <p className="text-sm text-muted mt-3">Loading…</p>
      ) : schedules.length === 0 ? (
        <p className="text-sm text-muted italic mt-3">No emails scheduled.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {schedules.map((s) => (
            <li key={s.id} className="rounded-lg border border-line bg-canvas/60">
              <div className="flex flex-wrap items-center gap-3 px-4 py-3">
                <button
                  onClick={() => {
                    setExpanded((prev) => {
                      const next = new Set(prev);
                      if (next.has(s.id)) next.delete(s.id);
                      else next.add(s.id);
                      return next;
                    });
                  }}
                  className="flex-1 min-w-0 text-left group"
                >
                  <div className="font-semibold text-sm truncate group-hover:text-brand transition-colors">
                    {s.subject}
                  </div>
                  <div className="text-xs text-muted mt-0.5">
                    Scheduled for {new Date(s.scheduledAt).toLocaleString()} · {s.recipientCount} recipients
                  </div>
                </button>
                <span className="text-xs font-bold text-amber-600 bg-amber-500/10 rounded-full px-2.5 py-1">Scheduled</span>
                <button
                  onClick={() => {
                    setRescheduling(rescheduling === s.id ? null : s.id);
                    setNewTime("");
                  }}
                  className="text-xs font-semibold rounded-lg border border-line px-3 py-1.5 hover:border-brand transition-colors"
                >
                  {rescheduling === s.id ? "Cancel" : "Reschedule"}
                </button>
              </div>

              {rescheduling === s.id && (
                <div className="border-t border-line px-4 py-3 flex flex-wrap items-center gap-3">
                  <input
                    type="datetime-local"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    min={minSchedule()}
                    className="input text-sm"
                  />
                  <button
                    onClick={() => reschedule(s)}
                    disabled={busy === s.id}
                    className="btn btn-primary text-sm px-4"
                  >
                    {busy === s.id ? "Saving…" : "Reschedule for new time"}
                  </button>
                </div>
              )}

              {expanded.has(s.id) && (
                <div className="border-t border-line px-4 py-3 space-y-3">
                  <div>
                    <span className="text-xs text-muted font-medium">Recipients ({s.recipientCount})</span>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {s.recipients.map((r) => (
                        <span key={r.email} className="text-xs font-mono bg-canvas border border-line rounded px-2 py-0.5">
                          {r.email}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted font-medium">Email preview</span>
                    <iframe
                      srcDoc={s.html}
                      title={`${s.subject} preview`}
                      sandbox="allow-same-origin"
                      className="mt-1 w-full rounded-lg border border-line bg-white"
                      style={{ height: "320px" }}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
