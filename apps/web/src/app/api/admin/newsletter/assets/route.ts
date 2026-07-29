import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import fs from "fs";
import path from "path";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const imagesDir = path.join(process.cwd(), "public", "email", "images");

  try {
    const files = fs.readdirSync(imagesDir).filter((f) => f !== ".gitkeep" && !f.startsWith("."));
    const assets = files.map((f) => ({
      name: f,
      url: `/email/images/${f}`,
    }));
    return NextResponse.json({ assets });
  } catch {
    return NextResponse.json({ assets: [] });
  }
}
