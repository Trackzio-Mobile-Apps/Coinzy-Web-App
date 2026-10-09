import { NextRequest, NextResponse } from "next/server";
import {
  aboutMeDisplayName,
  deleteAccount,
  fetchAboutMe,
  patchAboutMe,
  type AboutMeUser,
  type SellerDetails,
} from "@/lib/api/auth-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";
import { isSellerProfileComplete } from "@/lib/marketplace/sellerProfile";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };

function jwtClaims(token: string): { email?: string; name?: string } {
  try {
    const part = token.split(".")[1];
    if (!part) return {};
    const payload = JSON.parse(Buffer.from(part, "base64url").toString()) as Record<string, unknown>;
    const email =
      (typeof payload.email === "string" && payload.email) ||
      (typeof payload.handle === "string" && payload.handle) ||
      undefined;
    const name =
      (typeof payload.fullName === "string" && payload.fullName) ||
      (typeof payload.name === "string" && payload.name) ||
      (typeof payload.userName === "string" && payload.userName) ||
      undefined;
    return { email, name };
  } catch {
    return {};
  }
}

function jwtUserId(token: string): string | undefined {
  try {
    const part = token.split(".")[1];
    if (!part) return undefined;
    const payload = JSON.parse(Buffer.from(part, "base64url").toString()) as Record<string, unknown>;
    for (const key of ["userId", "id", "_id", "sub", "guestId"] as const) {
      const v = payload[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function publicProfile(user: AboutMeUser, token: string) {
  const sellerDetails = user.sellerDetails ?? null;
  const claims = jwtClaims(token);
  const name = aboutMeDisplayName(user) || claims.name || "";
  const email = (typeof user.email === "string" && user.email) || claims.email || "";
  const id =
    (typeof user.id === "string" && user.id.trim()) ||
    (typeof user._id === "string" && user._id.trim()) ||
    jwtUserId(token) ||
    "";
  return {
    id,
    name,
    email,
    isGuest: user.isGuest === true,
    sellerDetails: {
      name: sellerDetails?.name ?? null,
      contactEmail: sellerDetails?.contactEmail ?? null,
      location: sellerDetails?.location ?? null,
      phoneNumber: sellerDetails?.phoneNumber ?? null,
      bio: sellerDetails?.bio ?? null,
      externalLinks: sellerDetails?.externalLinks ?? [],
    },
    sellerProfileComplete: isSellerProfileComplete(sellerDetails),
  };
}

function normalizeSellerDetails(raw: SellerDetails): SellerDetails | { error: string } {
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const contactEmail = typeof raw.contactEmail === "string" ? raw.contactEmail.trim() : "";
  if (!name) return { error: "Enter your name." };
  if (!contactEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
    return { error: "Enter a valid seller email." };
  }
  return {
    name,
    contactEmail,
    location: typeof raw.location === "string" && raw.location.trim() ? raw.location.trim() : "—",
    phoneNumber: typeof raw.phoneNumber === "string" && raw.phoneNumber.trim() ? raw.phoneNumber.trim() : undefined,
    bio: typeof raw.bio === "string" && raw.bio.trim() ? raw.bio.trim() : undefined,
    externalLinks: Array.isArray(raw.externalLinks)
      ? raw.externalLinks.filter((l): l is string => typeof l === "string" && Boolean(l.trim()))
      : [],
  };
}

/** `GET /api/auth/me` → catalogue `GET auth/me` (seller profile + display fields; no JWT in JSON). */
export async function GET(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to continue." }, 401);

  const result = await fetchAboutMe(token);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status || 502;
    return reply({ error: true, reason: result.reason ?? "Could not load profile." }, status);
  }
  return reply({ error: false, user: publicProfile(result.user, token) });
}

/**
 * `PATCH /api/auth/me` → catalogue `PATCH auth/me`.
 * Accepts `{ sellerDetails }` and/or `{ fullName, syncSellerEmail? }` (Settings profile edit).
 */
export async function PATCH(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to continue." }, 401);

  let body: {
    sellerDetails?: SellerDetails;
    fullName?: string;
    syncSellerEmail?: boolean;
  };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return reply({ error: true, reason: "Invalid request body." }, 400);
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const hasSeller = body.sellerDetails && typeof body.sellerDetails === "object";
  if (!fullName && !hasSeller) {
    return reply({ error: true, reason: "Nothing to update." }, 400);
  }
  if (fullName && !/^[a-zA-Z ]{3,}$/.test(fullName)) {
    return reply({ error: true, reason: "Enter a valid Name" }, 400);
  }

  const current = await fetchAboutMe(token);
  if (current.error) {
    const status = current._status >= 500 ? 502 : current._status || 502;
    return reply({ error: true, reason: current.reason ?? "Could not load profile." }, status);
  }

  const accountEmail =
    (typeof current.user.email === "string" && current.user.email) || jwtClaims(token).email || "";
  const existing = current.user.sellerDetails ?? {};

  let sellerDetails: SellerDetails | undefined;
  if (hasSeller) {
    const normalized = normalizeSellerDetails(body.sellerDetails!);
    if ("error" in normalized) return reply({ error: true, reason: normalized.error }, 400);
    sellerDetails = normalized;
  } else if (fullName || body.syncSellerEmail) {
    const contactEmail =
      body.syncSellerEmail && accountEmail
        ? accountEmail
        : (typeof existing.contactEmail === "string" && existing.contactEmail) || accountEmail;
    sellerDetails = {
      name: (typeof existing.name === "string" && existing.name.trim()) || fullName || aboutMeDisplayName(current.user),
      contactEmail: contactEmail || undefined,
      location: (typeof existing.location === "string" && existing.location.trim()) || "—",
      phoneNumber: existing.phoneNumber ?? undefined,
      bio: existing.bio ?? undefined,
      externalLinks: existing.externalLinks ?? [],
    };
  }

  const payload: Record<string, unknown> = {};
  if (fullName) payload.fullName = fullName;
  if (accountEmail) payload.email = accountEmail;
  if (sellerDetails) payload.sellerDetails = sellerDetails;

  const result = await patchAboutMe(token, payload);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status || 502;
    return reply({ error: true, reason: result.reason ?? "Could not save profile." }, status);
  }
  return reply({ error: false, user: publicProfile(result.user, token) });
}

/** `DELETE /api/auth/me` → catalogue `DELETE auth/me`, then clear session cookie. */
export async function DELETE(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to continue." }, 401);

  const about = await fetchAboutMe(token);
  if (!about.error && about.user.isGuest === true) {
    return reply({ error: true, reason: "Guest accounts cannot be deleted. Create an account first." }, 400);
  }

  const result = await deleteAccount(token);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status || 502;
    return reply({ error: true, reason: result.reason ?? "Could not delete account." }, status);
  }

  const response = reply({ error: false, message: "Delete Success" });
  response.cookies.set("coinzy_session", "", { ...cookieOptions, maxAge: 0 });
  return response;
}
