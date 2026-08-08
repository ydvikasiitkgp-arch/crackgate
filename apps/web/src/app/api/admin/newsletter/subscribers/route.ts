import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  emails: z.array(z.string().email()).min(1),
});

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

  const { count } = await db.newsletterSubscriber.updateMany({
    where: { email: { in: parsed.data.emails } },
    data: { unsubscribed: true },
  });

  return NextResponse.json({ deleted: count });
}
