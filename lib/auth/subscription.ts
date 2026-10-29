import { cache } from "react";
import { fetchAboutMe, type AboutMeUser } from "@/lib/api/auth-session";
import type { ScanUsage } from "@/lib/identify/scanUsage";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function isSubscribedInJwt(token: string): boolean {
  const payload = decodeJwtPayload(token);
  return payload?.isSubscribed === true;
}

/** Catalogue `user.isSubscribed` (strict boolean from API). */
export function isUserSubscribed(user: AboutMeUser | null | undefined): boolean {
  return user?.isSubscribed === true;
}

/**
 * Premium entitlement from catalogue `GET auth/me` (`user.isSubscribed`), matching Android.
 * Falls back to the session JWT when the profile request fails.
 */
/** One `auth/me` call per request, shared by display fields, premium and scan usage. */
export const resolveAboutMe = cache((token: string) => fetchAboutMe(token));

export const resolveIsSubscribed = cache(async (token: string): Promise<boolean> => {
  const result = await resolveAboutMe(token);
  if (!result.error) {
    return isUserSubscribed(result.user);
  }
  return isSubscribedInJwt(token);
});

/** Server-side AI scan counters from `auth/me` (null when the backend does not send them). */
export async function resolveScanUsage(token: string): Promise<ScanUsage | null> {
  const result = await resolveAboutMe(token);
  return result.error ? null : result.usage;
}
