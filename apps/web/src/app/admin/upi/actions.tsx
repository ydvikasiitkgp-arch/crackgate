"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function UpiReviewActions({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "approve" | "reject">(null);
  const [confirmApprove, setConfirmApprove] = useState(false);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  async function approve() {
    setConfirmApprove(false);
    setBusy("approve");
    try {
      const r = await fetch(`/api/admin/pay/upi/${claimId}/approve`, {
        method: "POST",
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error ?? `HTTP ${r.status}`);
      router.refresh();
    } catch (e) {
      setError(`Approve failed: ${(e as Error).message}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setBusy(null);
    }
  }

  async function reject() {
    if (!rejectReason || rejectReason.trim().length < 3) return;
    setRejectDialog(false);
    setBusy("reject");
    try {
      const r = await fetch(`/api/admin/pay/upi/${claimId}/reject`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: rejectReason.trim() }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error ?? `HTTP ${r.status}`);
      setRejectReason("");
      router.refresh();
    } catch (e) {
      setError(`Reject failed: ${(e as Error).message}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      {/* Error toast */}
      {error && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-pop text-sm font-semibold bg-red-600 text-white animate-in slide-in-from-top-2">
          {error}
        </div>
      )}

      {/* Approve confirm */}
      {confirmApprove && (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => setConfirmApprove(false)} />
          <div className="relative bg-surface rounded-2xl border border-line shadow-pop w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-lg">Approve this claim?</h3>
            <p className="text-sm text-muted mt-2">This will flip the user&apos;s plan and grant paid access.</p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setConfirmApprove(false)} className="btn btn-ghost text-sm">Cancel</button>
              <button onClick={approve} disabled={busy !== null} className="btn btn-primary text-sm">
                {busy === "approve" ? "…" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject dialog */}
      {rejectDialog && (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={() => { setRejectDialog(false); setRejectReason(""); }} />
          <div className="relative bg-surface rounded-2xl border border-line shadow-pop w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-lg">Reject this claim?</h3>
            <p className="text-sm text-muted mt-2">Reason will be visible to the user.</p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="input text-sm mt-3 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setRejectDialog(false); setRejectReason(""); }} className="btn btn-ghost text-sm">Cancel</button>
              <button
                onClick={reject}
                disabled={busy !== null || rejectReason.trim().length < 3}
                className={cn(
                  "btn text-sm px-4 py-2 border text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950",
                  rejectReason.trim().length < 3 && "opacity-50 cursor-not-allowed"
                )}
              >
                {busy === "reject" ? "…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setConfirmApprove(true)}
          disabled={busy !== null}
          className="btn btn-primary text-xs px-3 py-1"
        >
          {busy === "approve" ? "…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => setRejectDialog(true)}
          disabled={busy !== null}
          className="btn text-xs px-3 py-1 border border-err text-err hover:bg-err/10"
        >
          {busy === "reject" ? "…" : "Reject"}
        </button>
      </div>
    </>
  );
}
