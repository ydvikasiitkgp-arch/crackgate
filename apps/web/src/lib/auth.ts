import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import type { Session } from "next-auth";
import { cookies } from "next/headers";
import { getLimiter, ipFromRequest } from "@/lib/rate-limit";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { isValidPhone, normalizePhone } from "@/lib/whatsapp";
import { authConfig } from "@/lib/auth.config";
import { getPostHogClient } from "@/lib/posthog";
import { IMPERSONATE_COOKIE, verifyImpersonationToken } from "@/lib/impersonate";

// Only register Google if it's actually configured. Otherwise NextAuth crashes
// at boot trying to discover OAuth endpoints with empty client credentials.
const googleConfigured =
  !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET;

const providers: Provider[] = [];
if (googleConfigured) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      // Always ask the user to pick an account; smoother UX for shared devices
      authorization: { params: { prompt: "select_account" } },
    }),
  );
}

const nextAuth = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  // JWT is required because the Credentials provider can't create database sessions.
  // Magic-link users still get a User row via the Prisma adapter.
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  providers: [
    ...providers,
    // Dev-only impersonation: sign in as any seeded user by email.
    // Disabled automatically in production. Gated behind DEV_DEMO_ENABLED for safety.
    ...(process.env.NODE_ENV !== "production" && process.env.DEV_DEMO_ENABLED === "1"
      ? [
          Credentials({
            id: "dev-demo",
            name: "Dev demo",
            credentials: { email: { label: "Email", type: "email" } },
            async authorize(raw) {
              const email = String(raw?.email ?? "").trim().toLowerCase();
              if (!email) return null;
              const user = await db.user.findUnique({ where: { email } });
              if (!user) return null;
              await db.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
              });
              return { id: user.id, email: user.email, name: user.name, image: user.picture ?? null };
            },
          }),
        ]
      : []),
    Credentials({
      id: "whatsapp",
      name: "WhatsApp OTP",
      credentials: {
        phone: { label: "Phone", type: "tel" },
        code:  { label: "OTP",   type: "text" },
      },
      async authorize(raw, req) {
        const phoneInput = String(raw?.phone ?? "");
        const code       = String(raw?.code ?? "");

        // IP-based rate limiting: max 20 verify attempts per 10 min per IP.
        // Uses in-memory sliding window (per-process, resets on restart).
        const ip = req ? ipFromRequest(req) : "unknown";
        const verifyLimiter = getLimiter({ windowMs: 10 * 60_000, max: 20, label: "otp-verify" });
        if (!verifyLimiter.check(ip).allowed) {
          console.warn(`[otp-verify] rate-limited by IP: ${ip}`);
          return null;
        }
        if (!/^\d{6}$/.test(code)) return null;
        const phone = normalizePhone(phoneInput);
        if (!isValidPhone(phone)) return null;

        const otp = await db.otpCode.findFirst({
          where: { phone, consumedAt: null, expiresAt: { gt: new Date() } },
          orderBy: { createdAt: "desc" },
        });
        if (!otp || otp.attempts >= 5) return null;
        const ok = await bcrypt.compare(code, otp.codeHash);
        if (!ok) {
          await db.otpCode.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
          return null;
        }

        // Find or create user. We don't have an email; synthesize a placeholder
        // that the user can change in their profile later.
        const placeholderEmail = `${phone}@wa.crackgate.in`;
        let user = await db.user.findUnique({ where: { phone } });
        if (!user) {
          user = await db.user.create({
            data: {
              phone,
              phoneVerified: new Date(),
              email: placeholderEmail,
              name: `User ${phone.slice(-4)}`,
              lastLoginAt: new Date(),
            },
          });
          getPostHogClient()?.capture({
            distinctId: user.id,
            event: "user_signed_up",
            properties: { method: "whatsapp_otp" },
          });
          getPostHogClient()?.identify({
            distinctId: user.id,
            properties: {
              $set: { name: user.name, phone },
              $set_once: { signed_up_at: new Date().toISOString(), signup_method: "whatsapp_otp" },
            },
          });
        } else {
          await db.user.update({
            where: { id: user.id },
            data: { phoneVerified: new Date(), lastLoginAt: new Date() },
          });
          getPostHogClient()?.capture({
            distinctId: user.id,
            event: "user_logged_in",
            properties: { method: "whatsapp_otp" },
          });
          getPostHogClient()?.identify({
            distinctId: user.id,
            properties: {
              $set: { name: user.name, phone },
            },
          });
        }
        await db.otpCode.update({ where: { id: otp.id }, data: { consumedAt: new Date() } });

        return { id: user.id, email: user.email, name: user.name, image: user.picture ?? null };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.uid = (user as { id: string }).id;
        try {
          const full = await db.user.findUnique({
            where: { id: token.uid as string },
            select: { plan: true, role: true, picture: true, name: true, email: true },
          });
          if (full) {
            token.plan  = full.plan;
            token.role  = full.role;
            token.name  = full.name;
            token.email = full.email;
            if (full.picture) token.picture = full.picture;
          }
        } catch (e) {
          console.error("[auth] jwt user lookup failed (continuing with cached token):", e);
        }
      }
      // Revalidate plan/role from DB every 5 minutes to catch admin grants
      // and plan changes without requiring re-login.
      const lastCheck = (token as Record<string, unknown>).lastRoleCheck as number | undefined;
      const now = Date.now();
      if (!lastCheck || now - lastCheck > 5 * 60_000) {
        try {
          const full = await db.user.findUnique({
            where: { id: token.uid as string },
            select: { plan: true, role: true },
          });
          if (full) {
            token.plan = full.plan;
            token.role = full.role;
          }
        } catch (e) {
          console.error("[auth] jwt role refresh failed (keeping cached values):", e);
        }
        (token as Record<string, unknown>).lastRoleCheck = now;
      }
      // Elevate role to "admin" for emails in ADMIN_EMAILS env (founder access).
      const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
      if (token.email && adminEmails.includes(String(token.email).toLowerCase())) {
        token.role = "admin";
      }
      // Throttled lastLoginAt update: once per 24h, fire-and-forget.
      const lastLoginUpdate = (token as Record<string, unknown>).lastLoginUpdate as number | undefined;
      if (!lastLoginUpdate || now - lastLoginUpdate > 24 * 60 * 60_000) {
        (token as Record<string, unknown>).lastLoginUpdate = now;
        db.user.update({ where: { id: token.uid as string }, data: { lastLoginAt: new Date() } })
          .catch(() => {/* best-effort */});
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as { id: string }).id = token.uid as string;
        (session.user as { plan?: string }).plan = token.plan as string | undefined;
        (session.user as { role?: string }).role = token.role as string | undefined;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Credentials providers already updated lastLoginAt in authorize().
      // For Google, the PrismaAdapter has just created/linked the User row,
      // so we bump lastLoginAt + capture the latest profile picture here.
      if (account?.provider === "google" && user.email) {
        // Detect first-ever Google login: if the user has exactly one Google
        // Account record, the adapter just created it (this is a signup).
        // This is more reliable than comparing createdAt === updatedAt which
        // breaks because Prisma's @updatedAt directive auto-bumps the timestamp.
        const dbUser = await db.user.findUnique({
          where: { email: user.email },
          select: { id: true, createdAt: true },
        }).catch(() => null);
        let isNew = false;
        if (dbUser?.id) {
          const accountCount = await db.account.count({
            where: { userId: dbUser.id, provider: "google" },
          }).catch(() => 0);
          isNew = accountCount <= 1;
        }
        await db.user.update({
          where: { email: user.email },
          data: {
            lastLoginAt: new Date(),
            image: user.image ?? undefined,
            picture: user.image ?? undefined,
          },
        }).catch(() => {/* first sign-in: adapter creates the user right after */});
        if (dbUser?.id) {
          if (isNew) {
            getPostHogClient()?.capture({
              distinctId: dbUser.id,
              event: "user_signed_up",
              properties: { method: "google" },
            });
          } else {
            getPostHogClient()?.capture({
              distinctId: dbUser.id,
              event: "user_logged_in",
              properties: { method: "google" },
            });
          }
          getPostHogClient()?.identify({
            distinctId: dbUser.id,
            properties: {
              $set: { name: user.name ?? null },
              $set_once: { signed_up_at: dbUser.createdAt.toISOString(), signup_method: "google" },
            },
          });
        }
      }
      return true;
    },
  },
  pages: { signIn: "/login" },
});

export const handlers = nextAuth.handlers;
export const signIn = nextAuth.signIn;
export const signOut = nextAuth.signOut;

/**
 * Wrapped auth() — transparently returns the impersonated user's session when
 * a valid `__impersonate` cookie is present (admin "login as user" mode).
 * Falls through to normal NextAuth when the cookie is absent/invalid/expired.
 */
export async function auth(): Promise<Session | null> {
  const cookieStore = await cookies();
  const impCookie = cookieStore.get(IMPERSONATE_COOKIE);
  if (impCookie?.value) {
    const payload = await verifyImpersonationToken(impCookie.value);
    if (payload?.sub) {
      const user = await db.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, name: true, plan: true, picture: true, role: true },
      });
      if (user) {
        return {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.picture ?? null,
            plan: user.plan,
            role: "user",
          },
          expires: new Date((payload.exp ?? Date.now() / 1000) * 1000).toISOString(),
          impersonator: {
            id: payload.impersonatorId,
            email: payload.impersonatorEmail,
          },
        };
      }
    }
  }
  return nextAuth.auth();
}
