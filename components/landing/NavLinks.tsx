"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_LINKS } from "@/lib/constants";

/** Desktop nav; the link for the current route is wine-coloured and underlined (Figma active state). */
export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="hidden items-center gap-1 lg:flex">
      {NAV_LINKS.map((link) => {
        const active = link.href.startsWith("/") && link.href !== "/" && pathname.startsWith(link.href);
        return (
          <Link
            key={link.label}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-2 text-sm font-medium leading-5 hover:bg-black/5 xl:px-4 ${
              active ? "text-primary-500 underline underline-offset-4" : "text-ink"
            }`}
          >
            {link.label}
            {link.hasDropdown && (
              <Image src="/assets/landing-page/01-top-nav/arrow-down.svg" alt="" width={16} height={16} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
