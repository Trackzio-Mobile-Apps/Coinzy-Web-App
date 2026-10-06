/**
 * Catalogue calls that require the visitor's session JWT (`coinzy_session`), not the guest client in `coinzy.ts`.
 * See `PUT /archetypes/wishlist/add/:id` and `DELETE /archetypes/wishlist/remove/:id` in docs/coinid-api.md.
 */

import type { Archetype, ArchetypeDetails, ArchetypePage } from "@/lib/api/coinzy";
import { CoinzyApiError, isArchetypeId } from "@/lib/api/coinzy";

const ORIGIN = process.env.COINZY_API_ORIGIN ?? "https://coins-api.trackzio.com";

async function sessionApiFetch<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${ORIGIN}/api${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...init.headers },
    cache: "no-store",
  });
  const json = (await res.json()) as T & { error?: boolean; reason?: string };
  if (!res.ok || json.error) {
    throw new CoinzyApiError(`Coinzy API ${path} failed (${res.status}): ${json.reason ?? "unknown error"}`, res.status);
  }
  return json;
}

export type SessionArchetype = Archetype & { isWishlisted?: boolean };

/** `POST /archetypes/fetchAll` with the user's bearer token (includes `isWishlisted` per item). */
export async function fetchArchetypesForSession({
  token,
  pageNo = 0,
  pageSize = 15,
  search,
  filters = {},
}: {
  token: string;
  pageNo?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, (string | boolean)[]>;
}): Promise<ArchetypePage & { items: SessionArchetype[] }> {
  const qs = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  if (search) qs.set("search", search);
  const json = await sessionApiFetch<{
    data: SessionArchetype[];
    pagination: { pageNo: number; pageSize: number; totalCount: number };
  }>(token, `/archetypes/fetchAll?${qs}`, { method: "POST", body: JSON.stringify(filters) });
  return { items: json.data, ...json.pagination };
}

export type SessionArchetypeDetails = ArchetypeDetails & { isWishlisted?: boolean };

/** `GET /archetypes/getDetails/:id` with the user's bearer token. */
export async function fetchArchetypeDetailsForSession(id: string, token: string): Promise<SessionArchetypeDetails | null> {
  if (!isArchetypeId(id)) return null;
  try {
    const json = await sessionApiFetch<{ data: SessionArchetypeDetails | null }>(token, `/archetypes/getDetails/${id}`);
    return json.data;
  } catch (err) {
    if (err instanceof CoinzyApiError && (err.status === 400 || err.status === 404)) return null;
    throw err;
  }
}

/** `PUT /archetypes/wishlist/add/:id` */
export async function addArchetypeToWishlist(archetypeId: string, token: string): Promise<void> {
  await sessionApiFetch(token, `/archetypes/wishlist/add/${archetypeId}`, { method: "PUT" });
}

/** `DELETE /archetypes/wishlist/remove/:id` */
export async function removeArchetypeFromWishlist(archetypeId: string, token: string): Promise<void> {
  await sessionApiFetch(token, `/archetypes/wishlist/remove/${archetypeId}`, { method: "DELETE" });
}

/** `POST /ai/identify-v2` — multipart `files` (2 images). */
export async function identifyCoinV2(
  token: string,
  files: Blob[],
  matchCount = 5,
): Promise<
  | { error: false; data: { imageUrls: string[]; matchesFoundCount: number; matches: unknown[] } }
  | { error: true; reason?: string; aiErrorCode?: string; resetsAt?: number; _status: number }
> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  const res = await fetch(`${ORIGIN}/api/ai/identify-v2?matchCount=${matchCount}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
    cache: "no-store",
  });
  const json = (await res.json()) as {
    error?: boolean;
    data?: { imageUrls: string[]; matchesFoundCount: number; matches: unknown[] };
    reason?: string;
    aiErrorCode?: string;
    resetsAt?: number;
  };
  if (!res.ok || json.error) {
    return {
      error: true,
      reason: json.reason,
      aiErrorCode: json.aiErrorCode,
      resetsAt: json.resetsAt,
      _status: res.status,
    };
  }
  if (!json.data) {
    return { error: true, reason: "Empty identification response.", _status: 502 };
  }
  return { error: false, data: json.data };
}

export type SessionCollectionRow = {
  collectionId: string;
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  representativeImages?: string[];
  coinCount?: number;
};

/** `GET /api/collections/fetchAll` */
export async function fetchCollectionsForSession(
  token: string,
  pageNo = 0,
  pageSize = 50,
): Promise<
  | {
      error: false;
      data: SessionCollectionRow[];
      ownedCount: number;
      identifiedCount: number;
      wishlistedCount: number;
    }
  | { error: true; reason?: string; _status: number }
> {
  const qs = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  const res = await fetch(`${ORIGIN}/api/collections/fetchAll?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = (await res.json()) as {
    error?: boolean;
    data?: SessionCollectionRow[];
    reason?: string;
    ownedCount?: number;
    identifiedCount?: number;
    wishlistedCount?: number;
  };
  if (!res.ok || json.error) {
    return { error: true, reason: json.reason, _status: res.status };
  }
  return {
    error: false,
    data: json.data ?? [],
    ownedCount: json.ownedCount ?? 0,
    identifiedCount: json.identifiedCount ?? 0,
    wishlistedCount: json.wishlistedCount ?? 0,
  };
}

export type UserCoinRow = {
  coinId: string;
  name: string;
  issuer?: string | null;
  yearOfMinting?: string | number | null;
  imageUrls?: string[];
  archetypeId?: string | null;
  isOwned?: boolean;
  isIdentified?: boolean;
  isWishlisted?: boolean;
};

/** `GET /coin/getDetails/:id` — one coin in the user's private collection. */
export type UserCoinDetails = {
  coinId: string;
  name: string;
  issuer?: string | null;
  yearOfMinting?: string | number | null;
  currency?: string | null;
  ruler?: string | null;
  shape?: string | null;
  rarity?: string | null;
  estimatedPrice?: number | null;
  weightGrams?: number | null;
  diameterMm?: number | null;
  thicknessMm?: number | null;
  material?: string | null;
  edgeType?: string | null;
  technique?: string | null;
  mintMark?: string | null;
  frontDesign?: string | null;
  backDesign?: string | null;
  inscriptions?: string | null;
  context?: string | null;
  mintLocation?: string | null;
  inCirculation?: boolean | null;
  imageUrls?: string[];
  archetypeId?: string | null;
  isOwned?: boolean;
  isIdentified?: boolean;
  isWishlisted?: boolean;
  marketplace?: ArchetypeDetails["marketplace"];
};

function normalizeUserCoin(raw: Record<string, unknown>): UserCoinDetails {
  const id = (raw.coinId ?? raw._id ?? "") as string;
  return { ...raw, coinId: id, name: String(raw.name ?? "") } as UserCoinDetails;
}

export async function fetchUserCoinDetails(
  token: string,
  coinId: string,
): Promise<{ error: false; data: UserCoinDetails } | { error: true; reason?: string; _status: number }> {
  const res = await fetch(`${ORIGIN}/api/coin/getDetails/${encodeURIComponent(coinId)}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = (await res.json()) as { error?: boolean; data?: Record<string, unknown>; reason?: string };
  if (!res.ok || json.error || !json.data) {
    return { error: true, reason: json.reason, _status: res.status };
  }
  return { error: false, data: normalizeUserCoin(json.data) };
}

/** `GET /api/coin/filteritems` — distinct values for the user's coins. */
export async function fetchUserCoinFilters(
  token: string,
  fields: string[],
): Promise<Record<string, string[]>> {
  const qs = fields.join("&");
  const res = await fetch(`${ORIGIN}/api/coin/filteritems?${qs}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = (await res.json()) as { error?: boolean; data?: Record<string, (string | null)[]> };
  if (!res.ok || json.error || !json.data) return {};
  const out: Record<string, string[]> = {};
  for (const [key, values] of Object.entries(json.data)) {
    out[key] = (values ?? []).filter((v): v is string => typeof v === "string" && v.length > 0).slice(0, 12);
  }
  return out;
}

/** `POST /api/coin/fetchAll` — user's private coins. */
export async function fetchUserCoins(
  token: string,
  opts: {
    pageNo?: number;
    pageSize?: number;
    search?: string;
    filters?: Record<string, (string | boolean)[]>;
  },
): Promise<
  | { error: false; data: UserCoinRow[]; totalCount: number }
  | { error: true; reason?: string; _status: number }
> {
  const qs = new URLSearchParams({
    pageNo: String(opts.pageNo ?? 0),
    pageSize: String(opts.pageSize ?? 20),
  });
  if (opts.search) qs.set("search", opts.search);
  const res = await fetch(`${ORIGIN}/api/coin/fetchAll?${qs}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(opts.filters ?? {}),
    cache: "no-store",
  });
  const json = (await res.json()) as {
    error?: boolean;
    data?: UserCoinRow[];
    reason?: string;
    pagination?: { totalCount?: number };
  };
  if (!res.ok || json.error) return { error: true, reason: json.reason, _status: res.status };
  const data = (json.data ?? []).map((row) => {
    const r = row as UserCoinRow & { _id?: string };
    return { ...r, coinId: r.coinId ?? r._id ?? "" };
  });
  return { error: false, data, totalCount: json.pagination?.totalCount ?? json.data?.length ?? 0 };
}

/** `POST /coin/add` */
export async function addCoinToCollection(
  token: string,
  body: Record<string, unknown>,
): Promise<{ error: false; data: unknown } | { error: true; reason?: string; _status: number }> {
  const res = await fetch(`${ORIGIN}/api/coin/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  const json = (await res.json()) as { error?: boolean; data?: unknown; reason?: string };
  if (!res.ok || json.error) {
    return { error: true, reason: json.reason, _status: res.status };
  }
  return { error: false, data: json.data };
}
