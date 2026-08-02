import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { sendNewsletter, newsletterHtml, type NewsletterRecipient } from "@/lib/resend";
import { fillMissingNames } from "@/lib/newsletter-recipients";
import { persistNewsletterSend } from "@/lib/newsletter-sends";

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

  const { subject, html, recipients: explicitRecipients } = parsed.data;

  let recipients: NewsletterRecipient[];

  if (explicitRecipients && explicitRecipients.length > 0) {
    recipients = normalizeRecipients(explicitRecipients);
  } else {
    const subscribers = await db.newsletterSubscriber.findMany({
      where: { unsubscribed: false },
      select: { email: true },
    });
    if (subscribers.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, recipients: 0 });
    }
    recipients = subscribers.map((s) => ({ email: s.email }));
  }

  recipients = await fillMissingNames(recipients);
  try {
    const wrapped = newsletterHtml(html);
    const result = await sendNewsletter({ subject, html: wrapped, recipients });
    const send = await persistNewsletterSend(subject, result.items);
    return NextResponse.json({
      ...result,
      recipients: recipients.length,
      sendId: send.id,
    });
  } catch (err) {
    console.error("[newsletter/send]", err);
    return NextResponse.json({ error: "send_failed", sent: 0, failed: recipients.length }, { status: 500 });
  }
}
