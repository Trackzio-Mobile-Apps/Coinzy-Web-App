import type { SessionCollectionRow } from "@/lib/api/coinzy-session";

export const COLLECTION_COIN_LIMIT = 100;

export type CollectionBucket = "owned" | "identified" | "wishlist";

export type CollectionNavIcon = "owned" | "identified" | "wishlist" | "private";

export type CollectionNavLink = {
  href: string;
  label: string;
  icon: CollectionNavIcon;
  active?: boolean;
};

export function collectionLinks(rows: SessionCollectionRow[], current: string): CollectionNavLink[] {
  const system: CollectionNavLink[] = [
    { href: "/collection/owned", label: "Owned", icon: "owned" },
    { href: "/collection/identified", label: "Identified", icon: "identified" },
    { href: "/collection/wishlist", label: "Wishlist", icon: "wishlist" },
  ];
  const priv: CollectionNavLink[] = rows
    .filter((r) => !(r.name === "Identified" && (r.description ?? "").toLowerCase().includes("auto created")))
    .map((r) => ({
      href: `/collection/c/${r.collectionId}`,
      label: r.name,
      icon: "private" as const,
    }));
  return [...system, ...priv].map((item) => ({
    ...item,
    active: item.href.endsWith(`/${current}`) || item.href.endsWith(`/c/${current}`),
  }));
}
