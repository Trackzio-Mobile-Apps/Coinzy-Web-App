/**
 * Auth-host calls with the visitor's session JWT (`coinzy_session`).
 * Profile lives on the catalogue/auth origin (`COINZY_AUTH_API_ORIGIN` / `COINZY_API_ORIGIN`),
 * not the marketplace listings host.
 */

const AUTH_ORIGIN =
  process.env.COINZY_AUTH_API_ORIGIN || process.env.COINZY_API_ORIGIN || "https://coins-api.trackzio.com";

export type SellerDetails = {
  name?: string | null;
  contactEmail?: string | null;
  location?: string | null;
  phoneNumber?: string | null;
  bio?: string | null;
  externalLinks?: string[] | null;
};

export type AboutMeUser = {
  id?: string;
  /** Some catalogue responses use Mongo-style `_id`. */
  _id?: string;
  email?: string | null;
  isGuest?: boolean;
  isProfileComplete?: boolean;
  name?: { first?: string; last?: string; full?: string } | string | null;
  phone?: string | null;
  sellerDetails?: SellerDetails | null;
};

function authHeaders(token: string, init?: HeadersInit): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    "App-Version": "web-1.0",
    ...init,
  };
}

function displayName(user: AboutMeUser | null | undefined): string {
  if (!user?.name) return "";
  if (typeof user.name === "string") return user.name.trim();
  return (user.name.full || [user.name.first, user.name.last].filter(Boolean).join(" ")).trim();
}

/** `GET auth/me` — current user + nested `sellerDetails`. */
export async function fetchAboutMe(
  token: string,
): Promise<{ error: false; user: AboutMeUser } | { error: true; reason?: string; _status: number }> {
  const res = await fetch(`${AUTH_ORIGIN.replace(/\/$/, "")}/auth/me`, {
    method: "GET",
    headers: authHeaders(token),
    cache: "no-store",
  });
  const json = (await res.json()) as { error?: boolean; reason?: string; user?: AboutMeUser };
  if (!res.ok || json.error || !json.user) {
    return { error: true, reason: json.reason, _status: res.status };
  }
  return { error: false, user: json.user };
}

/** `PATCH auth/me` with `{ sellerDetails }` — replaces the nested seller object (send full fields). */
export async function updateSellerDetails(
  token: string,
  sellerDetails: SellerDetails,
): Promise<{ error: false; user: AboutMeUser } | { error: true; reason?: string; _status: number }> {
  return patchAboutMe(token, { sellerDetails });
}

/**
 * `PATCH auth/me` — Android `ReferralApiService.updateInfo` shape.
 * Accepts `fullName` / profile fields and/or nested `sellerDetails`.
 */
export async function patchAboutMe(
  token: string,
  body: Record<string, unknown>,
): Promise<{ error: false; user: AboutMeUser } | { error: true; reason?: string; _status: number }> {
  const res = await fetch(`${AUTH_ORIGIN.replace(/\/$/, "")}/auth/me`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as { error?: boolean; reason?: string; user?: AboutMeUser };
  if (!res.ok || json.error || !json.user) {
    return { error: true, reason: json.reason, _status: res.status };
  }
  return { error: false, user: json.user };
}

/** `DELETE auth/me` — deletes the account (no stable response body). */
export async function deleteAccount(
  token: string,
): Promise<{ error: false } | { error: true; reason?: string; _status: number }> {
  const res = await fetch(`${AUTH_ORIGIN.replace(/\/$/, "")}/auth/me`, {
    method: "DELETE",
    headers: authHeaders(token),
    cache: "no-store",
  });
  if (!res.ok) {
    const json = (await res.json().catch(() => null)) as { reason?: string; error?: boolean } | null;
    return { error: true, reason: json?.reason, _status: res.status };
  }
  return { error: false };
}

export { displayName as aboutMeDisplayName };
