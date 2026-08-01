"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export function UserMenu({
  name, email, image, plan, role,
}: {
  name: string;
  email: string;
  image?: string;
  plan: "free" | "pro" | "premium" | string;
  role?: "user" | "admin" | string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function onDown(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDown); document.removeEventListener("keydown", onKey); };
  }, []);

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
        <div role="menu" className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] bg-surface border border-line rounded-xl shadow-pop overflow-y-auto max-h-[80vh] z-50">
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
