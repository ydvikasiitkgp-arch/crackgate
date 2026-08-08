import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  emails: z.array(z.string().email()).min(1),
});

function adminEmails(): Set<string> {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set(adminEmails);
}

export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid emails" }, { status: 400 });
  }

  const protectedEmails = adminEmails().add(admin.email.toLowerCase());
  const deletable = parsed.data.emails.filter((e) => !protectedEmails.has(e.toLowerCase()));

  if (deletable.length === 0) {
    return NextResponse.json({ error: "Cannot delete admin accounts" }, { status: 400 });
  }

  const { count } = await db.user.deleteMany({
    where: { email: { in: deletable } },
  });

  return NextResponse.json({ deleted: count });
}
