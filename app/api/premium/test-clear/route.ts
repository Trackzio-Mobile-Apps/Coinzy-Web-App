import { NextRequest, NextResponse } from "next/server";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";
import { getSessionUser } from "@/lib/auth/session";
import { PREMIUM_COOKIE } from "@/lib/premium/plans";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Dev / interim: clear the `coinzy_premium` test cookie so the session is free again.
 * Production builds hide the Settings UI that calls this.
 */
export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, message: "Invalid request origin." }, 403);
  if (process.env.NODE_ENV === "production") {
    return reply({ error: true, message: "Not available in production." }, 404);
  }

  const user = await getSessionUser();
  if (!user) return reply({ error: true, message: "Sign in required." }, 401);

  const response = reply({ error: false, message: null, data: { premium: false, test: true } });
  response.cookies.set(PREMIUM_COOKIE, "", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}
