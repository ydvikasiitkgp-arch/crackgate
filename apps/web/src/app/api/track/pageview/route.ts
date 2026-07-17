import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ipFromRequest } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_TYPES = new Set(["pageview", "click", "section_view"]);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const type = VALID_TYPES.has(body?.type) ? body.type : "pageview";
    const path = typeof body?.path === "string" ? body.path.slice(0, 500) : "/";
    const userId = typeof body?.userId === "string" ? body.userId : null;
    const element = typeof body?.element === "string" ? body.element.slice(0, 200) : null;
    const meta = body?.meta && typeof body.meta === "object" ? body.meta : null;
    const ip = ipFromRequest(req);

    await db.pageView.create({
      data: { type, path, userId, element, meta, ip },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // swallow — tracking must never break the UI
  }
}
