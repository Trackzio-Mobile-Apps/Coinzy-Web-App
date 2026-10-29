import { cookies } from "next/headers";
import { decodeJwtPayload, sessionJwtIsGuest } from "@/lib/auth/jwt-payload";
import { resolveIsSubscribed } from "@/lib/auth/subscription";

export type SessionUser = {
  name: string;
  email: string;
  isGuest: boolean;
};

/**
 * Premium entitlement for the signed-in user (`auth/me` `user.isSubscribed`, same as Android).
 *
 * Dev-only preview: `?premium=1` is still honoured by pages when `NODE_ENV !== "production"`.
 */
export async function getPremiumStatus(user: SessionUser | null): Promise<boolean> {
  if (!user || user.isGuest) return false;
  const token = await getSessionToken();
  if (!token) return false;
  return resolveIsSubscribed(token);
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

  return { name, email, isGuest: sessionJwtIsGuest(token) };
}
