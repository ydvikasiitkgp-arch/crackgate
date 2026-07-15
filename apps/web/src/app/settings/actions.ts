"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getPostHogClient } from "@/lib/posthog";

export type UpdateProfileState = { ok?: boolean; error?: string };

export async function updateProfile(
  _prev: UpdateProfileState,
  formData: FormData
): Promise<UpdateProfileState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Not signed in" };

  const name = String(formData.get("name") ?? "").trim().slice(0, 80);
  const targetYearRaw = String(formData.get("targetYear") ?? "").trim();
  const targetRankRaw = String(formData.get("targetRank") ?? "").trim();
  const currentStatus = String(formData.get("currentStatus") ?? "").trim().slice(0, 60);

  const targetRank = targetRankRaw === "" ? null : Number(targetRankRaw);
  if (targetRank !== null && (!Number.isInteger(targetRank) || targetRank < 1 || targetRank > 100000)) {
    return { error: "Target rank must be a whole number between 1 and 100000" };
  }
  const targetYear = targetYearRaw === "" ? null : targetYearRaw.slice(0, 12);

  try {
    // The session JWT id can be stale (e.g. after a DB re-seed). Resolve the
    // real row by id first, then fall back to email — otherwise update would
    // throw "No record was found for an update".
    const sUser = session.user as { id: string; email?: string | null };
    let target = await db.user.findUnique({ where: { id: sUser.id }, select: { id: true } });
    if (!target && sUser.email) {
      target = await db.user.findUnique({ where: { email: sUser.email }, select: { id: true } });
    }
    if (!target) return { error: "Your session is stale. Sign out and sign back in." };

    await db.user.update({
      where: { id: target.id },
      data: {
        name: name || null,
        targetYear,
        targetRank,
        currentStatus: currentStatus || null,
      },
    });
  } catch {
    return { error: "Could not save changes. Try again." };
  }

  getPostHogClient()?.capture({
    distinctId: session.user.id,
    event: "profile_updated",
    properties: {
      has_name: !!name,
      has_target_year: !!targetYear,
      has_target_rank: targetRank !== null,
      has_current_status: !!currentStatus,
    },
  });
  getPostHogClient()?.identify({
    distinctId: session.user.id,
    properties: {
      $set: {
        name: name || null,
        target_year: targetYear,
        target_rank: targetRank,
        current_status: currentStatus || null,
      },
    },
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { ok: true };
}
