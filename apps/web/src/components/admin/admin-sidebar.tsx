"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  FileText,
  Send,
  CreditCard,
  HelpCircle,
  BarChart3,
  ChevronLeft,
  Menu,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/reports", label: "Reports", icon: FileText, badge: true },
  { href: "/admin/newsletter", label: "Newsletter", icon: Send },
  { href: "/admin/upi", label: "Payments", icon: CreditCard, badge: true },
  { href: "/admin/questions", label: "Questions", icon: HelpCircle },
];

const EXTERNAL_LINKS = [
  { href: "https://app.posthog.com", label: "PostHog Analytics", icon: BarChart3 },
];

type AdminInfo = { email: string; source: string };

export function AdminSidebar({
  admin,
  children,
}: {
  admin: AdminInfo;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [mobileOpen]);

  return (
    <div className="flex min-h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-surface border-r border-line transition-all duration-300 flex flex-col shrink-0",
          "fixed lg:sticky left-0 z-50 lg:z-auto top-0 lg:top-16",
          "h-dvh lg:h-[calc(100vh-4rem)]",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo / collapse toggle */}
        <div className={cn(
          "flex items-center border-b border-line h-16 shrink-0",
          collapsed ? "justify-center px-2" : "justify-between px-5"
        )}>
          {!collapsed && (
            <Link href="/admin" className="flex items-center gap-2 group">
              <span className="font-extrabold text-lg tracking-tight">
                <span className="text-ink">Founder</span>
                <span className="text-brand">Console</span>
              </span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-paper transition text-muted"
            aria-label="Toggle sidebar"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg text-sm font-medium transition-all group relative",
                  collapsed ? "justify-center px-2 py-3" : "px-3 py-2.5",
                  isActive
                    ? "bg-brand/10 text-brand"
                    : "text-muted hover:text-ink hover:bg-paper"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("w-[18px] h-[18px] shrink-0", isActive && "text-brand")} />
                {!collapsed && (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    )}
                  </>
                )}
              </Link>
            );
          })}

          {!collapsed && (
            <>
              <div className="pt-4 pb-1 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted/60">
                  External
                </span>
              </div>
              {EXTERNAL_LINKS.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-ink hover:bg-paper transition"
                >
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  <span className="flex-1">{item.label}</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-40" />
                </a>
              ))}
            </>
          )}
        </nav>

        {/* Admin info */}
        <div className={cn(
          "border-t border-line shrink-0",
          collapsed ? "p-2" : "p-4"
        )}>
          {collapsed ? (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold">
                {admin.email.charAt(0).toUpperCase()}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand/10 text-brand flex items-center justify-center text-xs font-bold shrink-0">
                {admin.email.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{admin.email}</p>
                <p className="text-[10px] text-muted">via {admin.source === "env" ? "ADMIN_EMAILS" : "User.role"}</p>
              </div>
              <Link href="/" className="text-muted hover:text-ink transition" title="Back to site">
                <LogOut className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-20 left-4 z-50 lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-surface border border-line shadow-card"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Main content */}
      <main className={cn(
        "flex-1 min-h-screen transition-all",
        collapsed ? "lg:ml-[68px]" : "lg:ml-64"
      )}>
        {children}
      </main>
    </div>
  );
}
