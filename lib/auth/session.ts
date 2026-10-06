import { cookies } from "next/headers";

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
 * No plan/subscription claim is documented for the web session (docs/auth-api.md only lists a partial `user`; the proxy
 * strips tokens and only `name`/`email`/`isGuest` are decoded above), so this returns `false` for everyone. When the
 * backend contract names a claim, read it from the JWT payload here — this is the single place that decides premium.
 *
 * Dev-only preview: `/home?premium=1` is honoured by `app/home/page.tsx` when `NODE_ENV !== "production"`.
 */
export async function getPremiumStatus(user: SessionUser | null): Promise<boolean> {
  void user;
  return false;
}

/** Read the HTTP-only session cookie and surface display fields from the JWT payload. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get("coinzy_session")?.value;
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
