import { SignJWT, jwtVerify } from "jose";

export const IMPERSONATE_COOKIE = "__impersonate";
export const IMPERSONATE_MAX_AGE = 30 * 60; // 30 min (seconds)

export const IMPERSONATION_ROLE = "view_only_impersonator";

export type ImpersonationPayload = {
  sub: string;             // target user id
  targetEmail: string;
  impersonatorId: string;
  impersonatorEmail: string;
  role: typeof IMPERSONATION_ROLE;
  exp?: number;
};

function secret(): Uint8Array {
  const s = process.env.IMPERSONATE_SECRET;
  if (!s) throw new Error("IMPERSONATE_SECRET env var is not set");
  return new TextEncoder().encode(s);
}

export async function generateImpersonationToken(
  targetUserId: string,
  targetUserEmail: string,
  adminId: string,
  adminEmail: string,
): Promise<string> {
  return new SignJWT({
    targetEmail: targetUserEmail,
    impersonatorId: adminId,
    impersonatorEmail: adminEmail,
    role: IMPERSONATION_ROLE,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(targetUserId)
    .setIssuedAt()
    .setExpirationTime(`${IMPERSONATE_MAX_AGE}s`)
    .sign(secret());
}

export async function verifyImpersonationToken(
  token: string,
): Promise<ImpersonationPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (payload.role !== IMPERSONATION_ROLE) return null;
    return {
      sub: String(payload.sub ?? ""),
      targetEmail: String(payload.targetEmail ?? ""),
      impersonatorId: String(payload.impersonatorId ?? ""),
      impersonatorEmail: String(payload.impersonatorEmail ?? ""),
      role: IMPERSONATION_ROLE,
      exp: typeof payload.exp === "number" ? payload.exp : undefined,
    };
  } catch {
    return null;
  }
}
