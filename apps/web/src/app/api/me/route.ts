import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getPostHogClient } from "@/lib/posthog";
import { getLimiter, rateLimitResponse } from "@/lib/rate-limit";

const profileSchema = z.object({
  name: z.string().trim().max(80).optional(),
  targetYear: z.string().trim().max(40).optional(),
  currentStatus: z.string().trim().max(40).optional(),
});

const patchLimiter = getLimiter({ windowMs: 60_000, max: 10, label: "me:patch" });

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const u = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true, email: true, name: true, picture: true, plan: true, planExpiry: true,
        role: true, targetYear: true, currentStatus: true, createdAt: true,
      },
    });
    return NextResponse.json({ user: u }, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("GET /api/me:", error);
    if (error instanceof Error) {
      getPostHogClient()?.captureException(error);
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const { allowed, resetAt } = patchLimiter.check(session.user.id);
  if (!allowed) return rateLimitResponse(Math.ceil((resetAt - Date.now()) / 1000));
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }
  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid input" }, { status: 400 });
  }
  // Note: phone is intentionally not updatable here; it must go through the
  // OTP verification flow that sets phoneVerified.
  const updated = await db.user.update({
    where: { id: session.user.id },
    data: parsed.data,
    select: {
      id: true, email: true, name: true, picture: true, plan: true, planExpiry: true,
      role: true, targetYear: true, currentStatus: true, createdAt: true,
    },
  });
  return NextResponse.json({ user: updated });
}
