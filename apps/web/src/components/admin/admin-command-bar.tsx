"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import {
  Send,
  FileText,
  CreditCard,
  Download,
  Keyboard,
  ChevronDown,
  X,
  HelpCircle,
  ExternalLink,
  BarChart3,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const EXPORT_OPTIONS = [
  { dataset: "users", label: "Users", icon: "👥" },
  { dataset: "payments", label: "Payments", icon: "💰" },
  { dataset: "attempts", label: "Attempts", icon: "🧪" },
  { dataset: "activity", label: "Activity", icon: "📜" },
  { dataset: "reports", label: "Reports", icon: "🚩" },
  { dataset: "entitlements", label: "Entitlements", icon: "🔑" },
];

const QUICK_ACTIONS = [
  {
    href: "/admin/newsletter",
    label: "Send Newsletter",
    icon: Send,
    color: "text-brand",
    bg: "bg-brand/10 hover:bg-brand/15",
  },
  {
    href: "/admin/reports",
    label: "Review Reports",
    icon: FileText,
    color: "text-accent",
    bg: "bg-accent/10 hover:bg-accent/15",
  },
  {
    href: "/admin/upi",
    label: "Approve UPI",
    icon: CreditCard,
    color: "text-ok",
    bg: "bg-ok/10 hover:bg-ok/15",
  },
  {
    href: "/admin/questions",
    label: "Upload Questions",
    icon: HelpCircle,
    color: "text-purple-500",
    bg: "bg-purple-500/10 hover:bg-purple-500/15",
  },
  {
    href: "/admin/daily-users",
    label: "Daily Pulse",
    icon: Users,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10 hover:bg-cyan-500/15",
  },
  {
    href: "https://app.posthog.com",
    label: "Analytics",
    icon: BarChart3,
    color: "text-sky-500",
    bg: "bg-sky-500/10 hover:bg-sky-500/15",
    external: true,
  },
];

export function AdminCommandBar({
  pendingReports,
  pendingUpi,
}: {
  pendingReports: number;
  pendingUpi: number;
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setExportOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Quick action buttons */}
      {QUICK_ACTIONS.map((action) => {
        const badge =
          action.href === "/admin/reports" && pendingReports > 0
            ? pendingReports
            : action.href === "/admin/upi" && pendingUpi > 0
              ? pendingUpi
              : null;

        const Wrapper = action.external ? "a" : Link;
        const wrapperProps = action.external
          ? { href: action.href, target: "_blank", rel: "noopener noreferrer" }
          : { href: action.href };

        return (
          <Wrapper
            key={action.href}
            {...wrapperProps}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              action.bg,
              action.color
            )}
          >
            <action.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{action.label}</span>
            {badge && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-bad text-white text-[10px] font-bold px-1">
                {badge}
              </span>
            )}
            {action.external && <ExternalLink className="w-3 h-3 opacity-50 hidden sm:block" />}
          </Wrapper>
        );
      })}

      {/* Export dropdown */}
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setExportOpen(!exportOpen)}
          className={cn(
            "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all",
            "bg-surface border border-line hover:bg-paper text-ink",
            exportOpen && "ring-2 ring-brand/20 border-brand/30"
          )}
        >
          <Download className="w-4 h-4 text-muted" />
          <span className="hidden sm:inline">Export</span>
          <ChevronDown className={cn("w-3.5 h-3.5 text-muted transition-transform", exportOpen && "rotate-180")} />
        </button>

        {exportOpen && (
          <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl bg-surface border border-line shadow-pop z-50 py-1.5 animate-in fade-in slide-in-from-top-2">
            <div className="px-3 py-1.5 mb-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">
                Download CSV
              </p>
            </div>
            {EXPORT_OPTIONS.map((opt) => (
              <a
                key={opt.dataset}
                href={`/api/admin/export?dataset=${opt.dataset}`}
                className="group flex items-center gap-3 px-3 py-2 text-sm text-ink hover:bg-paper transition-colors"
                onClick={() => setExportOpen(false)}
              >
                <span className="text-base">{opt.icon}</span>
                <span className="flex-1">{opt.label}</span>
                <Download className="w-3.5 h-3.5 text-muted opacity-0 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
