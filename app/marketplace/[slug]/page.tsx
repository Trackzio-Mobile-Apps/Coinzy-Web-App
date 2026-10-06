import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TopNav } from "@/components/landing/TopNav";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { Pagination } from "@/components/catalogue/CoinGrid";
import { DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { SellBar } from "@/components/marketplace/SellBar";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { getMarketplaceCategory, loadListingPage } from "@/lib/marketplace/categories";
import { MARKETPLACE_BROWSE_CATEGORIES } from "@/lib/constants";

const PAGE_SIZE = 20; // Figma 793:77612: 4 rows × 5 cards

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const category = getMarketplaceCategory((await params).slug);
  return category
    ? {
        title: `${category.title} for sale | Marketplace | Coinzy AI`,
        description: `Browse ${category.title.toLowerCase()} listed by collectors on the Coinzy marketplace.`,
      }
    : {};
}

function GridSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading listings"
      className="grid animate-pulse grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(5,211px)] xl:justify-between"
    >
      {Array.from({ length: PAGE_SIZE }, (_, i) => (
        <div key={i} className="flex flex-col gap-6 rounded-[12px] border-[0.5px] border-border-neutral bg-white px-2 pb-4 pt-2">
          <div className="flex justify-center rounded-lg bg-coin-well py-5">
            <div className="size-[136px] rounded-full bg-black/[0.05]" />
          </div>
          <div className="flex flex-col gap-2 px-1">
            <div className="h-4 w-full rounded bg-black/[0.06]" />
            <div className="h-4 w-2/3 rounded bg-black/[0.05]" />
            <div className="h-4 w-12 rounded bg-primary-500/20" />
          </div>
        </div>
      ))}
    </div>
  );
}

async function ListingResults({ slug, page }: { slug: string; page: number }) {
  const category = getMarketplaceCategory(slug)!;
  let result: Awaited<ReturnType<typeof loadListingPage>>;
  try {
    result = await loadListingPage(category, page, PAGE_SIZE);
  } catch (err) {
    console.error(err);
    return (
      <p className="py-16 text-center text-sm text-muted">
        The marketplace is temporarily unavailable. Please try again in a moment.
      </p>
    );
  }
  if (!result.cards.length) {
    return (
      <p className="py-16 text-center text-sm text-muted">
        No {category.title.toLowerCase()} are listed right now — check back soon, or list one yourself below.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-10">
      <ListingGrid cards={result.cards} from={slug} fromPage={result.page} />
      {result.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            visible={6}
            href={(n) => `/marketplace/${slug}?page=${n}`}
          />
        </div>
      )}
    </div>
  );
}

/** Marketplace listings — Figma `Landing page/MarketplacePage/CoinListings` (793:77612). */
export default async function MarketplaceCategoryPage({ params, searchParams }: Params) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const category = getMarketplaceCategory(slug);
  if (!category) notFound();
  const requested = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);

  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <section className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-20 lg:px-[160px] lg:pb-[184px]">
          <DetailsBreadcrumb ancestors={[{ href: "/marketplace", label: "Marketplace" }]} current={category.crumb} />
          <h1 className="sr-only">{category.title} for sale</h1>
          <div className="mt-10">
            <Suspense key={`${slug}-${requested}`} fallback={<GridSkeleton />}>
              <ListingResults slug={slug} page={requested} />
            </Suspense>
          </div>
          <div className="mt-20 flex justify-center lg:mt-[124px]">
            <SellBar />
          </div>
        </section>

        <WebappCTASection />
        <BrowseCatalogueSection
          label="Browse Marketplace"
          description="Explore popular collecting categories, from ancient Roman to rare American."
          className="bg-cream"
          categories={MARKETPLACE_BROWSE_CATEGORIES}
          innerClassName=""
          cardVariant="marketplace"
          labelClassName="!font-normal text-primary-500"
          viewAllHref="/marketplace/all"
        />
        <MobileAppSection />
      </main>
      <Footer />
    </>
  );
}
