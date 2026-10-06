import { fetchAllListings, fetchListingFilterValues, type ListingSummary } from "@/lib/api/coinzy";
import { formatPrice } from "@/lib/catalogue/coinDetails";

/**
 * Marketplace listing pages (`/marketplace/[slug]`, Figma 793:77612 "CoinListings").
 *
 * Same idea as `lib/catalogue/categories.ts`: listing filters need exact values, and sellers' data
 * spells issuers/materials many ways, so each category is described with patterns resolved against
 * `GET /marketplace/listing/filterItems`. An empty resolution means "no listings in this category".
 */
type MarketplaceCategoryDef = {
  title: string;
  /** Breadcrumb label (Figma: "Marketplace › Ancient Roman coins"). */
  crumb: string;
  issuer?: RegExp;
  /** Issuers to leave out (e.g. "world" = everything that isn't US). */
  issuerExclude?: RegExp;
  material?: RegExp;
  rarity?: string[];
  years?: [number, number];
  search?: string;
};

const US = /united states|\bamerica\b|\(us territories|oregon/i;
const INDIA = /\bindia\b|\bindian\b|gwalior|hyderabad|east india company/i;
// Same UK patterns as the catalogue; "British India" is intentionally *not* British coins.
const UK = /^(United Kingdom|Great Britain|Kingdom of Great Britain|England|Kingdom of England)\b|\(United Kingdom/;
const GOLD = /^gold\b/i;
const SILVER = /silver/i;

export const MARKETPLACE_CATEGORIES = {
  all: { title: "All listings", crumb: "All listings" },
  "world-coins": { title: "World coins", crumb: "World coins", issuer: /./, issuerExclude: US },
  "rare-coins": { title: "Rare coins", crumb: "Rare coins", rarity: ["RARE", "ULTRA_RARE"] },
  "us-coins": { title: "US coins", crumb: "US coins", issuer: US },
  "us-gold-coins": { title: "US gold coins", crumb: "US gold coins", issuer: US, material: GOLD },
  "roman-coins": { title: "Ancient Roman coins", crumb: "Ancient Roman coins", issuer: /\bRoman\b/ },
  "american-coins": { title: "American coins", crumb: "American coins", issuer: US },
  // Home dashboard chip (Figma 1898:205770 labels it "British coins"). Empty until a UK-issuer listing exists.
  "british-coins": { title: "British coins", crumb: "British coins", issuer: UK },
  "wheat-pennies": {
    title: "Wheat pennies",
    crumb: "Wheat pennies",
    issuer: US,
    years: [1909, 1958],
    search: "Lincoln",
  },
  "gold-coins": { title: "Gold coins", crumb: "Gold coins", material: GOLD },
  "silver-coins": { title: "Silver coins", crumb: "Silver coins", material: SILVER },
  "indian-coins": { title: "Indian coins", crumb: "Indian coins", issuer: INDIA },
} satisfies Record<string, MarketplaceCategoryDef>;

export type MarketplaceSlug = keyof typeof MARKETPLACE_CATEGORIES;

export function getMarketplaceCategory(slug: string): (MarketplaceCategoryDef & { slug: MarketplaceSlug }) | null {
  return slug in MARKETPLACE_CATEGORIES
    ? { slug: slug as MarketplaceSlug, ...MARKETPLACE_CATEGORIES[slug as MarketplaceSlug] }
    : null;
}

/** Card data for listing grids and the marketplace page rows. */
export type ListingCard = {
  id: string;
  href: string;
  title: string;
  price: string | null;
  /** Front + back photos (seller uploads). */
  images: string[];
  /** Catalogue entry the seller's coin was identified as (source of year / issuer / rarity). */
  archetypeId: string | null;
};

const toCard = (l: ListingSummary): ListingCard => ({
  id: l.id,
  href: `/marketplace/listing/${l.id}`,
  title: l.title,
  price: formatPrice(l.price),
  images: l.imageUrls.filter(Boolean),
  archetypeId: l.archetypeId ?? null,
});

/** Resolve a category into the `fetchAll` body; `null` = a filter matched no values (empty category). */
async function buildListingFilters(def: MarketplaceCategoryDef): Promise<Record<string, string[]> | null> {
  const filters: Record<string, string[]> = {};
  if (def.rarity) filters.rarity = def.rarity;
  if (!def.issuer && !def.material && !def.years) return filters;

  const values = await fetchListingFilterValues(["issuer", "material", "yearOfMinting"]);
  if (def.issuer) {
    filters.issuer = values.issuer.filter((v) => def.issuer!.test(v) && !(def.issuerExclude?.test(v) ?? false));
  }
  if (def.material) filters.material = values.material.filter((v) => def.material!.test(v) && !/plated/i.test(v));
  if (def.years) {
    const [from, to] = def.years;
    filters.yearOfMinting = values.yearOfMinting.filter((v) => /^\d{4}$/.test(v) && +v >= from && +v <= to);
  }
  return Object.values(filters).some((v) => v.length === 0) ? null : filters;
}

/**
 * One page of a category, newest first, optionally narrowed by a text `search`. Throws if the API is down
 * (callers show an error state, never sample listings).
 *
 * `POST /marketplace/listing/fetchAll?search=` is a case-insensitive **whole-word** match on the title
 * (plurals fold: "Cent" = "Cents"; several words are OR-ed; "Linc" matches nothing). A category's own
 * `search` (wheat pennies → "Lincoln") takes the API slot when there is no visitor query; with one, the
 * visitor's term goes to the API and the category word is applied to the titles afterwards.
 */
export async function loadListingPage(
  def: MarketplaceCategoryDef,
  page: number,
  pageSize: number,
  search = "",
): Promise<{ cards: ListingCard[]; totalCount: number; totalPages: number; page: number }> {
  const filters = await buildListingFilters(def);
  let all = filters ? await fetchAllListings(filters, search || def.search || "") : [];
  if (search && def.search) {
    const needle = def.search.toLowerCase();
    all = all.filter((l) => l.title.toLowerCase().includes(needle));
  }
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    cards: all.slice((current - 1) * pageSize, current * pageSize).map(toCard),
    totalCount: all.length,
    totalPages,
    page: current,
  };
}

/**
 * Signed-in marketplace browse (`1356:154252`): category slug + title search + optional issuer filters from the URL.
 */
export async function loadSignedInBrowse({
  categorySlug,
  search,
  page,
  pageSize,
  issuerFilters = [],
}: {
  categorySlug?: string;
  search: string;
  page: number;
  pageSize: number;
  issuerFilters?: string[];
}): Promise<{ cards: ListingCard[]; totalCount: number; totalPages: number; page: number }> {
  const slug =
    categorySlug && categorySlug in MARKETPLACE_CATEGORIES ? (categorySlug as MarketplaceSlug) : "all";
  const def = MARKETPLACE_CATEGORIES[slug];
  const built = await buildListingFilters(def);
  let issuerList: string[] | undefined;
  if (issuerFilters.length) {
    issuerList =
      built?.issuer?.length
        ? built.issuer.filter((i) => issuerFilters.includes(i))
        : issuerFilters;
    if (!issuerList.length) return { cards: [], totalCount: 0, totalPages: 1, page: 1 };
  }
  const filters: Record<string, string[]> = { ...(built ?? {}), ...(issuerList ? { issuer: issuerList } : {}) };
  if (!built && slug !== "all" && !issuerFilters.length) {
    return { cards: [], totalCount: 0, totalPages: 1, page: 1 };
  }
  const categorySearch = "search" in def ? def.search : undefined;
  let all = await fetchAllListings(filters, search || categorySearch || "");
  if (search && categorySearch) {
    const needle = categorySearch.toLowerCase();
    all = all.filter((l) => l.title.toLowerCase().includes(needle));
  }
  const totalPages = Math.max(1, Math.ceil(all.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    cards: all.slice((current - 1) * pageSize, current * pageSize).map(toCard),
    totalCount: all.length,
    totalPages,
    page: current,
  };
}

/** Newest `n` listings with both photos (for the marketplace page rows); empty on API failure. */
export async function loadListingRow(slug: MarketplaceSlug, n: number): Promise<ListingCard[]> {
  try {
    const { cards } = await loadListingPage(MARKETPLACE_CATEGORIES[slug], 1, 200);
    return cards.filter((c) => c.images.length > 0).slice(0, n);
  } catch (err) {
    console.error(err);
    return [];
  }
}
