import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { Pagination } from "@/components/catalogue/CoinGrid";
import { CollectionCoinTileSkeleton } from "@/components/collection/CollectionGridSkeleton";
import { CollectionEditMenu } from "@/components/collection/CollectionEditMenu";
import { CollectionEmptyState } from "@/components/collection/CollectionEmptyState";
import { collectionLinks } from "@/components/collection/collectionNav";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { fetchCollectionsForSession, fetchUserCoins } from "@/lib/api/coinzy-session";
import { getPremiumStatus, getSessionToken, getSessionUser, type SessionUser } from "@/lib/auth/session";
import { parsePageParam, withFrom } from "@/lib/backNav";

const PAGE_SIZE = 16;

export const metadata: Metadata = { title: "Collection | Coinzy AI" };

async function CollectionSidebar({ user, id }: { user: SessionUser; id: string }) {
  const token = await getSessionToken();
  if (!token) return <AppSidebar user={user} active="collection" />;
  const collections = await fetchCollectionsForSession(token);
  const rows = collections.error ? [] : collections.data;
  return <AppSidebar user={user} active="collection" collectionLinks={collectionLinks(rows, id)} />;
}

async function PrivateCollectionBody({
  token,
  id,
  page,
}: {
  token: string;
  id: string;
  page: number;
}) {
  const [collections, coins] = await Promise.all([
    fetchCollectionsForSession(token),
    fetchUserCoins(token, { pageNo: page - 1, pageSize: PAGE_SIZE, filters: { _collection: [id] } }),
  ]);
  const rows = collections.error ? [] : collections.data;
  const collection = rows.find((r) => r.collectionId === id);
  const name = collection?.name ?? "Collection";
  const list = coins.error ? [] : coins.data;
  const total = coins.error ? 0 : coins.totalCount;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const hrefFor = (nextPage: number) =>
    nextPage > 1 ? `/collection/c/${id}?page=${nextPage}` : `/collection/c/${id}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4"><nav aria-label="Breadcrumb" className="flex items-center gap-4"><Link href="/collection" aria-label="Back to collections" className="flex size-8 items-center justify-center rounded border border-[#c8c8ca] bg-white text-xl text-[#606062]">‹</Link><Link href="/collection" className="text-base text-primary-500 underline">Collections</Link><span className="text-xl text-[#606062]">›</span><h1 className="text-lg font-semibold text-ink">{name}{total > 0 ? ` (${total})` : ""}</h1></nav>{collection && !(collection.name === "Identified" && (collection.description ?? "").toLowerCase().includes("auto created")) && <CollectionEditMenu id={id} name={name} />}</div>
      <ul className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {list.map((coin) => {
          const href = withFrom(`/collection/coin/${coin.coinId}`, `c/${id}`, page);
          const card = (
            <>
              <div className="relative aspect-square bg-[#f7f7f8]">
                {coin.imageUrls?.[0] ? (
                  <FallbackImage
                    src={coin.imageUrls[0]}
                    alt={coin.name}
                    fill
                    className="object-contain p-3"
                    sizes="200px"
                    fallback={<CoinPlaceholder className="size-full" />}
                  />
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
      {coins.error && <p role="alert" className="mt-4 text-sm text-[#dc2626]">{coins.reason ?? "Could not load coins."}</p>}
      {!coins.error && list.length === 0 && <CollectionEmptyState privateCollection />}
      {pages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination page={page} totalPages={pages} href={hrefFor} />
        </div>
      )}
    </>
  );
}

function PrivateCollectionFallback() {
  return (
    <>
      <p className="text-sm text-muted">
        <Link href="/collection" className="text-primary-500">
          Collections
        </Link>
        <span className="mx-2">/</span>
        <span className="inline-block h-4 w-32 animate-pulse rounded bg-black/[0.06] align-middle" />
      </p>
      <CollectionCoinTileSkeleton count={16} />
    </>
  );
}

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

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <Suspense fallback={<AppSidebar user={user} active="collection" />}>
        <CollectionSidebar user={user} id={id} />
      </Suspense>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#faf7f5]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
          <div className="mx-auto w-full max-w-[1120px]">
            <Suspense key={`${id}|${page}`} fallback={<PrivateCollectionFallback />}>
              <PrivateCollectionBody token={token} id={id} page={page} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
