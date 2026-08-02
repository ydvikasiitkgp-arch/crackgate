import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { newsletterQueue, type NewsletterJobData } from "@/lib/queue";
import type { NewsletterRecipient } from "@/lib/resend";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  scheduledAt: z.string().datetime(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid scheduledAt" }, { status: 422 });
  }

  const scheduledDate = new Date(parsed.data.scheduledAt);
  if (scheduledDate.getTime() <= Date.now()) {
    return NextResponse.json({ error: "scheduled_at_must_be_future" }, { status: 422 });
  }

  const schedule = await db.newsletterSchedule.findUnique({ where: { id } });
  if (!schedule) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (schedule.status !== "scheduled") {
    return NextResponse.json({ error: "already_processed" }, { status: 409 });
  }

  if (!newsletterQueue) {
    return NextResponse.json({ error: "redis_not_configured" }, { status: 500 });
  }

  try {
    if (schedule.jobId) {
      const job = await newsletterQueue.getJob(schedule.jobId);
      if (job) {
        const state = await job.getState();
        if (state !== "delayed") {
          return NextResponse.json({ error: "job_already_running" }, { status: 409 });
        }
        await job.remove();
      }
    }

    const jobData: NewsletterJobData = {
      subject: schedule.subject,
      html: schedule.html,
      recipients: schedule.recipients as unknown as NewsletterRecipient[],
    };
    const delay = Math.max(0, scheduledDate.getTime() - Date.now());
    const newJob = await newsletterQueue.add("send", jobData, { delay });

    await db.newsletterSchedule.update({
      where: { id },
      data: { scheduledAt: scheduledDate, jobId: newJob.id },
    });

    return NextResponse.json({
      scheduled: true,
      scheduledFor: scheduledDate.toISOString(),
    });
  } catch (err) {
    console.error("[newsletter/schedules/reschedule]", err);
    return NextResponse.json({ error: "reschedule_failed" }, { status: 500 });
  }
}
