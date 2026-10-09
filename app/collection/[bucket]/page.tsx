import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { Pagination } from "@/components/catalogue/CoinGrid";
import { CollectionCoinTileSkeleton } from "@/components/collection/CollectionGridSkeleton";
import { CollectionEmptyState } from "@/components/collection/CollectionEmptyState";
import { collectionLinks, type CollectionBucket } from "@/components/collection/collectionNav";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { fetchCollectionsForSession, fetchUserCoinFilters, fetchUserCoins } from "@/lib/api/coinzy-session";
import { getPremiumStatus, getSessionToken, getSessionUser, type SessionUser } from "@/lib/auth/session";
import { parsePageParam, parseQueryParam, withFrom } from "@/lib/backNav";
import { parseListingFilterParams } from "@/lib/marketplace/listingFilters";

const BUCKETS: Record<CollectionBucket, { title: string; filters: Record<string, boolean[]> }> = {
  owned: { title: "Owned collection", filters: { isOwned: [true] } },
  identified: { title: "Identified collection", filters: { isIdentified: [true] } },
  wishlist: { title: "Wishlist", filters: { isWishlisted: [true] } },
};

const FILTER_FIELDS = ["issuer", "ruler", "yearOfMinting", "mintLocation", "shape", "material"] as const;

export const metadata: Metadata = { title: "Collection | Coinzy AI" };

async function CollectionSidebar({ user, bucket }: { user: SessionUser; bucket: string }) {
  const token = await getSessionToken();
  if (!token) return <AppSidebar user={user} active="collection" />;
  const collections = await fetchCollectionsForSession(token);
  const rows = collections.error ? [] : collections.data;
  return <AppSidebar user={user} active="collection" collectionLinks={collectionLinks(rows, bucket)} />;
}

async function BucketBody({
  token,
  kind,
  bucket,
  page,
  query,
  selected,
}: {
  token: string;
  kind: CollectionBucket;
  bucket: string;
  page: number;
  query: string;
  selected: ReturnType<typeof parseListingFilterParams>;
}) {
  const filters: Record<string, (string | boolean)[]> = { ...BUCKETS[kind].filters };
  for (const [key, values] of Object.entries(selected)) {
    if (values?.length) filters[key] = values;
  }

  const [coins, options] = await Promise.all([
    fetchUserCoins(token, { pageNo: page - 1, pageSize: 16, search: query, filters }),
    fetchUserCoinFilters(token, [...FILTER_FIELDS]),
  ]);
  const list = coins.error ? [] : coins.data;
  const total = coins.error ? 0 : coins.totalCount;
  const pages = Math.max(1, Math.ceil(total / 16));
  const title = `${BUCKETS[kind].title} (${total})`;

  const hrefFor = (nextPage: number) => {
    const p = new URLSearchParams();
    if (query) p.set("q", query);
    for (const [key, values] of Object.entries(selected)) {
      values?.forEach((v) => p.append(key, v));
    }
    if (nextPage > 1) p.set("page", String(nextPage));
    const s = p.toString();
    return s ? `/collection/${bucket}?${s}` : `/collection/${bucket}`;
  };

  return (
    <>
      <p className="text-sm text-muted">
        <Link href="/collection" className="text-primary-500">
          Collections
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{title}</span>
      </p>
      <div className="mt-4 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-right text-xs text-muted">
            Showing {list.length} of {total} results
          </p>
          {coins.error && <p className="mt-4 text-sm text-[#dc2626]">{coins.reason ?? "Could not load coins."}</p>}
          {!coins.error && list.length === 0 && !query && Object.keys(selected).length === 0 && <CollectionEmptyState />}
          {!coins.error && list.length === 0 && (query || Object.keys(selected).length > 0) && (
            <p className="mt-8 text-sm text-muted">No coins match these filters.</p>
          )}
          <ul className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {list.map((coin) => {
              const href = withFrom(`/collection/coin/${coin.coinId}`, kind, page, query);
              const body = (
                <>
                  <div className="relative aspect-square bg-[#f7f7f8]">
                    <span className="absolute left-2 top-2 z-10 rounded-full bg-[#ecfdf5] px-2 py-0.5 text-[11px] font-medium text-[#047857]">
                      {kind === "wishlist" ? "Wishlist" : kind === "identified" ? "Identified" : "Owned"}
                    </span>
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
                  <p className="line-clamp-2 px-3 py-3 text-sm text-ink">
                    {coin.issuer ? `${coin.issuer}. ` : ""}
                    {coin.name}
                  </p>
                </>
              );
              return (
                <li key={coin.coinId} className="overflow-hidden rounded-xl border border-[#efefef] bg-white">
                  <Link href={href}>{body}</Link>
                </li>
              );
            })}
          </ul>
          {pages > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination page={page} totalPages={pages} href={hrefFor} />
            </div>
          )}
        </div>
        <aside className="hidden w-[240px] shrink-0 rounded-xl border border-[#efefef] bg-white p-4 lg:block">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-ink">Filter</p>
            <Link href={`/collection/${bucket}`} className="text-xs text-primary-500">
              Clear all
            </Link>
          </div>
          {FILTER_FIELDS.map((field) => {
            const values = options[field] ?? [];
            if (!values.length) return null;
            const picked = new Set(selected[field] ?? []);
            return (
              <div key={field} className="mt-4">
                <p className="text-sm font-medium capitalize text-ink">{field.replace(/([A-Z])/g, " $1")}</p>
                <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto">
                  {values.map((value) => {
                    const on = picked.has(value);
                    const next = new URLSearchParams();
                    if (query) next.set("q", query);
                    for (const [key, vals] of Object.entries(selected)) {
                      vals?.forEach((v) => {
                        if (!(key === field && v === value)) next.append(key, v);
                      });
                    }
                    if (!on) next.append(field, value);
                    const s = next.toString();
                    return (
                      <li key={value}>
                        <Link
                          href={s ? `/collection/${bucket}?${s}` : `/collection/${bucket}`}
                          className="flex items-center gap-2 text-sm text-ink"
                        >
                          <span className={`size-4 rounded border ${on ? "border-primary-500 bg-primary-500" : "border-[#d4d4d4]"}`} />
                          <span className="truncate">{value}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </aside>
      </div>
    </>
  );
}

function BucketBodyFallback({ bucketTitle }: { bucketTitle: string }) {
  return (
    <>
      <p className="text-sm text-muted">
        <Link href="/collection" className="text-primary-500">
          Collections
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ink">{bucketTitle}</span>
      </p>
      <div className="mt-4 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-right text-xs text-muted">Loading results…</p>
          <CollectionCoinTileSkeleton count={16} />
        </div>
        <aside className="hidden h-[320px] w-[240px] shrink-0 animate-pulse rounded-xl border border-[#efefef] bg-white lg:block" />
      </div>
    </>
  );
}

export default async function CollectionBucketPage({
  params,
  searchParams,
}: {
  params: Promise<{ bucket: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined> & { premium?: string }>;
}) {
  const { bucket } = await params;
  if (bucket === "coin") redirect("/collection");
  if (!(bucket in BUCKETS)) notFound();
  const kind = bucket as CollectionBucket;
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=/collection/${bucket}`);
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");
  const token = await getSessionToken();
  if (!token) redirect(`/auth?next=/collection/${bucket}`);

  const page = parsePageParam(Array.isArray(sp.page) ? sp.page[0] : sp.page);
  const query = parseQueryParam(sp.q);
  const selected = parseListingFilterParams(sp);
  const bodyKey = `${bucket}|${query}|${page}|${JSON.stringify(selected)}`;

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <Suspense fallback={<AppSidebar user={user} active="collection" />}>
        <CollectionSidebar user={user} bucket={bucket} />
      </Suspense>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto w-full max-w-[1122px]">
            <Suspense key={bodyKey} fallback={<BucketBodyFallback bucketTitle={BUCKETS[kind].title} />}>
              <BucketBody
                token={token}
                kind={kind}
                bucket={bucket}
                page={page}
                query={query}
                selected={selected}
              />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
