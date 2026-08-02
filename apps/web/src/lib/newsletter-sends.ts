import { db } from "@/lib/db";
import type { RecipientSendResult } from "@/lib/resend";

/** Records one newsletter campaign with per-recipient results. */
export async function persistNewsletterSend(subject: string, items: RecipientSendResult[]) {
  const sent = items.filter((r) => r.ok).length;
  const failed = items.length - sent;
  const status = failed === 0 ? "completed" : sent === 0 ? "failed" : "partial";

  return db.newsletterSend.create({
    data: {
      subject,
      recipientCount: items.length,
      sentCount: sent,
      failedCount: failed,
      status,
      items: {
        create: items.map((r) => ({
          email: r.email,
          status: r.ok ? "delivered" : "failed",
          error: r.error ?? undefined,
        })),
      },
    },
  });
}
