"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, Trash2, ArrowRight, Sparkles } from "lucide-react";
import { useCart, type ComboDiscount } from "@/hooks/use-cart";
import { CATALOG } from "@/data/catalog";
import { AddToCartBtn } from "@/components/add-to-cart-btn";

function formatPrice(paise: number) {
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export default function CartPage() {
  const { items, rawTotalPaise, totalPaise, count, loading, removeItem, clearCart, syncToServer, refetch, comboDiscounts, comboSavingsPaise, loggedIn } = useCart();
  const [tab, setTab] = useState<"cart" | "browse">("browse");
  const router = useRouter();

  function handleCheckout() {
    if (!loggedIn) {
      router.push("/login?next=/cart");
      return;
    }
    // Don't block navigation on sync — server component validates cart + auth.
    // Items from addItem() already hit the server; this is a safety net.
    syncToServer();
    router.push("/pay/checkout");
  }

  const liveExams = CATALOG.map((exam) => ({
    ...exam,
    subjects: exam.subjects.filter((s) => s.live),
  })).filter((exam) => exam.subjects.length > 0);

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-ink">Your Cart</h1>
        <span className="badge badge-pro">{count} item{count !== 1 ? "s" : ""}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-canvas rounded-xl border border-line w-fit mb-8">
        <button
          onClick={() => setTab("browse")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "browse" ? "bg-surface shadow-sm text-ink" : "text-muted hover:text-ink"}`}
        >
          Browse Mocks
        </button>
        <button
          onClick={() => setTab("cart")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${tab === "cart" ? "bg-surface shadow-sm text-ink" : "text-muted hover:text-ink"}`}
        >
          My Cart ({count})
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className={`${tab === "cart" ? "lg:col-span-3" : "lg:col-span-2"}`}>
          {tab === "browse" ? (
            <CatalogBrowser exams={liveExams} />
          ) : (
            <CartContents
              items={items}
              loading={loading}
              removeItem={removeItem}
              clearCart={clearCart}
              refetch={refetch}
              comboDiscounts={comboDiscounts}
              comboSavingsPaise={comboSavingsPaise}
              rawTotalPaise={rawTotalPaise}
              totalPaise={totalPaise}
              onCheckout={handleCheckout}
            />
          )}
        </div>

        {/* Cart sidebar (browse mode) */}
        {tab === "browse" && (
          <aside className="lg:col-span-1">
            <div className="sticky top-24 card p-5 space-y-4">
              <h3 className="font-semibold text-ink flex items-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Cart Summary
              </h3>
              {items.length === 0 ? (
                <p className="text-sm text-muted">No items yet. Click + on any mock above.</p>
              ) : (
                <>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <span className="truncate text-ink">{item.label}</span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-muted tabular-nums">{formatPrice(item.pricePaise)}</span>
                          <button onClick={() => removeItem(item.id)} className="text-muted hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  {comboSavingsPaise > 0 && (
                    <div className="rounded-lg bg-ok/10 border border-ok/30 px-3 py-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-ok">
                        <Sparkles className="w-3.5 h-3.5" />
                        Combo discount applied!
                      </div>
                      <p className="text-xs text-ok/80 mt-0.5">You save {formatPrice(comboSavingsPaise)}</p>
                    </div>
                  )}
                  <div className="border-t border-line pt-3 space-y-1">
                    {comboSavingsPaise > 0 && (
                      <div className="flex items-center justify-between text-sm text-muted">
                        <span>Subtotal</span>
                        <span className="line-through tabular-nums">{formatPrice(rawTotalPaise)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-ink">Total</span>
                      <span className="text-lg font-bold tabular-nums">{formatPrice(totalPaise)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="btn btn-primary w-full justify-center"
                  >
                    Checkout <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/* ─── Catalog Browser ─── */
function CatalogBrowser({
  exams,
}: {
  exams: typeof CATALOG;
}) {
  return (
    <div className="space-y-8">
      {exams.map((exam) => (
        <section key={`${exam.exam}-${exam.label}`}>
          <div className="flex items-center gap-3 mb-4">
            <SectionDot exam={exam.exam} />
            <h2 className="text-lg font-bold text-ink">{exam.label}</h2>
            <span className="text-xs text-muted">{exam.subjects.length} subject{exam.subjects.length !== 1 ? "s" : ""}</span>
          </div>
          <div className="space-y-2">
            {exam.subjects.map((subject) => {
              const price = subject.price?.proPaise ?? 49900;
              return (
                <div
                  key={subject.slug}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-line bg-canvas hover:border-brand/30 transition"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-ink truncate">{subject.label}</p>
                    <p className="text-xs text-muted">{formatPrice(price)} · one-time</p>
                  </div>
                  <AddToCartBtn exam={exam.exam} subject={subject.slug} size="sm" />
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ─── Cart Contents ─── */
function CartContents({
  items,
  loading,
  removeItem,
  clearCart,
  refetch,
  comboDiscounts,
  comboSavingsPaise,
  rawTotalPaise,
  totalPaise,
  onCheckout,
}: {
  items: { id: string; exam: string; subject: string; label: string; plan: string; pricePaise: number }[];
  loading: boolean;
  removeItem: (id: string) => Promise<boolean>;
  clearCart: () => Promise<void>;
  refetch: () => void;
  comboDiscounts: ComboDiscount[];
  comboSavingsPaise: number;
  rawTotalPaise: number;
  totalPaise: number;
  onCheckout: () => void;
}) {
  const [clearing, setClearing] = useState(false);

  async function handleClear() {
    setClearing(true);
    await clearCart();
    setClearing(false);
  }

  if (loading) {
    return <div className="text-center py-16 text-muted text-sm">Loading…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <ShoppingCart className="w-12 h-12 text-muted mx-auto mb-3 opacity-40" />
        <p className="text-muted">Your cart is empty</p>
        <Link href="/cart" className="btn btn-ghost mt-4 text-sm" onClick={() => {}}>
          Browse mocks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="font-semibold text-ink">{items.length} item{items.length !== 1 ? "s" : ""}</h2>
        <button
          onClick={handleClear}
          disabled={clearing}
          className="text-xs text-muted hover:text-red-600 transition"
        >
          {clearing ? "Clearing…" : "Clear all"}
        </button>
      </div>

      {/* Combo discount highlight */}
      {comboDiscounts.map((d, i) => (
        <div
          key={i}
          className="rounded-xl border-2 border-ok/40 bg-gradient-to-r from-ok/5 to-green-500/5 p-4"
        >
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-ok" />
            <span className="text-sm font-bold text-ok">{d.label}</span>
            <span className="inline-flex items-center rounded-full bg-ok/15 px-2 py-0.5 text-[10px] font-bold text-ok">
              SAVE {formatPrice(d.savingsPaise)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted line-through">{formatPrice(d.originalTotalPaise)}</span>
            <span className="font-bold text-ok">{formatPrice(d.discountedTotalPaise)}</span>
          </div>
        </div>
      ))}

      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 p-4 rounded-xl border border-line bg-canvas"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{item.label}</p>
            <p className="text-xs text-muted capitalize mt-0.5">{item.exam} · {item.plan} plan</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-sm font-semibold text-ink tabular-nums">{formatPrice(item.pricePaise)}</span>
            <button
              onClick={() => removeItem(item.id)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {/* Total */}
      <div className="border-t border-line pt-4 mt-4 space-y-1">
        {comboSavingsPaise > 0 && (
          <div className="flex items-center justify-between text-sm text-muted">
            <span>Subtotal</span>
            <span className="line-through tabular-nums">{formatPrice(rawTotalPaise)}</span>
          </div>
        )}
        {comboSavingsPaise > 0 && (
          <div className="flex items-center justify-between text-sm text-ok font-medium">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Combo discount
            </span>
            <span className="tabular-nums">-{formatPrice(comboSavingsPaise)}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Total</span>
          <span className="text-lg font-bold text-ink tabular-nums">{formatPrice(totalPaise)}</span>
        </div>
      </div>
      <button
        onClick={onCheckout}
        className="btn btn-primary w-full justify-center mt-4"
      >
        Proceed to Checkout <ArrowRight className="w-4 h-4 ml-1" />
      </button>
    </div>
  );
}

/* ─── Section Dot ─── */
function SectionDot({ exam }: { exam: string }) {
  const color = {
    GATE: "bg-brand",
    PSU: "bg-amber-500",
    STATE: "bg-emerald-500",
    DIPLOMA: "bg-blue-500",
  }[exam] ?? "bg-gray-400";
  return <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${color}`} />;
}
