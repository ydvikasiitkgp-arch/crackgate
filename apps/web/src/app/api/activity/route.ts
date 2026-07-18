import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    const items = await db.activity.findMany({
      where: { userId: session.user.id },
      orderBy: { ts: "desc" },
      take: 50,
    });
    return NextResponse.json({ activity: items });
  } catch (error) {
    console.error("GET /api/activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
