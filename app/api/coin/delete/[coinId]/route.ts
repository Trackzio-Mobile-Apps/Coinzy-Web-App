import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { deleteUserCoin } from "@/lib/api/coinzy-session";
import { deleteListing, fetchListingDetailsForSession } from "@/lib/api/marketplace-session";
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

  // A listed coin: remove its listing first so no orphan listing is left behind.
  const listingId = request.nextUrl.searchParams.get("listingId")?.trim();
  let listingRemoved = false;
  if (listingId) {
    if (listingId.length > 128 || /[/\\]/.test(listingId)) return reply({ error: true, reason: "Invalid listing id." }, 400);
    try {
      const listing = await fetchListingDetailsForSession(token, listingId);
      // null = listing already gone (404); otherwise it must be the caller's listing for this coin.
      if (listing) {
        const linkedCoinId = listing.coinId ?? (listing.coinDetails as { coinId?: string | null } | undefined)?.coinId;
        if (!listing.isMyListing || (linkedCoinId && linkedCoinId !== coinId)) {
          return reply({ error: true, reason: "Listing does not belong to this coin." }, 403);
        }
        const removed = await deleteListing(token, listingId);
        if (removed.error && removed._status !== 404) {
          return reply({ error: true, reason: removed.reason ?? "Could not remove the listing. The coin was not deleted." }, removed._status >= 500 ? 502 : removed._status);
        }
        listingRemoved = true;
      }
    } catch {
      return reply({ error: true, reason: "Could not remove the listing. The coin was not deleted." }, 502);
    }
  }

  const result = await deleteUserCoin(token, coinId);
  if (listingRemoved) {
    revalidateTag("marketplace-listings");
    revalidatePath("/marketplace");
    revalidatePath("/marketplace/my-listings");
    revalidatePath("/marketplace/all");
  }
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    const reason = result.reason ?? "Could not delete coin.";
    return reply({ error: true, reason: listingRemoved ? `${reason} The listing was already removed.` : reason }, status);
  }
  return reply({ error: false });
}
