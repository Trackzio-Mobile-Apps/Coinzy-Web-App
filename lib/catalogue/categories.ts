import { fetchFilterValues } from "@/lib/api/coinzy";

/**
 * Catalogue "view all" pages (`/catalogue/[slug]`, Figma 797:33107).
 *
 * The archetypes API only filters on exact values, and the data spells the same thing many
 * ways ("Mughal Empire", "Mughals", "MUGHAL EMPIRE"; 800+ gold alloys). So each category is
 * described with patterns that are resolved against the real distinct values from
 * `GET /archetypes/filteritems`, and the matching values are sent as the filter arrays.
 */
type CategoryDef = {
  title: string;
  description: string;
  /** Short name used in the breadcrumb. */
  crumb: string;
  issuer?: RegExp;
  material?: RegExp;
  rarity?: string[];
  inCirculation?: boolean[];
};

const US = /^(United States|USA)\b|\(United States/;
// Indian issuers, excluding European trading companies/colonies that merely mention India.
const INDIA = /\bIndia\b|\bIndian\b/;
const INDIA_EXCLUDE = /VOC|Dutch|French|Danish|Portuguese/;
const UK = /^(United Kingdom|Great Britain|Kingdom of Great Britain|England|Kingdom of England)\b|\(United Kingdom/;
const GOLD = /^gold\b/i;
const SILVER = /^silver\b/i;
const ROMAN = /^Roman (Empire|Republic)|^(Western|Eastern) Roman Empire|Roman Imperial/;
const RARE = ["RARE", "ULTRA_RARE"];

export const CATALOGUE_CATEGORIES = {
  all: {
    title: "All coins",
    crumb: "All coins",
    description: "Every coin in the Coinzy global catalogue",
  },
  "american-coins": {
    title: "American coins",
    crumb: "American coins",
    description: "Explore coins issued in the United States",
    issuer: US,
  },
  "british-coins": {
    title: "British coins",
    crumb: "British coins",
    description: "Explore coins from England and the United Kingdom",
    issuer: UK,
  },
  "rare-coins": {
    title: "Rare coins",
    crumb: "Rare coins",
    description: "Rare and ultra-rare coins from around the world",
    rarity: RARE,
  },
  "gold-coins": {
    title: "Gold coins",
    crumb: "Gold coins",
    description: "Coins struck in gold, from every era",
    material: GOLD,
  },
  "ancient-roman-coins": {
    title: "Ancient Roman coins",
    crumb: "Roman coins",
    description: "Explore popular coins from ancient Roman era",
    issuer: ROMAN,
  },
  // US row on /catalogue
  "rare-american-coins": {
    title: "Rare American coins",
    crumb: "Rare American coins",
    description: "Rare and ultra-rare coins issued in the United States",
    issuer: US,
    rarity: RARE,
  },
  "commemorative-coins": {
    title: "Commemorative coins",
    crumb: "Commemorative coins",
    description: "US commemorative and non-circulating issues",
    issuer: US,
    inCirculation: [false],
  },
  "us-gold-coins": {
    title: "US gold coins",
    crumb: "Gold coins",
    description: "Gold coins issued in the United States",
    issuer: US,
    material: GOLD,
  },
  "us-silver-coins": {
    title: "US silver coins",
    crumb: "Silver coins",
    description: "Silver coins issued in the United States",
    issuer: US,
    material: SILVER,
  },
  // Indian row on /catalogue
  "indian-coins": {
    title: "Indian coins",
    crumb: "Indian coins",
    description: "Coins from ancient India to the Republic of India",
    issuer: INDIA,
  },
  "rare-indian-coins": {
    title: "Rare Indian coins",
    crumb: "Rare Indian coins",
    description: "Rare and ultra-rare coins from India",
    issuer: INDIA,
    rarity: RARE,
  },
  "mughal-coins": {
    title: "Mughal coins",
    crumb: "Mughal coins",
    description: "Coins of the Mughal Empire",
    issuer: /mughal/i,
  },
  "commemorative-indian-coins": {
    title: "Commemorative Indian coins",
    crumb: "Commemorative coins",
    description: "Indian commemorative and non-circulating issues",
    issuer: INDIA,
    inCirculation: [false],
  },
  "indian-gold-coins": {
    title: "Indian Gold coins",
    crumb: "Gold coins",
    description: "Gold coins from India",
    issuer: INDIA,
    material: GOLD,
  },
} satisfies Record<string, CategoryDef>;

export type CategorySlug = keyof typeof CATALOGUE_CATEGORIES;

/** Filter chips shown on every view-all page (Figma: All · American · British · Rare · Gold). */
export const CATALOGUE_CHIPS: CategorySlug[] = ["all", "american-coins", "british-coins", "rare-coins", "gold-coins"];

export function getCategory(slug: string): (CategoryDef & { slug: CategorySlug }) | null {
  return slug in CATALOGUE_CATEGORIES
    ? { slug: slug as CategorySlug, ...CATALOGUE_CATEGORIES[slug as CategorySlug] }
    : null;
}

/** Resolve a category's patterns into the exact-value filter body for `POST /archetypes/fetchAll`. */
export async function buildFilters(def: CategoryDef): Promise<Record<string, (string | boolean)[]>> {
  const filters: Record<string, (string | boolean)[]> = {};
  if (def.rarity) filters.rarity = def.rarity;
  if (def.inCirculation) filters.inCirculation = def.inCirculation;
  if (def.issuer || def.material) {
    const values = await fetchFilterValues(["issuer", "material"]);
    if (def.issuer) {
      filters.issuer = values.issuer.filter(
        (v) => def.issuer!.test(v) && !(def.issuer === INDIA && INDIA_EXCLUDE.test(v)),
      );
    }
    if (def.material) {
      // Plated base metals are not gold/silver coins.
      filters.material = values.material.filter((v) => def.material!.test(v) && !/plated/i.test(v));
    }
  }
  return filters;
}
