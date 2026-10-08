import type { UserCoinDetails } from "@/lib/api/coinzy-session";

type UserMarketplace = {
  buy?: { isAvailable?: boolean; listingCount?: number };
  sale?: { isAvailable?: boolean; listingId?: string | null };
};

/** Active marketplace listing for this private coin, if any (`GET /coin/getDetails` → `marketplace.sale`). */
export function userCoinListingId(coin: UserCoinDetails): string | null {
  const mp = coin.marketplace as UserMarketplace | undefined;
  const id = mp?.sale?.listingId;
  return typeof id === "string" && id.length > 0 ? id : null;
}
