/** Razorpay webhook — the ONLY trusted way to upgrade a user's plan.
 *  Configure in Razorpay dashboard: events = payment.captured + payment.failed,
 *  URL = https://<your-domain>/api/razorpay/webhook,
 *  secret = RAZORPAY_WEBHOOK_SECRET. */
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { whatsappQueue } from "@/lib/queue";
import { getPostHogClient } from "@/lib/posthog";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.text(); // raw body for HMAC
  const sig  = req.headers.get("x-razorpay-signature") || "";
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  // Timing-safe compare
  if (
    sig.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  ) {
    return NextResponse.json({ error: "bad signature" }, { status: 400 });
  }

  const evt = JSON.parse(body) as {
    event: string;
    payload: { payment: { entity: {
      id: string;
      order_id: string;
      status: string;
      amount: number;
      notes?: Record<string, string>;
    } } };
  };

  const p = evt.payload.payment.entity;
  const payment = await db.payment.findUnique({ where: { razorpayOrderId: p.order_id } });
  if (!payment) {
    // Unknown order — accept 200 so Razorpay doesn't retry forever; log instead.
    console.warn("[rzp-webhook] unknown order", p.order_id);
    return NextResponse.json({ ok: true });
  }

  if (evt.event === "payment.captured") {
    // Idempotency guard: Razorpay may retry the webhook if the first response
    // is lost. If we've already processed this payment, return OK silently.
    if (payment.status === "captured") {
      return NextResponse.json({ ok: true, idempotent: true });
    }

    // Guard against amount tampering: the captured amount must match the amount
    // we recorded when the order was created (both in paise).
    if (typeof p.amount === "number" && p.amount !== payment.amount) {
      console.warn("[rzp-webhook] amount mismatch", p.order_id, p.amount, payment.amount);
      return NextResponse.json({ error: "amount mismatch" }, { status: 400 });
    }

    const months = payment.periodMonths;
    const now = new Date();
    const expiry = new Date(now);
    expiry.setMonth(expiry.getMonth() + months);

    await db.$transaction([
      db.payment.update({
        where: { id: payment.id },
        data: {
          status: "captured",
          razorpayPaymentId: p.id,
          capturedAt: now,
          raw: evt as object,
        },
      }),
      db.user.update({
        where: { id: payment.userId },
        data: { plan: payment.plan, planExpiry: expiry },
      }),
      db.activity.create({
        data: {
          userId: payment.userId,
          type: "plan_upgrade",
          payload: { plan: payment.plan, months, amount: p.amount },
        },
      }),
    ]);

    getPostHogClient()?.capture({
      distinctId: payment.userId,
      event: "payment_captured",
      properties: {
        plan: payment.plan,
        amount_paise: p.amount,
        amount_rupees: Math.round(p.amount / 100),
        period_months: months,
        razorpay_payment_id: p.id,
        razorpay_order_id: p.order_id,
      },
    });
    // Ensure the payment_captured event reaches PostHog even if the process
    // is killed shortly after (e.g. deploy restart).
    getPostHogClient()?.flush();

    // Queue WhatsApp receipt — never block the webhook response.
    try {
      const u = await db.user.findUnique({
        where: { id: payment.userId },
        select: { phone: true, name: true },
      });
      if (u?.phone && whatsappQueue) {
        await whatsappQueue.add("payment_receipt", {
          type: "payment_receipt",
          phone: u.phone,
          payload: {
            name: u.name ?? "",
            plan: payment.plan,
            amountRupees: Math.round(p.amount / 100),
            months,
          },
        });
      }
    } catch (e) {
      console.warn("[rzp-webhook] Queue add failed:", (e as Error).message);
    }
  } else if (evt.event === "payment.failed") {
    await db.payment.update({
      where: { id: payment.id },
      data: { status: "failed", raw: evt as object },
    });
    try {
      getPostHogClient()?.capture({
        distinctId: payment.userId,
        event: "payment_failed",
        properties: {
          plan: payment.plan,
          amount_paise: p.amount,
          razorpay_order_id: p.order_id,
        },
      });
      getPostHogClient()?.flush();
    } catch (e) {
      console.warn("[rzp-webhook] PostHog capture failed:", (e as Error).message);
    }
  }

  return NextResponse.json({ ok: true });
}
