import { Suspense } from "react";
import { AppSidebar } from "@/components/home/AppSidebar";
import { CatalogueEmpty } from "@/components/catalogue/CatalogueEmpty";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { CoinGrid, Pagination, loadCoins } from "@/components/catalogue/CoinGrid";
import { CoinGridSkeleton } from "@/components/catalogue/CoinGridSkeleton";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import type { SessionUser } from "@/lib/auth/session";
import { parsePageParam, parseQueryParam } from "@/lib/backNav";
import { CATALOGUE_CATEGORIES, buildFilters, getCategory } from "@/lib/catalogue/categories";

import { CatalogueCategoryBand } from "@/components/catalogue/CatalogueCategoryBand";
import { MarketplaceFilterPanel } from "@/components/marketplace/MarketplaceFilterPanel";
import { fetchFilterValues } from "@/lib/api/coinzy";
import { LISTING_FILTER_FIELDS, parseListingFilterParams, type ListingFilterSelection, type ListingFilterValues } from "@/lib/marketplace/listingFilters";

const PAGE_SIZE = 16;
let filterOptions: Promise<ListingFilterValues> | null = null;
let filterOptionsExpireAt = 0;

function loadFilterOptions() {
  // The combined response exceeds Next's 2 MB fetch-cache limit. Reuse the
  // public facet data per server process rather than downloading it on each search.
  if (!filterOptions || Date.now() >= filterOptionsExpireAt) {
    filterOptionsExpireAt = Date.now() + 86400_000;
    filterOptions = fetchFilterValues([...LISTING_FILTER_FIELDS]).then((options) => {
      for (const field of LISTING_FILTER_FIELDS) options[field] = [...new Set(options[field].map(String))];
      return options;
    }).catch((error) => {
      filterOptions = null;
      throw error;
    });
  }
  return filterOptions;
}

async function CatalogueFilters() {
  try {
    const options = await loadFilterOptions();
    return <MarketplaceFilterPanel options={options} collapsible wrapperClassName="order-first w-full shrink-0 lg:order-last lg:w-[268px]" />;
  } catch {
    return <p role="status" className="w-[268px] rounded-2xl border border-border-neutral bg-white p-4 text-sm text-muted">Filters are temporarily unavailable.</p>;
  }
}

function pageHref(base: URLSearchParams, page: number) {
  const next = new URLSearchParams(base);
  if (page <= 1) next.delete("page");
  else next.set("page", String(page));
  const q = next.toString();
  return q ? `/catalogue?${q}` : "/catalogue";
}

async function SignedInResults({
  categorySlug,
  page,
  query,
  selected,
}: {
  categorySlug: string | undefined;
  page: number;
  query: string;
  selected: ListingFilterSelection;
}) {
  const category = categorySlug && categorySlug !== "all" ? getCategory(categorySlug) : null;
  const filters: Record<string, (string | boolean)[]> = category ? await buildFilters(category).catch(() => ({})) : {};
  for (const [field, values] of Object.entries(selected)) {
    filters[field] = filters[field] ? values.filter((value) => filters[field].includes(value)) : values;
  }
  if (Object.values(filters).some((values) => !values.length)) {
    return <CatalogueEmpty query={query} clearHref="/catalogue" />;
  }
  const { coins, totalPages, totalCount, live } = await loadCoins({
    page,
    pageSize: PAGE_SIZE,
    filters,
    search: query,
  });
  const current = Math.min(page, totalPages);
  const from = category?.slug ?? "catalogue";
  const baseParams = new URLSearchParams();
  for (const [field, values] of Object.entries(selected)) values.forEach((value) => baseParams.append(field, value));
  if (query) baseParams.set("q", query);
  if (category && category.slug !== "all") baseParams.set("category", category.slug);

  if (!coins.length) {
    return (
      <CatalogueEmpty
        query={query}
        scope={query && category ? category.title : undefined}
        clearHref={pageHref(new URLSearchParams(category && category.slug !== "all" ? { category: category.slug } : {}), 1)}
        unavailable={Boolean(query) && !live}
      />
    );
  }

  return (
    <>
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-medium leading-7 text-ink">Browse all coins</h2>
        <p role="status" className="text-xs leading-4 text-[#9e9ea1]">
          Showing <span className="font-medium text-ink">{coins.length}</span> of{" "}
          {totalCount.toLocaleString("en-US")} results
          {query ? <> for “{query}”</> : null}
          {category && category.slug !== "all" ? <> in {category.title}</> : null}
        </p>
      </div>
      <CoinGrid compact coins={coins} from={from} fromPage={current} fromQuery={query} />
      {totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <Pagination page={current} totalPages={totalPages} href={(n) => pageHref(baseParams, n)} />
        </div>
      )}
      {!live && !query && (
        <p className="mt-4 text-center text-xs text-neutral-400">
          Showing sample coins — the catalogue is temporarily unavailable.
        </p>
      )}
    </>
  );
}

/** Signed-in Global Catalogue browse — shell paints first; grid streams behind Suspense. */
export function CatalogueSignedInPage({
  user,
  premium,
  searchParams,
}: {
  user: SessionUser;
  premium: boolean;
  searchParams: Record<string, string | string[] | undefined> & {
    page?: string;
    q?: string | string[];
    category?: string;
  };
}) {
  const query = parseQueryParam(searchParams.q);
  const page = parsePageParam(searchParams.page);
  const category =
    typeof searchParams.category === "string" && searchParams.category in CATALOGUE_CATEGORIES
      ? searchParams.category
      : undefined;

  const selected = parseListingFilterParams(searchParams);
  const filterKey = JSON.stringify(selected);
  const keepParams: Record<string, string | string[]> = {};
  for (const [field, value] of Object.entries(searchParams)) {
    if (value !== undefined && field !== "q" && field !== "page") keepParams[field] = value;
  }

  return (
    <div className="flex min-h-dvh bg-white">
      <AppSidebar user={user} active="catalogue" />
      <div className="flex min-w-0 flex-1 flex-col bg-[#faf7f5]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 px-4 py-4 lg:px-8">
          <div className="mb-4 flex min-h-10 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="shrink-0 text-2xl font-semibold leading-8 text-ink">Global Catalogue</h2>
            <CatalogueSearch
              key={`${category ?? "all"}|${query}`}
              action="/catalogue"
              query={query}
              keepParams={keepParams}
              placeholder="Search coins, empires, countries, years..."
              label="Search catalogue"
              variant="toolbar"
            />
          </div>

          <div className="flex flex-col items-start gap-4 lg:flex-row">
            <div className="flex w-full min-w-0 flex-1 flex-col gap-10">
              <CatalogueCategoryBand category={category} query={query} />
              <section className="w-full" aria-label="Catalogue results" data-listing-results>
                <Suspense key={`${category ?? "all"}|${query}|${page}|${filterKey}`} fallback={<CoinGridSkeleton compact count={PAGE_SIZE} />}>
                  <SignedInResults categorySlug={category} page={page} query={query} selected={selected} />
                </Suspense>
              </section>
            </div>
            <Suspense fallback={<div className="hidden h-[600px] w-[268px] shrink-0 animate-pulse rounded-2xl bg-white lg:block" />}><CatalogueFilters /></Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
