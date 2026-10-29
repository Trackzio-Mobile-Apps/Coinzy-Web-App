import { NextResponse, type NextRequest } from "next/server";
import { AUTHED_HINT_COOKIE, clearAuthedHintCookie, setAuthedHintCookie } from "@/lib/auth/authed-hint";
import { sessionJwtIsGuest } from "@/lib/auth/jwt-payload";
import { safeReturnPath } from "@/lib/auth/returnTo";

function withNoStore(response: NextResponse) {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  return response;
}

/**
 * Keep the readable `coinzy_authed` hint in sync with HTTP-only `coinzy_session`
 * so dual-auth route loaders can paint the correct chrome without a cookies() round-trip.
 *
 * Also bounce non-guest sessions off `/auth` (Edge, no Buffer) so browser Back after
 * login cannot re-show the wizard with stuck "Please wait…" UI (ClickUp `14yn59xndgp`).
 * Guests may still open `/auth` to upgrade (`cf5ba66`).
 */
export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("coinzy_session")?.value;
  const hasSession = Boolean(sessionToken);
  const hasHint = request.cookies.get(AUTHED_HINT_COOKIE)?.value === "1";
  const onAuth = request.nextUrl.pathname === "/auth";

  if (onAuth && sessionToken && !sessionJwtIsGuest(sessionToken)) {
    const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
    const response = NextResponse.redirect(new URL(next ?? "/home", request.url));
    if (!hasHint) setAuthedHintCookie(response);
    return withNoStore(response);
  }

  if (hasSession === hasHint) {
    return onAuth ? withNoStore(NextResponse.next()) : NextResponse.next();
  }

  const response = NextResponse.next();
  if (hasSession) setAuthedHintCookie(response);
  else clearAuthedHintCookie(response);
  return onAuth ? withNoStore(response) : response;
}

export const config = {
  matcher: [
    /*
     * Sync on document/RSC navigations; skip static assets and image optimizer.
     */
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
