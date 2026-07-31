"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";

export default function PaymentRowActions({
  paymentId,
  periodMonths,
}: {
  paymentId: string;
  periodMonths: number;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function editDuration() {
    const input = window.prompt(
      "Access duration for this payment (months):",
      String(periodMonths),
    );
    if (!input) return;
    const months = Number(input);
    if (!Number.isInteger(months) || months < 1 || months > 60) {
      window.alert("Enter a whole number between 1 and 60.");
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ periodMonths: months }),
      });
      if (r.ok) {
        router.refresh();
      } else {
        const d = await r.json().catch(() => ({}));
        window.alert(d.error ?? "Update failed");
      }
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (
      !window.confirm(
        "Delete this payment record? It drops out of revenue/counts. The user's access is unchanged.",
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/payments/${paymentId}`, {
        method: "DELETE",
      });
      if (r.ok) {
        router.refresh();
      } else {
        window.alert("Delete failed");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={editDuration}
        disabled={busy}
        title="Change access duration"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-brand bg-brand/10 hover:bg-brand/20 transition-colors disabled:opacity-50"
      >
        <Pencil className="w-3 h-3" />
        Edit
      </button>
      <button
        onClick={remove}
        disabled={busy}
        title="Delete payment record"
        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-err bg-err/10 hover:bg-err/20 transition-colors disabled:opacity-50"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </button>
    </div>
  );
}
