import { NextRequest, NextResponse } from "next/server";
import { markListingSold, type MarkListingSoldBody } from "@/lib/api/marketplace-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Session proxy — `PATCH /marketplace/markSold/:id` on the catalogue/auth host.
 * Docs: https://antiques-api.trackzio.com/docs#/core-module?id=patch-marketplacemarksoldid
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to manage your listings." }, 401);

  const { id: rawId } = await params;
  const id = rawId?.trim();
  if (!id || id.length > 128 || /[/\\]/.test(id)) {
    return reply({ error: true, reason: "Invalid listing id." }, 400);
  }

  let body: MarkListingSoldBody = {};
  const raw = await request.text();
  if (raw.trim()) {
    try {
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      const next: MarkListingSoldBody = {};
      if (typeof parsed.soldDate === "string") next.soldDate = parsed.soldDate;
      if (typeof parsed.soldCurrency === "string") next.soldCurrency = parsed.soldCurrency;
      if (typeof parsed.soldPrice === "number" && Number.isFinite(parsed.soldPrice)) {
        next.soldPrice = parsed.soldPrice;
      }
      body = next;
    } catch {
      return reply({ error: true, reason: "Invalid JSON body." }, 400);
    }
  }

  const result = await markListingSold(token, id, body);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not mark listing as sold." }, status);
  }
  return reply({ error: false });
}
