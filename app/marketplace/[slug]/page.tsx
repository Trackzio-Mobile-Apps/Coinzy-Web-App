import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { Suspense } from "react";
import { TopNav } from "@/components/landing/TopNav";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { CatalogueEmpty } from "@/components/catalogue/CatalogueEmpty";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { Pagination } from "@/components/catalogue/CoinGrid";
import { DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { SellBar } from "@/components/marketplace/SellBar";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { pagedHref, parsePageParam, parseQueryParam } from "@/lib/backNav";
import { getMarketplaceCategory, loadListingPage } from "@/lib/marketplace/categories";
import { MARKETPLACE_BROWSE_CATEGORIES } from "@/lib/constants";

const PAGE_SIZE = 20; // Figma 793:77612: 4 rows × 5 cards

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; q?: string | string[]; issuer?: string | string[] }>;
};

const SEARCH_HINT =
  "Search matches whole words in listing titles, such as “Dollar”, “Lincoln” or “Cents”. Check the spelling or try a broader word.";

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const category = getMarketplaceCategory((await params).slug);
  if (!category) return {};
  const query = parseQueryParam((await searchParams).q);
  return {
    title: `${query ? `“${query}” in ` : ""}${category.title} for sale | Marketplace | Coinzy AI`,
    description: `Browse ${category.title.toLowerCase()} listed by collectors on the Coinzy marketplace.`,
    // Search result pages are thin and unbounded — keep them out of the index.
    ...(query && { robots: { index: false, follow: true } }),
  };
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

async function ListingResults({ slug, page, query }: { slug: string; page: number; query: string }) {
  const category = getMarketplaceCategory(slug)!;
  const base = `/marketplace/${slug}`;
  let result: Awaited<ReturnType<typeof loadListingPage>>;
  try {
    result = await loadListingPage(category, page, PAGE_SIZE, query);
  } catch (err) {
    console.error(err);
    return query ? (
      <CatalogueEmpty query={query} clearHref={base} unavailable />
    ) : (
      <p className="py-16 text-center text-sm text-muted">
        The marketplace is temporarily unavailable. Please try again in a moment.
      </p>
    );
  }
  if (!result.cards.length) {
    return query ? (
      <CatalogueEmpty
        query={query}
        scope={slug === "all" ? undefined : category.title}
        clearHref={base}
        hint={SEARCH_HINT}
      />
    ) : (
      <p className="py-16 text-center text-sm text-muted">
        No {category.title.toLowerCase()} are listed right now — check back soon, or list one yourself below.
      </p>
    );
  }
  return (
    <div className="flex flex-col gap-10">
      {query && (
        <p role="status" className="-mb-2 font-jakarta text-xs text-neutral-400">
          <span className="font-bold text-muted">{result.totalCount.toLocaleString("en-US")}</span>{" "}
          {result.totalCount === 1 ? "result" : "results"} for “{query}”
        </p>
      )}
      <ListingGrid cards={result.cards} from={slug} fromPage={result.page} fromQuery={query} />
      {result.totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            visible={6}
            href={(n) => pagedHref(base, n, query)}
          />
        </div>
      )}
    </div>
  );
}

/** Marketplace listings — Figma `Landing page/MarketplacePage/CoinListings` (793:77612). */
export default async function MarketplaceCategoryPage({ params, searchParams }: Params) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  if (await getSessionUser()) {
    const p = new URLSearchParams();
    if (slug && slug !== "all") p.set("category", slug);
    const q = parseQueryParam(sp.q);
    if (q) p.set("q", q);
    if (sp.page && sp.page !== "1") p.set("page", sp.page);
    const issuers = sp.issuer;
    if (Array.isArray(issuers)) issuers.forEach((i) => p.append("issuer", i));
    else if (issuers) p.set("issuer", issuers);
    redirect(p.size ? `/marketplace?${p}` : "/marketplace");
  }
  const { page, q } = sp;
  const category = getMarketplaceCategory(slug);
  if (!category) notFound();
  const requested = parsePageParam(page);
  const query = parseQueryParam(q);

  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <section className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-20 lg:px-[160px] lg:pb-[184px]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <DetailsBreadcrumb ancestors={[{ href: "/marketplace", label: "Marketplace" }]} current={category.crumb} />
            {/* Search isn't in this Figma frame; same pill as the dashboard's marketplace search. */}
            <CatalogueSearch
              key={query}
              action={`/marketplace/${slug}`}
              query={query}
              placeholder="Search listings..."
              label="Search marketplace listings by title"
              className="sm:w-[260px]"
            />
          </div>
          <h1 className="sr-only">{category.title} for sale</h1>
          <div className="mt-10">
            <Suspense key={`${slug}|${query}|${requested}`} fallback={<GridSkeleton />}>
              <ListingResults slug={slug} page={requested} query={query} />
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
