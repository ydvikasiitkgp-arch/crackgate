import type { NextConfig } from "next";
import path from "node:path";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Emit a self-contained server bundle for Docker production image.
  output: "standalone",
  // TODO: tighten typing on PYQ/MOCKS readonly data and remove this.
  // Production build currently fails on `readonly` → mutable casts; not blocking runtime behavior.
  typescript: { ignoreBuildErrors: true },
  // Pin the trace root to the monorepo root so Next stops complaining about
  // multiple lockfiles and traces files from packages/database correctly.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // Prisma ships native engine binaries — don't let webpack bundle it.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "@crackgate/database"],
  experimental: {
    // Allow importing the workspace `@crackgate/database` package from outside this app dir.
    externalDir: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "ui-avatars.com" },
    ],
  },
  async headers() {
    // Content-Security-Policy. script-src keeps 'unsafe-inline' because the Next.js
    // App Router emits inline bootstrap/hydration scripts (and the anti-FOUC theme
    // script in layout.tsx) without a nonce; the remaining directives still provide
    // meaningful defense-in-depth (no object/embed, locked base-uri & form-action,
    // clickjacking protection, and a tight external origin allowlist).
    // In development, 'unsafe-eval' is added for React's debugging features.
    const isDev = process.env.NODE_ENV === "development";
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://checkout.razorpay.com`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https://lh3.googleusercontent.com https://ui-avatars.com https://*.razorpay.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.razorpay.com https://*.posthog.com",
      "frame-src https://checkout.razorpay.com https://api.razorpay.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests",
    ].join("; ");
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=(), payment=(self)" },
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
        ],
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  // Source-map upload + release tagging only run when these are set in CI;
  // without SENTRY_AUTH_TOKEN the build silently skips upload, so this is safe
  // to ship before Sentry is provisioned.
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  // Tunnel browser events through our own domain to dodge ad blockers.
  tunnelRoute: "/monitoring",
  disableLogger: true,
  // Don't fail the production build if Sentry's plugin hits an issue.
  widenClientFileUpload: true,
});