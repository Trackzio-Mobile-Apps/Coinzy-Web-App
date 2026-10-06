import { NextRequest, NextResponse } from "next/server";
import { fetchCollectionsForSession } from "@/lib/api/coinzy-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function GET(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to view your collections." }, 401);

  const pageNo = Number.parseInt(request.nextUrl.searchParams.get("pageNo") ?? "0", 10) || 0;
  const pageSize = Math.min(50, Number.parseInt(request.nextUrl.searchParams.get("pageSize") ?? "50", 10) || 50);

  const result = await fetchCollectionsForSession(token, pageNo, pageSize);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not load collections." }, status);
  }
  return reply({
    error: false,
    data: result.data,
    ownedCount: result.ownedCount,
    identifiedCount: result.identifiedCount,
    wishlistedCount: result.wishlistedCount,
  });
}
