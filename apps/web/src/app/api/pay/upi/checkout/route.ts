import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidPhone, normalizePhone } from "@/lib/whatsapp";
import { subjectPrice, getSubject } from "@/data/catalog";
import { getPostHogClient } from "@/lib/posthog";
import { calculateComboDiscounts } from "@/lib/combos";

export const runtime = "nodejs";

const ItemSchema = z.object({
  exam: z.string().min(1),
  subject: z.string().min(1),
  plan: z.enum(["pro", "premium"]),
  pricePaise: z.number().int().positive(),
});

const Body = z.object({
  items: z.array(ItemSchema).min(1, "Add at least one item to your cart").max(10),
  payerName: z.string().trim().min(2, "Please enter your full name").max(80),
  payerPhone: z.string().trim().min(10, "Enter a valid phone number").max(20),
  payerEmail: z.string().trim().email("Enter a valid email").max(120),
  upiApp: z.enum(["PhonePe", "GPay", "Paytm", "BHIM", "Other"]).optional(),
  payerNote: z.string().trim().max(280).optional(),
  promoCode: z.string().trim().max(30).optional(),
  promoDiscountPaise: z.number().int().nonnegative().optional(),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = Body.parse(await req.json());

  const phone = normalizePhone(body.payerPhone);
  if (!isValidPhone(phone)) {
    return NextResponse.json(
      { error: "invalid_phone", message: "Please enter a valid phone number." },
      { status: 400 },
    );
  }

  // Validate each item against catalog and compute total
  let rawTotalPaise = 0;
  const validatedItems: { exam: string; subject: string; plan: string; pricePaise: number }[] = [];

  for (const item of body.items) {
    const sub = getSubject(item.exam, item.subject);
    if (!sub || !sub.live) {
      return NextResponse.json(
        { error: "invalid_item", message: `Subject ${item.exam}/${item.subject} not found or not available.` },
        { status: 400 },
      );
    }

    const catalogPrice = subjectPrice(item.exam, item.subject);
    const expectedPaise = item.plan === "premium" ? catalogPrice.premiumPaise : catalogPrice.proPaise;

    if (item.pricePaise !== expectedPaise) {
      return NextResponse.json(
        { error: "price_mismatch", message: `Price mismatch for ${sub.label}. Expected ₹${expectedPaise / 100}.` },
        { status: 400 },
      );
    }

    rawTotalPaise += expectedPaise;
    validatedItems.push({
      exam: item.exam,
      subject: item.subject,
      plan: item.plan,
      pricePaise: expectedPaise,
    });
  }

  // Calculate combo discounts
  const comboDiscounts = calculateComboDiscounts(validatedItems);
  const comboSavingsPaise = comboDiscounts.reduce((sum, d) => sum + d.savingsPaise, 0);
  let finalTotalPaise = rawTotalPaise - comboSavingsPaise;

  // Validate and apply promo code (server-side re-validation)
  let promoDiscountPaise = 0;
  let appliedPromoCode: string | null = null;
  if (body.promoCode) {
    const promo = await db.promoCode.findUnique({ where: { code: body.promoCode.toUpperCase() } });
    if (promo && promo.active && (!promo.expiresAt || promo.expiresAt > new Date()) && (promo.maxUses == null || promo.usedCount < promo.maxUses)) {
      if (promo.type === "percent") {
        promoDiscountPaise = Math.round(finalTotalPaise * (promo.value / 100));
      } else {
        promoDiscountPaise = promo.value;
      }
      promoDiscountPaise = Math.min(promoDiscountPaise, finalTotalPaise);
      appliedPromoCode = promo.code;
      // Increment usage
      await db.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
    }
  }
  finalTotalPaise -= promoDiscountPaise;

  // Create the multi-item UpiPayment
  const payment = await db.upiPayment.create({
    data: {
      userId: session.user.id,
      plan: validatedItems[0].plan as any, // primary item's plan
      exam: validatedItems[0].exam,
      subject: validatedItems.map((i) => i.subject).join(","),
      amountPaise: finalTotalPaise,
      items: validatedItems,
      payerName: body.payerName,
      payerPhone: phone,
      payerEmail: body.payerEmail,
      upiApp: body.upiApp,
      payerNote: body.payerNote,
      promoCode: appliedPromoCode,
    },
  });

  // Backfill User.phone so the admin console shows the payer's mobile number.
  await db.user
    .updateMany({ where: { id: session.user.id, phone: null }, data: { phone } })
    .catch(() => {});

  // PostHog event
  try {
    const ph = getPostHogClient();
    if (ph) {
      ph.capture({
        distinctId: session.user.id,
        event: "cart_checkout_submitted",
        properties: {
          payment_id: payment.id,
          item_count: validatedItems.length,
          raw_total_paise: rawTotalPaise,
          combo_savings_paise: comboSavingsPaise,
          promo_discount_paise: promoDiscountPaise,
          promo_code: appliedPromoCode,
          final_total_paise: finalTotalPaise,
          combo_discount: comboDiscounts.length > 0,
          exams: [...new Set(validatedItems.map((i) => i.exam))],
        },
      });
    }
  } catch { /* non-critical */ }

  return NextResponse.json({ ok: true, paymentId: payment.id });
}
