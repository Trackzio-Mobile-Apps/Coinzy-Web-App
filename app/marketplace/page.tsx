import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { TopNav } from "@/components/landing/TopNav";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { ListingRowSection } from "@/components/marketplace/ListingRowSection";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { MARKETPLACE_BROWSE_CATEGORIES, MARKETPLACE_LISTING_ROWS } from "@/lib/constants";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { parseQueryParam } from "@/lib/backNav";
import { loadListingRow } from "@/lib/marketplace/categories";

export const metadata: Metadata = {
  title: "Marketplace | Coinzy AI",
  description: "Buy and sell coins from verified sellers on Coinzy.",
};

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  // `/marketplace?q=` (e.g. shared links) lands on the full results list, which owns paging and states.
  const query = parseQueryParam((await searchParams).q);
  if (query) redirect(`/marketplace/all?q=${encodeURIComponent(query)}`);
  const rows = await Promise.all(MARKETPLACE_LISTING_ROWS.map((row) => loadListingRow(row.slug, 4)));
  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <PageHero
          label="Marketplace"
          title="Where collectors buy and sell."
          description="Thousands of listings from verified sellers. Browse by era, mint, or condition — or post your own listing to reach 200K+ active collectors."
        />
        {MARKETPLACE_LISTING_ROWS.map((row, i) => (
          <ListingRowSection
            key={row.title}
            title={row.title}
            variant={row.variant}
            wellClassName={row.wellClassName}
            cards={rows[i]}
            viewAllHref={`/marketplace/${row.slug}`}
            from="marketplace"
            // Search isn't in Figma; it sits beside the first row's "View all" so the layout keeps its rhythm.
            headerExtra={
              i === 0 ? (
                <CatalogueSearch
                  action="/marketplace/all"
                  query=""
                  placeholder="Search listings..."
                  label="Search marketplace listings by title"
                  className="sm:w-[260px]"
                />
              ) : undefined
            }
          />
        ))}
        <WebappCTASection />
        <BrowseCatalogueSection
          label="Browse Marketplace"
          description="Explore popular collecting categories, from ancient Roman to rare American."
          className="bg-cream"
          categories={MARKETPLACE_BROWSE_CATEGORIES}
          viewAllHref="/marketplace/all"
          innerClassName=""
          cardVariant="marketplace"
          labelClassName="!font-normal text-primary-500"
        />
        <MobileAppSection />
      </main>
      <Footer />
    </>
  );
}
