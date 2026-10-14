import { NextRequest, NextResponse } from "next/server";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";
import { getSessionUser } from "@/lib/auth/session";
import { isPremiumPlanId, PREMIUM_COOKIE, PREMIUM_PLANS } from "@/lib/premium/plans";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  /** Long-lived test entitlement until real payments replace this cookie. */
  maxAge: 60 * 60 * 24 * 400,
};

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Test Premium purchase (no real payment). Sets `coinzy_premium` HTTP-only cookie so
 * `getPremiumStatus` returns true. Guests must sign in first. Replace with gateway later.
 */
export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, message: "Invalid request origin." }, 403);

  const user = await getSessionUser();
  if (!user) return reply({ error: true, message: "Sign in required." }, 401);
  if (user.isGuest) {
    return reply({ error: true, message: "Create a free account to purchase Premium (test)." }, 403);
  }

  let planId = "";
  try {
    const json = (await request.json()) as { planId?: unknown };
    planId = typeof json.planId === "string" ? json.planId.trim() : "";
  } catch {
    return reply({ error: true, message: "Invalid JSON body." }, 400);
  }

  if (!isPremiumPlanId(planId)) return reply({ error: true, message: "Unknown plan." }, 400);
  const plan = PREMIUM_PLANS.find((p) => p.id === planId)!;

  const response = reply({
    error: false,
    message: null,
    data: { premium: true, planId: plan.id, planLabel: plan.label, test: true },
  });
  response.cookies.set(PREMIUM_COOKIE, plan.id, cookieOptions);
  return response;
}
