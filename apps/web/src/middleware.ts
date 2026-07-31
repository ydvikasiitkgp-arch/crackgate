import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";
import { isMutation, isCsrfExempt, verifyOrigin } from "@/lib/csrf";
import { IMPERSONATE_COOKIE, verifyImpersonationToken } from "@/lib/impersonate";

const { auth } = NextAuth(authConfig);

const PROTECTED = ["/dashboard", "/settings", "/admin"];

// Route that must stay callable while impersonating so the admin can exit the
// session. Everything else under /api/ is read-only during impersonation.
const IMPERSONATE_END_PATH = "/api/admin/impersonate/end";

export default auth(async (req) => {
  const path = req.nextUrl.pathname;
  // Only a valid, unexpired impersonation token counts. A stale/forged cookie
  // is ignored (not treated as impersonating) so an admin whose session timed
  // out isn't locked out of /admin and their own API mutations.
  const impCookie = req.cookies.get(IMPERSONATE_COOKIE)?.value;
  const impersonating =
    !!impCookie && (await verifyImpersonationToken(impCookie)) !== null;

  // ── Impersonation enforcement ─────────────────────────
  if (impersonating) {
    // Block every mutation except ending the impersonation session itself.
    if (path.startsWith("/api/") && isMutation(req) && path !== IMPERSONATE_END_PATH) {
      return NextResponse.json(
        { error: "Action disabled: You are in View-Only Admin Mode" },
        { status: 403 },
      );
    }
    // Keep the admin out of /admin while wearing a user's identity.
    if (path.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
    }
  }

  // ── CSRF protection for API mutation endpoints ────────
  if (path.startsWith("/api/") && isMutation(req) && !isCsrfExempt(path)) {
    if (!verifyOrigin(req)) {
      return NextResponse.json(
        { error: "CSRF validation failed" },
        { status: 403 },
      );
    }
  }

  // ── Page route auth ───────────────────────────────────
  const needsAuth = PROTECTED.some((p) => path === p || path.startsWith(p + "/"));
  if (needsAuth && !req.auth) {
    const url = new URL("/login", req.nextUrl.origin);
    url.searchParams.set("next", path);
    return NextResponse.redirect(url);
  }
  if (path.startsWith("/admin") && req.auth?.user?.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }
});

export const config = {
  matcher: ["/dashboard/:path*", "/settings/:path*", "/admin/:path*", "/api/:path*"],
};
