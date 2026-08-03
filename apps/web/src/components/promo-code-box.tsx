"use client";

import { useState } from "react";
import { Tag, Check, Loader2, X, ChevronDown } from "lucide-react";

export type PromoResult = {
  code: string;
  discountPaise: number;
  label: string;
  type: string;
  value: number;
};

type Props = {
  subtotalPaise: number;
  value: PromoResult | null;
  onChange: (promo: PromoResult | null) => void;
  compact?: boolean;
};

export default function PromoCodeBox({ subtotalPaise, value, onChange, compact }: Props) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function applyPromo() {
    const code = input.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code, subtotalPaise }),
      });
      const data = await r.json();
      if (!r.ok) {
        setError(data.error ?? "Invalid code");
        onChange(null);
      } else {
        onChange(data);
      }
    } catch {
      setError("Failed to verify code");
      onChange(null);
    } finally {
      setLoading(false);
    }
  }

  function removePromo() {
    setInput("");
    setError(null);
    onChange(null);
  }

  return (
    <div className="rounded-xl border border-line overflow-hidden">
      {value ? (
        <div className="flex items-center justify-between gap-2 bg-ok/10 border border-ok/30 px-3 py-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Check className="w-4 h-4 text-ok shrink-0" />
            <span className="text-sm font-semibold text-ok truncate">
              {value.label}
            </span>
            <span className="text-xs text-ok/70 shrink-0">
              — ₹{Math.round(value.discountPaise / 100)} off
            </span>
          </div>
          <button
            type="button"
            onClick={removePromo}
            className="text-muted hover:text-err transition p-1 rounded shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className={`w-full flex items-center gap-2 text-xs font-semibold text-muted hover:bg-surface/50 transition ${compact ? "px-3 py-2" : "px-3 py-2.5"}`}
          >
            <Tag className="w-3.5 h-3.5" />
            Have a promo code?
            <ChevronDown
              className={`w-3.5 h-3.5 ml-auto transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <div className="px-3 pb-3 border-t border-line">
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value.toUpperCase())}
                  placeholder="e.g. FIRST10"
                  className="input flex-1 text-sm uppercase tracking-wider"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyPromo();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={applyPromo}
                  disabled={loading || !input.trim()}
                  className="btn btn-ghost text-sm px-3 shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                </button>
              </div>
              {error && <p className="text-xs text-err mt-1.5">{error}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
