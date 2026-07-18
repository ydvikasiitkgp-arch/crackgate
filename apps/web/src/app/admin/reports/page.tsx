import { redirect } from "next/navigation";
import Link from "next/link";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { resolveMock } from "@/lib/mock-registry";
import { AdminReportsClient } from "./AdminReportsClient";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage(props: {
  searchParams: Promise<{ status?: string; issueType?: string; exam?: string; subject?: string; page?: string; search?: string }>;
}) {
  const admin = await getAdminSession();
  if (!admin) redirect("/login?next=/admin/reports");

  const searchParams = await props.searchParams;
  const status = searchParams.status || undefined;
  const issueType = searchParams.issueType || undefined;
  const exam = searchParams.exam || undefined;
  const subject = searchParams.subject || undefined;
  const search = searchParams.search || undefined;
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const limit = 20;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (issueType) where.issueType = issueType;
  if (exam) where.exam = exam;
  if (subject) where.subject = subject;
  if (search) {
    where.OR = [
      { questionKey: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  // Canonical exam types and subjects — always shown in filters even if no reports exist yet
  const ALL_EXAMS = ["GATE", "PSU", "STATE", "DIPLOMA", "PYQ"];
  const ALL_SUBJECTS = [
    "mining", "civil", "environment", "geology",
    "electrical", "mechanical", "system", "e-and-t", "industrial-engineering",
    "rpsc-ame", "cgpsc-mining-officer",
    "coal-sirdar", "coal-overman",
  ];

  const [reports, total, countRows, uniqueUserRows, examRows, subjectRows, globalPending, globalReviewed, globalResolved, globalMultiReportRows] = await Promise.all([
    db.questionReport.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
    db.questionReport.count({ where }),
    db.questionReport.groupBy({ by: ["questionKey"], _count: { _all: true }, where }),
    db.questionReport.groupBy({ by: ["questionKey", "userId"], where }),
    db.questionReport.findMany({ distinct: ["exam"], select: { exam: true }, orderBy: { exam: "asc" } }),
    db.questionReport.findMany({ distinct: ["subject"], select: { subject: true }, orderBy: { subject: "asc" } }),
    db.questionReport.count({ where: { status: "pending" } }),
    db.questionReport.count({ where: { status: "reviewed" } }),
    db.questionReport.count({ where: { status: "resolved" } }),
    db.questionReport.groupBy({ by: ["questionKey", "userId"], where: { status: "pending" } }),
  ]);

  const reportCountMap: Record<string, number> = {};
  for (const r of countRows) reportCountMap[r.questionKey] = r._count?._all ?? 0;

  const reporterCountMap: Record<string, number> = {};
  for (const r of uniqueUserRows) reporterCountMap[r.questionKey] = (reporterCountMap[r.questionKey] ?? 0) + 1;

  // Count questions reported by multiple users (globally across all pages)
  const multiReportKeys = new Set<string>();
  const multiCount: Record<string, number> = {};
  for (const r of globalMultiReportRows) {
    multiCount[r.questionKey] = (multiCount[r.questionKey] ?? 0) + 1;
    if (multiCount[r.questionKey] > 1) multiReportKeys.add(r.questionKey);
  }

  // Resolve question stems for the reported questions
  const uniqueRefIds = [...new Set(reports.map((r) => r.mockRefId))];
  const questionMap: Record<string, string> = {};
  for (const refId of uniqueRefIds) {
    const bank = resolveMock(refId);
    if (!bank) continue;
    const rawQs = bank.questions as unknown as { stem?: string; id?: number | string }[];
    for (let i = 0; i < rawQs.length; i++) {
      const q = rawQs[i];
      const stem = q.stem
        ? q.stem.replace(/\$/g, "").replace(/\n/g, " ").slice(0, 200)
        : "";
      questionMap[`${refId}:${i}`] = stem;
      questionMap[String(i)] = questionMap[String(i)] ?? stem;
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-5 py-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold">Reported Issues</h1>
          <p className="text-muted mt-1">
            {total} total reports · {totalPages} page{totalPages !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/api/admin/export?dataset=reports" className="btn btn-ghost text-sm">📥 Export CSV</a>
          <Link href="/admin" className="btn btn-ghost text-sm">← Back to console</Link>
        </div>
      </div>

      <AdminReportsClient
        reports={reports.map((r) => ({
          id: r.id,
          userId: r.userId,
          userEmail: r.user.email,
          userName: r.user.name,
          mockRefId: r.mockRefId,
          questionKey: r.questionKey,
          questionStem: questionMap[`${r.mockRefId}:${r.questionKey}`] ?? questionMap[r.questionKey] ?? null,
          exam: r.exam,
          subject: r.subject,
          issueType: r.issueType,
          description: r.description,
          status: r.status,
          adminNote: r.adminNote,
          reviewedBy: r.reviewedBy,
          reportCount: reportCountMap[r.questionKey] ?? 1,
          reporterCount: reporterCountMap[r.questionKey] ?? 1,
          createdAt: r.createdAt.toISOString(),
        }))}
        pagination={{ page, limit, total, totalPages }}
        filters={{ status, issueType, exam, subject, search }}
        filterOptions={{
          exams: [...new Set([...ALL_EXAMS, ...examRows.map((r) => r.exam)])].sort(),
          subjects: [...new Set([...ALL_SUBJECTS, ...subjectRows.map((r) => r.subject)])].sort(),
        }}
        globalCounts={{ pending: globalPending, reviewed: globalReviewed, resolved: globalResolved, multiReport: multiReportKeys.size }}
      />
    </div>
  );
}
