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

const BATCH_SIZE = 100;
const MAX_ATTEMPTS = 5;
const BASE_DELAY_MS = 400;
const MAX_DELAY_MS = 10_000;
const BATCH_SPACING_MS = 120;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface BatchError {
  message: string;
  statusCode: number | null;
  name: string;
}

/** True for 429 (rate limit) and transient 5xx responses that are safe to retry. */
export function isRetryableError(error: BatchError): boolean {
  if (error.statusCode === 429 || error.name === "rate_limit_exceeded") return true;
  return error.statusCode !== null && error.statusCode >= 500;
}

/** Honors `retry-after` header or a "retry after N seconds" message when present. */
export function retryAfterMs(
  headers: Record<string, string> | null,
  error: BatchError,
): number | null {
  const fromHeader = headers?.["retry-after"];
  const headerMs = fromHeader ? Number(fromHeader) * 1000 : NaN;
  if (Number.isFinite(headerMs) && headerMs > 0) return headerMs;
  const match = /retry (?:after )?(\d+)/i.exec(error.message);
  const messageMs = match ? Number(match[1]) * 1000 : NaN;
  return Number.isFinite(messageMs) && messageMs > 0 ? messageMs : null;
}

async function sendBatchWithRetry(
  resend: Resend,
  messages: { from: string; to: string[]; subject: string; html: string }[],
): Promise<{ data: { id: string }[]; errors: { index: number; message: string }[] }> {
  let lastError: Error = new Error("unknown send failure");
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const res = await resend.batch.send(messages, { batchValidation: "permissive" });
    if (!res.error) return res.data;
    lastError = new Error(res.error.message);
    if (!isRetryableError(res.error)) break;
    const backoffMs = Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS);
    const waitMs = retryAfterMs(res.headers, res.error) ?? backoffMs + Math.random() * 200;
    await sleep(waitMs);
  }
  throw new Error(
    `Resend batch send failed after ${MAX_ATTEMPTS} attempts (rate limit / transient error): ${lastError.message}`,
  );
}

export async function sendNewsletter(opts: {
  subject: string;
  html: string;
  recipients: NewsletterRecipient[];
}): Promise<SendResult> {
  const from = process.env.RESEND_FROM_EMAIL ?? "support@crackgate.in";
  const resend = getClient();
  const items: RecipientSendResult[] = [];

  for (let i = 0; i < opts.recipients.length; i += BATCH_SIZE) {
    const chunk = opts.recipients.slice(i, i + BATCH_SIZE);
    const messages = chunk.map((recipient) => ({
      from,
      to: [recipient.email],
      subject: opts.subject,
      html: personalizeEmail(opts.html, recipient),
    }));

    const result = await sendBatchWithRetry(resend, messages);
    const failures = new Map(result.errors.map((e) => [e.index, e.message]));
    chunk.forEach((recipient, idx) => {
      const error = failures.get(idx);
      items.push(error ? { email: recipient.email, ok: false, error } : { email: recipient.email, ok: true });
    });

    if (i + BATCH_SIZE < opts.recipients.length) await sleep(BATCH_SPACING_MS);
  }

  const sent = items.filter((r) => r.ok).length;
  const failed = items.length - sent;
  return { sent, failed, items };
}
