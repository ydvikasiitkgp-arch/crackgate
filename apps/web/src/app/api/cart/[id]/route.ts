import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

// DELETE — remove a cart item by id
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  let session;
  try {
    session = await auth();
  } catch (e) {
    console.error("[cart] auth() failed in DELETE:", e);
    return NextResponse.json({ error: "auth_failed", detail: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let deleted;
  try {
    deleted = await db.cart.deleteMany({
      where: { id, userId: session.user.id },
    });
  } catch (e) {
    console.error("[cart] db.cart.deleteMany failed:", e);
    return NextResponse.json({ error: "db_error", detail: String(e instanceof Error ? e.message : e) }, { status: 500 });
  }

  if (deleted.count === 0) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
