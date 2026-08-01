"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ISSUE_TYPES = [
  { value: "factual_error", label: "Factual error" },
  { value: "typo", label: "Typo / formatting" },
  { value: "unclear_explanation", label: "Unclear explanation" },
  { value: "wrong_answer", label: "Wrong answer" },
  { value: "other", label: "Other" },
] as const;

type IssueType = (typeof ISSUE_TYPES)[number]["value"];

export function ReportIssueModal({
  open,
  onClose,
  questionKey,
  mockRefId,
}: {
  open: boolean;
  onClose: () => void;
  questionKey: string;
  mockRefId: string;
}) {
  const [issueType, setIssueType] = useState<IssueType>("factual_error");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setIssueType("factual_error");
      setDescription("");
      setStatus("idle");
      setErrorMsg("");
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);

  const handleSubmit = useCallback(async () => {
    if (description.trim().length < 10) {
      setErrorMsg("Please provide at least 10 characters.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mockRefId, questionKey, issueType, description: description.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to submit");
      }
      setStatus("success");
      setTimeout(onClose, 3500);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    }
  }, [mockRefId, questionKey, issueType, description, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      {/* Overlay */}
      <button
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm cg-overlay"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Panel */}
      <div className="relative bg-surface rounded-2xl border border-line shadow-xl w-full max-w-lg mx-4 p-6 text-left max-h-[85vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted hover:text-ink transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold text-ink">Report an issue</h2>
        <p className="text-sm text-muted mt-1">
          Help us improve — describe the problem you found with this question.
        </p>

        {status === "success" ? (
          <div className="mt-6 text-center py-8">
            <p className="text-ok font-semibold text-lg">Thank you!</p>
            <p className="text-sm text-muted mt-1">We&apos;ll review your report and fix any issues.</p>
          </div>
        ) : (
          <>
            {/* Issue Type */}
            <fieldset className="mt-5">
              <legend className="text-sm font-semibold text-ink mb-2">Issue type</legend>
              <div className="space-y-2">
                {ISSUE_TYPES.map((t) => (
                  <label key={t.value} className="flex items-center gap-2.5 cursor-pointer group">
                    <input
                      type="radio"
                      name="issueType"
                      value={t.value}
                      checked={issueType === t.value}
                      onChange={() => setIssueType(t.value)}
                      className="w-4 h-4 text-brand border-line focus:ring-accent accent-brand"
                    />
                    <span className="text-sm text-ink group-hover:text-brand transition">{t.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* Description */}
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <label htmlFor="report-desc" className="text-sm font-semibold text-ink">
                  Description
                </label>
                <span className={cn(
                  "text-xs tabular-nums",
                  description.length >= 10 ? "text-ok" : description.length > 0 ? "text-bad" : "text-muted",
                )}>
                  {description.length}/10 min
                </span>
              </div>
              <textarea
                id="report-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail (min 10 characters)..."
                className="input mt-1.5 resize-none"
              />
            </div>

            {errorMsg && <p className="text-sm text-bad mt-2">{errorMsg}</p>}

            {/* Actions */}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="btn btn-ghost text-sm">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={status === "loading" || description.trim().length < 10}
                className="btn btn-primary text-sm"
              >
                {status === "loading" ? "Submitting..." : "Submit report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
