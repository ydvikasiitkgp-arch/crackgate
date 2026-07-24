"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Check, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

const COMBO_ITEMS = [
  { exam: "DIPLOMA", subject: "wcl-sirdar" },
  { exam: "DIPLOMA", subject: "ncl-mining-sirdar" },
] as const;

export function ComboAddToCartBtn({
  items = COMBO_ITEMS,
  label = "Add Both to Cart — Save 15%",
  className = "",
}: {
  items?: readonly { exam: string; subject: string }[];
  label?: string;
  className?: string;
}) {
  const { addItem, items: cartItems } = useCart();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const allInCart = items.every((item) =>
    cartItems.some((c) => c.exam === item.exam && c.subject === item.subject),
  );

  async function handleAdd() {
    if (allInCart || loading) {
      router.push("/cart");
      return;
    }
    setLoading(true);
    for (const item of items) {
      await addItem(item.exam, item.subject, "pro");
    }
    router.push("/cart");
  }

  if (allInCart) {
    return (
      <button
        onClick={() => router.push("/cart")}
        className={`inline-flex items-center gap-2 rounded-xl bg-ok/15 border border-ok/40 px-8 py-4 text-base font-bold text-ok transition hover:bg-ok/25 ${className}`}
      >
        <Check className="w-5 h-5" />
        In Cart — View Cart
      </button>
    );
  }

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-amber-500/25 transition hover:from-amber-400 hover:to-orange-400 hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Adding…
        </>
      ) : (
        <>
          <ShoppingCart className="w-5 h-5" />
          {label}
        </>
      )}
    </button>
  );
}
