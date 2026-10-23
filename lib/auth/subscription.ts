import { cache } from "react";
import { fetchAboutMe } from "@/lib/api/auth-session";

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

/**
 * Premium entitlement from catalogue `GET auth/me` (`user.isSubscribed`), matching Android.
 * Falls back to the session JWT when the profile request fails.
 */
export const resolveIsSubscribed = cache(async (token: string): Promise<boolean> => {
  const result = await fetchAboutMe(token);
  if (!result.error) {
    return result.user.isSubscribed === true;
  }
  return isSubscribedInJwt(token);
});
