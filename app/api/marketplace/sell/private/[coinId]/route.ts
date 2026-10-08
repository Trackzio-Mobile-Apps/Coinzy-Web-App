import { NextRequest, NextResponse } from "next/server";
import { sellPrivateCoin, type SellPrivateListingBody } from "@/lib/api/marketplace-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest, { params }: { params: Promise<{ coinId: string }> }) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to list coins for sale." }, 401);

  const { coinId: rawCoinId } = await params;
  const coinId = rawCoinId?.trim();
  if (!coinId || coinId.length > 128 || /[/\\]/.test(coinId)) {
    return reply({ error: true, reason: "Invalid coin id." }, 400);
  }

  let body: SellPrivateListingBody;
  try {
    body = (await request.json()) as SellPrivateListingBody;
  } catch {
    return reply({ error: true, reason: "Invalid request body." }, 400);
  }

  if (!body.price || !body.sellerDetails?.contactEmail || !body.sellerDetails?.name) {
    return reply({ error: true, reason: "Price and seller contact details are required." }, 400);
  }

  const result = await sellPrivateCoin(token, coinId, body);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not create listing." }, status);
  }
  return reply({ error: false, data: result.data });
}
