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

export interface SendResult {
  sent: number;
  failed: number;
}

export async function sendNewsletter(opts: {
  subject: string;
  html: string;
  recipients: string[];
}): Promise<SendResult> {
  const from = process.env.RESEND_FROM_EMAIL ?? "support@crackgate.in";
  const resend = getClient();
  const CONCURRENCY = 10;
  let sent = 0;
  let failed = 0;

  for (let i = 0; i < opts.recipients.length; i += CONCURRENCY) {
    const batch = opts.recipients.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (email) => {
        const { error } = await resend.emails.send({
          from,
          to: [email],
          subject: opts.subject,
          html: opts.html,
        });
        return !error;
      }),
    );

    sent += results.filter(Boolean).length;
    failed += results.filter((r) => !r).length;
  }

  return { sent, failed };
}
