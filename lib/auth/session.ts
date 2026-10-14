import { cookies } from "next/headers";
import { isPremiumPlanId, PREMIUM_COOKIE } from "@/lib/premium/plans";

export type SessionUser = {
  name: string;
  email: string;
  isGuest: boolean;
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Premium entitlement for the signed-in user.
 *
 * Interim: test purchase sets HTTP-only `coinzy_premium` (plan id) via `POST /api/premium/test-purchase`.
 * No JWT plan claim is documented yet (docs/auth-api.md). When the backend exposes one, prefer the JWT here and
 * treat the cookie as a fallback until real web payments ship.
 *
 * Dev-only preview: `?premium=1` is still honoured by pages when `NODE_ENV !== "production"`.
 */
export async function getPremiumStatus(user: SessionUser | null): Promise<boolean> {
  if (!user || user.isGuest) return false;
  const raw = (await cookies()).get(PREMIUM_COOKIE)?.value ?? "";
  return isPremiumPlanId(raw);
}

/** Raw session JWT for server-side catalogue calls (wishlist, user-scoped fetch). Never send to the client. */
export async function getSessionToken(): Promise<string | null> {
  return (await cookies()).get("coinzy_session")?.value ?? null;
}

/** Read the HTTP-only session cookie and surface display fields from the JWT payload. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  if (!payload) return { name: "Guest", email: "", isGuest: true };

  const email =
    (typeof payload.email === "string" && payload.email) ||
    (typeof payload.handle === "string" && payload.handle) ||
    "";
  const name =
    (typeof payload.fullName === "string" && payload.fullName) ||
    (typeof payload.name === "string" && payload.name) ||
    (typeof payload.userName === "string" && payload.userName) ||
    (email ? email.split("@")[0] : "Guest");
  const isGuest =
    payload.isGuest === true ||
    payload.guest === true ||
    (typeof payload.userType === "string" && payload.userType.toLowerCase() === "guest") ||
    name === "Guest";

  return { name, email, isGuest };
}
