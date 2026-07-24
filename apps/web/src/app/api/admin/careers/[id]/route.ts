import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const VALID_STATUSES = ["new", "reviewed", "shortlisted", "rejected"] as const;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const data: Record<string, unknown> = {};
  if (body.status && VALID_STATUSES.includes(body.status)) {
    data.status = body.status;
    if (body.status !== "new") data.reviewedAt = new Date();
  }
  if (body.notes !== undefined) data.notes = body.notes?.trim() || null;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const app = await db.careerApplication.update({ where: { id }, data });
  return NextResponse.json({ ok: true, status: app.status });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await params;
  await db.careerApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
