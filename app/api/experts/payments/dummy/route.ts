import { NextRequest, NextResponse } from "next/server";
import { adminAdjustUserCredits, hasExpertsAdminKey } from "@/lib/api/experts-admin";
import { fetchExpertsProfile } from "@/lib/api/experts-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";
import { getSessionToken, getSessionUser } from "@/lib/auth/session";
import { EXPERT_CREDIT_PACKS } from "@/lib/experts/creditPacks";
import { isTrackzioStaffEmail } from "@/lib/experts/staffAccess";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Trackzio staff-only dummy credit purchase (no real payment).
 * Session email must end with `@trackzio.com`. Grants via Experts admin adjust.
 */
export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, message: "Invalid request origin." }, 403);

  const user = await getSessionUser();
  const token = await getSessionToken();
  if (!user || !token || user.isGuest) {
    return reply({ error: true, message: "Sign in required." }, 401);
  }
  if (!isTrackzioStaffEmail(user.email)) {
    return reply({ error: true, message: "Dummy pay is limited to @trackzio.com accounts." }, 403);
  }
  if (!hasExpertsAdminKey()) {
    return reply(
      {
        error: true,
        message: "Dummy pay is not configured. Set COINZY_EXPERTS_ADMIN_API_KEY on the server.",
      },
      503,
    );
  }

  let packId = "";
  try {
    const json = (await request.json()) as { packId?: unknown };
    packId = typeof json.packId === "string" ? json.packId.trim() : "";
  } catch {
    return reply({ error: true, message: "Invalid JSON body." }, 400);
  }

  const pack = EXPERT_CREDIT_PACKS.find((p) => p.id === packId);
  if (!pack) return reply({ error: true, message: "Unknown credit pack." }, 400);

  const profileRes = await fetchExpertsProfile(token);
  const expertsUser = profileRes.body?.data?.user;
  const userId = (expertsUser?._id || expertsUser?.id || "").trim();
  if (profileRes.body?.error || !userId) {
    return reply(
      {
        error: true,
        message: profileRes.body?.message || "Could not resolve Experts profile for credit grant.",
      },
      profileRes.status >= 400 ? profileRes.status : 502,
    );
  }

  const reason = `web_dummy_pay:${user.email.toLowerCase()}:${pack.productId}`;
  const adjust = await adminAdjustUserCredits(userId, { amount: pack.credits, reason });
  if (adjust.configError) {
    return reply({ error: true, message: adjust.configError }, 503);
  }
  if (!adjust.ok || adjust.body?.error || typeof adjust.body?.data?.creditBalance !== "number") {
    return reply(
      {
        error: true,
        message: adjust.body?.message || "Failed to grant credits.",
      },
      adjust.status >= 400 ? adjust.status : 502,
    );
  }

  return reply({
    error: false,
    message: null,
    data: {
      creditBalance: adjust.body.data.creditBalance,
      creditsGranted: pack.credits,
      packId: pack.id,
      dummy: true,
    },
  });
}
