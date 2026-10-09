import type { Metadata } from "next";
import { CatalogueSignedInPage } from "@/components/catalogue/CatalogueSignedInPage";
import { TopNav } from "@/components/landing/TopNav";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { PageHero } from "@/components/ui/PageHero";
import { CategoryRowSection } from "@/components/catalogue/CategoryRowSection";
import { BrowseAllCoinsSection } from "@/components/catalogue/BrowseAllCoinsSection";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { getPremiumStatus, getSessionUser } from "@/lib/auth/session";
import { parsePageParam, parseQueryParam } from "@/lib/backNav";
import { CATALOGUE_INDIA_CATEGORIES, CATALOGUE_US_CATEGORIES } from "@/lib/constants";

type Props = {
  searchParams: Promise<
    Record<string, string | string[] | undefined> & { page?: string; q?: string | string[]; category?: string; premium?: string }
  >;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = parseQueryParam((await searchParams).q);
  return {
    title: query ? `“${query}” | Global Catalogue | Coinzy AI` : "Global Catalogue | Coinzy AI",
    description: "200,000+ coins from every era and country, with value ranges backed by NGC and PCGS data.",
    ...(query && { robots: { index: false, follow: true } }),
  };
}

export default async function CataloguePage({ searchParams }: Props) {
  const sp = await searchParams;
  const user = await getSessionUser();
  if (user) {
    const premium =
      (await getPremiumStatus(user)) ||
      (process.env.NODE_ENV !== "production" && sp.premium === "1");
    return <CatalogueSignedInPage user={user} premium={premium} searchParams={sp} />;
  }

  const pageNo = parsePageParam(Array.isArray(sp.page) ? sp.page[0] : sp.page);
  const query = parseQueryParam(sp.q);
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
        <BrowseAllCoinsSection page={pageNo} query={query} />
        <MobileAppSection />
      </main>
      <Footer />
    </>
  );
}
