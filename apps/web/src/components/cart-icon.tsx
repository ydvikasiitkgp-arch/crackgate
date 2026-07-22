"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

export function CartIcon({ href }: { href?: string }) {
  const { count } = useCart();

  const badge = count > 0 && (
    <span className="absolute top-[-6px] right-[-6px] min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold leading-none px-1">
      {count}
    </span>
  );

  const inner = (
    <span className="relative inline-flex p-2 rounded-lg text-ink hover:bg-brand/10 transition">
      <ShoppingCart className="w-5 h-5" />
      {badge}
    </span>
  );

  if (href) {
    return (
      <Link href={href} aria-label={`Cart (${count} items)`}>
        {inner}
      </Link>
    );
  }

  return <span aria-label={`Cart (${count} items)`}>{inner}</span>;
}
