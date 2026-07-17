"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";

type FunnelStep = {
  step: string;
  count: number;
  pctOfTotal: number;
  pctOfPrev: number;
  dropoff: number;
};

type FunnelData = { funnel: FunnelStep[] };

const STEP_COLORS = [
  "bg-brand",
  "bg-brand-2",
  "bg-ok",
  "bg-accent",
  "bg-amber-500",
  "bg-emerald-500",
];

export function AdminFunnelChart() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/funnel")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-brand animate-spin" />
        <p className="text-sm text-muted">Loading funnel...</p>
      </div>
    );
  }

  if (!data || data.funnel.length === 0) return null;

  const maxCount = data.funnel[0]?.count ?? 1;

  return (
    <section className="mt-8">
      <AdminSectionHeader
        title="Conversion Funnel"
        subtitle="Visitor → Paid (last 30 days)"
      />
      <div className="mt-4 card p-6">
        <div className="space-y-3">
          {data.funnel.map((s, i) => {
            const widthPct = maxCount > 0 ? Math.max(8, (s.count / maxCount) * 100) : 8;
            return (
              <div key={s.step}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-semibold">{s.step}</span>
                  <div className="flex items-center gap-3 text-muted tabular-nums">
                    <span className="font-semibold text-ink">{s.count.toLocaleString("en-IN")}</span>
                    <span className="text-xs">({s.pctOfTotal}%)</span>
                    {i > 0 && s.pctOfPrev < 100 && (
                      <span className="text-xs text-bad">
                        {s.pctOfPrev}% →
                      </span>
                    )}
                  </div>
                </div>
                <div className="relative h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                  <div
                    className={`absolute inset-y-0 left-0 ${STEP_COLORS[i] ?? "bg-brand"} rounded-lg transition-all duration-500`}
                    style={{ width: `${widthPct}%` }}
                  />
                  {s.dropoff > 0 && (
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-muted">
                      -{s.dropoff.toLocaleString("en-IN")} dropped
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-xs text-muted mt-4 pt-3 border-t border-line">
          {data.funnel[0]?.count.toLocaleString("en-IN")} visitors → {data.funnel[data.funnel.length - 1]?.count.toLocaleString("en-IN")} paid ({data.funnel[0]?.count ? Math.round(((data.funnel[data.funnel.length - 1]?.count ?? 0) / data.funnel[0].count) * 1000) / 10 : 0}% overall conversion)
        </p>
      </div>
    </section>
  );
}
