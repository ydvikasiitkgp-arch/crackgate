"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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
  const [previewHeights, setPreviewHeights] = useState<Record<string, number>>({});
  const previewIframeRefs = useRef<Record<string, HTMLIFrameElement | null>>({});

  function togglePreview(id: string) {
    const doc = previewIframeRefs.current[id]?.contentDocument;
    const contentHeight = Math.max(
      doc?.body?.scrollHeight ?? 0,
      doc?.documentElement?.scrollHeight ?? 0,
    );
    setPreviewHeights((prev) => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      const next = Math.max(
        200,
        Math.min(
          (contentHeight > 0 ? contentHeight : 480) + 16,
          Math.floor((window.innerHeight ?? 900) * 0.9),
        ),
      );
      return { ...prev, [id]: next };
    });
  }

  const resizeDrag = useRef<{ startY: number; startH: number } | null>(null);

  function beginResize(e: React.PointerEvent<HTMLDivElement>, startH: number) {
    e.preventDefault();
    resizeDrag.current = { startY: e.clientY, startH };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function moveResize(e: React.PointerEvent<HTMLDivElement>, apply: (h: number) => void) {
    if (!resizeDrag.current) return;
    const next = Math.max(200, resizeDrag.current.startH + (e.clientY - resizeDrag.current.startY));
    apply(next);
  }

  function endResize() {
    resizeDrag.current = null;
  }

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
                    <div
                      onDoubleClick={() => togglePreview(s.id)}
                      title={previewHeights[s.id] !== undefined ? "Double-click to collapse preview" : "Double-click to expand preview to full height"}
                      className="mt-1 w-full overflow-hidden rounded-lg border border-line bg-white"
                      style={{ height: previewHeights[s.id] ?? 320, resize: "vertical", minHeight: 200 }}
                    >
                      <iframe
                        ref={(el) => { previewIframeRefs.current[s.id] = el; }}
                        srcDoc={s.html}
                        title={`${s.subject} preview`}
                        sandbox="allow-same-origin"
                        className="block w-full"
                        style={{ height: "calc(100% - 12px)" }}
                      />
                      <div
                        onPointerDown={(e) => beginResize(e, previewHeights[s.id] ?? 320)}
                        onPointerMove={(e) => moveResize(e, (h) => setPreviewHeights((prev) => ({ ...prev, [s.id]: h })))}
                        onPointerUp={endResize}
                        onPointerCancel={endResize}
                        className="flex h-3 cursor-ns-resize touch-none select-none items-center justify-center border-t border-line bg-surface"
                      >
                        <span className="h-1 w-10 rounded-full bg-current opacity-30" />
                      </div>
                    </div>
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
