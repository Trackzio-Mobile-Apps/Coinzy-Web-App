import type { ListingDetails } from "@/lib/api/coinzy";
import { OwnerListingPanel } from "@/components/marketplace/OwnerListingPanel";

/** Listed coin seller rail — Figma `1349:142237` (reuses owner panel actions). */
export function CollectionListedSellerRail({
  listing,
  listingId,
  coinId,
}: {
  listing: ListingDetails;
  listingId: string;
  coinId?: string | null;
}) {
  return <OwnerListingPanel listing={listing} listingId={listingId} coinId={coinId} variant="rail" />;
}
