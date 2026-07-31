"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2 } from "lucide-react";

export default function RevokeEntitlementButton({
  entitlementId,
  label,
}: {
  entitlementId: string;
  label: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  async function revoke() {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/entitlements/${entitlementId}`, {
        method: "DELETE",
      });
      if (r.ok) {
        setOpen(false);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 grid place-items-center" role="dialog" aria-modal="true">
          <button
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-label="Close"
          />
          <div className="relative bg-surface rounded-2xl border border-line shadow-pop w-full max-w-sm mx-4 p-6">
            <h3 className="font-bold text-lg text-err">Revoke access?</h3>
            <p className="text-sm text-muted mt-2">
              Removes this user&apos;s <strong>{label}</strong> test access. Their
              other entitlements are unchanged. Logged for audit.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setOpen(false)} className="btn btn-ghost text-sm">
                Cancel
              </button>
              <button
                onClick={revoke}
                disabled={busy}
                className="btn text-sm px-4 py-2 border border-err text-err hover:bg-err/10"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Revoke"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(true)}
        disabled={busy}
        title={`Revoke ${label} access`}
        aria-label={`Revoke ${label} access`}
        className="mt-0.5 inline-flex items-center justify-center rounded-md p-1 text-err/70 bg-err/10 hover:bg-err/20 hover:text-err transition-colors disabled:opacity-50"
      >
        <X className="w-3 h-3" />
      </button>
    </>
  );
}
