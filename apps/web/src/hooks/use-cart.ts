"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";

export type CartItem = {
  id: string;
  exam: string;
  subject: string;
  label: string;
  plan: string;
  pricePaise: number;
  createdAt: string;
};

export type ComboDiscount = {
  label: string;
  originalTotalPaise: number;
  discountedTotalPaise: number;
  savingsPaise: number;
};

type CartState = {
  items: CartItem[];
  rawTotalPaise: number;
  totalPaise: number;
  count: number;
  loading: boolean;
  comboDiscounts: ComboDiscount[];
  comboSavingsPaise: number;
};

// ── singleton shared state ──────────────────────────────────────────
let state: CartState = {
  items: [],
  rawTotalPaise: 0,
  totalPaise: 0,
  count: 0,
  loading: true,
  comboDiscounts: [],
  comboSavingsPaise: 0,
};
const listeners = new Set<() => void>();

function emit() {
  for (const fn of listeners) fn();
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

function getSnapshot() {
  return state;
}

function setCart(s: CartState) {
  state = s;
  emit();
}

async function fetchCart() {
  try {
    const res = await fetch("/api/cart");
    if (res.ok) {
      const data = await res.json();
      setCart({
        items: data.items ?? [],
        rawTotalPaise: data.rawTotalPaise ?? 0,
        totalPaise: data.totalPaise ?? 0,
        count: data.count ?? 0,
        loading: false,
        comboDiscounts: data.comboDiscounts ?? [],
        comboSavingsPaise: data.comboSavingsPaise ?? 0,
      });
    }
  } catch {
    setCart({ ...state, loading: false });
  }
}

// ── hook ────────────────────────────────────────────────────────────
export function useCart() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    fetchCart();
  }, []);

  const addItem = useCallback(
    async (exam: string, subject: string, plan: string = "pro") => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, subject, plan }),
      });
      if (res.ok) {
        await fetchCart();
        return { ok: true as const };
      }
      console.error("[cart] addItem failed:", res.status, await res.text());
      return { ok: false as const, status: res.status };
    },
    [],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (res.ok) await fetchCart();
      return res.ok;
    },
    [],
  );

  const clearCart = useCallback(async () => {
    const items = snap.items;
    await Promise.all(items.map((i) => fetch(`/api/cart/${i.id}`, { method: "DELETE" })));
    await fetchCart();
  }, [snap.items]);

  return { ...snap, addItem, removeItem, clearCart, refetch: fetchCart };
}
