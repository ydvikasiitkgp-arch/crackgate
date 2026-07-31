/** Queue infrastructure using BullMQ + Redis.
 *
 *  Setup:
 *   1. Add a `redis` service to docker-compose (see docker-compose.yml).
 *   2. Set REDIS_URL env var (default: redis://redis:6379).
 *   3. Start workers alongside the web process (currently co-located via
 *      `Worker` instantiation in this module; extract to a separate process
 *      when throughput demands it).
 *
 *  Current queues:
 *   - whatsapp   : outbound WhatsApp messages (OTP, receipts, digests)
 *   - digest     : per-user weekly digest computation + send
 *   - newsletter : scheduled newsletter broadcasts via Resend
 */
import { Queue, Worker, type Job } from "bullmq";
import IORedis from "ioredis";
import type { NewsletterRecipient } from "@/lib/resend";
import { fillMissingNames } from "@/lib/newsletter-recipients";

// bullmq's internal ioredis version may differ from the workspace install,
// so we use `as any` for the connection object to avoid type incompatibility.
const connection = new IORedis(process.env.REDIS_URL ?? "redis://redis:6379", {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
}) as any;

// ── WhatsApp queue ──────────────────────────────────────────────────────────

export interface WhatsappJobData {
  type: "payment_receipt" | "weekly_digest" | "otp";
  phone: string;
  payload: Record<string, unknown>;
}

export const whatsappQueue = new Queue<WhatsappJobData>("whatsapp", { connection });

// ── Digest queue (one job per user, spawned by the cron endpoint) ───────────

export interface DigestJobData {
  userId: string;
  phone: string;
  name: string;
  plan: string;
}

export const digestQueue = new Queue<DigestJobData>("digest", { connection });

// ── Newsletter queue ────────────────────────────────────────────────────────
// Recipients are fetched fresh at execution time unless pre-selected by admin.

export interface NewsletterJobData {
  subject: string;
  html: string;
  recipients?: NewsletterRecipient[];
}

export const newsletterQueue = new Queue<NewsletterJobData>("newsletter", { connection });

// ── Worker setup ────────────────────────────────────────────────────────────

let workersStarted = false;

export function startWorkers() {
  if (workersStarted) return;
  workersStarted = true;

  new Worker<WhatsappJobData>(
    "whatsapp",
    async (job: Job<WhatsappJobData>) => {
      const { sendPaymentReceipt, sendWeeklyDigest, sendOtp } = await import("@/lib/whatsapp");
      const { type, phone, payload } = job.data;
      switch (type) {
        case "payment_receipt":
          await sendPaymentReceipt(phone, payload as Parameters<typeof sendPaymentReceipt>[1]);
          break;
        case "weekly_digest":
          await sendWeeklyDigest(phone, payload as Parameters<typeof sendWeeklyDigest>[1]);
          break;
        case "otp":
          await sendOtp(phone, payload.code as string);
          break;
      }
    },
    { connection, concurrency: 5 },
  );

  new Worker<DigestJobData>(
    "digest",
    async (job: Job<DigestJobData>) => {
      const { db } = await import("@/lib/db");
      const { sendWeeklyDigest } = await import("@/lib/whatsapp");
      const { userId, phone, name } = job.data;

      const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
      const weekAgo = new Date(Date.now() - WEEK_MS);

      const [attempts, practiceRows] = await Promise.all([
        db.attempt.findMany({
          where: { userId, takenAt: { gt: weekAgo } },
          select: { score: true, total: true, breakdown: true },
        }),
        db.activity.findMany({
          where: { userId, type: "practice_attempt", ts: { gt: weekAgo } },
          select: { payload: true },
        }),
      ]);

      const totalAttempts = attempts.length + practiceRows.length;

      const attemptPct = attempts.length
        ? attempts.reduce((s, a) => s + (a.total ? (a.score / a.total) * 100 : 0), 0) / attempts.length
        : null;
      const practiceCorrect = practiceRows.filter((r) => {
        const p = r.payload as { correct?: boolean } | null;
        return p?.correct === true;
      }).length;
      const practicePct = practiceRows.length ? (practiceCorrect / practiceRows.length) * 100 : null;
      const accuracyParts = [attemptPct, practicePct].filter((x): x is number => x !== null);
      const avgAccuracy = accuracyParts.length
        ? Math.round(accuracyParts.reduce((s, x) => s + x, 0) / accuracyParts.length)
        : 0;

      const subjScore = new Map<string, { scored: number; total: number }>();
      for (const a of attempts) {
        const b = (a.breakdown as Record<string, { scored: number; total: number }>) ?? {};
        for (const [k, v] of Object.entries(b)) {
          const cur = subjScore.get(k) ?? { scored: 0, total: 0 };
          cur.scored += v.scored; cur.total += v.total;
          subjScore.set(k, cur);
        }
      }
      for (const r of practiceRows) {
        const p = r.payload as { subjectName?: string; correct?: boolean } | null;
        if (!p?.subjectName) continue;
        const cur = subjScore.get(p.subjectName) ?? { scored: 0, total: 0 };
        cur.total += 1;
        if (p.correct) cur.scored += 1;
        subjScore.set(p.subjectName, cur);
      }
      let weakest = "—";
      let weakestPct = 101;
      for (const [name, v] of subjScore) {
        if (v.total < 3) continue;
        const pct = (v.scored / v.total) * 100;
        if (pct < weakestPct) { weakestPct = pct; weakest = name; }
      }
      const suggestion = weakest === "—"
        ? "Keep up the momentum — try a new subject this week!"
        : `Focus on ${weakest} (${Math.round(weakestPct)}% this week). Run an Adaptive session.`;

      await sendWeeklyDigest(phone, {
        name: name?.split(" ")[0] ?? "Aspirant",
        attemptsThisWeek: totalAttempts,
        avgAccuracyPct: avgAccuracy,
        weakestSubject: weakest,
        suggestion,
      });

      await db.activity.create({
        data: { userId, type: "weekly_digest_sent", payload: { totalAttempts, avgAccuracy } },
      });
    },
    { connection, concurrency: 10 },
  );

  new Worker<NewsletterJobData>(
    "newsletter",
    async (job: Job<NewsletterJobData>) => {
      const { db } = await import("@/lib/db");
      const { sendNewsletter, newsletterHtml } = await import("@/lib/resend");
      const { subject, html, recipients: explicitRecipients } = job.data;

      let recipients: NewsletterRecipient[];

      if (explicitRecipients && explicitRecipients.length > 0) {
        recipients = explicitRecipients;
      } else {
        const subscribers = await db.newsletterSubscriber.findMany({
          where: { unsubscribed: false },
          select: { email: true },
        });
        if (subscribers.length === 0) return;
        recipients = subscribers.map((s) => ({ email: s.email }));
      }

      recipients = await fillMissingNames(recipients);

      const wrapped = newsletterHtml(html);
      await sendNewsletter({ subject, html: wrapped, recipients });
    },
    { connection, concurrency: 1 },
  );
}
