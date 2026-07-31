/** Founder/admin gate.
 *  A user is treated as admin if EITHER:
 *    - their User.role is "admin" in the DB, OR
 *    - their email appears in the ADMIN_EMAILS env var (comma-separated).
 *  ADMIN_EMAILS is the bootstrap path before any user has role=admin in the DB.
 */
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export type AdminSession = {
  userId: string;
  email: string;
  name: string;
  source: "role" | "env";
};

/** User IDs flagged as test accounts via the "Is test user" grant flow.
 *  Excluded from paid-user counts and revenue on admin dashboards. */
export async function getTestUserIds(): Promise<Set<string>> {
  const rows = await db.entitlement.findMany({
    where: { source: "test_grant" },
    select: { userId: true },
    distinct: ["userId"],
  });
  return new Set(rows.map((r) => r.userId));
}

export async function getAdminSession(): Promise<AdminSession | null> {
  const session = await auth();
  if (!session?.user?.email) return null;
  const userId = (session.user as { id?: string }).id ?? "";

  const email = session.user.email.toLowerCase();
  const envList = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  if (envList.includes(email)) {
    return {
      userId,
      email,
      name: session.user.name ?? email,
      source: "env",
    };
  }

  // Trust the elevated role in the JWT (auth.ts promotes ADMIN_EMAILS to admin).
  const sessionRole = (session.user as { role?: string }).role;
  if (sessionRole === "admin") {
    return {
      userId,
      email,
      name: session.user.name ?? email,
      source: "role",
    };
  }

  if (!userId) return null;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  if (user?.role === "admin") {
    return {
      userId,
      email,
      name: session.user.name ?? email,
      source: "role",
    };
  }

  return null;
}
