import { NextRequest, NextResponse } from "next/server";
import { addCollectionForSession } from "@/lib/api/coinzy-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to create a collection." }, 401);

  let body: { name?: string };
  try {
    body = (await request.json()) as { name?: string };
  } catch {
    return reply({ error: true, reason: "Invalid request body." }, 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) {
    return reply({ error: true, reason: "Enter a collection name (max 80 characters)." }, 400);
  }

  const result = await addCollectionForSession(token, name);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not create collection." }, status);
  }
  return reply({ error: false, data: result.data });
}
