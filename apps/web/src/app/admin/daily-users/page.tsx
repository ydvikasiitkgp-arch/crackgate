"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { AdminKpiCard } from "@/components/admin/admin-kpi-card";

type Point = { date: string; count: number };
type Summary = {
  total: number;
  signupsToday: number;
  signups7d: number;
  signups30d: number;
  attemptsToday: number;
  attempts7d: number;
  attempts30d: number;
  dauToday: number;
  dau7d: number;
  dau30d: number;
  active7dUsers: number;
  paidUsers: number;
  conversionRate: number;
  stickiness: number;
};
type DailyData = {
  signups: Point[];
  attempts: Point[];
  dau: Point[];
  summary: Summary;
};

function shortDate(d: string): string {
  const dt = new Date(d + "T00:00:00Z");
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", timeZone: "UTC" });
}

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-line bg-surface px-3 py-2 shadow-pop text-xs">
      <p className="font-medium text-ink mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} className="text-muted">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: p.color }} />
          {p.name}: <span className="font-semibold text-ink">{p.value.toLocaleString("en-IN")}</span>
        </p>
      ))}
    </div>
  );
}

export default function DailyUsersPage() {
  const [data, setData] = useState<DailyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/daily-users")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-3 sm:px-5 py-10">
        <div className="card p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-5 h-5 text-brand animate-spin" />
          <p className="text-sm text-muted">Loading daily user data...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-[1200px] mx-auto px-3 sm:px-5 py-10">
        <p className="text-muted text-center py-20">Failed to load data.</p>
      </div>
    );
  }

  const { signups, attempts, dau, summary } = data;
  const signupsChart = signups.map((p) => ({ ...p, label: shortDate(p.date) }));
  const attemptsChart = attempts.map((p) => ({ ...p, label: shortDate(p.date) }));
  const dauChart = dau.map((p) => ({ ...p, label: shortDate(p.date) }));

  const tickStyle = { fontSize: 11, fill: "rgb(var(--muted-rgb))" };
  const gridStyle = { strokeDasharray: "3 3", stroke: "rgb(var(--line-rgb) / 0.5)" };

  return (
    <div className="max-w-[1200px] mx-auto px-3 sm:px-5 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Daily Pulse</h1>
        <p className="text-muted mt-1 text-sm">Non-admin user activity — the canonical daily metrics</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <AdminKpiCard label="Total Users" value={summary.total} subtitle="excl. admins" icon="Users" tone="brand" />
        <AdminKpiCard label="Signups Today" value={summary.signupsToday} subtitle={`${summary.signups7d} this week`} icon="UserPlus" tone="ok" />
        <AdminKpiCard label="Attempts Today" value={summary.attemptsToday} subtitle={`${summary.attempts7d} this week`} icon="Activity" />
        <AdminKpiCard label="DAU Today" value={summary.dauToday} subtitle={`active 7d: ${summary.active7dUsers}`} icon="Zap" tone="accent" />
        <AdminKpiCard label="Paid Users" value={summary.paidUsers} subtitle={`${summary.conversionRate}% conversion`} icon="Crown" tone="ok" />
        <AdminKpiCard label="Stickiness" value={`${summary.stickiness}x`} subtitle={`DAU 30d / signups 30d`} icon="Eye" tone={summary.stickiness >= 1 ? "ok" : "default"} />
      </div>

      <div className="mt-8 grid lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-semibold text-ink">Daily Signups</h3>
            <p className="text-xs text-muted mt-0.5">New non-admin registrations per day</p>
          </div>
          <div className="w-full h-56 px-2 pb-2">
            <ResponsiveContainer>
              <BarChart data={signupsChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} interval={4} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(var(--brand-rgb) / 0.05)" }} />
                <Bar dataKey="count" name="Signups" fill="var(--brand, #4f46e5)" radius={[4, 4, 0, 0]} maxBarSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-semibold text-ink">Daily Active Users</h3>
            <p className="text-xs text-muted mt-0.5">Unique non-admin users with any activity</p>
          </div>
          <div className="w-full h-56 px-2 pb-2">
            <ResponsiveContainer>
              <LineChart data={dauChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} interval={4} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line type="monotone" dataKey="count" name="DAU" stroke="var(--brand-2, #7c3aed)" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--brand-2, #7c3aed)", fill: "white" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card overflow-hidden lg:col-span-2">
          <div className="p-6 pb-2">
            <h3 className="text-sm font-semibold text-ink">Mock Attempts</h3>
            <p className="text-xs text-muted mt-0.5">Daily mock test submissions by non-admin users</p>
          </div>
          <div className="w-full h-52 px-2 pb-2">
            <ResponsiveContainer>
              <BarChart data={attemptsChart} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid {...gridStyle} vertical={false} />
                <XAxis dataKey="label" tick={tickStyle} interval={2} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgb(var(--ok-rgb) / 0.05)" }} />
                <Bar dataKey="count" name="Attempts" fill="var(--ok, #16a34a)" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
