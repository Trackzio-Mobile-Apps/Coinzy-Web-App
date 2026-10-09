import type { HomeNavItem } from "@/lib/home";

export type SidebarActive =
  | "home"
  | "identify"
  | "expert"
  | "marketplace"
  | "catalogue"
  | "collection"
  | "feed"
  | "settings";

/** Sidebar items for signed-in app shells (`/home`, `/marketplace`, `/catalogue`, `/feed`, `/settings`, `/experts`). */
export function sidebarNav(active: SidebarActive): HomeNavItem[] {
  return [
    { label: "Home", href: "/home", icon: "home", active: active === "home" },
    { label: "Identify coin", href: "/identify", icon: "identify", active: active === "identify" },
    { label: "Expert analysis", href: "/experts", icon: "expert", active: active === "expert" },
    { label: "Marketplace", href: "/marketplace", icon: "marketplace", chevron: true, active: active === "marketplace" },
    { label: "Collection", href: "/collection", icon: "collection", chevron: true, active: active === "collection" },
    { label: "Feed", href: "/feed", icon: "feed", active: active === "feed" },
    { label: "Global Catalogue", href: "/catalogue", icon: "catalogue", active: active === "catalogue" },
    { label: "Settings", href: "/settings", icon: "settings", active: active === "settings" },
  ];
}
