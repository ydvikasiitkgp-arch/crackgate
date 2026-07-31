/** Admin: revoke a single entitlement (e.g. a test-account grant).
 *  The user's other entitlements are untouched. Logged to AuditLog. */
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const entitlement = await db.entitlement.findUnique({
    where: { id },
    select: { userId: true, exam: true, subject: true, user: { select: { email: true } } },
  });
  if (!entitlement) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await db.$transaction([
    db.entitlement.delete({ where: { id } }),
    db.auditLog.create({
      data: {
        action: "entitlement_revoke",
        adminId: admin.userId,
        adminEmail: admin.email,
        targetUserId: entitlement.userId,
        targetUserEmail: entitlement.user.email,
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
