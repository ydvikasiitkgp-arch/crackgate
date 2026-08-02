import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const send = await db.newsletterSend.findUnique({
    where: { id },
    include: { items: { orderBy: { email: "asc" } } },
  });

  if (!send) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: send.id,
    subject: send.subject,
    sentAt: send.sentAt.toISOString(),
    recipientCount: send.recipientCount,
    sentCount: send.sentCount,
    failedCount: send.failedCount,
    status: send.status,
    items: send.items.map((i) => ({
      email: i.email,
      status: i.status,
      error: i.error,
    })),
  });
}
