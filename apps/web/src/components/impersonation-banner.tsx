"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShieldAlert } from "lucide-react";

export default function ImpersonationBanner({
  targetEmail,
  adminEmail,
}: {
  targetEmail: string;
  adminEmail: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function endSession() {
    setBusy(true);
    try {
      await fetch("/api/admin/impersonate/end", { method: "POST" });
      router.push("/admin/upi");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sticky top-0 z-[60] bg-amber-500 px-4 py-2 text-amber-950 shadow-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 text-sm font-semibold">
        <span className="inline-flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            Admin View-Only Mode — viewing as <span className="underline decoration-amber-800 underline-offset-2">{targetEmail}</span>
            <span className="hidden sm:inline text-amber-900/80"> (read-only · auto-exits in 30 min)</span>
          </span>
        </span>
        <button
          onClick={endSession}
          disabled={busy}
          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-950 px-3 py-1.5 text-xs font-bold text-amber-50 transition-colors hover:bg-amber-900 disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
          End Session
        </button>
      </div>
      <span className="sr-only">Admin: {adminEmail}</span>
    </div>
  );
}
