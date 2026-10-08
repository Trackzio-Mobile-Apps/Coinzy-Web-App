import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AppSidebar } from "@/components/home/AppSidebar";
import { CoinPhotos, DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";
import { CoinDetailTabs, EstimatedValueBanner, TableRow } from "@/components/catalogue/CoinDetailsInteractive";
import { CollectionCoinGradingBlock } from "@/components/collection/CollectionCoinGradingBlock";
import { CollectionCoinOverflowMenu } from "@/components/collection/CollectionCoinOverflowMenu";
import { CollectionCoinSellActions } from "@/components/collection/CollectionCoinSellActions";
import { CollectionCoinStatusBadge } from "@/components/collection/CollectionCoinStatusBadge";
import { CollectionListedSellerRail } from "@/components/collection/CollectionListedSellerRail";
import { collectionLinks } from "@/components/collection/collectionNav";
import { IdentifyExpertBanner } from "@/components/identify/IdentifyExpertBanner";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { fetchArchetypeDetails, fetchListingDetails, fetchListingFilterValues, isArchetypeId } from "@/lib/api/coinzy";
import {
  fetchArchetypeDetailsForSession,
  fetchCollectionsForSession,
  fetchUserCoinDetails,
} from "@/lib/api/coinzy-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { parsePageParam, parseQueryParam } from "@/lib/backNav";
import { collectionDetailsAncestor } from "@/lib/collection/breadcrumb";
import { userCoinListingId } from "@/lib/collection/marketplaceSale";
import { collectionCoinStatus, userCoinSpec } from "@/lib/collection/userCoinSpec";
import { coinTitle, detailTabs, gradePrices, overviewRows } from "@/lib/catalogue/coinDetails";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    from?: string;
    fromPage?: string;
    fromQ?: string | string[];
    premium?: string;
  }>;
};

async function CollectionCoinDetailsContent({
  coinId,
  from,
  fromPage,
  fromQuery,
  premium,
  sellerName,
  sellerEmail,
}: {
  coinId: string;
  from?: string;
  fromPage: number;
  fromQuery: string;
  premium: boolean;
  sellerName: string;
  sellerEmail: string;
}) {
  const token = await getSessionToken();
  if (!token) redirect(`/auth?next=/collection/coin/${coinId}`);

  const [collectionsRes, coinRes] = await Promise.all([
    fetchCollectionsForSession(token),
    fetchUserCoinDetails(token, coinId),
  ]);
  if (coinRes.error) notFound();

  const userCoin = coinRes.data;
  const collections = collectionsRes.error ? [] : collectionsRes.data;
  const ancestor = collectionDetailsAncestor(from, collections);
  const archetypeId = userCoin.archetypeId;
  const archetype =
    archetypeId && isArchetypeId(archetypeId)
      ? (await fetchArchetypeDetailsForSession(archetypeId, token).catch(() => null)) ??
        (await fetchArchetypeDetails(archetypeId).catch(() => null))
      : null;

  const spec = userCoinSpec(userCoin, archetype);
  const title = coinTitle(spec);
  const grades = gradePrices(spec.estimatedPrice ?? null);
  const userImages = userCoin.imageUrls?.length ? userCoin.imageUrls : (archetype?.imageUrls ?? []);
  const databaseImages = archetype?.imageUrls?.length ? archetype.imageUrls : userImages;
  const status = collectionCoinStatus(userCoin);
  const listingId = userCoinListingId(userCoin);
  const [listing, sellFilters] = await Promise.all([
    listingId ? fetchListingDetails(listingId).catch(() => null) : Promise.resolve(null),
    fetchListingFilterValues([
      "gradingScale",
      "gradeValue",
      "gradingAuthority",
      "strikerType",
      "cleaningAlterations",
    ]).catch(() => null),
  ]);

  const listHref = (() => {
    const base = ancestor.href;
    const qs = new URLSearchParams();
    if (fromQuery) qs.set("q", fromQuery);
    if (fromPage > 1) qs.set("page", String(fromPage));
    const s = qs.toString();
    return s ? `${base}?${s}` : base;
  })();

  return (
    <>
      <DetailsBreadcrumb ancestors={[{ href: listHref, label: ancestor.label }]} current={title} />

      <CollectionCoinSellActions
        coinId={coinId}
        coinTitle={title}
        sellerName={sellerName}
        sellerEmail={sellerEmail}
        listingId={listingId}
        listedSellerPanel={
          listingId && listing ? <CollectionListedSellerRail listing={listing} listingId={listingId} /> : null
        }
        filterOptions={{
          gradingScale: sellFilters?.gradingScale,
          gradeValue: sellFilters?.gradeValue,
          gradingAuthority: sellFilters?.gradingAuthority,
          strikerType: sellFilters?.strikerType,
          cleaningAlterations: sellFilters?.cleaningAlterations,
        }}
        databaseImages={databaseImages}
        title={title}
      >
          <div className="flex w-full flex-col gap-6 rounded-2xl bg-white p-4">
            <div className="flex min-h-8 flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold leading-8 text-ink">{title}</h1>
                <CollectionCoinStatusBadge status={status} />
              </div>
              <CollectionCoinOverflowMenu coinId={coinId} coinTitle={title} returnHref={listHref} />
            </div>

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <CoinPhotos images={userImages} title={title} />
              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <EstimatedValueBanner grades={grades} />
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-medium leading-7 text-ink">Overview</h2>
                  <div className="flex flex-col">
                    {overviewRows(spec).map((row) => (
                      <TableRow key={row.label} {...row} gapClassName="gap-6 lg:gap-[210px]" />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <IdentifyExpertBanner
              title="Want more certainty?"
              subtext="Have your coin reviewed by a human expert, not AI"
            />
          </div>

          <CoinDetailTabs tabs={detailTabs(spec)} premium={premium} />
          {listing && <CollectionCoinGradingBlock listing={listing} />}
      </CollectionCoinSellActions>
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: `Collection coin | Coinzy AI`, description: `Coin details in your Coinzy collection.` };
}

/** Private collection coin details — Figma `1348:175552` (also `1344:118250`). */
export default async function CollectionCoinDetailsPage({ params, searchParams }: Params) {
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=/collection/coin/${(await params).id}`);

  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");
  const token = await getSessionToken();
  if (!token) redirect(`/auth?next=/collection/coin/${id}`);

  const collectionsRes = await fetchCollectionsForSession(token);
  const rows = collectionsRes.error ? [] : collectionsRes.data;
  const sidebarKey = sp.from?.startsWith("c/") ? sp.from.slice(2) : sp.from ?? "owned";

  const details = (
    <Suspense key={id} fallback={<CoinDetailsSkeleton />}>
      <CollectionCoinDetailsContent
        coinId={id}
        from={sp.from}
        fromPage={parsePageParam(sp.fromPage)}
        fromQuery={parseQueryParam(sp.fromQ)}
        premium={premium}
        sellerName={user.name}
        sellerEmail={user.email}
      />
    </Suspense>
  );

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="collection" collectionLinks={collectionLinks(rows, sidebarKey)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto w-full max-w-[1122px]">{details}</div>
        </main>
      </div>
    </div>
  );
}
