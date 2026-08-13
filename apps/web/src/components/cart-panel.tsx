"use client";

import { X, Trash2, ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { AshokaChakra } from "@/components/ashoka-chakra";
import { INDEPENDENCE_DAY_ACTIVE, INDEPENDENCE_DAY_PROMO_CODE } from "@/lib/celebration";

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function CartPanel({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, totalPaise, count, loading, removeItem, comboDiscounts, comboSavingsPaise, rawTotalPaise } = useCart();

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-surface border-l border-line shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-semibold text-ink">
              Your Cart {count > 0 && `(${count})`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-canvas text-ink"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {loading ? (
            <p className="text-sm text-muted text-center py-8">Loading…</p>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
              <p className="text-sm text-muted">Your cart is empty</p>
              <Link
                href="/cart"
                onClick={onClose}
                className="mt-3 inline-flex items-center gap-1.5 text-sm text-brand hover:underline"
              >
                Browse mocks <span aria-hidden>→</span>
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl border border-line bg-canvas"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">
                    {item.label}
                  </p>
                  <p className="text-xs text-muted capitalize mt-0.5">
                    {item.exam} · {item.plan} plan
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-semibold text-ink tabular-nums">
                    {formatPrice(item.pricePaise)}
                  </span>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 rounded hover:bg-red-50 text-muted hover:text-red-600 transition"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-line px-5 py-4 space-y-3">
            {INDEPENDENCE_DAY_ACTIVE && (
              <div className="flex items-center justify-between gap-2 rounded-lg border border-line bg-gradient-to-r from-[#FF9933]/10 via-transparent to-[#138808]/10 px-3 py-2">
                <span className="inline-flex items-center gap-1.5 text-xs text-ink">
                  <AshokaChakra size={14} aria-hidden />
                  Independence Day sale
                </span>
                <span className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs font-bold text-[#B45309] dark:text-[#fbbf24]">
                  Use {INDEPENDENCE_DAY_PROMO_CODE}
                </span>
              </div>
            )}
            {comboDiscounts.length > 0 && (
              <div className="rounded-lg bg-ok/10 border border-ok/20 px-3 py-2 text-xs text-ok font-medium">
                Combo discount applied! You save {formatPrice(comboSavingsPaise)}
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Total</span>
              <div className="text-right">
                {comboSavingsPaise > 0 && (
                  <span className="text-xs text-muted line-through mr-2">{formatPrice(rawTotalPaise)}</span>
                )}
                <span className="text-lg font-bold text-ink tabular-nums">
                  {formatPrice(totalPaise)}
                </span>
              </div>
            </div>
            <a
              href="/pay/checkout"
              onClick={onClose}
              className="block w-full text-center py-3 rounded-xl bg-brand text-white font-semibold hover:bg-brand/90 transition"
            >
              Proceed to Checkout
            </a>
          </div>
        )}
      </div>
    </>
  );
}
