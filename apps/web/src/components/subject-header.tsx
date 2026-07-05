import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { BrandLockup } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

import { getGateSubject } from "@/data/gate/registry";

/**
 * Header for a self-contained GATE subject mini-site (e.g. /gate/civil).
 * Generic clone of MiningHeader — the module links are derived from the
 * subject slug, so a new subject gets a working header for free.
 */
export async function SubjectHeader({ subject }: { subject: string }) {
  const session = await auth();
  const u = session?.user;
  const meta = getGateSubject(subject);
  const label = meta?.label ?? "GATE";

  const modules = [
    { href: `/gate/${subject}`, label: "Home" },
    { href: `/gate/${subject}/learn`, label: "Learn" },
    { href: `/gate/${subject}/practice`, label: "Practice" },
    { href: `/gate/${subject}/mocks`, label: "Mocks" },
    { href: `/gate/${subject}/aits`, label: "AITS" },
    { href: "/pricing", label: "Pricing" },
  ];

  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-line">
      <nav className="max-w-7xl mx-auto px-4 sm:px-5 h-16 flex items-center gap-3 sm:gap-6">
        <BrandLockup href="/" />
        {meta?.code && (
          <span className="hidden sm:inline-flex badge border border-brand/30 bg-brand/10 text-brand text-xs font-semibold">
            {meta.code}
          </span>
        )}
        <div className="hidden md:flex items-center gap-1">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-ink hover:bg-brand/10 transition"
            >
              {m.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {u ? (
            <UserMenu
              name={u.name ?? "Aspirant"}
              email={u.email ?? ""}
              image={u.image ?? undefined}
              plan={u.plan ?? "free"}
              role={u.role}
            />
          ) : (
            <Link href="/login" className="btn btn-primary text-sm">Get Started</Link>
          )}
        </div>
      </nav>

      {/* mobile module strip */}
      <div className="md:hidden border-t border-line">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2">
          <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-brand/10 text-brand">
            {label}
          </span>
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium whitespace-nowrap bg-canvas text-ink hover:bg-brand/10 transition"
            >
              {m.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
