import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TopNav } from "@/components/landing/TopNav";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { SellerDetailsPanel } from "@/components/marketplace/SellerDetailsPanel";
import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";
import { CoinPhotos, DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { CoinDetailTabs, EstimatedValueBanner, TableRow } from "@/components/catalogue/CoinDetailsInteractive";
import { fetchArchetypeDetails, fetchListingDetails, isArchetypeId, type ListingDetails } from "@/lib/api/coinzy";
import {
  coinTitle,
  detailTabs,
  formatPrice,
  gradePrices,
  gradingRows,
  listingGradeCode,
  overviewRows,
  type CoinSpec,
} from "@/lib/catalogue/coinDetails";
import { FROM_HOME, pagedHref, parsePageParam, parseQueryParam } from "@/lib/backNav";
import { MARKETPLACE_BROWSE_CATEGORIES } from "@/lib/constants";
import { getMarketplaceCategory } from "@/lib/marketplace/categories";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string; fromPage?: string; fromQ?: string | string[] }> };

/** Listing coin facts in the shared `CoinSpec` shape (falls back to the listing title). */
function listingCoin(l: ListingDetails): CoinSpec {
  return { ...l.coinDetails, name: l.coinDetails?.name ?? l.title };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const listing = await fetchListingDetails((await params).id).catch(() => null);
  if (!listing) return {};
  const title = coinTitle({ ...listingCoin(listing), name: listing.title });
  const price = formatPrice(listing.price);
  return {
    title: `${title}${price ? ` — ${price}` : ""} | Marketplace | Coinzy AI`,
    description: `${title} for sale on the Coinzy marketplace${price ? ` at ${price}` : ""}. Grading, specifications and seller details.`,
  };
}

function SectionTable({ heading, rows }: { heading: string; rows: { label: string; value: string }[] }) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-lg font-medium leading-7 text-ink">{heading}</h2>
      <div className="flex flex-col">
        {rows.map((row) => (
          <TableRow key={row.label} {...row} gapClassName="gap-6 lg:gap-[140px]" />
        ))}
      </div>
    </div>
  );
}

/** Breadcrumb + listing details: streams in after the API responds; the skeleton shows meanwhile. */
async function ListingDetailsContent({
  id,
  from,
  fromPage,
  fromQuery,
}: {
  id: string;
  from?: string;
  fromPage: number;
  /** Search term of the list the visitor came from. */
  fromQuery: string;
}) {
  const listing = await fetchListingDetails(id);
  if (!listing) notFound();

  const coin = listingCoin(listing);
  // Market estimate comes from the catalogue entry the seller's coin was identified as.
  const archetypeId = listing.coinDetails?.archetypeId;
  const archetype = archetypeId ? await fetchArchetypeDetails(archetypeId).catch(() => null) : null;
  const grades = gradePrices(archetype?.estimatedPrice ?? null);
  const title = coinTitle({ ...coin, name: listing.title });
  const price = formatPrice(listing.price);
  const images = listing.imageUrls.length ? listing.imageUrls : (listing.coinDetails?.imageUrls ?? []);

  // Breadcrumb trail = where the visitor came from (`?from=` + `?fromPage=`, see `lib/backNav.ts`).
  const category = from ? getMarketplaceCategory(from) : null;
  const ancestors =
    from === FROM_HOME
      ? [{ href: "/home", label: "Home" }]
      : from === "marketplace"
        ? [{ href: "/marketplace", label: "Marketplace" }]
        : [
            { href: "/marketplace", label: "Marketplace" },
            category
              ? { href: pagedHref(`/marketplace/${category.slug}`, fromPage, fromQuery), label: category.crumb }
              : { href: "/marketplace/all", label: "All listings" },
          ];

  return (
    <>
      {/* Breadcrumb (Figma 843:15472) */}
      <DetailsBreadcrumb ancestors={ancestors} current={title} />

      {/* Details (Figma 863:29439) */}
      <div className="mt-10 flex flex-col items-start gap-4 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <div className="flex w-full flex-col gap-6 rounded-2xl border-[0.5px] border-border-neutral bg-white p-4">
            <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <h1 className="text-2xl font-semibold leading-8 text-ink">{title}</h1>
              {/* Asking price: not drawn in Figma, but a listing page needs it. */}
              {price && (
                <p className="text-2xl font-semibold leading-8 text-primary-500">
                  <span className="sr-only">Price: </span>
                  {price}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <CoinPhotos images={images} title={title} />

              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <EstimatedValueBanner grades={grades} defaultCode={listingGradeCode(listing.gradeValue, grades)} />
                <SectionTable heading="Coin grading details" rows={gradingRows(listing)} />
                <SectionTable heading="Coin Specifications" rows={overviewRows(coin)} />
              </div>
            </div>
          </div>

          <CoinDetailTabs tabs={detailTabs(coin)} className="border-[0.5px] border-border-neutral" />
        </div>

        <aside className="flex w-full shrink-0 flex-col lg:w-[268px]">
          <SellerDetailsPanel seller={listing.sellerDetails} title={title} />
        </aside>
      </div>
    </>
  );
}

/** Marketplace listing details — Figma `Landing page/MarketplacePage/CoinListings/DetailsPage` (843:15466). */
export default async function MarketplaceListingPage({ params, searchParams }: Params) {
  const [{ id }, { from, fromPage, fromQ }] = await Promise.all([params, searchParams]);
  if (!isArchetypeId(id)) notFound();

  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <section className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-20 lg:px-[160px] lg:pb-[184px]">
          <Suspense key={id} fallback={<CoinDetailsSkeleton sidebar="seller" />}>
            <ListingDetailsContent id={id} from={from} fromPage={parsePageParam(fromPage)} fromQuery={parseQueryParam(fromQ)} />
          </Suspense>
        </section>

        {/* Figma order on this page: CTA first, then categories. */}
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
