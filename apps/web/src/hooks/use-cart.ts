"use client";

import { useState, useEffect, useCallback } from "react";

export type CartItem = {
  id: string;
  exam: string;
  subject: string;
  label: string;
  plan: string;
  pricePaise: number;
  createdAt: string;
};

type CartState = {
  items: CartItem[];
  totalPaise: number;
  count: number;
  loading: boolean;
};

export function useCart() {
  const [state, setState] = useState<CartState>({
    items: [],
    totalPaise: 0,
    count: 0,
    loading: true,
  });

  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setState({
          items: data.items ?? [],
          totalPaise: data.totalPaise ?? 0,
          count: data.count ?? 0,
          loading: false,
        });
      }
    } catch {
      setState((s) => ({ ...s, loading: false }));
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(
    async (exam: string, subject: string, plan: string = "pro") => {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam, subject, plan }),
      });
      if (res.ok) await fetchCart();
      return res.ok;
    },
    [fetchCart],
  );

  const removeItem = useCallback(
    async (id: string) => {
      const res = await fetch(`/api/cart/${id}`, { method: "DELETE" });
      if (res.ok) await fetchCart();
      return res.ok;
    },
    [fetchCart],
  );

  const clearCart = useCallback(async () => {
    const items = state.items;
    await Promise.all(items.map((i) => fetch(`/api/cart/${i.id}`, { method: "DELETE" })));
    await fetchCart();
  }, [state.items, fetchCart]);

  return { ...state, addItem, removeItem, clearCart, refetch: fetchCart };
}
