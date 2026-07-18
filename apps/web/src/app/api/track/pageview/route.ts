import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ipFromRequest, getLimiter } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = new Set(["pageview", "click", "section_view"]);
const limiter = getLimiter({ windowMs: 60_000, max: 60, label: "track:pageview" });

export async function POST(req: Request) {
  try {
    const ip = ipFromRequest(req);
    const { allowed } = limiter.check(ip);
    if (!allowed) return NextResponse.json({ ok: true }); // swallow — tracking must never block

    const body = await req.json().catch(() => null);
    const type = VALID_TYPES.has(body?.type) ? body.type : "pageview";
    const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";
    // ponytail: derive userId from session, never trust client-supplied userId (IDOR fix)
    const session = await auth().catch(() => null);
    const userId = session?.user?.id ?? null;
    const element = typeof body?.element === "string" ? body.element.slice(0, 200) : null;
    const meta = body?.meta && typeof body.meta === "object" ? body.meta : null;

    await db.pageView.create({
      data: { type, path, userId, element, meta, ip },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // swallow — tracking must never break the UI
  }
}
