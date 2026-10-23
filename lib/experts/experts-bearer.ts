import crypto from "node:crypto";
import { cache } from "react";

import { aboutMeDisplayName, fetchAboutMe, type AboutMeUser } from "@/lib/api/auth-session";

function base64urlJson(value: object): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    return JSON.parse(Buffer.from(part, "base64url").toString()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function signHs256Jwt(payload: Record<string, unknown>, secret: string): string {
  const header = base64urlJson({ alg: "HS256", typ: "JWT" });
  const body = base64urlJson(payload);
  const data = `${header}.${body}`;
  const sig = crypto.createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function catalogueUserId(user: AboutMeUser): string | undefined {
  const id = typeof user.id === "string" ? user.id.trim() : "";
  const oid = typeof user._id === "string" ? user._id.trim() : "";
  return id || oid || undefined;
}

function userJwtSharedSecret(): string | undefined {
  const secret = (
    process.env.COINZY_USER_JWT_SHARED_SECRET ||
    process.env.USER_JWT_SHARED_SECRET ||
    ""
  ).trim();
  return secret || undefined;
}

/**
 * Experts resolves mobile users from JWT `userId` / `id` / `_id` (not catalogue `auth/me`).
 * Re-sign with the catalogue profile id so web matches Android (`externalUserId` = coins user id).
 */
export const expertsBearerForSession = cache(async (sessionToken: string): Promise<string> => {
  const about = await fetchAboutMe(sessionToken);
  if (about.error) return sessionToken;

  const baseToken = about.sessionToken ?? sessionToken;
  const uid = catalogueUserId(about.user);
  const secret = userJwtSharedSecret();
  if (!uid || !secret) return baseToken;

  const prev = decodeJwtPayload(baseToken) ?? decodeJwtPayload(sessionToken) ?? {};
  const exp =
    typeof prev.exp === "number" && prev.exp > Math.floor(Date.now() / 1000)
      ? prev.exp
      : Math.floor(Date.now() / 1000) + 86400;

  const email =
    (typeof about.user.email === "string" && about.user.email.trim()) ||
    (typeof prev.email === "string" ? prev.email.trim() : "") ||
    undefined;
  const name = aboutMeDisplayName(about.user) || (typeof prev.name === "string" ? prev.name : undefined);

  const payload: Record<string, unknown> = {
    userId: uid,
    exp,
    ...(email ? { email } : {}),
    ...(name ? { name } : {}),
  };

  return signHs256Jwt(payload, secret);
});
