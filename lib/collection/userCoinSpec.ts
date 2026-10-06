import type { ArchetypeDetails } from "@/lib/api/coinzy";
import type { UserCoinDetails } from "@/lib/api/coinzy-session";
import type { CoinSpec } from "@/lib/catalogue/coinDetails";

/** Merge private coin fields with catalogue archetype data for shared details UI. */
export function userCoinSpec(user: UserCoinDetails, archetype?: ArchetypeDetails | null): CoinSpec {
  const estimated =
    archetype?.estimatedPrice ??
    (user.estimatedPrice != null && Number.isFinite(user.estimatedPrice) ? { F: user.estimatedPrice } : null);

  return {
    ...archetype,
    ...user,
    name: user.name,
    estimatedPrice: estimated,
    marketplace: user.marketplace ?? archetype?.marketplace,
  };
}

export type CollectionCoinStatus = "owned" | "identified" | "wishlist";

export function collectionCoinStatus(user: UserCoinDetails): CollectionCoinStatus {
  if (user.isOwned) return "owned";
  if (user.isWishlisted) return "wishlist";
  return "identified";
}

export const COLLECTION_STATUS_LABEL: Record<CollectionCoinStatus, string> = {
  owned: "Owned",
  identified: "Identified",
  wishlist: "Wishlist",
};
