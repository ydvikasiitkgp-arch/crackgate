import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { subjectPrice, getSubject } from "@/data/catalog";
import { calculateComboDiscounts } from "@/lib/combos";

export const runtime = "nodejs";

// GET — list cart items with computed prices + combo discounts
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const items = await db.cart.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  const enriched = items.map((item) => {
    const price = subjectPrice(item.exam, item.subject);
    const sub = getSubject(item.exam, item.subject);
    return {
      ...item,
      label: sub?.label ?? item.subject,
      examLabel: sub ? getSubject(item.exam, item.subject)?.label?.split("·")[0]?.trim() : item.exam,
      pricePaise: item.plan === "premium" ? price.premiumPaise : price.proPaise,
    };
  });

  const rawTotalPaise = enriched.reduce((sum, i) => sum + i.pricePaise, 0);
  const comboDiscounts = calculateComboDiscounts(enriched);
  const comboSavingsPaise = comboDiscounts.reduce((sum, d) => sum + d.savingsPaise, 0);
  const totalPaise = rawTotalPaise - comboSavingsPaise;

  return NextResponse.json({
    items: enriched,
    rawTotalPaise,
    totalPaise,
    count: enriched.length,
    comboDiscounts,
    comboSavingsPaise,
  });
}

const AddBody = z.object({
  exam: z.string().min(1),
  subject: z.string().min(1),
  plan: z.enum(["pro", "premium"]).default("pro"),
});

// POST — add item to cart
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = AddBody.parse(await req.json());

  // Validate against catalog
  const sub = getSubject(body.exam, body.subject);
  if (!sub || !sub.live) {
    return NextResponse.json(
      { error: "invalid_subject", message: "Subject not found or not available." },
      { status: 400 },
    );
  }

  // Upsert — if already in cart, update plan
  const item = await db.cart.upsert({
    where: {
      userId_exam_subject: {
        userId: session.user.id,
        exam: body.exam,
        subject: body.subject,
      },
    },
    create: {
      userId: session.user.id,
      exam: body.exam,
      subject: body.subject,
      plan: body.plan,
    },
    update: { plan: body.plan },
  });

  return NextResponse.json({ item });
}

const UpdateBody = z.object({
  exam: z.string().min(1),
  subject: z.string().min(1),
  plan: z.enum(["pro", "premium"]),
});

// PUT — update plan for an existing cart item
export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = UpdateBody.parse(await req.json());

  const item = await db.cart.update({
    where: {
      userId_exam_subject: {
        userId: session.user.id,
        exam: body.exam,
        subject: body.subject,
      },
    },
    data: { plan: body.plan },
  });

  return NextResponse.json({ item });
}
