/** Canonical URL for the seller's own listing details (Figma `1363:178858`). */
export function selfListingPath(listingId: string, opts?: { listed?: boolean }): string {
  const id = listingId.trim();
  if (!id) return "/marketplace";
  const qs = opts?.listed ? "?listed=1" : "";
  return `/marketplace/my-listing/${encodeURIComponent(id)}${qs}`;
}

/** Open sell drawer on a collection coin (From Owned / List-a-coin → `?list=1`). */
export function collectionSellHref(coinId: string): string {
  return `/collection/coin/${encodeURIComponent(coinId.trim())}?from=marketplace&list=1`;
}
