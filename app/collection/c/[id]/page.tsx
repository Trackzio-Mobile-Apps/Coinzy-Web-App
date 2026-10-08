import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { CollectionEmptyState } from "@/components/collection/CollectionEmptyState";
import { collectionLinks } from "@/components/collection/collectionNav";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { fetchCollectionsForSession, fetchUserCoins } from "@/lib/api/coinzy-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { parsePageParam, withFrom } from "@/lib/backNav";

export const metadata: Metadata = { title: "Collection | Coinzy AI" };

export default async function PrivateCollectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ page?: string; premium?: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=/collection/c/${id}`);
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");
  const token = await getSessionToken();
  if (!token) redirect(`/auth?next=/collection/c/${id}`);
  const page = parsePageParam(sp.page);
  const [collections, coins] = await Promise.all([
    fetchCollectionsForSession(token),
    fetchUserCoins(token, { pageNo: page - 1, pageSize: 16, filters: { _collection: [id] } }),
  ]);
  const rows = collections.error ? [] : collections.data;
  const name = rows.find((r) => r.collectionId === id)?.name ?? "Collection";
  const list = coins.error ? [] : coins.data;

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="collection" collectionLinks={collectionLinks(rows, id)} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <p className="text-sm text-muted">
            <Link href="/collection" className="text-primary-500">Collections</Link>
            <span className="mx-2">/</span>
            <span className="text-ink">{name}</span>
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {list.map((coin) => {
              const href = withFrom(`/collection/coin/${coin.coinId}`, `c/${id}`, page);
              const card = (
                <>
                  <div className="relative aspect-square bg-[#f7f7f8]">
                    {coin.imageUrls?.[0] ? (
                      <FallbackImage src={coin.imageUrls[0]} alt={coin.name} fill className="object-contain p-3" sizes="200px" fallback={<CoinPlaceholder className="size-full" />} />
                    ) : (
                      <CoinPlaceholder className="size-full" />
                    )}
                  </div>
                  <p className="line-clamp-2 px-3 py-3 text-sm text-ink">{coin.name}</p>
                </>
              );
              return (
                <li key={coin.coinId} className="overflow-hidden rounded-xl border border-[#efefef] bg-white">
                  <Link href={href}>{card}</Link>
                </li>
              );
            })}
          </ul>
          {!coins.error && list.length === 0 && <CollectionEmptyState />}
        </main>
      </div>
    </div>
  );
}
