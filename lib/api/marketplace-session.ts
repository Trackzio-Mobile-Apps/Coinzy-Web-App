/**
 * Marketplace mutations (and owner-scoped reads) with the visitor's session JWT (`coinzy_session`).
 * Anonymous catalogue/marketplace reads stay on guest tokens in `lib/api/coinzy.ts`.
 *
 * Sell / owner listing / delete / myListingsOnly must hit the **same host as auth + private coins**
 * (`COINZY_API_ORIGIN`). Android uses one BASE_URL for both. Posting sell to
 * `COINZY_MARKETPLACE_API_ORIGIN` (prod browse host) with a catalogue session returns
 * 404 "Coin not found or you don't own this coin" because that coin inventory lives on catalogue.
 */

import type { ListingDetails } from "@/lib/api/coinzy";
import { resolveCatalogueOrigin } from "@/lib/api/catalogue-origin";

/** Session marketplace host = catalogue/auth origin (defaults to prod coins-api-prod.trackzio.com). */
const getSessionOrigin = () => resolveCatalogueOrigin();

/** Card row from session `POST …/listing/fetchAll` (Android `myListingsOnly`). */
export type SessionListingSummary = {
  id: string;
  title: string;
  price: number | string | null;
  createdAt: string;
  archetypeId?: string | null;
  imageUrls: string[];
  isMyListing?: boolean;
  coinId?: string | null;
};

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
  const res = await fetch(`${getSessionOrigin()}/api/marketplace/sell/private/${encodeURIComponent(coinId)}`, {
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

/**
 * Android `MarketListScreen` — `POST /marketplace/listing/fetchAll?myListingsOnly=true`
 * with the session JWT (guest tokens never return the owner's listings).
 */
export async function fetchMyListings(
  token: string,
  filters: Record<string, string[]> = {},
): Promise<{ listings: SessionListingSummary[]; totalCount: number }> {
  const qs = new URLSearchParams({
    pageNo: "0",
    pageSize: "100",
    myListingsOnly: "true",
  });
  const res = await fetch(`${getSessionOrigin()}/api/marketplace/listing/fetchAll?${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(filters),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    error?: boolean;
    reason?: string;
    data?: Array<SessionListingSummary & { _id?: string }>;
    pagination?: { totalCount?: number };
  };
  if (!res.ok || json.error) {
    throw new Error(json.reason ?? `My listings failed (${res.status})`);
  }
  const rows: SessionListingSummary[] = [];
  for (const raw of json.data ?? []) {
    const id = raw.id || raw._id;
    if (!id) continue;
    rows.push({
      id,
      title: raw.title,
      price: raw.price ?? null,
      // API may omit createdAt on some owner rows — never throw in sort (silent catch → empty UI).
      createdAt: typeof raw.createdAt === "string" ? raw.createdAt : "",
      archetypeId: raw.archetypeId ?? null,
      imageUrls: Array.isArray(raw.imageUrls) ? raw.imageUrls.filter(Boolean) : [],
      isMyListing: raw.isMyListing,
      coinId: raw.coinId ?? null,
    });
  }
  const listings = rows.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
  const totalCount = json.pagination?.totalCount ?? listings.length;
  return { listings, totalCount };
}

/** `GET /marketplace/listing/getDetails/:id` with the signed-in user (for `isMyListing`). */
export async function fetchListingDetailsForSession(
  token: string,
  listingId: string,
): Promise<OwnerListingDetails | null> {
  const res = await fetch(
    `${getSessionOrigin()}/api/marketplace/listing/getDetails/${encodeURIComponent(listingId)}`,
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
    `${getSessionOrigin()}/api/marketplace/listing/delete/${encodeURIComponent(listingId)}`,
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
    `${getSessionOrigin()}/api/marketplace/markSold/${encodeURIComponent(listingId)}`,
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
