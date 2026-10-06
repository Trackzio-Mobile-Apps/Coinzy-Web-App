/** Marketplace listing filter fields (`GET /marketplace/listing/filterItems`, `POST …/fetchAll` body). */

export const LISTING_FILTER_FIELDS = [
  "issuer",
  "ruler",
  "material",
  "shape",
  "yearOfMinting",
  "mintLocation",
  "rarity",
] as const;

export type ListingFilterField = (typeof LISTING_FILTER_FIELDS)[number];

export type ListingFilterValues = Record<ListingFilterField, string[]>;

export type ListingFilterSelection = Partial<Record<ListingFilterField, string[]>>;

export function parseListingFilterParams(
  searchParams: Record<string, string | string[] | undefined>,
): ListingFilterSelection {
  const out: ListingFilterSelection = {};
  for (const key of LISTING_FILTER_FIELDS) {
    const raw = searchParams[key];
    const values = (Array.isArray(raw) ? raw : raw ? [raw] : [])
      .map((s) => s.trim())
      .filter(Boolean);
    if (values.length) out[key] = values;
  }
  return out;
}

/** Keep `q`, `category`, `premium`; drop filter keys and reset page. */
export function clearFiltersHref(params: URLSearchParams): string {
  const next = new URLSearchParams();
  const q = params.get("q");
  const category = params.get("category");
  const premium = params.get("premium");
  if (q) next.set("q", q);
  if (category) next.set("category", category);
  if (premium) next.set("premium", premium);
  const s = next.toString();
  return s ? `/marketplace?${s}` : "/marketplace";
}

export function toggleFilterHref(base: URLSearchParams, field: ListingFilterField, value: string): string {
  const next = new URLSearchParams(base);
  const all = next.getAll(field);
  if (all.includes(value)) next.delete(field, value);
  else next.append(field, value);
  next.delete("page");
  const q = next.toString();
  return q ? `/marketplace?${q}` : "/marketplace";
}
