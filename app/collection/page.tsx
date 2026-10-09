import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { CollectionFreePlanCard } from "@/components/collection/CollectionFreePlanCard";
import { CollectionCreateCollectionCard } from "@/components/collection/CollectionCreateCollectionCard";
import { CollectionGridSkeleton } from "@/components/collection/CollectionGridSkeleton";
import { CollectionHomeCard } from "@/components/collection/CollectionHomeCard";
import { CollectionRecentlyIdentified } from "@/components/collection/CollectionRecentlyIdentified";
import { collectionLinks } from "@/components/collection/collectionNav";
import { privateCollectionTitle, systemCollectionTitle } from "@/lib/collection/cardTitle";
import { fetchCollectionsForSession, fetchUserCoins, type UserCoinRow } from "@/lib/api/coinzy-session";
import { getPremiumStatus, getSessionToken, getSessionUser, type SessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Collections | Coinzy AI",
  description: "Your owned, identified, and wishlisted coins.",
};

function thumbs(coins: UserCoinRow[]) {
  return coins.map((c) => c.imageUrls?.[0]).filter((s): s is string => Boolean(s));
}

function latestActivity(coins: UserCoinRow[]): string | null {
  let best: string | null = null;
  let bestMs = -1;
  for (const c of coins) {
    const raw = c.updatedAt ?? c.createdAt;
    if (!raw) continue;
    const ms = Date.parse(raw);
    if (Number.isFinite(ms) && ms > bestMs) {
      bestMs = ms;
      best = raw;
    }
  }
  return best;
}

async function CollectionSidebar({ user }: { user: SessionUser }) {
  const token = await getSessionToken();
  if (!token) return <AppSidebar user={user} active="collection" />;
  const collections = await fetchCollectionsForSession(token, 0, 20);
  const rows = collections.error ? [] : collections.data;
  return <AppSidebar user={user} active="collection" collectionLinks={collectionLinks(rows, "")} />;
}

async function CollectionHomeBody({
  token,
  premium,
}: {
  token: string;
  premium: boolean;
}) {
  const [collections, owned, identified, wishlist, recent, all] = await Promise.all([
    fetchCollectionsForSession(token, 0, 20),
    fetchUserCoins(token, { pageSize: 5, filters: { isOwned: [true] } }),
    fetchUserCoins(token, { pageSize: 5, filters: { isIdentified: [true] } }),
    fetchUserCoins(token, { pageSize: 5, filters: { isWishlisted: [true] } }),
    fetchUserCoins(token, { pageSize: 5, filters: { isIdentified: [true] } }),
    fetchUserCoins(token, { pageSize: 1 }),
  ]);

  const rows = collections.error ? [] : collections.data;
  const ownedCount = collections.error ? 0 : collections.ownedCount;
  const identifiedCount = collections.error ? 0 : collections.identifiedCount;
  const wishlistedCount = collections.error ? 0 : collections.wishlistedCount;
  const used = all.error ? 0 : all.totalCount;
  const ownedList = owned.error ? [] : owned.data;
  const identifiedList = identified.error ? [] : identified.data;
  const wishlistList = wishlist.error ? [] : wishlist.data;
  const recentList = recent.error ? [] : recent.data;

  const privateRows = rows.filter(
    (r) => !(r.name === "Identified" && (r.description ?? "").toLowerCase().includes("auto created")),
  );

  const cards = [
    {
      href: "/collection/owned",
      title: systemCollectionTitle("owned", ownedCount),
      count: ownedCount,
      images: thumbs(ownedList),
      lastUpdatedAt: latestActivity(ownedList),
      muted: false,
    },
    {
      href: "/collection/identified",
      title: systemCollectionTitle("identified", identifiedCount),
      count: identifiedCount,
      images: thumbs(identifiedList),
      lastUpdatedAt: latestActivity(identifiedList),
      muted: false,
    },
    {
      href: "/collection/wishlist",
      title: systemCollectionTitle("wishlist", wishlistedCount),
      count: wishlistedCount,
      images: thumbs(wishlistList),
      lastUpdatedAt: latestActivity(wishlistList),
      muted: false,
    },
    ...privateRows.map((r) => ({
      href: `/collection/c/${r.collectionId}`,
      title: privateCollectionTitle(r.name, r.coinCount ?? 0),
      count: r.coinCount ?? 0,
      images: r.representativeImages ?? (r.imageUrl ? [r.imageUrl] : []),
      lastUpdatedAt: r.updatedAt ?? null,
      muted: (r.coinCount ?? 0) === 0,
    })),
  ];

  return (
    <div className="mx-auto flex w-full max-w-[1122px] gap-4">
      <div className="min-w-0 flex-1">
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {cards.map((card) => (
            <CollectionHomeCard key={card.href} {...card} />
          ))}
          <CollectionCreateCollectionCard privateCount={privateRows.length} />
        </div>
      </div>
      <aside className="hidden shrink-0 flex-col gap-4 lg:flex">
        {!premium && <CollectionFreePlanCard used={used} />}
        <CollectionRecentlyIdentified coins={recentList} />
      </aside>
    </div>
  );
}

function CollectionHomeBodyFallback() {
  return (
    <div className="mx-auto flex w-full max-w-[1122px] gap-4">
      <div className="min-w-0 flex-1">
        <CollectionGridSkeleton count={6} />
      </div>
      <aside className="hidden w-[266px] shrink-0 animate-pulse flex-col gap-4 lg:flex">
        <div className="h-36 rounded-xl border border-[#efefef] bg-white" />
        <div className="h-48 rounded-xl border border-[#efefef] bg-white" />
      </aside>
    </div>
  );
}

/** Collections overview — Figma `1341:262557`. Title first; cards stream. */
export default async function CollectionHomePage({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string; q?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/collection");
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");
  const token = await getSessionToken();
  if (!token) redirect("/auth?next=/collection");
  const query = typeof sp.q === "string" ? sp.q : "";

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <Suspense fallback={<AppSidebar user={user} active="collection" />}>
        <CollectionSidebar user={user} />
      </Suspense>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto w-full max-w-[1122px]">
            <div className="flex max-w-[695px] flex-col gap-4">
              <h1 className="text-2xl font-semibold leading-8 text-ink">Collections</h1>
              <CatalogueSearch
                action="/collection/owned"
                query={query}
                placeholder="Search coins, empires, countries, years…"
                className="h-8 max-w-none w-full"
              />
            </div>
          </div>
          <Suspense fallback={<CollectionHomeBodyFallback />}>
            <CollectionHomeBody token={token} premium={premium} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
