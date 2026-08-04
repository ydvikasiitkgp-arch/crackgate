"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BarChart3, Loader2 } from "lucide-react";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";

type Point = { date: string; count: number };
type Overview = {
  series: {
    signups: Point[];
    attempts: Point[];
    activity: Point[];
    reports: Point[];
    dau: Point[];
    visitors: Point[];
    pageviews: Point[];
  };
};

function shortDate(d: string): string {
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    timeZone: "UTC",
  });
}

function pctChange(
  a: number,
  b: number
): { dir: "up" | "down" | "flat"; label: string } {
  if (b === 0)
    return { dir: a > 0 ? "up" : "flat", label: a > 0 ? "+∞" : "—" };
  const diff = ((a - b) / b) * 100;
  const rounded = Math.round(Math.abs(diff));
  if (diff > 0) return { dir: "up", label: `+${rounded}%` };
  if (diff < 0) return { dir: "down", label: `-${rounded}%` };
  return { dir: "flat", label: "0%" };
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-pop text-xs">
      <p className="font-medium text-ink mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted">
          <span
            className="inline-block w-2 h-2 rounded-full mr-1.5"
            style={{ backgroundColor: p.color }}
          />
          {p.name}: <span className="font-semibold text-ink">{p.value.toLocaleString("en-IN")}</span>
        </p>
      ))}
    </div>
  );
}

export function AdminCharts() {
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/overview")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="mt-8 card p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 text-brand animate-spin" />
        <p className="text-sm text-muted">Loading trend data...</p>
      </div>
    );

  if (!data) return null;

  const signups = data.series.signups.map((p) => ({
    ...p,
    label: shortDate(p.date),
  }));
  const attempts = data.series.attempts.map((p) => ({
    ...p,
    label: shortDate(p.date),
  }));
  const dau = data.series.dau.map((p) => ({
    ...p,
    label: shortDate(p.date),
  }));
  const reports = data.series.reports.map((p) => ({
    ...p,
    label: shortDate(p.date),
  }));
  const visitors = (data.series.visitors ?? []).map((p) => ({
    ...p,
    label: shortDate(p.date),
  }));
  const pageviews = (data.series.pageviews ?? []).map((p) => ({
    ...p,
    label: shortDate(p.date),
  }));
  const pageviews30 = pageviews.slice(-30);
  const prev30Sum = pageviews.slice(-60, -30).reduce((s, p) => s + p.count, 0);
  const cur30Sum = pageviews.slice(-30).reduce((s, p) => s + p.count, 0);
  const pageviews30Delta = pctChange(cur30Sum, prev30Sum);

  const tickStyle = { fontSize: 11, fill: "rgb(var(--muted-rgb))" };
  const gridStyle = { strokeDasharray: "3 3", stroke: "rgb(var(--line-rgb) / 0.5)" };

  return (
    <section className="mt-8">
      <AdminSectionHeader
        title="Trends"
        subtitle="30-day overview of platform activity"
      />

      <div className="mt-4 grid lg:grid-cols-2 gap-6">
        {/* Signups */}
        <div className="card overflow-hidden">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-semibold text-ink">Signups</h3>
            <p className="text-xs text-muted mt-0.5">New user registrations per day</p>
          </div>
          <div className="w-full h-56 px-2 pb-2">
            <ResponsiveContainer>
              <BarChart data={signups} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} interval={4} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(var(--brand-rgb) / 0.05)" }} />
                <Bar
                  dataKey="count"
                  name="Signups"
                  fill="var(--brand, #4f46e5)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* DAU */}
        <div className="card overflow-hidden">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-semibold text-ink">Daily Active Users</h3>
            <p className="text-xs text-muted mt-0.5">Unique users with activity per day</p>
          </div>
          <div className="w-full h-56 px-2 pb-2">
            <ResponsiveContainer>
              <LineChart data={dau} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} interval={4} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="DAU"
                  stroke="var(--brand-2, #7c3aed)"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--brand-2, #7c3aed)", fill: "white" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visitors */}
        {visitors.length > 0 && (
          <div className="card overflow-hidden">
            <div className="p-6 pb-2">
              <h3 className="text-sm font-semibold text-ink">Website Visitors</h3>
              <p className="text-xs text-muted mt-0.5">Unique visitors per day (excl. admins)</p>
            </div>
            <div className="w-full h-56 px-2 pb-2">
              <ResponsiveContainer>
                <LineChart data={visitors} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis dataKey="label" tick={tickStyle} interval={4} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    name="Visitors"
                    stroke="var(--accent, #f59e0b)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--accent, #f59e0b)", fill: "white" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* All Visits 30d */}
        {pageviews30.length > 0 && (
          <div className="card overflow-hidden">
            <div className="p-6 pb-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-ink">All Visits (30d)</h3>
                <span
                  className={`text-xs font-semibold tabular-nums ${
                    pageviews30Delta.dir === "up"
                      ? "text-ok"
                      : pageviews30Delta.dir === "down"
                        ? "text-bad"
                        : "text-muted"
                  }`}
                >
                  {pageviews30Delta.dir === "up" ? "▲" : pageviews30Delta.dir === "down" ? "▼" : ""}{" "}
                  {pageviews30Delta.label} vs prev 30d
                </span>
              </div>
              <p className="text-xs text-muted mt-0.5">Total visits per day · last 30 days (excl. admins)</p>
            </div>
            <div className="w-full h-56 px-2 pb-2">
              <ResponsiveContainer>
                <BarChart data={pageviews30} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid {...gridStyle} vertical={false} />
                  <XAxis dataKey="label" tick={tickStyle} interval={4} axisLine={false} tickLine={false} />
                  <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(var(--accent-rgb, 245 158 11) / 0.05)" }} />
                  <Bar
                    dataKey="count"
                    name="Visits"
                    fill="var(--accent, #f59e0b)"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Attempts */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-semibold text-ink">Mock Attempts</h3>
            <p className="text-xs text-muted mt-0.5">Daily mock test submissions across all users</p>
          </div>
          <div className="w-full h-52 px-2 pb-2">
            <ResponsiveContainer>
              <BarChart data={attempts} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} interval={2} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(var(--ok-rgb, 16 163 74) / 0.05)" }} />
                <Bar
                  dataKey="count"
                  name="Attempts"
                  fill="var(--ok, #10b981)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Reports */}
        <div className="card overflow-hidden lg:col-span-2">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-semibold text-ink">Reports</h3>
            <p className="text-xs text-muted mt-0.5">User-submitted question issues per day</p>
          </div>
          <div className="w-full h-52 px-2 pb-2">
            <ResponsiveContainer>
              <BarChart data={reports} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} interval={2} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(var(--accent-rgb, 245 158 11) / 0.05)" }} />
                <Bar
                  dataKey="count"
                  name="Reports"
                  fill="var(--accent, #f59e0b)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
