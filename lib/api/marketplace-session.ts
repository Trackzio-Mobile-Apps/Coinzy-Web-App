/**
 * Marketplace mutations with the visitor's session JWT (`coinzy_session`).
 * Read paths use guest tokens in `lib/api/coinzy.ts` on the production marketplace host.
 */

const MARKETPLACE_ORIGIN = process.env.COINZY_MARKETPLACE_API_ORIGIN ?? "https://coins-api-prod.trackzio.com";

export type SellPrivateListingBody = {
  title?: string;
  price: number;
  gradingScale?: string;
  gradeValue?: string;
  gradingAuthority?: string;
  certificationNumber?: string;
  strikerType?: string;
  cleaningAlterations?: string[];
  coinCondition?: string;
  sellerDetails: {
    name: string;
    contactEmail: string;
    location: string;
    externalLinks?: string[];
    phoneNumber?: string;
    bio?: string;
  };
};

export async function sellPrivateCoin(
  token: string,
  coinId: string,
  body: SellPrivateListingBody,
): Promise<{ error: false; data: { id?: string; listingId?: string } } | { error: true; reason?: string; _status: number }> {
  const res = await fetch(`${MARKETPLACE_ORIGIN}/api/marketplace/sell/private/${encodeURIComponent(coinId)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    error?: boolean;
    reason?: string;
    data?: { id?: string; listingId?: string; _id?: string };
  };
  if (!res.ok || json.error) {
    return { error: true, reason: json.reason, _status: res.status };
  }
  const id = json.data?.id ?? json.data?._id ?? json.data?.listingId;
  return { error: false, data: { id, listingId: id } };
}
