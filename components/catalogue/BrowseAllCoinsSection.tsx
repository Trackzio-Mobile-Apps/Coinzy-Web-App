import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { CatalogueEmpty } from "@/components/catalogue/CatalogueEmpty";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { CoinGrid, Pagination, loadCoins } from "@/components/catalogue/CoinGrid";
import { CoinGridSkeleton } from "@/components/catalogue/CoinGridSkeleton";
import { SectionShell } from "@/components/ui/SectionShell";
import { pagedHref } from "@/lib/backNav";

const PAGE_SIZE = 15; // Figma: 3 rows × 5 cards

/** Grid + pager for one page of `/catalogue` (optionally narrowed by `?q=`); streams in behind a skeleton. */
async function BrowseAllResults({ page, query }: { page: number; query: string }) {
  const { coins, totalPages, totalCount, live } = await loadCoins({ page, pageSize: PAGE_SIZE, search: query });
  const current = Math.min(page, totalPages);
  const clearHref = "/catalogue#browse-all";

  if (query && !coins.length) {
    return <CatalogueEmpty query={query} clearHref={clearHref} unavailable={!live} />;
  }

  return (
    <div className="flex flex-col items-center gap-16">
      <div className="w-full space-y-4">
        {query && (
          <p role="status" className="font-jakarta text-xs text-neutral-400">
            <span className="font-bold text-muted">{totalCount.toLocaleString("en-US")}</span>{" "}
            {totalCount === 1 ? "result" : "results"} for “{query}”
          </p>
        )}
        <CoinGrid coins={coins} from="catalogue" fromPage={current} fromQuery={query} />
      </div>
      <Pagination page={current} totalPages={totalPages} href={(n) => `${pagedHref("/catalogue", n, query)}#browse-all`} />
    </div>
  );
}

export function BrowseAllCoinsSection({ page = 1, query = "" }: { page?: number; query?: string }) {
  return (
    <SectionShell id="browse-all" className="bg-cream">
      <div className="flex flex-col items-center gap-16">
        <div className="w-full space-y-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex-1 space-y-3 font-jakarta">
              <p className="text-xs uppercase leading-[1.5] text-primary-500">Browse catalogue</p>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold leading-[1.2] text-ink">Browse all coins</h2>
                <p className="text-sm leading-[1.5] text-muted">
                  Explore popular collecting categories, from ancient Roman to rare American.
                </p>
              </div>
            </div>
            {/* Search sits beside "View all" so the section keeps Figma's vertical rhythm. */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <CatalogueSearch key={query} action="/catalogue" query={query} hash="#browse-all" className="sm:w-[260px]" />
              <Link
                href="/catalogue/all"
                className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium leading-5 text-primary-500 hover:text-primary-700"
              >
                View all
                <Image src="/assets/landing-page/icons/shared/arrow-right.svg" alt="" width={16} height={16} />
              </Link>
            </div>
          </div>
          <Suspense key={`${query}|${page}`} fallback={<CoinGridSkeleton count={PAGE_SIZE} />}>
            <BrowseAllResults page={page} query={query} />
          </Suspense>
        </div>
      </div>
    </SectionShell>
  );
}
