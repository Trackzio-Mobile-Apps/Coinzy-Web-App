import { NextRequest, NextResponse } from "next/server";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

/**
 * Local logout (Android: no HTTP logout). Clears `coinzy_session`.
 * Guest id cookie is kept so the next guest login can resume the same guestId.
 */
export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) {
    return NextResponse.json({ error: true, reason: "Invalid request origin." }, { status: 403 });
  }
  const response = NextResponse.json({ error: false }, { headers: { "Cache-Control": "no-store" } });
  response.cookies.set("coinzy_session", "", { ...cookieOptions, maxAge: 0 });
  return response;
}
