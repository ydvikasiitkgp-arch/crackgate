import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { db } from "@/lib/db";
import AdminPromosClient from "./admin-promos-client";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const admin = await getAdminSession();
  if (!admin) redirect("/login?next=/admin/promos");

  const promos = await db.promoCode.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      code: true,
      type: true,
      value: true,
      maxUses: true,
      usedCount: true,
      expiresAt: true,
      active: true,
      createdAt: true,
    },
  });

  return (
    <div className="p-6 max-w-5xl">
      <AdminPromosClient
        promos={promos.map((p) => ({
          ...p,
          createdAt: p.createdAt.toISOString(),
          expiresAt: p.expiresAt?.toISOString() ?? null,
        }))}
        admin={admin}
      />
    </div>
  );
}
