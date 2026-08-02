"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
  MessageCircle,
  Tag,
  Zap,
} from "lucide-react";
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
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${tab === "browse" ? "bg-surface shadow-sm text-ink" : "text-muted hover:text-ink"}`}
        >
          Browse Mocks
        </button>
        <button
          onClick={() => setTab("cart")}
          className={`px-4 py-2.5 rounded-lg text-sm font-medium transition ${tab === "cart" ? "bg-surface shadow-sm text-ink" : "text-muted hover:text-ink"}`}
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
            <div className="sticky top-24 space-y-4">
              {/* Main summary card */}
              <div className="card overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-line bg-surface/50">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-brand" />
                    <h3 className="font-bold text-ink">Cart Summary</h3>
                    {items.length > 0 && (
                      <span className="ml-auto text-xs font-semibold text-muted bg-canvas px-2 py-0.5 rounded-full">
                        {items.length}
                      </span>
                    )}
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <ShoppingCart className="w-10 h-10 text-muted/30 mx-auto mb-2" />
                    <p className="text-sm text-muted">Your cart is empty</p>
                    <p className="text-xs text-muted/70 mt-1">
                      Click + on any mock above to add it
                    </p>
                  </div>
                ) : (
                  <div className="p-5 space-y-4">
                    {/* Items */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item.id} className="group">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-ink leading-tight">
                                {item.label}
                              </p>
                              <p className="text-[11px] text-muted mt-0.5 capitalize">
                                {item.exam} · {item.plan}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="text-sm font-bold text-ink tabular-nums">
                                {formatPrice(item.pricePaise)}
                              </span>
                              <button
                                onClick={() => removeItem(item.id)}
                                className="p-2 rounded-md text-muted/50 hover:text-red-600 hover:bg-red-50 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Combo discount badge */}
                    {comboSavingsPaise > 0 && (
                      <div className="rounded-xl bg-gradient-to-r from-ok/10 to-ok/5 border border-ok/30 px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-ok/15">
                            <Sparkles className="w-3.5 h-3.5 text-ok" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-ok">
                              Combo discount applied!
                            </p>
                            <p className="text-[11px] text-ok/70">
                              You save {formatPrice(comboSavingsPaise)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Price breakdown */}
                    <div className="border-t border-line pt-3 space-y-1.5">
                      {comboSavingsPaise > 0 && (
                        <>
                          <div className="flex items-center justify-between text-xs text-muted">
                            <span>Subtotal</span>
                            <span className="line-through tabular-nums">
                              {formatPrice(rawTotalPaise)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-ok font-medium">
                            <span className="flex items-center gap-1">
                              <Tag className="w-3 h-3" /> Combo discount
                            </span>
                            <span className="tabular-nums">
                              -{formatPrice(comboSavingsPaise)}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex items-center justify-between pt-1.5 border-t border-line">
                        <span className="text-sm font-bold text-ink">Total</span>
                        <span className="text-xl font-extrabold text-ink tabular-nums">
                          {formatPrice(totalPaise)}
                        </span>
                      </div>
                    </div>

                    {/* Checkout CTA */}
                    <button
                      onClick={handleCheckout}
                      className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      Checkout <ArrowRight className="w-4 h-4" />
                    </button>

                    {/* Trust micro-signals */}
                    <div className="flex items-center justify-center gap-3 text-[10px] text-muted/70">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" />
                        Secure
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Unlocks in hours
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Help card */}
              <a
                href="https://chat.whatsapp.com/D0bRgzW1YPHH76Gu1PTsUI"
                target="_blank"
                rel="noopener noreferrer"
                className="card p-4 flex items-center gap-3 hover:border-brand/30 transition cursor-pointer group"
              >
                <div className="flex items-center justify-center w-9 h-9 rounded-full bg-brand/10 group-hover:bg-brand/15 transition">
                  <MessageCircle className="w-4.5 h-4.5 text-brand" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-ink">
                    Need help choosing?
                  </p>
                  <p className="text-[11px] text-muted">
                    Chat with us on WhatsApp
                  </p>
                </div>
              </a>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-bold text-ink flex items-center gap-2">
          Your Cart
          <span className="text-xs font-semibold text-muted bg-surface px-2 py-0.5 rounded-full">
            {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </h2>
        <button
          onClick={handleClear}
          disabled={clearing}
          className="text-xs text-muted hover:text-red-600 transition flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          {clearing ? "Clearing…" : "Clear all"}
        </button>
      </div>

      {/* Combo discount highlight */}
      {comboDiscounts.map((d, i) => (
        <div
          key={i}
          className="rounded-xl border-2 border-ok/40 bg-gradient-to-r from-ok/5 to-green-500/5 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-ok/15">
              <Sparkles className="w-5 h-5 text-ok" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-ok">{d.label}</span>
                <span className="inline-flex items-center rounded-full bg-ok/15 px-2 py-0.5 text-[10px] font-bold text-ok">
                  SAVE {formatPrice(d.savingsPaise)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs mt-0.5">
                <span className="text-muted line-through">
                  {formatPrice(d.originalTotalPaise)}
                </span>
                <span className="font-bold text-ok">
                  {formatPrice(d.discountedTotalPaise)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Item cards */}
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="group flex items-center justify-between gap-4 p-4 rounded-xl border border-line bg-canvas hover:border-brand/20 hover:shadow-sm transition"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-ink truncate">
                {item.label}
              </p>
              <p className="text-xs text-muted capitalize mt-0.5">
                {item.exam} · {item.plan} plan
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm font-bold text-ink tabular-nums">
                {formatPrice(item.pricePaise)}
              </span>
              <button
                onClick={() => removeItem(item.id)}
                className="p-2.5 rounded-lg text-muted/50 hover:bg-red-50 hover:text-red-600 transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="border-t border-line pt-4 space-y-1.5">
        {comboSavingsPaise > 0 && (
          <>
            <div className="flex items-center justify-between text-sm text-muted">
              <span>Subtotal</span>
              <span className="line-through tabular-nums">
                {formatPrice(rawTotalPaise)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm text-ok font-medium">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Combo discount
              </span>
              <span className="tabular-nums">-{formatPrice(comboSavingsPaise)}</span>
            </div>
          </>
        )}
        <div className="flex items-center justify-between pt-2 border-t border-line">
          <span className="text-sm font-bold text-ink">Total</span>
          <span className="text-xl font-extrabold text-ink tabular-nums">
            {formatPrice(totalPaise)}
          </span>
        </div>
      </div>

      {/* Checkout CTA */}
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <button
          onClick={onCheckout}
          className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
        >
          Proceed to Checkout <ArrowRight className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-center gap-3 text-[11px] text-muted/70">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Secure
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> Unlocks in hours
          </span>
        </div>
      </div>
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
