/**
 * Marketplace mutations (and owner-scoped reads) with the visitor's session JWT (`coinzy_session`).
 * Anonymous catalogue/marketplace reads stay on guest tokens in `lib/api/coinzy.ts`.
 *
 * Sell / owner listing / delete must hit the **same host as auth + private coins**
 * (`COINZY_API_ORIGIN`). Android uses one BASE_URL for both. Posting sell to
 * `COINZY_MARKETPLACE_API_ORIGIN` (prod browse host) with a catalogue session returns
 * 404 "Coin not found or you don't own this coin" because that coin inventory lives on catalogue.
 */

import type { ListingDetails } from "@/lib/api/coinzy";

/** Session marketplace host = catalogue/auth origin (not the prod guest-browse host). */
const SESSION_ORIGIN =
  process.env.COINZY_API_ORIGIN ?? "https://coins-api.trackzio.com";

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

export type OwnerListingDetails = ListingDetails & {
  isMyListing?: boolean;
  coinId?: string | null;
};

type ApiResult<T> = { error: false; data: T } | { error: true; reason?: string; _status: number };

function normalizeListing(raw: (OwnerListingDetails & { _id?: string }) | null | undefined): OwnerListingDetails | null {
  if (!raw) return null;
  const id = raw.id || raw._id;
  if (!id) return null;
  return { ...raw, id };
}

export async function sellPrivateCoin(
  token: string,
  coinId: string,
  body: SellPrivateListingBody,
): Promise<ApiResult<{ id?: string; listingId?: string }>> {
  const res = await fetch(`${SESSION_ORIGIN}/api/marketplace/sell/private/${encodeURIComponent(coinId)}`, {
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

/** `GET /marketplace/listing/getDetails/:id` with the signed-in user (for `isMyListing`). */
export async function fetchListingDetailsForSession(
  token: string,
  listingId: string,
): Promise<OwnerListingDetails | null> {
  const res = await fetch(
    `${SESSION_ORIGIN}/api/marketplace/listing/getDetails/${encodeURIComponent(listingId)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const json = (await res.json()) as {
    error?: boolean;
    reason?: string;
    data?: (OwnerListingDetails & { _id?: string }) | null;
  };
  if (!res.ok || json.error) {
    if (res.status === 400 || res.status === 404) return null;
    throw new Error(json.reason ?? `Listing details failed (${res.status})`);
  }
  return normalizeListing(json.data);
}

/** `DELETE /marketplace/listing/delete/:id` — remove own listing from the marketplace. */
export async function deleteListing(
  token: string,
  listingId: string,
): Promise<ApiResult<null>> {
  const res = await fetch(
    `${SESSION_ORIGIN}/api/marketplace/listing/delete/${encodeURIComponent(listingId)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    },
  );
  const json = (await res.json()) as { error?: boolean; reason?: string };
  if (!res.ok || json.error) {
    return { error: true, reason: json.reason, _status: res.status };
  }
  return { error: false, data: null };
}

export type MarkListingSoldBody = {
  soldDate?: string;
  soldCurrency?: string;
  soldPrice?: number;
};

/**
 * `PATCH /marketplace/markSold/:id` — owner marks listing sold (archives it).
 * Contract mirrored from antiques-api docs; same path on the catalogue session host.
 */
export async function markListingSold(
  token: string,
  listingId: string,
  body: MarkListingSoldBody = {},
): Promise<ApiResult<null>> {
  const res = await fetch(
    `${SESSION_ORIGIN}/api/marketplace/markSold/${encodeURIComponent(listingId)}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  const json = (await res.json()) as { error?: boolean; reason?: string };
  if (!res.ok || json.error) {
    return { error: true, reason: json.reason, _status: res.status };
  }
  return { error: false, data: null };
}
