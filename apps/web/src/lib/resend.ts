import { Resend } from "resend";

let client: Resend | null = null;

function getClient(): Resend {
  if (!client) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY not configured");
    }
    client = new Resend(apiKey);
  }
  return client;
}

export function newsletterHtml(bodyHtml: string): string {
  const trimmed = bodyHtml.trim();
  if (trimmed.startsWith("<!DOCTYPE") || trimmed.startsWith("<html")) {
    return bodyHtml;
  }
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#fff;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
          <tr>
            <td style="padding:40px 32px;font-size:16px;line-height:1.6;color:#1e293b">
              ${bodyHtml}
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" style="max-width:560px">
          <tr>
            <td align="center" style="padding:24px 16px 0;font-size:12px;color:#94a3b8">
              CrackGate — crackgate.in
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export interface NewsletterRecipient {
  email: string;
  name?: string | null;
}

/** Escapes a value so it can be safely interpolated into HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Resolves the greeting name for personalization.
 * Only resolves when `name` is a non-empty string (uses the first word);
 * otherwise falls back to "Aspirant".
 */
export function resolveFirstName(name: string | null | undefined): string {
  if (typeof name === "string" && name.trim().length > 0) {
    const first = name.trim().split(/\s+/)[0];
    return first.slice(0, 100);
  }
  return "Aspirant";
}

/**
 * Replaces template placeholders (e.g. `{{name}}`) in the HTML for a single
 * recipient. Unknown/missing values fall back to safe defaults.
 */
export function personalizeEmail(html: string, recipient: NewsletterRecipient): string {
  const name = escapeHtml(resolveFirstName(recipient.name));
  return html.replaceAll("{{name}}", name);
}

export interface RecipientSendResult {
  email: string;
  ok: boolean;
  error?: string | null;
}

export interface SendResult {
  sent: number;
  failed: number;
  items: RecipientSendResult[];
}

export async function sendNewsletter(opts: {
  subject: string;
  html: string;
  recipients: NewsletterRecipient[];
}): Promise<SendResult> {
  const from = process.env.RESEND_FROM_EMAIL ?? "support@crackgate.in";
  const resend = getClient();
  const BATCH_SIZE = 100;
  const RETRY_LIMIT = 2;
  const RETRY_DELAY_MS = 1200;
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const items: RecipientSendResult[] = [];

  const valid: NewsletterRecipient[] = [];
  for (const recipient of opts.recipients) {
    if (EMAIL_RE.test(recipient.email)) {
      valid.push(recipient);
    } else {
      items.push({ email: recipient.email, ok: false, error: "Invalid email format" });
    }
  }

  for (let i = 0; i < valid.length; i += BATCH_SIZE) {
    const chunk = valid.slice(i, i + BATCH_SIZE);
    const payload = chunk.map((recipient) => ({
      from,
      to: [recipient.email],
      subject: opts.subject,
      html: personalizeEmail(opts.html, recipient),
    }));

    for (let attempt = 0; ; attempt++) {
      const { error } = await resend.batch.send(payload);
      if (!error) {
        items.push(...chunk.map((r) => ({ email: r.email, ok: true, error: null })));
        break;
      }
      const isRateLimit = /too many requests/i.test(error.message ?? "");
      if (isRateLimit && attempt < RETRY_LIMIT) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
        continue;
      }
      items.push(...chunk.map((r) => ({ email: r.email, ok: false, error: error.message ?? null })));
      break;
    }
  }

  const sent = items.filter((r) => r.ok).length;
  const failed = items.length - sent;
  return { sent, failed, items };
}
