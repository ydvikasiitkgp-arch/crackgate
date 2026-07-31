import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/admin";
import {
  generateImpersonationToken,
  IMPERSONATE_COOKIE,
  IMPERSONATE_MAX_AGE,
} from "@/lib/impersonate";

// Start a view-only "login as user" session. Target must be a paid or test
// user (has at least one entitlement). Sets a 30-min httpOnly cookie; every
// page then renders as the target user while the middleware enforces read-only.
export async function POST(req: NextRequest) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Only paid or test users (active entitlement) are impersonable.
  const entitled = await db.entitlement.findFirst({
    where: {
      userId,
      OR: [{ expiry: null }, { expiry: { gt: new Date() } }],
    },
  });
  if (!entitled) {
    return NextResponse.json(
      { error: "This user has no active access yet — nothing to view." },
      { status: 400 },
    );
  }

  const token = await generateImpersonationToken(user.id, admin.userId, admin.email);
  await db.auditLog.create({
    data: {
      action: "impersonate_start",
      adminId: admin.userId,
      adminEmail: admin.email,
      targetUserId: user.id,
      targetUserEmail: user.email,
    },
  });

  const res = NextResponse.json({ ok: true, email: user.email });
  res.cookies.set(IMPERSONATE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: IMPERSONATE_MAX_AGE,
  });
  return res;
}
