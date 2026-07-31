import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  IMPERSONATE_COOKIE,
  verifyImpersonationToken,
} from "@/lib/impersonate";

// End an active impersonation session. Reads the impersonation cookie itself
// (not the admin session) so it works from inside the impersonated view.
// This route is exempted from the middleware mutation block on purpose.
export async function POST(req: NextRequest) {
  const token = req.cookies.get(IMPERSONATE_COOKIE)?.value;
  if (token) {
    const payload = await verifyImpersonationToken(token);
    if (payload?.sub) {
      await db.auditLog.create({
        data: {
          action: "impersonate_end",
          adminId: payload.impersonatorId,
          adminEmail: payload.impersonatorEmail,
          targetUserId: payload.sub,
          targetUserEmail: payload.targetEmail,
        },
      });
    }
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(IMPERSONATE_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
