"use client";

import { useEffect, useCallback, useSyncExternalStore } from "react";
import { subjectPrice, getSubject } from "@/data/catalog";
import { calculateComboDiscounts } from "@/lib/combos";

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
  loggedIn: boolean;
};

const LS_KEY = "cg_cart";

// ── localStorage helpers ────────────────────────────────────────────
type LsItem = { exam: string; subject: string; plan: string };

function lsRead(): LsItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function lsWrite(items: LsItem[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(items));
}

function lsAdd(exam: string, subject: string, plan: string) {
  const items = lsRead();
  if (!items.some((i) => i.exam === exam && i.subject === subject)) {
    items.push({ exam, subject, plan });
    lsWrite(items);
  }
}

function lsRemove(exam: string, subject: string) {
  lsWrite(lsRead().filter((i) => !(i.exam === exam && i.subject === subject)));
}

function lsClear() {
  localStorage.removeItem(LS_KEY);
}

// ── build CartItem from local data ──────────────────────────────────
function localItemToCart(exam: string, subject: string, plan: string): CartItem {
  const price = subjectPrice(exam, subject);
  const sub = getSubject(exam, subject);
  return {
    id: `local-${exam}-${subject}`,
    exam,
    subject,
    label: sub?.label ?? subject,
    plan,
    pricePaise: plan === "premium" ? price.premiumPaise : price.proPaise,
    createdAt: new Date().toISOString(),
  };
}

function buildLocalState(): CartState {
  const lsItems = lsRead();
  const items = lsItems.map((i) => localItemToCart(i.exam, i.subject, i.plan));
  const rawTotalPaise = items.reduce((s, i) => s + i.pricePaise, 0);
  const comboDiscounts = calculateComboDiscounts(items);
  const comboSavingsPaise = comboDiscounts.reduce((s, d) => s + d.savingsPaise, 0);
  return {
    items,
    rawTotalPaise,
    totalPaise: rawTotalPaise - comboSavingsPaise,
    count: items.length,
    loading: false,
    comboDiscounts,
    comboSavingsPaise,
    loggedIn: false,
  };
}

// ── singleton shared state ──────────────────────────────────────────
let state: CartState = {
  items: [],
  rawTotalPaise: 0,
  totalPaise: 0,
  count: 0,
  loading: true,
  comboDiscounts: [],
  comboSavingsPaise: 0,
  loggedIn: false,
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

// ── server fetch ────────────────────────────────────────────────────
async function fetchServerCart(): Promise<boolean> {
  try {
    const res = await fetch("/api/cart", { credentials: "include" });
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
        loggedIn: true,
      });
      return true;
    }
    if (res.status !== 401) console.error("[cart:fetch] server returned", res.status, await res.text().catch(() => ""));
  } catch { /* ignore */ }
  return false;
}

// ── merge localStorage into server on login ─────────────────────────
async function mergeLocalToServer() {
  const lsItems = lsRead();
  if (lsItems.length === 0) return;
  console.log("[cart:merge] starting —", lsItems.length, "items to sync");
  let allOk = true;
  for (const item of lsItems) {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
      if (!res.ok) { allOk = false; console.error("[cart:merge] POST failed:", item.subject, res.status, await res.text().catch(() => "")); }
    } catch (e) {
      allOk = false;
      console.error("[cart:merge] POST error:", item.subject, e);
    }
  }
  if (allOk) lsClear();
  console.log("[cart:merge] done — allOk:", allOk);
}

// ── init: runs on each component mount ──────────────────────────────
function initCart() {
  fetchServerCart().then((loggedIn) => {
    if (loggedIn) {
      // Merge any leftover guest cart
      mergeLocalToServer().then(() => fetchServerCart());
    } else {
      // Guest — load from localStorage
      setCart(buildLocalState());
    }
  });
}

// ── hook ────────────────────────────────────────────────────────────
export function useCart() {
  const snap = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  useEffect(() => {
    initCart();
  }, []);

  const addItem = useCallback(
    async (exam: string, subject: string, plan: string = "pro") => {
      // Always update local state immediately
      lsAdd(exam, subject, plan);

      if (snap.loggedIn) {
        // Sync to server
        const res = await fetch("/api/cart", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exam, subject, plan }),
        });
        if (res.ok) {
          await fetchServerCart();
          return { ok: true as const };
        }
        console.error("[cart:addItem] server POST failed:", res.status, await res.text().catch(() => ""));
        // Server failed but local state is updated — still usable
      }

      // Guest mode — update from localStorage
      setCart(buildLocalState());
      return { ok: true as const };
    },
    [snap.loggedIn],
  );

  const removeItem = useCallback(
    async (id: string): Promise<boolean> => {
      const item = state.items.find((i) => i.id === id);
      if (!item) return false;

      lsRemove(item.exam, item.subject);

      if (snap.loggedIn) {
        const res = await fetch(`/api/cart/${id}`, { method: "DELETE", credentials: "include" });
        if (res.ok) {
          await fetchServerCart();
          return true;
        }
        return false;
      }

      setCart(buildLocalState());
      return true;
    },
    [snap.loggedIn],
  );

  const clearCart = useCallback(async () => {
    lsClear();
    if (snap.loggedIn) {
      await Promise.all(
        state.items.map((i) => fetch(`/api/cart/${i.id}`, { method: "DELETE", credentials: "include" })),
      );
      await fetchServerCart();
    } else {
      setCart(buildLocalState());
    }
  }, [snap.loggedIn]);

  const syncToServer = useCallback(async () => {
    console.log("[cart:sync] called — loggedIn:", snap.loggedIn);
    if (!snap.loggedIn) return false;
    const lsItems = lsRead();
    console.log("[cart:sync] localStorage items:", lsItems.length);
    if (lsItems.length === 0) return true;
    let allOk = true;
    for (const item of lsItems) {
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        });
        if (!res.ok) { allOk = false; console.error("[cart:sync] POST failed:", item.subject, res.status, await res.text().catch(() => "")); }
      } catch (e) {
        allOk = false;
        console.error("[cart:sync] POST error:", item.subject, e);
      }
    }
    if (allOk) lsClear();
    await fetchServerCart();
    console.log("[cart:sync] done — allOk:", allOk);
    return allOk;
  }, [snap.loggedIn]);

  return { ...snap, addItem, removeItem, clearCart, syncToServer, refetch: snap.loggedIn ? fetchServerCart : () => { setCart(buildLocalState()); } };
}
