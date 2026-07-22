import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// POST — clear all cart items for the current user
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  await db.cart.deleteMany({ where: { userId: session.user.id } });

  return NextResponse.json({ ok: true });
}
