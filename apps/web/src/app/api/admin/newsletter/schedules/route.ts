import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schedules = await db.newsletterSchedule.findMany({
    where: { status: "scheduled" },
    orderBy: { scheduledAt: "asc" },
  });

  return NextResponse.json({
    schedules: schedules.map((s) => ({
      id: s.id,
      subject: s.subject,
      scheduledAt: s.scheduledAt.toISOString(),
      recipients: s.recipients,
      recipientCount: (s.recipients as unknown[]).length,
      html: s.html,
    })),
  });
}
