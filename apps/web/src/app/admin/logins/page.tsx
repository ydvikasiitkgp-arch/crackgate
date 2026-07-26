import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import { fmtDate } from "@/lib/utils";
import { AdminSectionHeader } from "@/components/admin/admin-section-header";
import { AdminDataTableEmpty } from "@/components/admin/admin-empty-state";

export const dynamic = "force-dynamic";

const SUBJECT_LABELS: Record<string, string> = {
  mining: "Mining Engineering (MN)",
  civil: "Civil Engineering (CE)",
  environment: "Environmental Science and Engineering (ES)",
  geology: "Geology and Geophysics (GG)",
  geomatics: "Geomatics Engineering (GE)",
  textile: "Textile Engineering and Fibre Science (TF)",
  "life-sciences": "Life Sciences (XL)",
  ecology: "Ecology and Evolution (EY)",
  agricultural: "Agricultural Engineering (AG)",
  electrical: "Electrical",
  mechanical: "Mechanical",
  system: "System",
  "e-and-t": "E&T",
  "industrial-engineering": "Ind. Engg.",
  "rpsc-ame": "RPSC AME",
  "cgpsc-mining-officer": "CGPSC",
  "coal-sirdar": "Coal Sirdar",
  "coal-overman": "Coal Overman",
  "ongc-mechanical": "ONGC Mech",
  "ongc-petroleum": "ONGC Petrol",
  "ongc-chemical": "ONGC Chem",
  "ongc-instrumentation": "ONGC Instr",
  "ongc-geology": "ONGC Geo",
  "wcl-sirdar": "WCL Mining Sirdar",
  "wcl-af-electrical": "WCL AF Electrical",
  "ncl-mining-sirdar": "NCL Mining Sirdar",
  "ncl-surveyor": "NCL Surveyor",
};

export default async function LoginsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const admin = await getAdminSession();
  if (!admin) redirect("/login?next=/admin/logins");

  const { q = "", page: pageStr = "1" } = await searchParams;
  const query = q.trim();
  const pageNum = Math.max(1, parseInt(pageStr, 10) || 1);
  const pageSize = 50;

  const where = query
    ? {
        OR: [
          { email: { contains: query, mode: "insensitive" as const } },
          { name: { contains: query, mode: "insensitive" as const } },
          { phone: { contains: query } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { lastLoginAt: { sort: "desc", nulls: "last" } },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        plan: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        entitlements: {
          select: { exam: true, subject: true, tier: true, expiry: true, source: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="max-w-[1400px] mx-auto px-3 sm:px-5 py-10">
      <AdminSectionHeader
        title="Recent Logins"
        subtitle={`${total} users${query ? ` matching "${query}"` : ""}`}
      />

      {/* Search */}
      <form className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search by email, name, or phone…"
          className="input flex-1 max-w-sm"
        />
        <button type="submit" className="btn btn-primary text-sm">
          Search
        </button>
        {query && (
          <a href="/admin/logins" className="btn text-sm border border-line">
            Clear
          </a>
        )}
      </form>

      {/* Table */}
      <div className="mt-4 card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-xs text-muted uppercase tracking-wider border-b border-line">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left">User</th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left">Phone</th>
                <th className="px-3 sm:px-6 py-3 text-left">Access</th>
                <th className="px-3 sm:px-6 py-3 text-left">Plan</th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left">Joined</th>
                <th className="px-3 sm:px-6 py-3 text-left">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/50">
              {users.length === 0 ? (
                <AdminDataTableEmpty
                  colSpan={6}
                  icon="Users"
                  title="No users found"
                  description={query ? `No users matching "${query}".` : "No users yet."}
                />
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-paper/50 transition-colors">
                    <td className="px-3 sm:px-6 py-3">
                      <div className="font-medium">{u.email}</div>
                      {u.name && <div className="text-xs text-muted">{u.name}</div>}
                      {u.role === "admin" && (
                        <span className="inline-flex mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                          ADMIN
                        </span>
                      )}
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-6 py-3 text-muted text-xs">
                      {u.phone ?? "—"}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      {u.entitlements.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {u.entitlements.map((e, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand/10 text-brand"
                              title={`Source: ${e.source}${e.expiry ? ` · Expires: ${fmtDate(e.expiry)}` : " · No expiry"}`}
                            >
                              {SUBJECT_LABELS[e.subject] ?? e.subject}
                              <span className="ml-1 text-brand/60">{e.tier}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 sm:px-6 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        {u.plan.charAt(0).toUpperCase() + u.plan.slice(1)}
                      </span>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-3 text-muted">
                      {fmtDate(u.createdAt)}
                    </td>
                    <td className="px-3 sm:px-6 py-3 text-muted">
                      {u.lastLoginAt ? fmtDate(u.lastLoginAt) : (
                        <span className="text-xs italic">Never</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          {pageNum > 1 && (
            <a
              href={`?q=${encodeURIComponent(query)}&page=${pageNum - 1}`}
              className="px-3 py-1.5 rounded-lg border border-line hover:bg-paper transition"
            >
              ← Prev
            </a>
          )}
          <span className="text-muted">
            Page {pageNum} of {totalPages}
          </span>
          {pageNum < totalPages && (
            <a
              href={`?q=${encodeURIComponent(query)}&page=${pageNum + 1}`}
              className="px-3 py-1.5 rounded-lg border border-line hover:bg-paper transition"
            >
              Next →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
