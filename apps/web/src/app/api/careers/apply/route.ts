import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const ROLES = [
  "Questions Evaluator",
  "Marketing & Sales",
  "Content Creator",
  "Other",
] as const;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, role, message, portfolio } = body ?? {};

    if (!name || !email || !phone || !role) {
      return NextResponse.json(
        { error: "Name, email, phone, and role are required." },
        { status: 400 },
      );
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Name must be at least 2 characters." },
        { status: 400 },
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    const phoneDigits = String(phone).replace(/[^\d]/g, "");
    if (phoneDigits.length < 10) {
      return NextResponse.json(
        { error: "Please enter a valid phone number." },
        { status: 400 },
      );
    }

    if (!ROLES.includes(role)) {
      return NextResponse.json(
        { error: "Please select a valid role." },
        { status: 400 },
      );
    }

    const app = await db.careerApplication.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phoneDigits,
        role,
        message: message?.trim() || null,
        portfolio: portfolio?.trim() || null,
      },
    });

    return NextResponse.json({ ok: true, id: app.id });
  } catch (e) {
    console.error("[careers/apply] POST failed:", e);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
