import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  const subtotalPaise = Number(body.subtotalPaise);

  if (!code || !subtotalPaise || subtotalPaise <= 0) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const promo = await db.promoCode.findUnique({ where: { code } });
  if (!promo) {
    return NextResponse.json({ error: "Invalid promo code" }, { status: 404 });
  }
  if (!promo.active) {
    return NextResponse.json({ error: "This promo code is no longer active" }, { status: 400 });
  }
  if (promo.expiresAt && promo.expiresAt < new Date()) {
    return NextResponse.json({ error: "This promo code has expired" }, { status: 400 });
  }
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return NextResponse.json({ error: "This promo code has reached its usage limit" }, { status: 400 });
  }

  let discountPaise: number;
  if (promo.type === "percent") {
    discountPaise = Math.round(subtotalPaise * (promo.value / 100));
  } else {
    discountPaise = promo.value;
  }
  // Discount can't exceed subtotal
  discountPaise = Math.min(discountPaise, subtotalPaise);

  const label =
    promo.type === "percent"
      ? `${promo.code} — ${promo.value}% off`
      : `${promo.code} — ₹${Math.round(promo.value / 100)} off`;

  return NextResponse.json({
    code: promo.code,
    discountPaise,
    label,
    type: promo.type,
    value: promo.value,
  });
}
