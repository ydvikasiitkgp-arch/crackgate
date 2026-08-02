import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sends = await db.newsletterSend.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    sends: sends.map((s) => ({
      id: s.id,
      subject: s.subject,
      sentAt: s.sentAt.toISOString(),
      recipientCount: s.recipientCount,
      sentCount: s.sentCount,
      failedCount: s.failedCount,
      status: s.status,
    })),
  });
}

const deleteSchema = z.object({
  ids: z.array(z.string().min(1)).min(1),
});

export async function DELETE(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = deleteSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid ids" }, { status: 400 });
  }

  const { count } = await db.newsletterSend.deleteMany({
    where: { id: { in: parsed.data.ids } },
  });

  return NextResponse.json({ deleted: count });
}
