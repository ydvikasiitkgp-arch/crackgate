/** Admin: approve a pending UPI claim and flip the user's plan. */
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { sendPaymentReceipt } from "@/lib/whatsapp";
import { DEFAULT_EXAM, DEFAULT_SUBJECT, type ExamTrack } from "@/data/catalog";
import { getPostHogClient } from "@/lib/posthog";
import { getCombo, isComboSlug, comboLabel } from "@/lib/combos";

export const runtime = "nodejs";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const claim = await db.upiPayment.findUnique({ where: { id } });
  if (!claim) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (claim.status !== "pending") {
    return NextResponse.json(
      { error: "already_reviewed", status: claim.status },
      { status: 409 },
    );
  }

  // Tier 0 policy: planExpiry = now + periodMonths (no compounding).
  const now = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + claim.periodMonths);

  // Multi-item cart checkout: items JSON array is present
  const cartItems = claim.items as unknown as { exam: string; subject: string; plan: string; pricePaise: number }[] | null;
  const isCartCheckout = Array.isArray(cartItems) && cartItems.length > 0;

  // Build entitlement operations — cart checkout creates N entitlements
  let entitlementOps: any[];
  let exams: string[] = [];
  let subjects: string[] = [];

  if (isCartCheckout) {
    // Multi-item checkout — one entitlement per cart item
    entitlementOps = cartItems!.map((item) => {
      exams.push(item.exam);
      subjects.push(item.subject);
      return db.entitlement.upsert({
        where: {
          userId_exam_subject: { userId: claim.userId, exam: item.exam, subject: item.subject },
        },
        create: {
          userId: claim.userId,
          exam: item.exam,
          subject: item.subject,
          tier: item.plan as any,
          source: "upi",
          expiry,
        },
        update: { tier: item.plan as any, source: "upi", expiry },
      });
    });
  } else {
    // Single-item or combo — existing logic
    const exam = claim.exam ?? DEFAULT_EXAM;
    const subject = claim.subject ?? DEFAULT_SUBJECT;
    exams = [exam];
    subjects = [subject];

    const isCombo = isComboSlug(subject);
    const combo = getCombo(subject);

    entitlementOps = combo
      ? combo.entitlements.map((ent) =>
          db.entitlement.upsert({
            where: {
              userId_exam_subject: { userId: claim.userId, exam: ent.exam, subject: ent.subject },
            },
            create: {
              userId: claim.userId,
              exam: ent.exam,
              subject: ent.subject,
              tier: claim.plan,
              source: "upi",
              expiry,
            },
            update: { tier: claim.plan, source: "upi", expiry },
          })
        )
      : [
          db.entitlement.upsert({
            where: {
              userId_exam_subject: { userId: claim.userId, exam, subject },
            },
            create: {
              userId: claim.userId,
              exam,
              subject,
              tier: claim.plan,
              source: "upi",
              expiry,
            },
            update: { tier: claim.plan, source: "upi", expiry },
          }),
        ];
  }

  // Only the live GATE Mining track drives the global User.plan.
  const syncsGlobalPlan = !isCartCheckout && exams[0] === DEFAULT_EXAM && subjects[0] === DEFAULT_SUBJECT && !isComboSlug(subjects[0]);

  await db.$transaction([
    db.upiPayment.update({
      where: { id: claim.id },
      data: {
        status: "approved",
        reviewedById: admin.userId || undefined,
        reviewedAt: now,
      },
    }),
    ...(syncsGlobalPlan
      ? [
          db.user.update({
            where: { id: claim.userId },
            data: { plan: claim.plan, planExpiry: expiry },
          }),
        ]
      : []),
    // Backfill the payer's mobile so it shows in the admin console.
    ...(claim.payerPhone
      ? [
          db.user.updateMany({
            where: { id: claim.userId, phone: null },
            data: { phone: claim.payerPhone },
          }),
        ]
      : []),
    ...entitlementOps,
    db.payment.create({
      data: {
        userId: claim.userId,
        razorpayOrderId: `upi-${claim.id}`,
        razorpayPaymentId: `upi-pay-${claim.id}`,
        amount: claim.amountPaise,
        currency: "INR",
        plan: claim.plan,
        exam: exams[0],
        subject: subjects.join(","),
        periodMonths: claim.periodMonths,
        status: "captured",
        capturedAt: now,
        raw: {
          source: "upi_manual",
          payerName: claim.payerName,
          payerPhone: claim.payerPhone,
          payerEmail: claim.payerEmail,
          upiApp: claim.upiApp,
          exams,
          subjects,
          is_cart_checkout: isCartCheckout,
          is_combo: !isCartCheckout && isComboSlug(subjects[0]),
          approvedBy: admin.email,
        },
      },
    }),
    db.activity.create({
      data: {
        userId: claim.userId,
        type: "plan_upgrade",
        payload: {
          source: "upi_manual",
          plan: claim.plan,
          months: claim.periodMonths,
          amountPaise: claim.amountPaise,
          payerPhone: claim.payerPhone,
          exams,
          subjects,
          is_cart_checkout: isCartCheckout,
          approvedBy: admin.email,
        },
      },
    }),
  ]);

  getPostHogClient()?.capture({
    distinctId: claim.userId,
    event: "upi_payment_approved",
    properties: {
      plan: claim.plan,
      exams,
      subjects,
      is_cart_checkout: isCartCheckout,
      item_count: isCartCheckout ? cartItems!.length : 1,
      amount_paise: claim.amountPaise,
      amount_rupees: Math.round(claim.amountPaise / 100),
      period_months: claim.periodMonths,
      upi_app: claim.upiApp ?? null,
      syncs_global_plan: syncsGlobalPlan,
    },
  });
  getPostHogClient()?.flush();

  // Fire-and-forget WhatsApp receipt.
  try {
    const u = await db.user.findUnique({
      where: { id: claim.userId },
      select: { phone: true, name: true },
    });
    const receiptPhone = u?.phone ?? claim.payerPhone;
    if (receiptPhone) {
      await sendPaymentReceipt(receiptPhone, {
        name: u?.name ?? claim.payerName ?? "there",
        plan: claim.plan,
        amountRupees: Math.round(claim.amountPaise / 100),
        months: claim.periodMonths,
      });
    }
  } catch (e) {
    console.warn("[upi/approve] receipt failed:", (e as Error).message);
  }

  return NextResponse.json({ ok: true });
}
