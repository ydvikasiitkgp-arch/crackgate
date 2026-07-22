import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const code = String(body.code ?? "").trim().toUpperCase();
  const type = String(body.type ?? "");
  const value = Number(body.value);

  if (!code || (type !== "percent" && type !== "flat") || !value || value <= 0) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 });
  }

  // Check duplicate
  const existing = await db.promoCode.findUnique({ where: { code } });
  if (existing) {
    return NextResponse.json({ error: `Code "${code}" already exists` }, { status: 409 });
  }

  const promo = await db.promoCode.create({
    data: {
      code,
      type,
      value,
      maxUses: body.maxUses ? Number(body.maxUses) : null,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
    },
  });

  return NextResponse.json({ code: promo.code, id: promo.id });
}
