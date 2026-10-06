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
