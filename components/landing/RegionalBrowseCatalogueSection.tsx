"use client";

import { BrowseCatalogueSection } from "./BrowseCatalogueSection";
import { INDIA_CATEGORIES, MARKETPLACE_PAGE_CATEGORIES } from "@/lib/constants";
import { useVisitorRegion } from "@/lib/useVisitorRegion";

const WORLD_CATEGORIES = [
  { ...MARKETPLACE_PAGE_CATEGORIES[1], title: "Rare American coins", coin: "/assets/landing-page/05-browse-catalogue/world-rare-american.webp", href: "/catalogue/rare-american-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[0], title: "World coins", coin: "/assets/landing-page/05-browse-catalogue/world-coins.webp", href: "/catalogue" },
  { ...MARKETPLACE_PAGE_CATEGORIES[2], title: "Commemorative US coins", coin: "/assets/landing-page/05-browse-catalogue/world-commemorative.webp", href: "/catalogue/commemorative-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[3], title: "American Gold coins", coin: "/assets/landing-page/05-browse-catalogue/world-american-gold.webp", href: "/catalogue/us-gold-coins" },
];

export function RegionalBrowseCatalogueSection() {
  const region = useVisitorRegion();
  return <BrowseCatalogueSection categories={region === "rest-of-world" ? WORLD_CATEGORIES : INDIA_CATEGORIES} />;
}
