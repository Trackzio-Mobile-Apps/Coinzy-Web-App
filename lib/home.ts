/** Signed-in free-user home (Figma `1898:205770` / Webapp `1242:101939`). */

/**
 * Sidebar entries. Items with `href` are real routes; `soon: true` items have no page yet and render
 * as disabled (don't point them at `#` anchors or redirecting routes — add the `href` when the page ships).
 */
export const HOME_NAV: readonly HomeNavItem[] = [
  { label: "Home", href: "/home", icon: "home", active: true },
  { label: "Identify coin", icon: "identify", soon: true },
  { label: "Expert analysis", icon: "expert", soon: true },
  { label: "Marketplace", href: "/marketplace", icon: "marketplace", chevron: true },
  { label: "Collection", icon: "collection", chevron: true, soon: true },
  { label: "Feed", icon: "feed", soon: true },
  { label: "Global Catalogue", href: "/catalogue", icon: "catalogue" },
  { label: "Settings", icon: "settings", soon: true },
];

export type HomeNavIcon =
  | "home"
  | "identify"
  | "expert"
  | "marketplace"
  | "collection"
  | "feed"
  | "catalogue"
  | "settings";

export type HomeNavItem = {
  label: string;
  icon: HomeNavIcon;
  href?: string;
  active?: boolean;
  chevron?: boolean;
  soon?: boolean;
};

export const MARKETPLACE_CHIPS = [
  { label: "All", slug: "all" },
  { label: "American coins", slug: "american-coins" },
  { label: "British coins", slug: "world-coins" },
  { label: "Rare coins", slug: "rare-coins" },
  { label: "Gold coins", slug: "gold-coins" },
] as const;

/** Figma static browse rows when live listings are unavailable. */
export const HOME_MARKETPLACE_FALLBACK = [
  {
    id: undefined as string | undefined,
    name: "Indian Head Cent",
    year: "1907",
    issuer: "United States",
    rarity: "Common",
    rarityTone: "muted" as const,
    price: "$2,500",
    image: "/assets/home/coin-listing-1.png",
  },
  {
    id: undefined as string | undefined,
    name: "Liberty Double Eagle",
    year: "1907",
    issuer: "United States",
    rarity: "Very rare",
    rarityTone: "warn" as const,
    price: "$1,200",
    image: "/assets/home/coin-listing-2.png",
  },
  {
    id: undefined as string | undefined,
    name: "Denarius — Julius Caesar",
    year: "44 BC",
    issuer: "Ancient Rome",
    rarity: "Rare",
    rarityTone: "info" as const,
    price: "$5,700",
    image: "/assets/home/coin-listing-3.png",
  },
  {
    id: undefined as string | undefined,
    name: "Denarius — Julius Caesar",
    year: "44 BC",
    issuer: "Ancient Rome",
    rarity: "Rare",
    rarityTone: "info" as const,
    price: "$910",
    image: "/assets/home/coin-listing-4.png",
  },
];

export const HOME_CATALOGUE_FALLBACK = [
  { id: undefined as string | undefined, name: "1909 - Small VDB Lincoln cent", price: "Est. $700 – $2,500", image: "/assets/home/catalogue-1.png" },
  { id: undefined as string | undefined, name: "1909 - Small VDB Lincoln cent", price: "Est. $700 – $2,500", image: "/assets/home/catalogue-2.png" },
  { id: undefined as string | undefined, name: "1909 - Small VDB Lincoln cent", price: "Est. $700 – $2,500", image: "/assets/home/catalogue-3.png" },
];

export const HOME_OTHER_APPS = [
  {
    name: "Banknote AI",
    description: "Identify banknotes using Banknote AI",
    icon: "/assets/other-apps/banknote-icon.png",
    href: "https://play.google.com/store/apps/details?id=com.trackzio.banknote",
  },
  {
    name: "Habit Eazy",
    description: "Build better habits with Habit Eazy",
    icon: "/assets/other-apps/habit-eazy-icon.png",
    href: "https://play.google.com/store/apps/details?id=com.progresspal",
  },
  {
    name: "Antique Lens",
    description: "Identify antiques using Antiqzy AI",
    icon: "/assets/other-apps/antiqzy-icon.png",
    href: "https://play.google.com/store/apps/details?id=com.trackzio.antiquevintage",
  },
];
