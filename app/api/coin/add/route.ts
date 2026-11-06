import { NextRequest, NextResponse } from "next/server";
import { addCoinToCollection } from "@/lib/api/coinzy-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to add coins to your collection." }, 401);

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return reply({ error: true, reason: "Invalid request body." }, 400);
  }

  const urls = body.imageUrls;
  if (!Array.isArray(urls) || urls.length < 2) {
    return reply({ error: true, reason: "Two image urls must be provided" }, 400);
  }

  // The upstream API requires these fields even when catalogue data omits them.
  for (const field of ["currency", "issuer", "yearOfMinting", "shape"] as const) {
    if (body[field] == null || (typeof body[field] === "string" && !body[field].trim())) {
      body[field] = "Unknown";
    }
  }

  // Private collection copies are separate from the Identified/Owned coin.
  body.isIdentified = body.isIdentified === false && typeof body._collection === "string" && Boolean(body._collection.trim()) ? false : true;

  const result = await addCoinToCollection(token, body);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not add coin." }, status);
  }
  return reply({ error: false, data: result.data });
}
