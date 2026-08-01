"use client";

/** Bottom-left floating widget to instantly switch your plan in dev.
 *  Hidden unless NEXT_PUBLIC_DEV_TOOLS=1; press the chip to expand. The server
 *  endpoint still enforces a dev/admin check, so the API stays available to
 *  admins in prod even though this widget is not rendered there. */

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Plan = "free" | "pro" | "premium";

export function DevPlanSwitcher({ currentPlan }: { currentPlan?: Plan }) {
  const isDev = process.env.NEXT_PUBLIC_DEV_TOOLS === "1";
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Plan | null>(null);
  const router = useRouter();

  if (!isDev || pathname.startsWith("/pay")) return null;

  async function setPlan(plan: Plan) {
    setBusy(plan);
    try {
      const res = await fetch("/api/dev/set-plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (e) { alert((e as Error).message); }
    finally    { setBusy(null); }
  }

  return (
    <div className="fixed bottom-5 left-5 z-50">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-full bg-violet-600 text-white text-xs font-mono px-3 py-2 shadow-lg hover:bg-violet-700"
        >
          ⚙ DEV · {currentPlan ?? "?"}
        </button>
      ) : (
        <div className="bg-surface border-2 border-violet-600 rounded-xl shadow-xl p-4 w-64">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-violet-700">DEV PLAN SWITCHER</span>
            <button onClick={() => setOpen(false)} className="text-muted hover:text-ink text-sm">✕</button>
          </div>
          <p className="text-xs text-muted mb-3">
            Current: <b className="text-ink">{currentPlan}</b>. Switching is instant; no payment.
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {(["free", "pro", "premium"] as const).map((p) => (
              <button
                key={p}
                disabled={busy !== null || currentPlan === p}
                onClick={() => setPlan(p)}
                className={
                  "text-xs font-semibold py-2 rounded border transition " +
                  (currentPlan === p
                    ? "bg-violet-600 text-white border-violet-600"
                    : "bg-surface border-line hover:border-violet-400")
                }
              >
                {busy === p ? "…" : p}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted mt-3">
            Server enforces NODE_ENV ≠ production OR role=admin.
          </p>
        </div>
      )}
    </div>
  );
}
