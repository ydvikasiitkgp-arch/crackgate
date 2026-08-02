"use client";

import { useState, useEffect } from "react";

type SendMode = "instant" | "schedule";

interface SendResult {
  recipients: number;
  sent: number;
  failed: number;
  sendId: string;
  items: { email: string; ok: boolean; error: string | null }[];
}

export default function NewsletterComposer({
  subscriberCount,
  selectedEmails,
  subscriberSelectedCount = 0,
  userSelectedCount = 0,
  additionalCount = 0,
  shareholdersCount = 0,
  onSent,
}: {
  subscriberCount: number;
  selectedEmails: Map<string, string | null>;
  subscriberSelectedCount?: number;
  userSelectedCount?: number;
  additionalCount?: number;
  shareholdersCount?: number;
  onSent?: () => void;
}) {
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");
  const [mode, setMode] = useState<SendMode>("instant");
  const [scheduledAt, setScheduledAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOnlyFailed, setShowOnlyFailed] = useState(false);

  const [drafts, setDrafts] = useState<string[]>([]);
  const [selectedDraft, setSelectedDraft] = useState("");
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [assets, setAssets] = useState<{ name: string; url: string }[]>([]);
  const [copiedAsset, setCopiedAsset] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const html = document.documentElement;
    const sync = () => setTheme(html.getAttribute("data-theme") === "dark" ? "dark" : "light");
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(html, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    fetch("/api/admin/newsletter/drafts")
      .then((r) => r.json())
      .then((data) => setDrafts(data.drafts ?? []))
      .catch(() => {});
    fetch("/api/admin/newsletter/assets")
      .then((r) => r.json())
      .then((data) => setAssets(data.assets ?? []))
      .catch(() => {});
  }, []);

  async function loadDraft() {
    if (!selectedDraft) return;
    setLoadingDraft(true);
    try {
      const res = await fetch(`/email/drafts/${selectedDraft}`);
      const content = await res.text();

      const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
      if (titleMatch) {
        setSubject(titleMatch[1].trim());
      }

      setHtml(content);
    } catch {
      setError("Failed to load draft.");
    } finally {
      setLoadingDraft(false);
    }
  }

  async function copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(window.location.origin + url);
      setCopiedAsset(url);
      setTimeout(() => setCopiedAsset(null), 2000);
    } catch {
      /* fallback */
    }
  }

  function minSchedule() {
    const d = new Date(Date.now() + 3600_000);
    return d.toISOString().slice(0, 16);
  }

  async function send() {
    setError(null);
    setResult(null);
    setResultMessage(null);

    if (!subject.trim()) { setError("Subject is required."); return; }
    if (!html.trim()) { setError("Content is required."); return; }
    if (selectedEmails.size === 0) { setError("Select at least one recipient."); return; }
    if (mode === "schedule" && !scheduledAt) { setError("Pick a date & time to schedule."); return; }

    setLoading(true);
    try {
      const endpoint = mode === "instant" ? "/api/admin/newsletter/send" : "/api/admin/newsletter/schedule";
      const body: Record<string, unknown> = {
        subject: subject.trim(),
        html: html.trim(),
        recipients: Array.from(selectedEmails.entries()).map(([email, name]) => ({ email, name: name ?? undefined })),
      };
      if (mode === "schedule") body.scheduledAt = new Date(scheduledAt).toISOString();

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error ?? `HTTP ${res.status}`);
        return;
      }

      if (mode === "instant") {
        setResult({
          recipients: data.recipients,
          sent: data.sent,
          failed: data.failed,
          sendId: data.sendId,
          items: data.items ?? [],
        });
        onSent?.();
        setSubject("");
        setHtml("");
      } else {
        setResult(null);
        setResultMessage(`Scheduled for ${new Date(data.scheduledFor).toLocaleString()} · ${data.recipients} recipients.`);
      }
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Compose newsletter</h2>
          <span className="text-sm text-muted">
            {selectedEmails.size > 0
              ? [
                  subscriberSelectedCount > 0 && `${subscriberSelectedCount} subscriber${subscriberSelectedCount === 1 ? "" : "s"}`,
                  userSelectedCount > 0 && `${userSelectedCount} user${userSelectedCount === 1 ? "" : "s"}`,
                  additionalCount > 0 && `${additionalCount} additional`,
                  shareholdersCount > 0 && `${shareholdersCount} testers/dev`,
                ]
                  .filter(Boolean)
                  .join(" + ") + " selected"
              : "no recipients"}
          </span>
        </div>

        <div className="mt-4 space-y-4">

          <div className="flex gap-4 flex-wrap">
            <div className="flex items-end gap-2">
              <div>
                <span className="text-xs text-muted font-medium">Load draft</span>
                <select
                  value={selectedDraft}
                  onChange={(e) => setSelectedDraft(e.target.value)}
                  className="input mt-1 text-sm"
                >
                  <option value="">— Select —</option>
                  {drafts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={loadDraft}
                disabled={!selectedDraft || loadingDraft}
                className="btn btn-accent text-sm px-4"
              >
                {loadingDraft ? "Loading…" : "Load"}
              </button>
            </div>

            {assets.length > 0 && (
              <div>
                <span className="text-xs text-muted font-medium">Assets</span>
                <div className="mt-1 flex flex-wrap gap-2">
                  {assets.map((a) => (
                    <button
                      key={a.name}
                      onClick={() => copyUrl(a.url)}
                      className="text-xs font-mono bg-canvas border border-line rounded px-2 py-1 hover:border-brand transition-colors"
                      title="Click to copy URL"
                    >
                      {copiedAsset === a.url ? "Copied!" : a.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <label className="block">
            <span className="text-xs text-muted">Subject</span>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter subject"
              className="input mt-1 w-full"
            />
          </label>

          <label className="block">
            <span className="text-xs text-muted">Content (HTML)</span>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<h1>Hello!</h1><p>Your newsletter content here...</p>"
              rows={12}
              className="input mt-1 w-full font-mono text-sm"
            />
          </label>

          <div className="border-t border-line pt-4">
            <span className="text-xs text-muted font-medium">Preview</span>
            {html.trim() ? (
              <iframe
                srcDoc={html}
                title="Newsletter preview"
                sandbox="allow-same-origin"
                className="mt-2 w-full rounded-lg border border-line bg-white"
                style={{ height: "400px", colorScheme: theme }}
              />
            ) : (
              <p className="mt-2 text-sm text-muted italic">Type some content above to see a preview.</p>
            )}
          </div>

          <div className="border-t border-line pt-4">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <span className="text-xs text-muted font-medium">Mode</span>
                <div className="mt-1 flex rounded-lg border border-line p-0.5 bg-canvas">
                  <button
                    type="button"
                    onClick={() => setMode("instant")}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${mode === "instant" ? "bg-brand text-white shadow-sm" : "text-muted hover:text-ink border border-transparent"}`}
                  >
                    Instant
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("schedule")}
                    className={`px-4 py-1.5 rounded-md text-sm font-semibold transition ${mode === "schedule" ? "bg-brand text-white shadow-sm" : "text-muted hover:text-ink border border-transparent"}`}
                  >
                    Scheduled
                  </button>
                </div>
              </div>
              {mode === "schedule" && (
                <div>
                  <span className="text-xs text-muted font-medium">Send at</span>
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    min={minSchedule()}
                    className="input mt-1 text-sm"
                  />
                </div>
              )}
              <div className="flex-1 flex justify-end">
                <button
                  onClick={send}
                  disabled={loading}
                  className="btn btn-primary px-6"
                >
                  {loading
                    ? "Sending…"
                    : selectedEmails.size === 0
                      ? "Select recipients"
                      : mode === "instant"
                        ? `Send to ${selectedEmails.size} selected`
                        : `Schedule for ${selectedEmails.size} selected`}
                </button>
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-bad mt-2">{error}</p>}
          {resultMessage && <p className="text-sm text-ok mt-2">{resultMessage}</p>}
          {result && <SendResults result={result} showOnlyFailed={showOnlyFailed} setShowOnlyFailed={setShowOnlyFailed} />}
        </div>
      </div>
    </div>
  );
}

function SendResults({
  result,
  showOnlyFailed,
  setShowOnlyFailed,
}: {
  result: SendResult;
  showOnlyFailed: boolean;
  setShowOnlyFailed: (v: boolean) => void;
}) {
  const failedItems = result.items.filter((i) => !i.ok);
  const visible = showOnlyFailed ? failedItems : result.items;

  return (
    <div className="border-t border-line pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm">
          <span className="font-bold text-ok">{result.sent} delivered</span>
          <span className="text-muted">·</span>
          <span className={failedItems.length ? "font-bold text-bad" : "font-bold text-ok"}>
            {result.failed} failed
          </span>
          <span className="text-muted">·</span>
          <span className="text-muted">{result.recipients} recipients</span>
        </div>
        <button
          onClick={() => setShowOnlyFailed(!showOnlyFailed)}
          className="text-xs font-semibold rounded-lg border border-line px-3 py-1.5 hover:border-brand transition-colors"
        >
          {showOnlyFailed ? "Show all" : `Show failed only (${failedItems.length})`}
        </button>
      </div>

      <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border border-line">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-canvas text-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Status</th>
              <th className="px-3 py-2 font-semibold">Email</th>
              <th className="px-3 py-2 font-semibold">Error</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {visible.map((i) => (
              <tr key={i.email} className="align-top">
                <td className="px-3 py-2 whitespace-nowrap">
                  {i.ok ? (
                    <span className="text-ok font-semibold">✓ Delivered</span>
                  ) : (
                    <span className="text-bad font-semibold">✗ Failed</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono break-all">{i.email}</td>
                <td className="px-3 py-2 text-muted break-words">{i.ok ? "—" : (i.error ?? "unknown error")}</td>
              </tr>
            ))}
            {visible.length === 0 && (
              <tr>
                <td colSpan={3} className="px-3 py-4 text-center text-muted italic">No failures 🎉</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
