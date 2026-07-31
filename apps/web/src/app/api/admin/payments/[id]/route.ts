/** Admin: manage a captured payment record.
 *  DELETE — remove a payment (e.g. erroneous duplicate). User's access
 *           entitlements are left untouched.
 *  PATCH  — change the access duration (periodMonths) a payment granted,
 *           recomputing the matching entitlements' expiry.
 */
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const payment = await db.payment.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!payment) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await db.payment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const periodMonths = Number(body?.periodMonths);
  if (!Number.isInteger(periodMonths) || periodMonths < 1 || periodMonths > 60) {
    return NextResponse.json({ error: "periodMonths must be 1-60" }, { status: 400 });
  }

  const payment = await db.payment.findUnique({ where: { id } });
  if (!payment) return NextResponse.json({ error: "not_found" }, { status: 404 });

  // Resolve the exams/subjects this payment granted access to.
  const raw = (payment.raw ?? {}) as Record<string, unknown>;
  let exams: string[] = [];
  let subjects: string[] = [];
  if (
    Array.isArray(raw.combo_entitlements) &&
    (raw.combo_entitlements as string[]).length > 0
  ) {
    for (const ce of raw.combo_entitlements as string[]) {
      const [exam, subject] = ce.split("/");
      if (exam && subject) {
        exams.push(exam);
        subjects.push(subject);
      }
    }
  } else if (Array.isArray(raw.subjects) && (raw.subjects as string[]).length > 0) {
    exams = (raw.exams as string[] | undefined) ?? (payment.exam ? [payment.exam] : []);
    subjects = raw.subjects as string[];
  } else {
    exams = payment.exam ? [payment.exam] : [];
    subjects = (payment.subject ?? "").split(",").filter(Boolean);
  }

  const base = payment.capturedAt ?? payment.createdAt;
  const expiry = new Date(base);
  expiry.setMonth(expiry.getMonth() + periodMonths);

  await db.$transaction([
    db.payment.update({ where: { id }, data: { periodMonths } }),
    db.entitlement.updateMany({
      where: {
        userId: payment.userId,
        exam: { in: exams },
        subject: { in: subjects },
        source: { not: "test_grant" },
      },
      data: { expiry },
    }),
  ]);

  return NextResponse.json({ ok: true, periodMonths, expiry });
}
