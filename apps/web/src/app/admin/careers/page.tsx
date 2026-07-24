import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { CareersClient } from "./CareersClient";

export const runtime = "nodejs";

export default async function AdminCareersPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login");

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [applications, total, newCount, thisWeekCount, shortlistedCount, roleCounts] =
    await Promise.all([
      db.careerApplication.findMany({ orderBy: { createdAt: "desc" } }),
      db.careerApplication.count(),
      db.careerApplication.count({ where: { status: "new" } }),
      db.careerApplication.count({ where: { createdAt: { gte: weekAgo } } }),
      db.careerApplication.count({ where: { status: "shortlisted" } }),
      db.careerApplication.groupBy({ by: ["role"], _count: true }),
    ]);

  const serialized = applications.map((a) => ({
    ...a,
    createdAt: a.createdAt.toISOString(),
    reviewedAt: a.reviewedAt?.toISOString() ?? null,
  }));

  const roleBreakdown = Object.fromEntries(
    roleCounts.map((r) => [r.role, r._count]),
  );

  return (
    <CareersClient
      applications={serialized}
      kpis={{ total, newCount, thisWeekCount, shortlistedCount, roleBreakdown }}
      adminName={admin.name}
    />
  );
}
