import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { newsletterQueue, type NewsletterJobData } from "@/lib/queue";
import type { NewsletterRecipient } from "@/lib/resend";

export const dynamic = "force-dynamic";

const recipientSchema = z.union([
  z.string().email(),
  z.object({
    email: z.string().email(),
    name: z.string().trim().max(500).nullable().optional(),
  }),
]);

const bodySchema = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  scheduledAt: z.string().datetime(),
  recipients: z.array(recipientSchema).optional(),
});

function normalizeRecipients(list: Array<{ email: string; name?: string | null } | string>): NewsletterRecipient[] {
  return list.map((r) => (typeof r === "string" ? { email: r } : { email: r.email, name: r.name ?? null }));
}

export async function POST(request: Request) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { subject, html, scheduledAt, recipients: explicitRecipients } = parsed.data;
  const scheduledDate = new Date(scheduledAt);
  const now = Date.now();
  const delay = Math.max(0, scheduledDate.getTime() - now);

  let recipientCount: number;

  if (explicitRecipients && explicitRecipients.length > 0) {
    recipientCount = explicitRecipients.length;
  } else {
    recipientCount = await db.newsletterSubscriber.count({
      where: { unsubscribed: false },
    });
  }

  if (recipientCount === 0) {
    return NextResponse.json({ recipients: 0, scheduled: false });
  }

  const jobData: NewsletterJobData = { subject, html };
  if (explicitRecipients && explicitRecipients.length > 0) {
    jobData.recipients = normalizeRecipients(explicitRecipients);
  }

  if (!newsletterQueue) {
    return NextResponse.json({ error: "redis_not_configured" }, { status: 500 });
  }

  try {
    const scheduledJob = await newsletterQueue.add("send", jobData, { delay });
    const record = await db.newsletterSchedule.create({
      data: {
        subject,
        html,
        recipients: (jobData.recipients ?? []) as unknown as object[],
        scheduledAt: scheduledDate,
        jobId: scheduledJob.id,
      },
    });
    return NextResponse.json({
      recipients: recipientCount,
      scheduled: true,
      scheduledFor: scheduledDate.toISOString(),
      scheduleId: record.id,
    });
  } catch (err) {
    console.error("[newsletter/schedule]", err);
    return NextResponse.json({ error: "schedule_failed", sent: 0, failed: recipientCount }, { status: 500 });
  }
}
