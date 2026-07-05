import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { SiteHeader, MiningHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { DevPlanSwitcher } from "@/components/dev-plan-switcher";
import { HideOnMiningSite, ShowOnMiningSite } from "@/components/mobile-nav";
import { ThemeScript } from "@/components/theme-script";
import { auth } from "@/lib/auth";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// Staging (staging.crackgate.in) must never be indexed by search engines.
// const isStaging = process.env.NEXT_PUBLIC_SITE_ENV === "staging";

export const metadata: Metadata = {
  metadataBase: new URL("https://crackgate.in"),
  title: { default: "CrackGate.in — GATE Mining, Civil, Geology & PSU Exam Prep", template: "%s · CrackGate.in" },
  description:
    "India's #1 platform for GATE Mining (MN), Civil (CE), Geology (GG), Environmental Science (ES), PSU Coal India & state mining engineering exams. Full-length mocks, topic-wise practice, SWOT analytics & study material.",
  keywords: ["GATE Mining", "GATE MN", "GATE Civil Engineering", "GATE CE", "GATE Geology", "GATE GG", "GATE Environmental Science", "Coal India PSU", "CIL Management Trainee", "Mining Engineering PSU", "RPSC Mining Engineer", "Mining Sirdar Exam"],
  // ...(isStaging ? { robots: { index: false, follow: false } } : {}),
  openGraph: {
    type: "website",
    url: "https://crackgate.in",
    title: "CrackGate.in — GATE Mining, Civil, Geology & PSU Exam Prep",
    description: "10+ full-length mocks · 1000+ practice questions · SWOT analytics · ₹0 first mock. Covers GATE MN, CE, GG, ES & PSU Coal India.",
    images: ["/og-banner.png"],
  },
  twitter: { card: "summary_large_image" },
  icons: {
    // Bump ?v= whenever the icon art changes. The files live in /public with
    // stable URLs, so browsers cache them indefinitely and keep showing the old
    // tab/taskbar icon until the URL changes — the version query forces a refetch.
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon-32.png?v=2", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png?v=2", sizes: "192x192", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png?v=2",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const plan    = (session?.user as { plan?: "free" | "pro" | "premium" } | undefined)?.plan;

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body>
        <a href="#main" className="skip-link">Skip to main content</a>
        <HideOnMiningSite><SiteHeader /></HideOnMiningSite>
        <ShowOnMiningSite><MiningHeader /></ShowOnMiningSite>
        <main id="main">{children}</main>
        <SiteFooter />
        {session?.user && <DevPlanSwitcher currentPlan={plan} />}
      </body>
    </html>
  );
}
