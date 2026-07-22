"use client";

import { useState } from "react";
import { ShoppingCart, Check } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

type Variant = "default" | "light";
type Size = "sm" | "md";

export function AddToCartBtn({
  exam,
  subject,
  label = "Add to Cart",
  variant = "default",
  size = "sm",
  className = "",
}: {
  exam: string;
  subject: string;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const { addItem, items } = useCart();
  const [loading, setLoading] = useState(false);
  const inCart = items.some((i) => i.exam === exam && i.subject === subject);

  async function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (inCart || loading) return;
    setLoading(true);
    await addItem(exam, subject, "pro");
    setLoading(false);
  }

  const sizeCls = size === "md" ? "px-4 py-2.5 text-sm gap-2" : "px-3 py-1.5 text-xs gap-1.5";
  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  const variantCls = inCart
    ? variant === "light"
      ? "border-white/40 bg-white/15 text-white"
      : "border-ok/40 bg-ok/10 text-ok"
    : variant === "light"
      ? "border-white/40 bg-white/5 text-white/90 hover:bg-white/15 hover:border-white/60"
      : "border-line bg-surface text-ink hover:border-brand/50 hover:bg-brand/5";

  return (
    <button
      onClick={handleAdd}
      disabled={inCart || loading}
      className={`inline-flex items-center justify-center rounded-lg border font-semibold transition-all duration-150 ${sizeCls} ${variantCls} ${className}`}
    >
      {inCart ? (
        <>
          <Check className={iconSize} />
          Added
        </>
      ) : loading ? (
        <span className={`block animate-spin rounded-full border-2 border-current border-t-transparent ${iconSize}`} />
      ) : (
        <>
          <ShoppingCart className={iconSize} />
          {label}
        </>
      )}
    </button>
  );
}
