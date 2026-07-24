"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyCard({
  label,
  value,
  mono = true,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ponytail: silent fail — clipboard API may be blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex items-center justify-between gap-2 rounded-lg bg-surface border border-line hover:border-brand/30 px-3 py-2.5 text-left transition group w-full"
    >
      <div className="min-w-0">
        <p className="text-[10px] text-muted font-medium uppercase tracking-wider">
          {label}
        </p>
        <p
          className={`text-sm font-semibold mt-0.5 truncate ${mono ? "font-mono" : ""}`}
        >
          {value}
        </p>
      </div>
      <div className="shrink-0 text-muted group-hover:text-brand transition">
        {copied ? (
          <Check className="w-4 h-4 text-ok" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </div>
    </button>
  );
}
