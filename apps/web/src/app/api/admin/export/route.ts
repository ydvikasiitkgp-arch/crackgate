/** GET /api/admin/export?dataset=users|attempts|activity|payments
 *  Streams a CSV download of the chosen dataset. Excel opens this natively.
 */
import { NextRequest } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Row = Record<string, unknown>;

// Neutralize CSV formula injection: cells starting with =,+,-,@,tab,CR are
// interpreted as formulas by Excel/Sheets. Prefix with a single quote.
function neutralizeFormula(s: string): string {
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function escapeCell(v: unknown): string {
  if (v == null) return "";
  if (v instanceof Date) return v.toISOString();
  if (typeof v === "object") return neutralizeFormula(JSON.stringify(v)).replace(/"/g, '""');
  const s = neutralizeFormula(String(v));
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function toCsv(rows: Row[], headers: string[]): string {
  const head = headers.join(",");
  const body = rows
    .map((r) => headers.map((h) => {
      const v = r[h];
      const cell = escapeCell(v);
      return /[",\n\r]/.test(cell) || cell.includes(",") ? `"${cell.replace(/"/g, '""')}"` : cell;
    }).join(","))
    .join("\n");
  // Prefix BOM so Excel detects UTF-8 (₹ etc.) correctly.
  return "\uFEFF" + head + "\n" + body + "\n";
}

async function buildDataset(dataset: string): Promise<{ headers: string[]; rows: Row[] } | null> {
  switch (dataset) {
    case "users": {
      const users = await db.user.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true, email: true, name: true, phone: true, plan: true, planExpiry: true,
          role: true, targetYear: true, currentStatus: true,
          createdAt: true, lastLoginAt: true,
          entitlements: { select: { exam: true, subject: true, tier: true } },
        },
      });
      return {
        headers: ["id", "email", "name", "phone", "plan", "planExpiry", "entitlements", "role", "targetYear", "currentStatus", "createdAt", "lastLoginAt"],
        rows: users.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          phone: u.phone,
          plan: u.plan,
          planExpiry: u.planExpiry,
          entitlements: u.entitlements.map((e) => `${e.exam}:${e.subject}:${e.tier}`).join("; ") || null,
          role: u.role,
          targetYear: u.targetYear,
          currentStatus: u.currentStatus,
          createdAt: u.createdAt,
          lastLoginAt: u.lastLoginAt,
        })),
      };
    }
    case "attempts": {
      const attempts = await db.attempt.findMany({
        orderBy: { takenAt: "desc" },
        take: 20000,
        include: { user: { select: { email: true } } },
      });
      return {
        headers: ["id", "email", "kind", "refId", "refTitle", "score", "total", "correct", "wrong", "skipped", "durationSec", "takenAt"],
        rows: attempts.map((a) => ({
          id: a.id,
          email: a.user.email,
          kind: a.kind,
          refId: a.refId,
          refTitle: a.refTitle,
          score: a.score,
          total: a.total,
          correct: a.correct,
          wrong: a.wrong,
          skipped: a.skipped,
          durationSec: a.durationSec,
          takenAt: a.takenAt,
        })),
      };
    }
    case "activity": {
      const activity = await db.activity.findMany({
        orderBy: { ts: "desc" },
        take: 20000,
        include: { user: { select: { email: true } } },
      });
      return {
        headers: ["id", "email", "type", "payload", "ts"],
        rows: activity.map((a) => ({
          id: a.id,
          email: a.user.email,
          type: a.type,
          payload: a.payload,
          ts: a.ts,
        })),
      };
    }
    case "payments": {
      const payments = await db.payment.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      });
      return {
        headers: ["id", "email", "name", "plan", "periodMonths", "amountInr", "currency", "status", "razorpayOrderId", "razorpayPaymentId", "createdAt", "capturedAt"],
        rows: payments.map((p) => ({
          id: p.id,
          email: p.user.email,
          name: p.user.name,
          plan: p.plan,
          periodMonths: p.periodMonths,
          amountInr: Math.round(p.amount / 100),
          currency: p.currency,
          status: p.status,
          razorpayOrderId: p.razorpayOrderId,
          razorpayPaymentId: p.razorpayPaymentId,
          createdAt: p.createdAt,
          capturedAt: p.capturedAt,
        })),
      };
    }
    case "entitlements": {
      const entitlements = await db.entitlement.findMany({
        orderBy: { createdAt: "desc" },
        include: { user: { select: { email: true, name: true } } },
      });
      return {
        headers: ["id", "email", "userName", "exam", "subject", "tier", "source", "expiry", "createdAt"],
        rows: entitlements.map((e) => ({
          id: e.id,
          email: e.user.email,
          userName: e.user.name,
          exam: e.exam,
          subject: e.subject,
          tier: e.tier,
          source: e.source,
          expiry: e.expiry,
          createdAt: e.createdAt,
        })),
      };
    }
    case "reports": {
      const reports = await db.questionReport.findMany({
        orderBy: { createdAt: "desc" },
        take: 20000,
        include: { user: { select: { email: true, name: true } } },
      });
      return {
        headers: ["id", "email", "userName", "mockRefId", "questionKey", "exam", "subject", "issueType", "description", "status", "adminNote", "reviewedBy", "reviewedAt", "createdAt"],
        rows: reports.map((r) => ({
          id: r.id,
          email: r.user.email,
          userName: r.user.name,
          mockRefId: r.mockRefId,
          questionKey: r.questionKey,
          exam: r.exam,
          subject: r.subject,
          issueType: r.issueType,
          description: r.description,
          status: r.status,
          adminNote: r.adminNote,
          reviewedBy: r.reviewedBy,
          reviewedAt: r.reviewedAt,
          createdAt: r.createdAt,
        })),
      };
    }
    default:
      return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return new Response("forbidden", { status: 403 });
    }
    const dataset = req.nextUrl.searchParams.get("dataset") ?? "";
    const data = await buildDataset(dataset);
    if (!data) {
      return new Response("unknown dataset (use users|attempts|activity|payments|reports|entitlements)", { status: 400 });
    }
    const csv = toCsv(data.rows, data.headers);
    const stamp = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="crackgate-${dataset}-${stamp}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("GET /api/admin/export:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
