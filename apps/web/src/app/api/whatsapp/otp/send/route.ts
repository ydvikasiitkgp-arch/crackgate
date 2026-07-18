/** POST /api/whatsapp/otp/send
 *  Body: { phone: string }
 *  Generates a 6-digit code, stores a bcrypt hash, sends via WhatsApp template.
 *
 *  Rate limits:
 *   - Max 3 sends per phone per 10 min.
 *   - Max 10 sends per IP per hour. */

import { NextResponse } from "next/server";
import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { isValidPhone, normalizePhone, sendOtp } from "@/lib/whatsapp";

export const runtime = "nodejs";

const Body = z.object({ phone: z.string().min(7).max(20) });

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = Body.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid_body" }, { status: 400 });

  const phone = normalizePhone(parsed.data.phone);
  if (!isValidPhone(phone)) return NextResponse.json({ error: "invalid_phone" }, { status: 400 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  // ---- rate-limit by phone (3 / 10 min) ----
  const recent = await db.otpCode.count({
    where: { phone, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } },
  });
  if (recent >= 3) {
    return NextResponse.json({ error: "rate_limited", retryAfterSec: 600 }, { status: 429 });
  }

  // ---- rate-limit by IP (10 / hour) ----
  if (ip) {
    const recentByIp = await db.otpCode.count({
      where: { ip, createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) } },
    });
    if (recentByIp >= 10) {
      return NextResponse.json({ error: "rate_limited", retryAfterSec: 3600 }, { status: 429 });
    }
  }

  // ---- generate 6-digit code ----
  const code = String(randomInt(100000, 1000000));
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

  await db.otpCode.create({
    data: { phone, codeHash, channel: "whatsapp", expiresAt, ip },
  });

  try {
    await sendOtp(phone, code);
  } catch (e) {
    console.error("[otp/send] WhatsApp send failed:", e);
    return NextResponse.json({ error: "send_failed", message: (e as Error).message }, { status: 502 });
  }

  return NextResponse.json({ ok: true, expiresAt });
}
