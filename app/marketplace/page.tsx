import type { Metadata } from "next";
import { TopNav } from "@/components/landing/TopNav";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { ListingRowSection } from "@/components/marketplace/ListingRowSection";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { MARKETPLACE_BROWSE_CATEGORIES, MARKETPLACE_LISTING_ROWS } from "@/lib/constants";
import { loadListingRow } from "@/lib/marketplace/categories";

export const metadata: Metadata = {
  title: "Marketplace | Coinzy AI",
  description: "Buy and sell coins from verified sellers on Coinzy.",
};

export default async function MarketplacePage() {
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
