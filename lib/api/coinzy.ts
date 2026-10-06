/**
 * Server-side client for the Coinzy backend (docs/coinid-api.md).
 *
 * Every endpoint needs a JWT. The public website has no logged-in user, so we use a
 * guest session from `POST /auth/guest-login` (note: auth routes live at the server root,
 * data routes under `/api`). The token is cached in memory until shortly before its
 * 24h expiry and refreshed once on a 401. It never reaches the browser — only import
 * this module from Server Components / route handlers.
 */

import { unstable_cache } from "next/cache";

/**
 * Two backends: the catalogue lives on `coins-api` (the original host), while real marketplace
 * listings only exist on production (`coins-api-prod`; `coins-api` has none). Each gets its own token.
 */
const ORIGINS = {
  catalogue: process.env.COINZY_API_ORIGIN ?? "https://coins-api.trackzio.com",
  marketplace: process.env.COINZY_MARKETPLACE_API_ORIGIN ?? "https://coins-api-prod.trackzio.com",
};
type Backend = keyof typeof ORIGINS;

const tokens: Partial<Record<Backend, { token: string; expiresAt: number }>> = {};

export class CoinzyApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function jwtExpiry(token: string): number {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
    if (typeof payload.exp === "number") return payload.exp * 1000;
  } catch {
    // fall through to a conservative default
  }
  return Date.now() + 60 * 60 * 1000;
}

async function guestToken(backend: Backend, forceRefresh = false): Promise<string> {
  // Refresh 5 minutes early so a request never goes out with a token about to expire.
  const cached = tokens[backend];
  if (!forceRefresh && cached && cached.expiresAt - 5 * 60 * 1000 > Date.now()) {
    return cached.token;
  }
  const res = await fetch(`${ORIGINS[backend]}/auth/guest-login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    cache: "no-store",
  });
  const json = (await res.json()) as { error?: boolean; token?: string; reason?: string };
  if (!res.ok || json.error || !json.token) {
    throw new Error(`Coinzy guest login failed (${res.status}): ${json.reason ?? "no token"}`);
  }
  tokens[backend] = { token: json.token, expiresAt: jwtExpiry(json.token) };
  return json.token;
}

async function apiFetch<T>(
  path: string,
  init: RequestInit & { revalidate?: number; backend?: Backend } = {},
): Promise<T> {
  const { revalidate = 3600, backend = "catalogue", ...rest } = init;
  const send = async (token: string) =>
    fetch(`${ORIGINS[backend]}/api${path}`, {
      ...rest,
      headers: { "Content-Type": "application/json", ...rest.headers, Authorization: `Bearer ${token}` },
      next: { revalidate },
    });

  let res = await send(await guestToken(backend));
  if (res.status === 401) res = await send(await guestToken(backend, true));
  const json = (await res.json()) as T & { error?: boolean; reason?: string };
  if (!res.ok || json.error) {
    throw new CoinzyApiError(`Coinzy API ${path} failed (${res.status}): ${json.reason ?? "unknown error"}`, res.status);
  }
  return json;
}

export type Archetype = {
  archetypeId: string;
  name: string;
  issuer?: string;
  imageUrls: string[];
};

export type ArchetypePage = {
  items: Archetype[];
  pageNo: number;
  pageSize: number;
  totalCount: number;
};

/** `POST /archetypes/fetchAll` — global catalogue, paginated. `filters` values must be arrays. */
export async function fetchArchetypes({
  pageNo = 0,
  pageSize = 15,
  search,
  filters = {},
}: {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  filters?: Record<string, (string | boolean)[]>;
} = {}): Promise<ArchetypePage> {
  const qs = new URLSearchParams({ pageNo: String(pageNo), pageSize: String(pageSize) });
  if (search) qs.set("search", search);
  const json = await apiFetch<{
    data: Archetype[];
    pagination: { pageNo: number; pageSize: number; totalCount: number };
  }>(`/archetypes/fetchAll?${qs}`, { method: "POST", body: JSON.stringify(filters) });
  return { items: json.data, ...json.pagination };
}

/**
 * `GET /archetypes/filteritems` — distinct values per field (issuer ~10.8k, material ~4.4k).
 * The response is ~0.5 MB, so it is cached for a day in the Next data cache.
 */
export async function fetchFilterValues<F extends string>(fields: F[]): Promise<Record<F, string[]>> {
  const qs = new URLSearchParams(fields.map((f) => [f, "true"]));
  const json = await apiFetch<{ data: Record<F, (string | null)[]> }>(`/archetypes/filteritems?${qs}`, {
    revalidate: 86400,
  });
  const out = {} as Record<F, string[]>;
  for (const f of fields) out[f] = (json.data[f] ?? []).filter((v): v is string => Boolean(v));
  return out;
}

/** `GET /archetypes/getDetails/:id` payload (fields the website renders). Missing values come back as `null`. */
export type ArchetypeDetails = {
  _id: string;
  name: string;
  value: string | null;
  issuer: string | null;
  ruler: string | null;
  rulerType: string | null;
  // Newer archetypes send these as numbers, older ones as strings.
  yearOfMinting: string | number | null;
  currency: string | null;
  shape: string | null;
  rarity: string | null;
  coinType: string | null;
  material: string | null;
  edgeType: string | null;
  technique: string | null;
  weightGrams: string | number | null;
  diameterMm: string | number | null;
  thicknessMm: string | number | null;
  frontDesign: string | null;
  backDesign: string | null;
  inscriptions: string | null;
  context: string | null;
  coinSummary: string | null;
  mintLocation: string | null;
  mintMark: string | null;
  orientation: string | null;
  inCirculation: boolean | null;
  isDemonetized: boolean | null;
  /** Grade code (F, VF, XF, AU, UNC…) → USD range like "3.50-6.70", or a single number (newer archetypes). */
  estimatedPrice: Record<string, string | number> | null;
  imageUrls: string[];
  marketplace?: { buy?: { isAvailable: boolean; listingCount: number } };
};

/**
 * One catalogue coin; `null` when the id is malformed or unknown (→ 404).
 *
 * Cached for a day in the Next data cache, keyed by id only. A plain `fetch` cache would key on the
 * Authorization header too, so every new guest token (daily, and on each server restart) would miss.
 * Errors are not cached; a 404 result (`null`) is.
 */
/** Archetype and listing ids are Mongo ObjectIds. */
export const isArchetypeId = (id: string) => /^[a-f0-9]{24}$/i.test(id);

export const fetchArchetypeDetails = unstable_cache(
  async (id: string): Promise<ArchetypeDetails | null> => {
    if (!isArchetypeId(id)) return null;
    try {
      const json = await apiFetch<{ data: ArchetypeDetails | null }>(`/archetypes/getDetails/${id}`, {
        revalidate: 0,
      });
      return json.data;
    } catch (err) {
      if (err instanceof CoinzyApiError && (err.status === 400 || err.status === 404)) return null;
      throw err;
    }
  },
  ["archetype-details"],
  { revalidate: 86400, tags: ["archetype-details"] },
);

/** Coin facts embedded in a listing (subset of an archetype, plus the seller's own coin notes). */
export type ListingCoinDetails = Pick<
  ArchetypeDetails,
  | "name"
  | "issuer"
  | "ruler"
  | "yearOfMinting"
  | "currency"
  | "shape"
  | "rarity"
  | "material"
  | "edgeType"
  | "technique"
  | "mintLocation"
  | "mintMark"
  | "context"
  | "inCirculation"
  | "weightGrams"
  | "diameterMm"
  | "thicknessMm"
  | "frontDesign"
  | "backDesign"
  | "inscriptions"
  | "imageUrls"
> & { archetypeId: string | null };

/** `GET /marketplace/listing/getDetails/:id` payload (production backend). */
export type ListingDetails = {
  id: string;
  title: string;
  /** Asking price (USD, whole dollars in practice). */
  price: number | string | null;
  gradingScale: string | null;
  /** e.g. "VF-20 to VF-35:Very Fine" */
  gradeValue: string | null;
  gradingAuthority: string | null;
  certificationNumber: string | null;
  strikerType: string | null;
  cleaningAlterations: string[] | null;
  coinCondition: string | null;
  createdAt: string;
  expiresAt: string;
  coinDetails: ListingCoinDetails | null;
  sellerDetails: {
    name: string | null;
    contactEmail: string | null;
    phoneNumber: string | null;
    location: string | null;
    externalLinks: string[] | null;
    bio: string | null;
  } | null;
  imageUrls: string[];
};

/**
 * One marketplace listing; `null` when malformed, unknown or expired (API answers 400 → 404 page).
 * Cached per id for 10 minutes — listings change (price edits, expiry) far more often than archetypes.
 */
export const fetchListingDetails = unstable_cache(
  async (id: string): Promise<ListingDetails | null> => {
    if (!isArchetypeId(id)) return null;
    try {
      const json = await apiFetch<{ data: ListingDetails | null }>(`/marketplace/listing/getDetails/${id}`, {
        backend: "marketplace",
        revalidate: 0,
      });
      return json.data;
    } catch (err) {
      if (err instanceof CoinzyApiError && (err.status === 400 || err.status === 404)) return null;
      throw err;
    }
  },
  ["listing-details"],
  { revalidate: 600, tags: ["listing-details"] },
);

/** Card-level listing from `POST /marketplace/listing/fetchAll`. */
export type ListingSummary = {
  id: string;
  title: string;
  price: number | string | null;
  createdAt: string;
  archetypeId?: string | null;
  imageUrls: string[];
};

/**
 * Every listing matching `filters`/`search`, newest first. The API can only sort by title/price, and the
 * marketplace is small (~200 listings), so we fetch all matches in one request and sort/paginate locally.
 * Cached 5 min per (filters, search), keyed without the token (see `fetchArchetypeDetails`).
 * Revisit if the marketplace grows past a few thousand listings.
 */
export const fetchAllListings = unstable_cache(
  async (filters: Record<string, string[]> = {}, search = ""): Promise<ListingSummary[]> => {
    const qs = new URLSearchParams({ pageNo: "0", pageSize: "1000" });
    if (search) qs.set("search", search);
    const json = await apiFetch<{ data: ListingSummary[] }>(`/marketplace/listing/fetchAll?${qs}`, {
      method: "POST",
      body: JSON.stringify(filters),
      backend: "marketplace",
      revalidate: 0,
    });
    return [...json.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  ["marketplace-listings"],
  { revalidate: 300, tags: ["marketplace-listings"] },
);

/** `GET /marketplace/listing/filterItems` — distinct values per field, cached for an hour. */
export const fetchListingFilterValues = unstable_cache(
  async <F extends string>(fields: F[]): Promise<Record<F, string[]>> => {
    const qs = fields.join("&");
    const json = await apiFetch<{ data: Record<F, (string | null)[]> }>(`/marketplace/listing/filterItems?${qs}`, {
      backend: "marketplace",
      revalidate: 0,
    });
    const out = {} as Record<F, string[]>;
    for (const f of fields) out[f] = (json.data[f] ?? []).filter((v): v is string => Boolean(v));
    return out;
  },
  ["marketplace-filter-items"],
  { revalidate: 3600, tags: ["marketplace-listings"] },
);

/** `GET /archetypes/coins-of-the-day` — three ULTRA_RARE archetypes, cached per calendar day. */
export const fetchCoinsOfTheDay = unstable_cache(
  async (): Promise<ArchetypeDetails[]> => {
    const json = await apiFetch<{ data: ArchetypeDetails[] }>("/archetypes/coins-of-the-day", {
      revalidate: 0,
    });
    return json.data ?? [];
  },
  ["coins-of-the-day"],
  { revalidate: 86400, tags: ["coins-of-the-day"] },
);
