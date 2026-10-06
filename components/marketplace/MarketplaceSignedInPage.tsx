import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { AppSidebar } from "@/components/home/AppSidebar";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { Pagination } from "@/components/catalogue/CoinGrid";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { MarketplaceFilterPanel } from "@/components/marketplace/MarketplaceFilterPanel";
import { fetchListingFilterValues } from "@/lib/api/coinzy";
import type { SessionUser } from "@/lib/auth/session";
import { parsePageParam, parseQueryParam } from "@/lib/backNav";
import { MARKETPLACE_PAGE_CATEGORIES } from "@/lib/constants";
import { loadSignedInBrowse } from "@/lib/marketplace/categories";

const PAGE_SIZE = 16;
const A = "/assets/marketplace";

const EXPLORE_SLUGS = ["american-coins", "roman-coins", "gold-coins"] as const;

function pageHref(base: URLSearchParams, page: number) {
  const next = new URLSearchParams(base);
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const q = next.toString();
  return q ? `/marketplace?${q}` : "/marketplace";
}

/** Signed-in marketplace — Figma `1356:154252`. */
export async function MarketplaceSignedInPage({
  user,
  premium,
  searchParams,
}: {
  user: SessionUser;
  premium: boolean;
  searchParams: { page?: string; q?: string | string[]; category?: string; issuer?: string | string[] };
}) {
  const query = parseQueryParam(searchParams.q);
  const page = parsePageParam(searchParams.page);
  const category = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const issuerRaw = searchParams.issuer;
  const issuerFilters = (Array.isArray(issuerRaw) ? issuerRaw : issuerRaw ? [issuerRaw] : []).map((s) => s.trim()).filter(Boolean);

  const [browse, filterValues] = await Promise.all([
    loadSignedInBrowse({ categorySlug: category, search: query, page, pageSize: PAGE_SIZE, issuerFilters }).catch(() => ({
      cards: [],
      totalCount: 0,
      totalPages: 1,
      page: 1,
    })),
    fetchListingFilterValues(["issuer"]).catch(() => ({ issuer: [] as string[] })),
  ]);

  const baseParams = new URLSearchParams();
  if (query) baseParams.set("q", query);
  if (category) baseParams.set("category", category);
  for (const i of issuerFilters) baseParams.append("issuer", i);

  const showing = browse.cards.length;
  const total = browse.totalCount;

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="marketplace" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-[28px] font-semibold leading-9 text-ink">Marketplace</h2>
              <CatalogueSearch
                action="/marketplace"
                query={query}
                placeholder="Search coins, empires, countries, years..."
                label="Search marketplace listings"
                className="w-full max-w-[480px]"
              />
            </div>

            <section className="mb-8 rounded-[12px] border border-[#e5e7eb] bg-white p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#f5f5f5]">
                    <Image src={`${A}/icon-listings.svg`} alt="" width={20} height={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium leading-5 text-ink">Your listings</h3>
                    <p className="mt-1 max-w-md text-sm leading-5 text-[#737373]">
                      You haven&apos;t listed anything yet. Turn your collection into cash — list a coin in under 2 minutes.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  title="Coming soon"
                  className="shrink-0 rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium leading-5 text-ink opacity-60"
                >
                  List a coin
                </button>
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-medium leading-7 text-ink">Explore by categories</h3>
                <Link href="/marketplace" className="text-sm font-medium leading-5 text-primary-500 hover:underline">
                  See more
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {MARKETPLACE_PAGE_CATEGORIES.slice(0, 3).map((cat, i) => (
                  <Link
                    key={cat.title}
                    href={`/marketplace?category=${EXPLORE_SLUGS[i] ?? "all"}`}
                    className="relative flex h-[120px] overflow-hidden rounded-[12px] px-4 py-3"
                    style={{ backgroundColor: cat.wellBg }}
                  >
                    <div className="relative z-10 flex flex-col justify-end">
                      <p className="text-sm font-medium leading-5 text-ink">{cat.title}</p>
                      <p className="text-xs leading-4 text-[#737373]">{cat.subtitle}</p>
                    </div>
                    <Image src={cat.coin} alt="" width={80} height={80} className="absolute bottom-0 right-2 object-contain" />
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-lg font-medium leading-7 text-ink">Browse all coins</h3>
                <p className="text-sm leading-5 text-[#737373]">
                  Showing {showing} of {total.toLocaleString("en-US")} results
                </p>
              </div>
              {browse.cards.length ? (
                <>
                  <ListingGrid cards={browse.cards} from="marketplace" fromPage={browse.page} fromQuery={query} columns={4} />
                  {browse.totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination page={browse.page} totalPages={browse.totalPages} href={(n) => pageHref(baseParams, n)} />
                    </div>
                  )}
                </>
              ) : (
                <p className="rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-8 text-center text-sm leading-5 text-muted">
                  No listings match your search or filters. Try clearing filters or a different search term.
                </p>
              )}
            </section>
          </main>

          <Suspense fallback={<div className="w-[266px] shrink-0 border-l border-[#e5e7eb] bg-white" />}>
            <MarketplaceFilterPanel issuers={filterValues.issuer} rulerSamples={[]} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
