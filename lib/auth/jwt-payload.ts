/**
 * Edge-safe JWT payload decode (no Node `Buffer`). Used by middleware and
 * server session helpers — never ship the token to the browser.
 */
export function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const normalized = part.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Guest vs real account from a session JWT payload — mirrors `getSessionUser`.
 * Unknown/opaque tokens are treated as guest so `/auth` stays reachable for upgrades.
 */
export function sessionJwtIsGuest(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;

  const email =
    (typeof payload.email === "string" && payload.email) ||
    (typeof payload.handle === "string" && payload.handle) ||
    "";
  const name =
    (typeof payload.fullName === "string" && payload.fullName) ||
    (typeof payload.name === "string" && payload.name) ||
    (typeof payload.userName === "string" && payload.userName) ||
    (email ? email.split("@")[0] : "Guest");

  return (
    payload.isGuest === true ||
    payload.guest === true ||
    (typeof payload.userType === "string" && payload.userType.toLowerCase() === "guest") ||
    name === "Guest"
  );
}
