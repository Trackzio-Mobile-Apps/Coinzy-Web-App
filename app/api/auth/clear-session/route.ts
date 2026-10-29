import { NextRequest, NextResponse } from "next/server";
import { clearAuthedHintCookie } from "@/lib/auth/session-cookie";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Clears `coinzy_session` and redirects (stale JWT after API host change). */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("next")?.trim() || "/";
  const nextPath = raw.startsWith("/") && !raw.startsWith("//") ? raw : "/";
  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set("coinzy_session", "", { ...cookieOptions, maxAge: 0 });
  clearAuthedHintCookie(response);
  return response;
}
