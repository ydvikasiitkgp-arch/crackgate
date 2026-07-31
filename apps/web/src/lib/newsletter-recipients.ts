import type { NewsletterRecipient } from "@/lib/resend";
import { db } from "@/lib/db";

/**
 * Fills in missing names from the User table (matched by email).
 * Recipients that already carry a usable name are left untouched.
 */
export async function fillMissingNames(recipients: NewsletterRecipient[]): Promise<NewsletterRecipient[]> {
  const missing = recipients.filter((r) => !r.name || !String(r.name).trim());
  if (missing.length === 0) return recipients;

  const rows = await db.user.findMany({
    where: { email: { in: missing.map((r) => r.email) } },
    select: { email: true, name: true },
  });

  const nameByEmail = new Map<string, string>();
  for (const row of rows) {
    const name = row.name?.trim();
    if (name) nameByEmail.set(row.email, name);
  }

  return recipients.map((r) => {
    if (r.name && String(r.name).trim()) return r;
    return { email: r.email, name: nameByEmail.get(r.email) ?? null };
  });
}
