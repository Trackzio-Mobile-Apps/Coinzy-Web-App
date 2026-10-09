import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AppSidebar } from "@/components/home/AppSidebar";
import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";
import { CoinPhotos, DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { CoinDetailTabs, EstimatedValueBanner, TableRow } from "@/components/catalogue/CoinDetailsInteractive";
import { CollectionCoinStatusBadge } from "@/components/collection/CollectionCoinStatusBadge";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { OwnerListingPanel } from "@/components/marketplace/OwnerListingPanel";
import { SelfListingSuccessToast } from "@/components/marketplace/SelfListingSuccessToast";
import { fetchArchetypeDetails, isArchetypeId } from "@/lib/api/coinzy";
import { fetchListingDetailsForSession } from "@/lib/api/marketplace-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
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
import type { ListingDetails } from "@/lib/api/coinzy";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ listed?: string; premium?: string }>;
};

function listingCoin(l: ListingDetails): CoinSpec {
  return { ...l.coinDetails, name: l.coinDetails?.name ?? l.title };
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

async function SelfListingContent({ id, listed }: { id: string; listed: boolean }) {
  const token = await getSessionToken();
  if (!token) redirect(`/auth?next=/marketplace/my-listing/${id}${listed ? "?listed=1" : ""}`);

  const listing = await fetchListingDetailsForSession(token, id).catch(() => null);
  if (!listing) notFound();

  // Owner-only view. Non-owners (or missing `isMyListing`) go to the public listing page.
  if (!listing.isMyListing) {
    redirect(`/marketplace/listing/${id}`);
  }

  const coin = listingCoin(listing);
  const archetypeId = listing.coinDetails?.archetypeId;
  const archetype = archetypeId ? await fetchArchetypeDetails(archetypeId).catch(() => null) : null;
  const grades = gradePrices(archetype?.estimatedPrice ?? null);
  const title = coinTitle({ ...coin, name: listing.title });
  const price = formatPrice(listing.price);
  const images = listing.imageUrls.length ? listing.imageUrls : (listing.coinDetails?.imageUrls ?? []);

  return (
    <>
      <DetailsBreadcrumb ancestors={[{ href: "/marketplace", label: "Your listings" }]} current={title} />

      <div className="mt-10 flex flex-col items-start gap-4 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <div className="flex w-full flex-col gap-6 rounded-2xl border-[0.5px] border-border-neutral bg-white p-4">
            <div className="flex min-h-8 flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold leading-8 text-ink">{title}</h1>
                <CollectionCoinStatusBadge status="owned" />
              </div>
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
          <OwnerListingPanel listing={listing} listingId={listing.id} coinId={listing.coinId} variant="card" />
        </aside>
      </div>

      <SelfListingSuccessToast listingId={listing.id} show={listed} />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Your listing | Marketplace | Coinzy AI`,
    description: `Manage your Coinzy marketplace listing.`,
    robots: { index: false, follow: false },
  };
}

/** Seller's own listing details — Figma Copy `1363:178858`. */
export default async function SelfListingPage({ params, searchParams }: Params) {
  const user = await getSessionUser();
  const { id } = await params;
  if (!user) redirect(`/auth?next=/marketplace/my-listing/${id}`);
  if (!isArchetypeId(id)) notFound();

  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");
  const listed = sp.listed === "1";

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="marketplace" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto w-full max-w-[1122px]">
            <Suspense key={id} fallback={<CoinDetailsSkeleton sidebar="seller" />}>
              <SelfListingContent id={id} listed={listed} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
