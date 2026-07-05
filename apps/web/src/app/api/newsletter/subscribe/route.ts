import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@crackgate/database";

const bodySchema = z.object({
  email: z.string().trim().email(),
  source: z.string().max(50).optional().default("landing"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
  }

  const { email, source } = parsed.data;
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null;

  try {
    await db.newsletterSubscriber.create({
      data: { email, source, ip },
    });
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    // P2002 = unique constraint violation — already subscribed
    if (typeof err === "object" && err !== null && "code" in err && (err as { code: string }).code === "P2002") {
      return NextResponse.json({ ok: true, existing: true });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
