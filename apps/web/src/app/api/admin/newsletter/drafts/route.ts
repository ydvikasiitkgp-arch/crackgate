import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const draftsDir = path.join(process.cwd(), "public", "email", "drafts");

  try {
    const files = fs.readdirSync(draftsDir).filter((f) => f.endsWith(".html"));
    return NextResponse.json({ drafts: files });
  } catch {
    return NextResponse.json({ drafts: [] });
  }
}
