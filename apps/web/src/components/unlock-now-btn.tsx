"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

/**
 * "Unlock now" CTA — adds the given item to the cart (guest cart lives in
 * localStorage, synced to db.cart by /pay/checkout's EmptyCart) and routes
 * to the real checkout, which carries the correct exam/subject/plan track.
 */
export function UnlockNowBtn({
  exam,
  subject,
  plan = "pro",
  label = "Unlock now",
  className = "",
  icon = true,
}: {
  exam: string;
  subject: string;
  plan?: string;
  label?: string;
  className?: string;
  icon?: boolean;
}) {
  const { addItem } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handle() {
    if (loading) return;
    setLoading(true);
    await addItem(exam, subject, plan);
    router.push("/pay/checkout");
  }

  return (
    <button onClick={handle} disabled={loading} className={className}>
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          {icon && <span aria-hidden>🔒</span>}
          {label}
        </>
      )}
    </button>
  );
}
