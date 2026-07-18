import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { getLimiter, rateLimitResponse } from "@/lib/rate-limit";
import { getPostHogClient } from "@/lib/posthog";

const orderLimiter = getLimiter({ windowMs: 60_000, max: 5, label: "razorpay:order" });

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const result = await Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`Razorpay request timed out after ${ms}ms`)), ms);
    }),
  ]);
  clearTimeout(timer);
  return result;
}

const PLANS = {
  pro:     { amount: 49900,  months: 18 },  // ₹499 — GATE 2027 cycle (~18 months)
  premium: { amount: 89900,  months: 18 },  // ₹899 — GATE 2027 cycle
} as const;

const Body = z.object({ plan: z.enum(["pro", "premium"]) });

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const { allowed, resetAt } = orderLimiter.check(session.user.id);
    if (!allowed) return rateLimitResponse(Math.ceil((resetAt - Date.now()) / 1000));
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

    const { plan } = parsed.data;
    const cfg = PLANS[plan];

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: "razorpay_not_configured", message: "Payment provider isn't configured on the server." },
        { status: 503 },
      );
    }

    const rzp = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await withTimeout(
      rzp.orders.create({
        amount: cfg.amount,
        currency: "INR",
        receipt: `cg-${session.user.id.slice(0, 8)}-${Date.now()}`,
        notes: { userId: session.user.id, plan, months: String(cfg.months) },
      }),
      10_000,
    );

    await db.payment.create({
      data: {
        userId: session.user.id,
        razorpayOrderId: order.id,
        amount: cfg.amount,
        currency: "INR",
        plan,
        periodMonths: cfg.months,
        status: "created",
      },
    });

    getPostHogClient()?.capture({
      distinctId: session.user.id,
      event: "payment_order_created",
      properties: {
        plan,
        amount_paise: cfg.amount,
        amount_rupees: Math.round(cfg.amount / 100),
        period_months: cfg.months,
        razorpay_order_id: order.id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      amount: cfg.amount,
      currency: "INR",
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (e) {
    const err = e as { statusCode?: number; error?: { description?: string }; message?: string };
    console.error("[razorpay/order]", err);
    if (e instanceof Error) {
      getPostHogClient()?.captureException(e);
    }
    return NextResponse.json(
      {
        error: "razorpay_error",
        message: err?.error?.description ?? err?.message ?? "Failed to create payment order.",
      },
      { status: err?.statusCode && err.statusCode >= 400 && err.statusCode < 600 ? err.statusCode : 500 },
    );
  }
}
