"use client";

import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function CartIcon({ onClick }: { onClick: () => void }) {
  const { count } = useCart();

  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg text-ink hover:bg-brand/10 transition"
      aria-label={`Cart (${count} items)`}
    >
      <ShoppingCart className="w-5 h-5" />
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 w-5 h-5 flex items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold leading-none">
          {count}
        </span>
      )}
    </button>
  );
}
