import Link from "next/link";
import { auth } from "@/lib/auth";
import { UserMenu } from "@/components/user-menu";
import { BrandLockup } from "@/components/brand";
import { MegaNav } from "@/components/mega-nav";
import { MobileNav, MobileSectionBar } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const session = await auth();
  const u = session?.user;

  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-line">
      <nav className="max-w-7xl mx-auto px-4 sm:px-5 h-16 flex items-center gap-3 sm:gap-6">
        <BrandLockup />

        {/* Primary nav — grouped by exam track (GATE / PSU / State / News / About) */}
        <MegaNav />

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
          <MobileNav authed={!!u} />
        </div>
      </nav>

      {/* Mobile-only: always-visible scrollable section pills */}
      <MobileSectionBar />
    </header>
  );
}

/** Module links for the self-contained GATE Mining mini-site. */
const MINING_MODULES = [
  { href: "/gate/mining", label: "Home" },
  { href: "/learn", label: "Learn" },
  { href: "/practice", label: "Practice" },
  { href: "/mocks", label: "Mocks" },
  { href: "/aits", label: "AITS" },
  { href: "/pricing", label: "Pricing" },
];

/**
 * Header for the GATE Mining mini-site. Replaces the global SiteHeader on
 * /gate/mining and the module routes (Learn/Practice/Mocks/AITS/Pricing).
 */
export async function MiningHeader() {
  const session = await auth();
  const u = session?.user;

  return (
    <header className="sticky top-0 z-40 bg-surface/85 backdrop-blur-md border-b border-line">
      <nav className="max-w-7xl mx-auto px-4 sm:px-5 h-16 flex items-center gap-3 sm:gap-6">
        <BrandLockup href="/" />
        <span className="hidden sm:inline-flex badge border border-brand/30 bg-brand/10 text-brand text-xs font-semibold">
          MN
        </span>
        <div className="hidden md:flex items-center gap-1">
          {MINING_MODULES.map((m) => (
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
          <MobileNav authed={!!u} />
        </div>
      </nav>

      {/* mobile module strip */}
      <div className="md:hidden border-t border-line">
        <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2">
          <span className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold whitespace-nowrap bg-brand/10 text-brand">
            Mining (MN)
          </span>
          {MINING_MODULES.map((m) => (
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
