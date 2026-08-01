import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession, getTestUserIds } from "@/lib/admin";
import { db } from "@/lib/db";
import NewsletterPageClient from "./newsletter-page-client";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const admin = await getAdminSession();
  if (!admin) {
    redirect("/login?next=/admin/newsletter");
  }

  const [testUserIds, subRows, userRows] = await Promise.all([
    getTestUserIds(),
    db.newsletterSubscriber.findMany({
      where: { unsubscribed: false },
      orderBy: { subscribedAt: "desc" },
      select: { email: true, source: true, subscribedAt: true },
    }),
    db.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5000,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        plan: true,
        createdAt: true,
        entitlements: { select: { tier: true }, where: { expiry: { gt: new Date() } } },
      },
    }),
  ]);

  const testEmails = new Set(userRows.filter((u) => testUserIds.has(u.id)).map((u) => u.email));

  const subscriberRows = subRows.filter((r) => !testEmails.has(r.email));
  const subscriberEmails = new Set(subscriberRows.map((r) => r.email));
  const userRowsFiltered = userRows.filter(
    (u) => !testEmails.has(u.email) && !subscriberEmails.has(u.email),
  );

  const userEmailToPlan = new Map(userRowsFiltered.map((u) => [u.email, u.plan]));
  const userEmailToPaid = new Map(
    userRowsFiltered.map((u) => [u.email, u.entitlements.length > 0]),
  );

  const subscribers = subscriberRows.map((r) => ({
    email: r.email,
    source: r.source,
    subscribedAt: r.subscribedAt.toISOString(),
    plan: userEmailToPaid.get(r.email)
      ? (userEmailToPlan.get(r.email) ?? "pro")
      : (userEmailToPlan.get(r.email) ?? null),
    isPaid: userEmailToPaid.get(r.email) ?? false,
  }));

  const users = userRowsFiltered.map((r) => ({
    email: r.email,
    name: r.name,
    phone: r.phone,
    plan: r.plan,
    isPaid: r.entitlements.length > 0,
    joinedAt: r.createdAt.toISOString(),
  }));

  const shareholderEmails = process.env.ADMIN_SHAREHOLDER_EMAILS
    ? process.env.ADMIN_SHAREHOLDER_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : [];

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="flex items-baseline justify-between">
        <h1 className="text-2xl font-extrabold">Newsletter</h1>
        <Link href="/admin" className="text-sm text-muted underline">
          ← Admin
        </Link>
      </div>

      <p className="text-sm text-muted mt-2">
        Logged in as <b>{admin.email}</b>
      </p>

      <NewsletterPageClient
        subscribers={subscribers}
        subscriberCount={subscribers.length}
        users={users}
        userCount={users.length}
        shareholderEmails={shareholderEmails}
      />
    </div>
  );
}
