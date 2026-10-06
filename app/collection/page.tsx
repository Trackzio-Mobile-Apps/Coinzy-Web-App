import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { COLLECTION_COIN_LIMIT, collectionLinks } from "@/components/collection/collectionNav";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { fetchCollectionsForSession, fetchUserCoins, type UserCoinRow } from "@/lib/api/coinzy-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Collections | Coinzy AI",
  description: "Your owned, identified, and wishlisted coins.",
};

function thumbs(coins: UserCoinRow[]) {
  return coins.map((c) => c.imageUrls?.[0]).filter((s): s is string => Boolean(s)).slice(0, 4);
}

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

  const [collections, owned, identified, wishlist, recent, all] = await Promise.all([
    fetchCollectionsForSession(token, 0, 20),
    fetchUserCoins(token, { pageSize: 4, filters: { isOwned: [true] } }),
    fetchUserCoins(token, { pageSize: 4, filters: { isIdentified: [true] } }),
    fetchUserCoins(token, { pageSize: 4, filters: { isWishlisted: [true] } }),
    fetchUserCoins(token, { pageSize: 5, filters: { isIdentified: [true] } }),
    fetchUserCoins(token, { pageSize: 1 }),
  ]);

  const rows = collections.error ? [] : collections.data;
  const ownedCount = collections.error ? 0 : collections.ownedCount;
  const identifiedCount = collections.error ? 0 : collections.identifiedCount;
  const wishlistedCount = collections.error ? 0 : collections.wishlistedCount;
  const used = all.error ? 0 : all.totalCount;
  const privateRows = rows.filter(
    (r) => !(r.name === "Identified" && (r.description ?? "").toLowerCase().includes("auto created")),
  );
  const cards = [
    { href: "/collection/owned", title: `Owned (${ownedCount} coins)`, images: owned.error ? [] : thumbs(owned.data), count: ownedCount },
    { href: "/collection/identified", title: `Identified (${identifiedCount} coins)`, images: identified.error ? [] : thumbs(identified.data), count: identifiedCount },
    { href: "/collection/wishlist", title: `Wishlist (${wishlistedCount} coins)`, images: wishlist.error ? [] : thumbs(wishlist.data), count: wishlistedCount },
    ...privateRows.map((r) => ({
      href: `/collection/c/${r.collectionId}`,
      title: `${r.name} (${r.coinCount ?? 0} coins)`,
      images: r.representativeImages ?? (r.imageUrl ? [r.imageUrl] : []),
      count: r.coinCount ?? 0,
    })),
  ];

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="collection" collectionLinks={collectionLinks(rows, "")} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto flex w-full max-w-[1122px] gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-semibold leading-8 text-ink">Collections</h1>
                <CatalogueSearch action="/collection/owned" query="" placeholder="Search coins, empires, countries, years..." />
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {cards.map((card) => (
                  <Link key={card.href} href={card.href} className="rounded-2xl border border-[#efefef] bg-white p-4">
                    <div className="flex h-[88px] items-center">
                      <div className="flex -space-x-4">
                        {card.images.length ? (
                          card.images.map((src) => (
                            <span key={src} className="relative size-16 overflow-hidden rounded-full border-2 border-white bg-[#f5f5f5]">
                              <FallbackImage src={src} alt="" fill className="object-cover" sizes="64px" fallback={<CoinPlaceholder className="size-full" />} />
                            </span>
                          ))
                        ) : (
                          [0, 1, 2, 3].map((i) => (
                            <span key={i} className="size-16 rounded-full border-2 border-white bg-[#e5e5e5]" />
                          ))
                        )}
                      </div>
                      <span className="ml-2 flex size-12 items-center justify-center rounded-full bg-[#9ca3af] text-sm font-medium text-white">
                        {card.count}
                      </span>
                    </div>
                    <p className="mt-4 text-sm font-medium text-ink">{card.title}</p>
                  </Link>
                ))}
              </div>
            </div>
            <aside className="hidden w-[268px] shrink-0 flex-col gap-4 lg:flex">
              {!premium && (
                <div className="rounded-xl border border-[#dfdfe0] bg-white p-4">
                  <p className="text-sm font-medium text-ink">Free plan</p>
                  <p className="mt-1 text-xs text-[#87878a]">
                    {used} of {COLLECTION_COIN_LIMIT} coins added to collections
                  </p>
                  <div className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-[#dfdfe0]">
                    <div
                      className="h-full rounded-full bg-[#7c3c3f]"
                      style={{ width: `${Math.min(100, (used / COLLECTION_COIN_LIMIT) * 100)}%` }}
                    />
                  </div>
                  <Link href="/home#premium" className="mt-4 flex h-9 items-center justify-center rounded-[10px] border border-[#e5e5e5] text-sm font-medium text-ink">
                    Upgrade
                  </Link>
                </div>
              )}
              <div className="rounded-xl border border-[#efefef] bg-white p-4">
                <p className="text-sm font-medium text-ink">Recently identified</p>
                <ul className="mt-3 grid grid-cols-3 gap-2">
                  {(recent.error ? [] : recent.data).map((coin) => (
                    <li key={coin.coinId} className="text-center">
                      <div className="relative mx-auto size-14 overflow-hidden rounded-full bg-[#f5f5f5]">
                        {coin.imageUrls?.[0] ? (
                          <FallbackImage src={coin.imageUrls[0]} alt="" fill className="object-cover" sizes="56px" fallback={<CoinPlaceholder className="size-full" />} />
                        ) : (
                          <CoinPlaceholder className="size-full" />
                        )}
                      </div>
                      <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-ink">{coin.name}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
