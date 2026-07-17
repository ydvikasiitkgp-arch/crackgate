"use client";

import { cn } from "@/lib/utils";
import {
  Users,
  Crown,
  Activity,
  IndianRupee,
  Flag,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Zap,
  Eye,
} from "lucide-react";

type TrendDirection = "up" | "down" | "flat";

const ICON_MAP = {
  Users,
  Crown,
  Activity,
  IndianRupee,
  Flag,
  Clock,
  Zap,
  Eye,
} as const;

type IconName = keyof typeof ICON_MAP;

function MiniSparkline({
  data,
  color = "var(--brand)",
}: {
  data: number[];
  color?: string;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const h = 32;
  const w = 80;
  const step = w / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(" ");

  const areaPoints = `0,${h} ${points} ${w},${h}`;
  const gradId = `grad-${color.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg width={w} height={h} className="shrink-0 opacity-60">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradId})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminKpiCard({
  label,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  sparkData,
  tone = "default",
  className,
}: {
  label: string;
  value: string | number;
  subtitle?: string;
  icon: IconName;
  trend?: TrendDirection;
  trendValue?: string;
  sparkData?: number[];
  tone?: "default" | "ok" | "bad" | "accent" | "brand";
  className?: string;
}) {
  const Icon = ICON_MAP[icon];

  const toneColors = {
    default: "text-ink",
    ok: "text-ok",
    bad: "text-bad",
    accent: "text-accent",
    brand: "text-brand",
  };

  const trendConfig = {
    up: { Icon: TrendingUp, color: "text-ok", bg: "bg-ok/10" },
    down: { Icon: TrendingDown, color: "text-bad", bg: "bg-bad/10" },
    flat: { Icon: Minus, color: "text-muted", bg: "bg-muted/10" },
  };

  const trendInfo = trend ? trendConfig[trend] : null;
  const sparkColor =
    tone === "ok"
      ? "var(--ok)"
      : tone === "bad"
        ? "var(--bad)"
        : tone === "accent"
          ? "var(--accent)"
          : "var(--brand)";

  return (
    <div className={cn("card group relative overflow-hidden", className)}>
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-brand/40 via-brand/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-3 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg",
                  tone === "ok"
                    ? "bg-ok/10"
                    : tone === "bad"
                      ? "bg-bad/10"
                      : tone === "accent"
                        ? "bg-accent/10"
                        : tone === "brand"
                          ? "bg-brand/10"
                          : "bg-paper"
                )}
              >
                {Icon && <Icon className={cn("w-4 h-4", toneColors[tone])} />}
              </div>
              <span className="text-xs font-medium text-muted uppercase tracking-wider">
                {label}
              </span>
            </div>

            <div
              className={cn(
                "text-xl sm:text-2xl font-extrabold tracking-tight",
                toneColors[tone]
              )}
            >
              {value}
            </div>

            {subtitle && (
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                {subtitle}
              </p>
            )}

            {trendInfo && trendValue && (
              <div
                className={cn(
                  "inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full text-[11px] font-semibold",
                  trendInfo.bg,
                  trendInfo.color
                )}
              >
                <trendInfo.Icon className="w-3 h-3" />
                {trendValue}
              </div>
            )}
          </div>

          {sparkData && sparkData.length > 1 && (
            <MiniSparkline data={sparkData} color={sparkColor} />
          )}
        </div>
      </div>
    </div>
  );
}
