import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      plan?: "free" | "pro" | "premium";
      role?: "user" | "admin";
      entitlements?: Array<{
        exam: string;
        subject: string;
        label: string;
        tier: "pro" | "premium";
        expiry: string | null;
      }>;
    };
    /** Present only during admin "login as user" mode. */
    impersonator?: {
      id: string;
      email: string;
    };
  }
}
