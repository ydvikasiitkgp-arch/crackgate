"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import type { TrackStats } from "@/app/api/user/stats/route";

type Entitlement = {
  exam: string;
  subject: string;
  label: string;
  tier: "pro" | "premium";
  expiry: string | null;
};

function trackKey(exam: string, subject: string): string {
  return `${exam}-${subject}`.toLowerCase();
}

function relativeTime(iso: string | null): string {
  if (!iso) return "Never";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function UserMenu({
  name, email, image, plan, role, entitlements = [],
}: {
  name: string;
  email: string;
  image?: string;
  plan: "free" | "pro" | "premium" | string;
  role?: "user" | "admin" | string;
  entitlements?: Entitlement[];
}) {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Record<string, TrackStats>>({});
  const [statsLoading, setStatsLoading] = useState(false);
  const statsFetched = useRef(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDown(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

  // Fetch stats when dropdown opens (only if user has entitlements)
  useEffect(() => {
    if (open && entitlements.length > 0 && !statsFetched.current) {
      statsFetched.current = true;
      setStatsLoading(true);
      fetch("/api/user/stats")
        .then((r) => r.json())
        .then((d) => setStats(d.tracks ?? {}))
        .catch(() => {})
        .finally(() => setStatsLoading(false));
    }
  }, [open, entitlements.length]);

  const initials = name.split(" ").map(s => s[0]).slice(0, 2).join("").toUpperCase();
  const planClass = plan === "premium" ? "badge-premium" : plan === "pro" ? "badge-pro" : "badge-free";
  const planLabel = String(plan).toUpperCase();

  async function handleLogout() {
    setOpen(false);
    await signOut({ redirect: false });
    router.push("/");
    router.refresh();
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full p-1 hover:bg-canvas transition border border-transparent hover:border-line"
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" className="w-8 h-8 rounded-full border border-line" />
        ) : (
          <span className="w-8 h-8 rounded-full bg-brand text-white grid place-items-center text-xs font-bold">{initials}</span>
        )}
        <svg className={`w-4 h-4 text-muted transition-transform ${open ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.06l3.71-3.83a.75.75 0 111.08 1.04l-4.24 4.38a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-80 bg-surface border border-line rounded-xl shadow-pop overflow-hidden z-50">
          {/* Profile card */}
          <div className="p-4 bg-gradient-to-br from-brand/5 to-accent/5 border-b border-line">
            <div className="flex items-center gap-3">
              {image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={image} alt="" className="w-12 h-12 rounded-full border border-line" />
              ) : (
                <span className="w-12 h-12 rounded-full bg-brand text-white grid place-items-center font-bold">{initials}</span>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate">{name}</div>
                <div className="text-xs text-muted truncate">{email}</div>
                <div className="mt-1.5 flex gap-1.5 items-center">
                  <span className={`badge ${planClass} text-[10px]`}>{planLabel}</span>
                  {role === "admin" && <span className="badge bg-purple-50 text-purple-700 text-[10px]">ADMIN</span>}
                </div>
              </div>
            </div>
            {plan === "free" && (
              <Link
                href="/pricing"
                onClick={() => setOpen(false)}
                className="btn btn-accent w-full mt-3 text-xs justify-center"
              >
                Upgrade your plan
              </Link>
            )}
          </div>

          {/* Mini-dashboard: Your courses */}
          {entitlements.length > 0 && (
            <div className="border-b border-line">
              <div className="px-4 pt-3 pb-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-muted">Your courses</div>
              </div>
              <div className="px-2 pb-2 space-y-0.5 max-h-52 overflow-y-auto">
                {statsLoading ? (
                  Array.from({ length: Math.min(entitlements.length, 3) }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 px-2 py-2 rounded-lg animate-pulse">
                      <div className="h-8 w-8 rounded-lg bg-surface" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-3 w-28 rounded bg-surface" />
                        <div className="h-2.5 w-20 rounded bg-surface" />
                      </div>
                    </div>
                  ))
                ) : (
                  entitlements.map((e) => {
                    const key = trackKey(e.exam, e.subject);
                    const s = stats[key];
                    return (
                      <Link
                        key={key}
                        href={`/dashboard?track=${key}`}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-canvas transition group"
                      >
                        <div className="h-8 w-8 rounded-lg bg-brand/10 text-brand grid place-items-center text-xs font-bold shrink-0">
                          {e.exam === "GATE" ? "G" : e.exam === "PSU" ? "P" : e.exam === "DIPLOMA" ? "D" : "S"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold truncate group-hover:text-brand transition-colors">
                            {e.label}
                          </div>
                          <div className="text-[11px] text-muted flex items-center gap-1.5">
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${e.tier === "premium" ? "bg-accent" : "bg-brand"}`} />
                            {s ? (
                              <>{s.attempts} attempt{s.attempts !== 1 ? "s" : ""} · {s.accuracy}% · {relativeTime(s.lastPracticed)}</>
                            ) : (
                              <span>Not started</span>
                            )}
                          </div>
                        </div>
                        <svg className="w-3.5 h-3.5 text-muted/50 group-hover:text-brand transition-colors shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Account */}
          <Section>
            <Item href="/dashboard" icon="📊" onClick={() => setOpen(false)}>Dashboard</Item>
            <Item href="/settings"  icon="⚙️" onClick={() => setOpen(false)}>Account settings</Item>
            <Item href="/pricing"   icon="💎" onClick={() => setOpen(false)}>Plans & billing</Item>
            <Item href="/contact"   icon="💬" onClick={() => setOpen(false)}>Help & support</Item>
            {role === "admin" && (
              <Item href="/admin" icon="🛡️" onClick={() => setOpen(false)}>Admin console</Item>
            )}
          </Section>

          {/* Logout */}
          <Section last>
            <button
              type="button"
              onClick={handleLogout}
              role="menuitem"
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm hover:bg-rose-50 text-rose-700 text-left"
            >
              <span className="w-5 text-center">🚪</span>
              <span>Sign out</span>
            </button>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return <div className={`py-1.5 ${last ? "" : "border-b border-line"}`}>{children}</div>;
}

function Item({ href, icon, children, onClick }: { href: string; icon: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-canvas text-ink"
    >
      <span className="w-5 text-center">{icon}</span>
      <span>{children}</span>
    </Link>
  );
}
