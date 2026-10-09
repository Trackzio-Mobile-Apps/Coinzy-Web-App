import { NextRequest, NextResponse } from "next/server";
import { fetchUserCoins } from "@/lib/api/coinzy-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Session proxy for owned/collection coin lists — `POST /api/coin/fetchAll` on the catalogue host.
 * Browser never sees the JWT; uses `coinzy_session` cookie + origin check.
 */
export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to view your coins." }, 401);

  const pageNo = Number.parseInt(request.nextUrl.searchParams.get("pageNo") ?? "0", 10) || 0;
  const pageSize = Math.min(
    50,
    Math.max(1, Number.parseInt(request.nextUrl.searchParams.get("pageSize") ?? "20", 10) || 20),
  );
  const search = request.nextUrl.searchParams.get("search")?.trim() || undefined;

  let filters: Record<string, (string | boolean)[]> = {};
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (body && typeof body === "object" && !Array.isArray(body)) {
      filters = body as Record<string, (string | boolean)[]>;
    }
  } catch {
    // Empty body is fine — callers may rely on query filters only.
  }

  const result = await fetchUserCoins(token, { pageNo, pageSize, search, filters });
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not load coins." }, status);
  }
  return reply({ error: false, data: result.data, totalCount: result.totalCount });
}
