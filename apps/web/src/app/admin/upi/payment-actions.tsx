"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2 } from "lucide-react";
import ViewAsButton from "@/components/admin/view-as-button";

export default function PaymentRowActions({
  paymentId,
  periodMonths,
  userId,
  userEmail,
}: {
  paymentId: string;
  periodMonths: number;
  userId?: string;
  userEmail?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<null | "edit">(null);
  const [editOpen, setEditOpen] = useState(false);
  const [months, setMonths] = useState(periodMonths);
  const [error, setError] = useState("");

  function toastError(msg: string) {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  }

  async function saveDuration() {
    if (!Number.isInteger(months) || months < 1 || months > 60) {
      toastError("Enter a whole number between 1 and 60.");
      return;
    }
    setBusy("edit");
    try {
      const r = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ periodMonths: months }),
      });
      if (r.ok) {
        setEditOpen(false);
        router.refresh();
      } else {
        const d = await r.json().catch(() => ({}));
        toastError(d.error ?? "Update failed");
      }
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

      {/* Edit dialog */}
      {editOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setEditOpen(false)}
            aria-label="Close"
          />
          <div className="relative bg-surface rounded-2xl border border-line shadow-pop w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-lg">Change access duration</h3>
            <p className="text-sm text-muted mt-2">
              Recomputes the entitlement expiry from the payment date + new
              months. Current: <strong>{periodMonths} months</strong>.
            </p>
            <input
              type="number"
              min={1}
              max={60}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value) || 0)}
              className="input text-sm mt-3 w-full"
              autoFocus
            />
            <p className="text-xs text-muted mt-1">
              Between 1 and 60 months. Test-grant entitlements are never touched.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditOpen(false)} className="btn btn-ghost text-sm">
                Cancel
              </button>
              <button
                onClick={saveDuration}
                disabled={busy !== null}
                className="btn btn-primary text-sm"
              >
                {busy === "edit" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Row actions */}
      <div className="flex items-center gap-1.5">
        <ViewAsButton userId={userId} userEmail={userEmail} iconOnly />
        <button
          onClick={() => {
            setMonths(periodMonths);
            setEditOpen(true);
          }}
          disabled={busy !== null}
          title="Change access duration"
          aria-label="Change access duration"
          className="inline-flex items-center justify-center rounded-md p-1.5 text-brand bg-brand/10 hover:bg-brand/20 transition-colors disabled:opacity-50"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}
