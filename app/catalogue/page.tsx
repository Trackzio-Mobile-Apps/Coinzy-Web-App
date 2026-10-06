import type { Metadata } from "next";
import { TopNav } from "@/components/landing/TopNav";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { CategoryRowSection } from "@/components/catalogue/CategoryRowSection";
import { BrowseAllCoinsSection } from "@/components/catalogue/BrowseAllCoinsSection";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { CATALOGUE_INDIA_CATEGORIES, CATALOGUE_US_CATEGORIES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Global Catalogue | Coinzy AI",
  description: "200,000+ coins from every era and country, with value ranges backed by NGC and PCGS data.",
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page } = await searchParams;
  const pageNo = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <PageHero
          label="Global Catalogue"
          title="Every coin. Every value. One place."
          description="200,000+ coins from every era and country. Value ranges backed by NGC and PCGS data. Search by name, or upload a photo to find yours."
        />
        <CategoryRowSection
          title="US coins by category"
          categories={CATALOGUE_US_CATEGORIES}
          variant="marketplace"
          gridClassName="xl:grid-cols-[repeat(4,268px)]"
          viewAllHref="/catalogue/american-coins"
        />
        <CategoryRowSection
          title="Indian coins by category"
          categories={CATALOGUE_INDIA_CATEGORIES}
          variant="india"
          gridClassName="xl:grid-cols-4 xl:gap-6"
          parchment
          viewAllHref="/catalogue/indian-coins"
        />
        <WebappCTASection />
        <BrowseAllCoinsSection page={pageNo} />
        <MobileAppSection />
      </main>
      <Footer />
    </>
  );
}
