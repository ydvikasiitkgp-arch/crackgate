import { NextRequest } from "next/server";

const CSRF_EXEMPT_PATHS = [
  "/api/razorpay/webhook",
  "/api/whatsapp/webhook",
  "/api/cron/weekly-digest",
  "/api/cron/cleanup-otp",
  "/api/track",
];

export function isMutation(req: NextRequest): boolean {
  return !["GET", "HEAD", "OPTIONS"].includes(req.method);
}

export function isCsrfExempt(path: string): boolean {
  return CSRF_EXEMPT_PATHS.some(
    (e) => path === e || path.startsWith(e + "/"),
  );
}

function getAllowedOrigins(): string[] {
  const raw = process.env.APP_ORIGIN;
  if (raw) return raw.split(",").map((s) => s.trim()).filter(Boolean);
  return process.env.NODE_ENV === "production"
    ? ["https://crackgate.in", "https://www.crackgate.in"]
    : ["http://localhost:3000"];
}

export function verifyOrigin(req: NextRequest): boolean {
  const allowed = getAllowedOrigins();
  const origin = req.headers.get("origin") ?? "";
  const referer = req.headers.get("referer") ?? "";

  if (origin) {
    return allowed.some((a) => origin === a);
  }

  if (referer) {
    return allowed.some(
      (a) => referer === a || referer === a + "/" || referer.startsWith(a + "/"),
    );
  }

  return false;
}
