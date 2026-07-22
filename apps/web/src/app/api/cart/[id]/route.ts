import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// DELETE — remove a cart item by id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Only delete if it belongs to this user
  const deleted = await db.cart.deleteMany({
    where: { id, userId: session.user.id },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
