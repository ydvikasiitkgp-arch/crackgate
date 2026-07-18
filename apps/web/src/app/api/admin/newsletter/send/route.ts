import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { sendNewsletter, newsletterHtml } from "@/lib/resend";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  recipients: z.array(z.string().email()).optional(),
});

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

  const { subject, html, recipients: explicitRecipients } = parsed.data;

  let recipients: string[];

  if (explicitRecipients && explicitRecipients.length > 0) {
    recipients = explicitRecipients;
  } else {
    const subscribers = await db.newsletterSubscriber.findMany({
      where: { unsubscribed: false },
      select: { email: true },
    });
    if (subscribers.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, recipients: 0 });
    }
    recipients = subscribers.map((s) => s.email);
  }
  try {
    const wrapped = newsletterHtml(html);
    const result = await sendNewsletter({ subject, html: wrapped, recipients });
    return NextResponse.json({ ...result, recipients: recipients.length });
  } catch (err) {
    console.error("[newsletter/send]", err);
    const message = err instanceof Error ? err.message : "Send failed";
    return NextResponse.json({ error: message, sent: 0, failed: recipients.length }, { status: 500 });
  }
}
