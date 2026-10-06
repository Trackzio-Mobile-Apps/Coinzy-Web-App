import type { HomeNavItem } from "@/lib/home";

/** Sidebar items for signed-in app shells (`/home`, `/marketplace`, `/catalogue`). */
export function sidebarNav(active: "home" | "identify" | "marketplace" | "catalogue"): HomeNavItem[] {
  return [
    { label: "Home", href: "/home", icon: "home", active: active === "home" },
    { label: "Identify coin", href: "/identify", icon: "identify", active: active === "identify" },
    { label: "Expert analysis", icon: "expert", soon: true },
    { label: "Marketplace", href: "/marketplace", icon: "marketplace", chevron: true, active: active === "marketplace" },
    { label: "Collection", icon: "collection", chevron: true, soon: true },
    { label: "Feed", icon: "feed", soon: true },
    { label: "Global Catalogue", href: "/catalogue", icon: "catalogue", active: active === "catalogue" },
    { label: "Settings", icon: "settings", soon: true },
  ];
}
