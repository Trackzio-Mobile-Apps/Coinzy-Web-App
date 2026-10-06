import type { SessionCollectionRow } from "@/lib/api/coinzy-session";
import type { CollectionBucket } from "@/components/collection/collectionNav";

const BUCKET_CRUMBS: Record<CollectionBucket, { href: string; label: string }> = {
  owned: { href: "/collection/owned", label: "Owned collection" },
  identified: { href: "/collection/identified", label: "Identified collection" },
  wishlist: { href: "/collection/wishlist", label: "Wishlist" },
};

/** Breadcrumb parent for `/collection/coin/[id]` from `?from=` (bucket slug or `c/<collectionId>`). */
export function collectionDetailsAncestor(
  from: string | undefined,
  collections: SessionCollectionRow[],
): { href: string; label: string } {
  if (from?.startsWith("c/")) {
    const id = from.slice(2);
    const name = collections.find((c) => c.collectionId === id)?.name ?? "Collection";
    return { href: `/collection/c/${id}`, label: name };
  }
  if (from && from in BUCKET_CRUMBS) return BUCKET_CRUMBS[from as CollectionBucket];
  return BUCKET_CRUMBS.owned;
}
