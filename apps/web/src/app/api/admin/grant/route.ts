/** Admin: manually grant a plan to a user by email or phone.
 *  Mirrors the UPI-approve transaction (plan flip + synthetic Payment + Activity)
 *  so revenue/KPI views stay unified. Use for off-platform payments, comps,
 *  support fixes, etc. When isTestUser is true, skips the Payment record to
 *  avoid inflating revenue — for internal test accounts. */
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import type { PrismaPromise } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizePhone } from "@/lib/whatsapp";
import { randomUUID } from "crypto";
import {
  DEFAULT_EXAM,
  DEFAULT_SUBJECT,
  getSubject,
  subjectPrice,
  type ExamTrack,
} from "@/data/catalog";

export const runtime = "nodejs";

// Combo definitions — matches the pricing page + submit API + approve API.
const COMBOS = {
  "combo-wcl-ncl-mining-sirdar": {
    pricePaise: 59900,
    entitlements: [
      { exam: "DIPLOMA" as ExamTrack, subject: "wcl-sirdar" },
      { exam: "DIPLOMA" as ExamTrack, subject: "ncl-mining-sirdar" },
    ],
  },
} as const;

type ComboKey = keyof typeof COMBOS;

const Body = z.object({
  identifier: z.string().trim().min(3, "Enter an email or phone number"),
  plan: z.enum(["pro", "premium"]),
  months: z.coerce.number().int().min(1).max(60).default(18),
  exam: z.string().trim().min(2).default(DEFAULT_EXAM),
  subject: z.string().trim().min(1).default(DEFAULT_SUBJECT),
  isTestUser: z.boolean().optional().default(false),
});

export async function POST(req: Request) {
  const admin = await getAdminSession();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { identifier, plan, months, exam, subject, isTestUser } = parsed.data;
  const isEmail = identifier.includes("@");

  // Check if this is a combo grant
  const isCombo = subject in COMBOS;
  const combo = isCombo ? COMBOS[subject as ComboKey] : null;

  // Validate exam+subject against the catalog (skip validation for combos)
  if (!isCombo) {
    const cat = getSubject(exam, subject);
    if (!cat) {
      return NextResponse.json(
        { error: "invalid_subject", message: "Unknown exam or subject." },
        { status: 400 },
      );
    }
  }

  const user = isEmail
    ? await db.user.findFirst({
        where: { email: { equals: identifier, mode: "insensitive" } },
        select: { id: true, email: true, name: true },
      })
    : await db.user.findUnique({
        where: { phone: normalizePhone(identifier) },
        select: { id: true, email: true, name: true },
      });

  if (!user) {
    return NextResponse.json(
      {
        error: "user_not_found",
        message: isEmail
          ? "No account with that email. They must sign in once first."
          : "No account with that phone. They must sign in once first.",
      },
      { status: 404 },
    );
  }

  const now = new Date();
  const expiry = new Date(now);
  expiry.setMonth(expiry.getMonth() + months);

  const grantSource = isTestUser ? "test_grant" : "manual_grant";

  // For combos, use the combo price; otherwise resolve from catalog
  const amountPaise = combo
    ? combo.pricePaise
    : subjectPrice(exam, subject)[plan === "premium" ? "premiumPaise" : "proPaise"];

  // For combos, create entitlements for all included exams
  const entitlementOps = combo
    ? combo.entitlements.map((ent) =>
        db.entitlement.upsert({
          where: { userId_exam_subject: { userId: user.id, exam: ent.exam, subject: ent.subject } },
          create: {
            userId: user.id,
            exam: ent.exam,
            subject: ent.subject,
            tier: plan,
            source: grantSource,
            expiry,
          },
          update: { tier: plan, source: grantSource, expiry },
        })
      )
    : [
        db.entitlement.upsert({
          where: { userId_exam_subject: { userId: user.id, exam, subject } },
          create: {
            userId: user.id,
            exam,
            subject,
            tier: plan,
            source: grantSource,
            expiry,
          },
          update: { tier: plan, source: grantSource, expiry },
        }),
      ];

  // Only the currently-live GATE Mining track drives the global User.plan
  const syncsGlobalPlan = exam === DEFAULT_EXAM && subject === DEFAULT_SUBJECT && !isCombo;

  const ops: PrismaPromise<unknown>[] = [
    ...(syncsGlobalPlan
      ? [
          db.user.update({
            where: { id: user.id },
            data: { plan, planExpiry: expiry },
          }),
        ]
      : []),
    ...entitlementOps,
    db.activity.create({
      data: {
        userId: user.id,
        type: isTestUser ? "test_plan_upgrade" : "plan_upgrade",
        payload: {
          source: grantSource,
          plan,
          months,
          amountPaise,
          exam,
          subject,
          is_combo: isCombo,
          combo_entitlements: combo?.entitlements.map((e) => `${e.exam}/${e.subject}`) ?? null,
          grantedBy: admin.email,
        },
      },
    }),
  ];

  if (!isTestUser) {
    const ref = `grant-${randomUUID()}`;
    ops.push(
      db.payment.create({
        data: {
          userId: user.id,
          razorpayOrderId: ref,
          razorpayPaymentId: `${ref}-pay`,
          amount: amountPaise,
          currency: "INR",
          plan,
          exam,
          subject,
          periodMonths: months,
          status: "captured",
          capturedAt: now,
          raw: {
            source: grantSource,
            grantedBy: admin.email,
            exam,
            subject,
            is_combo: isCombo,
            combo_entitlements: combo?.entitlements.map((e) => `${e.exam}/${e.subject}`) ?? null,
          },
        },
      }),
    );
  }

  await db.$transaction(ops);

  return NextResponse.json({
    ok: true,
    user: { email: user.email, name: user.name },
    plan,
    months,
    exam,
    subject,
    isTestUser,
    isCombo,
    comboEntitlements: combo?.entitlements.map((e) => `${e.exam} · ${e.subject}`) ?? [],
    expiry: expiry.toISOString().slice(0, 10),
  });
}
