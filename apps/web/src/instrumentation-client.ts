// Sentry browser init. Uses NEXT_PUBLIC_SENTRY_DSN (inlined at build time).
// No-op until that var is set, so it's safe to ship now.
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.01, // 1% of sessions — enough to spot UX patterns
  replaysOnErrorSampleRate: 1,    // 100% of error sessions — always capture crashes
  environment: process.env.NODE_ENV,
  enabled: !!process.env.NEXT_PUBLIC_SENTRY_DSN,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
