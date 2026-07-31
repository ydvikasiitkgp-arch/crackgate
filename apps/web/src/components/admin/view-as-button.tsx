"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, Loader2 } from "lucide-react";

export default function ViewAsButton({
  userId,
  userEmail,
}: {
  userId?: string;
  userEmail?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  function toastError(msg: string) {
    setError(msg);
    setTimeout(() => setError(""), 3000);
  }

  async function startImpersonation() {
    if (!userId) return;
    setBusy(true);
    try {
      const r = await fetch("/api/admin/impersonate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (r.ok) {
        router.push("/dashboard");
      } else {
        const d = await r.json().catch(() => ({}));
        toastError(d.error ?? "Could not start session");
        setOpen(false);
      }
    } finally {
      setBusy(false);
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

      {/* Confirm dialog */}
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div className="relative bg-surface rounded-2xl border border-line shadow-pop w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-lg">View as {userEmail ?? "user"}?</h3>
            <p className="text-sm text-muted mt-2">
              You&apos;ll see this user&apos;s dashboard exactly as they see it.
              The session is <strong>read-only</strong>, times out automatically
              in 30 minutes, and is logged for audit.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="btn btn-ghost text-sm">
                Cancel
              </button>
              <button
                onClick={startImpersonation}
                disabled={busy}
                className="btn btn-primary text-sm"
              >
                {busy ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "View dashboard"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {userId && (
        <button
          onClick={() => setOpen(true)}
          disabled={busy}
          title={`View dashboard as ${userEmail ?? "this user"}`}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
        >
          <Eye className="w-3 h-3" />
          View As
        </button>
      )}
    </>
  );
}
