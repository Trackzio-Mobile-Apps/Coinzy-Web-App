import { NextRequest, NextResponse } from "next/server";
import { deleteUserCoin } from "@/lib/api/coinzy-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ coinId: string }> },
) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to remove coins from your collection." }, 401);

  const { coinId: rawCoinId } = await params;
  const coinId = rawCoinId?.trim();
  if (!coinId || coinId.length > 128 || /[/\\]/.test(coinId)) {
    return reply({ error: true, reason: "Invalid coin id." }, 400);
  }

  const result = await deleteUserCoin(token, coinId);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not delete coin." }, status);
  }
  return reply({ error: false });
}
