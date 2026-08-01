"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Loader2 } from "lucide-react";

const LS_KEY = "cg_cart";

// Checkout is a server component that reads only db.cart, but cart items can
// live in localStorage when added as a guest or before auth resolved. This
// pushes any unsynced items to /api/cart (idempotent upsert) and refreshes so
// the server re-renders the real checkout — never bouncing to /pricing.
export default function EmptyCart() {
  const router = useRouter();
  const [state, setState] = useState<"syncing" | "empty" | "failed">("syncing");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let items: { exam: string; subject: string; plan?: string }[] = [];
      try {
        items = JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
      } catch { /* malformed storage — treat as empty */ }

      if (items.length === 0) {
        if (!cancelled) setState("empty");
        return;
      }

      const remaining: typeof items = [];
      let anyOk = false;
      for (const item of items) {
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exam: item.exam,
              subject: item.subject,
              plan: item.plan === "premium" ? "premium" : "pro",
            }),
          });
          if (res.ok) anyOk = true;
          else remaining.push(item);
        } catch {
          remaining.push(item);
        }
      }
      if (cancelled) return;

      if (anyOk) {
        // Synced items now live on the server — keep only the unsynced ones.
        try {
          if (remaining.length === 0) localStorage.removeItem(LS_KEY);
          else localStorage.setItem(LS_KEY, JSON.stringify(remaining));
        } catch { /* ignore */ }
        router.refresh();
        return;
      }

      // Nothing synced — leave localStorage for a retry on the next visit.
      setState("failed");
    })();
    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="card p-10 text-center mt-16">
      {state === "syncing" ? (
        <>
          <Loader2 className="w-12 h-12 text-brand mx-auto mb-3 animate-spin" />
          <h1 className="text-xl font-bold text-ink">Syncing your cart…</h1>
          <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
            We&apos;re moving the items you added into checkout.
          </p>
        </>
      ) : (
        <>
          <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
          <h1 className="text-xl font-bold text-ink">Your cart is empty</h1>
          <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
            {state === "failed"
              ? "We couldn&apos;t sync your saved items. Please add them again."
              : "Add a mock series to your cart, then check out here."}
          </p>
        </>
      )}
      <Link href="/cart" className="btn btn-ghost mt-5 text-sm">
        Browse mocks
      </Link>
    </div>
  );
}
