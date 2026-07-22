import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await _req.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (typeof body.active === "boolean") data.active = body.active;
  if (body.maxUses !== undefined) data.maxUses = body.maxUses ? Number(body.maxUses) : null;
  if (body.expiresAt !== undefined) data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;

  const promo = await db.promoCode.update({
    where: { id },
    data,
  });

  return NextResponse.json({ ok: true, code: promo.code });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  await db.promoCode.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
