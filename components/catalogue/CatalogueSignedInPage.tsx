import Link from "next/link";
import { Suspense } from "react";
import { AppSidebar } from "@/components/home/AppSidebar";
import { CatalogueEmpty } from "@/components/catalogue/CatalogueEmpty";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { CoinGrid, Pagination, loadCoins } from "@/components/catalogue/CoinGrid";
import { CoinGridSkeleton } from "@/components/catalogue/CoinGridSkeleton";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import type { SessionUser } from "@/lib/auth/session";
import { parsePageParam, parseQueryParam } from "@/lib/backNav";
import { CATALOGUE_CATEGORIES, CATALOGUE_CHIPS, buildFilters, getCategory } from "@/lib/catalogue/categories";

const PAGE_SIZE = 20;

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
}: {
  categorySlug: string | undefined;
  page: number;
  query: string;
}) {
  const category = categorySlug && categorySlug !== "all" ? getCategory(categorySlug) : null;
  const filters = category ? await buildFilters(category).catch(() => ({})) : {};
  const { coins, totalPages, totalCount, live } = await loadCoins({
    page,
    pageSize: PAGE_SIZE,
    filters,
    search: query,
  });
  const current = Math.min(page, totalPages);
  const from = category?.slug ?? "catalogue";
  const baseParams = new URLSearchParams();
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
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p role="status" className="text-sm leading-5 text-[#737373]">
          Showing <span className="font-medium text-ink">{coins.length}</span> of{" "}
          {totalCount.toLocaleString("en-US")} results
          {query ? <> for “{query}”</> : null}
          {category && category.slug !== "all" ? <> in {category.title}</> : null}
        </p>
      </div>
      <CoinGrid coins={coins} from={from} fromPage={current} fromQuery={query} />
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
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

  const chipHref = (slug: string) => {
    const p = new URLSearchParams();
    if (slug !== "all") p.set("category", slug);
    if (query) p.set("q", query);
    const s = p.toString();
    return s ? `/catalogue?${s}` : "/catalogue";
  };

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="catalogue" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[28px] font-semibold leading-9 text-ink">Global Catalogue</h2>
            <CatalogueSearch
              key={`${category ?? "all"}|${query}`}
              action="/catalogue"
              query={query}
              keepParams={category && category !== "all" ? { category } : undefined}
              placeholder="Search coins by name…"
              label="Search catalogue"
              className="w-full max-w-[480px]"
            />
          </div>

          <div className="mb-6 flex flex-wrap gap-1.5">
            {CATALOGUE_CHIPS.map((chip) => {
              const active = (category ?? "all") === chip;
              return (
                <Link
                  key={chip}
                  href={chipHref(chip)}
                  aria-current={active ? "page" : undefined}
                  className={`flex h-8 items-center rounded-full border bg-white px-3 text-sm font-medium leading-5 ${
                    active
                      ? "border-primary-500 text-primary-500"
                      : "border-[#e5e5e5] text-muted hover:text-ink"
                  }`}
                >
                  {chip === "all" ? "All" : CATALOGUE_CATEGORIES[chip].title}
                </Link>
              );
            })}
          </div>

          <Suspense key={`${category ?? "all"}|${query}|${page}`} fallback={<CoinGridSkeleton count={PAGE_SIZE} />}>
            <SignedInResults categorySlug={category} page={page} query={query} />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
