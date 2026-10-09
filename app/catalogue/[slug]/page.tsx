import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { TopNav } from "@/components/landing/TopNav";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { CatalogueEmpty } from "@/components/catalogue/CatalogueEmpty";
import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { CoinGrid, Pagination, loadCoins } from "@/components/catalogue/CoinGrid";
import { CoinGridSkeleton } from "@/components/catalogue/CoinGridSkeleton";
import { pagedHref, parsePageParam, parseQueryParam } from "@/lib/backNav";
import { getSessionUser } from "@/lib/auth/session";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { CATALOGUE_CATEGORIES, CATALOGUE_CHIPS, buildFilters, getCategory } from "@/lib/catalogue/categories";
import { CATALOGUE_US_CATEGORIES } from "@/lib/constants";

const PAGE_SIZE = 20; // Figma 797:33107: 4 rows × 5 cards ("Showing 20 of …")
const ICONS = "/assets/catalogue";

type Params = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; q?: string | string[] }>;
};

type Category = NonNullable<ReturnType<typeof getCategory>>;

type Results = Awaited<ReturnType<typeof loadCoins>>;

export async function generateMetadata({ params, searchParams }: Params): Promise<Metadata> {
  const category = getCategory((await params).slug);
  if (!category) return {};
  const query = parseQueryParam((await searchParams).q);
  return {
    title: `${query ? `“${query}” in ` : ""}${category.title} | Global Catalogue | Coinzy AI`,
    description: category.description,
    ...(query && { robots: { index: false, follow: true } }),
  };
}

/** "Showing N of M results" (Figma 1386:252341); streams in with the grid. */
async function ResultCount({ results, query }: { results: Promise<Results>; query: string }) {
  const { coins, totalCount } = await results;
  // Nothing to count — the empty / unavailable state below says it.
  if (!coins.length) return null;
  return (
    <p role="status" className="font-jakarta text-xs text-neutral-400">
      Showing <span className="font-bold text-muted">{coins.length}</span> of {totalCount.toLocaleString("en-US")}{" "}
      results{query ? <> for “{query}”</> : null}
    </p>
  );
}

/** Grid + pager for one view-all page; streams in behind a skeleton so the header/search stay interactive. */
async function CategoryResults({
  category,
  results,
  page,
  query,
}: {
  category: Category;
  results: Promise<Results>;
  page: number;
  query: string;
}) {
  const { coins, totalPages, live } = await results;
  const current = Math.min(page, totalPages);
  const base = `/catalogue/${category.slug}`;

  return (
    <>
      {coins.length ? (
        <CoinGrid coins={coins} from={category.slug} fromPage={current} fromQuery={query} />
      ) : (
        <CatalogueEmpty
          query={query}
          scope={query ? category.title : undefined}
          clearHref={base}
          unavailable={Boolean(query) && !live}
        />
      )}
      {!live && !query && (
        <p className="text-center text-xs text-neutral-400">
          Showing sample coins — the catalogue is temporarily unavailable.
        </p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination page={current} totalPages={totalPages} visible={6} href={(n) => pagedHref(base, n, query)} />
        </div>
      )}
    </>
  );
}

export default async function CatalogueCategoryPage({ params, searchParams }: Params) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  // Signed-in users stay in the app shell — never the marketing catalogue layout.
  if (await getSessionUser()) {
    const p = new URLSearchParams();
    if (slug && slug !== "all") p.set("category", slug);
    const q = parseQueryParam(sp.q);
    if (q) p.set("q", q);
    const pageNum = parsePageParam(Array.isArray(sp.page) ? sp.page[0] : sp.page);
    if (pageNum > 1) p.set("page", String(pageNum));
    redirect(p.size ? `/catalogue?${p}` : "/catalogue");
  }
  const { page, q } = sp;
  const category = getCategory(slug);
  if (!category) notFound();

  const requested = parsePageParam(page);
  const query = parseQueryParam(q);
  // One request feeds both the count line and the grid (each awaits this promise).
  const results = buildFilters(category)
    .catch(() => ({}))
    .then((filters) => loadCoins({ page: requested, pageSize: PAGE_SIZE, filters, search: query }));

  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <section className="mx-auto w-full max-w-[1440px] px-6 pb-5 pt-20 lg:px-[160px]">
          <div className="space-y-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-5">
              <Link
                href="/catalogue"
                aria-label="Back to Global Catalogue"
                className="flex rounded border-[0.5px] border-[#c2c2c4] bg-white p-1 hover:bg-neutral-50"
              >
                <Image src={`${ICONS}/icon-breadcrumb-back.svg`} alt="" width={24} height={24} />
              </Link>
              <nav aria-label="Breadcrumb" className="flex items-center gap-2">
                <Link href="/catalogue" className="text-base leading-6 text-primary-500 underline">
                  Global Catalogue
                </Link>
                <Image src={`${ICONS}/icon-breadcrumb-separator.svg`} alt="" width={24} height={24} />
                <span aria-current="page" className="text-lg font-semibold leading-7 text-ink">
                  {category.crumb}
                </span>
              </nav>
            </div>

            <div className="space-y-10">
              <div className="space-y-4">
                <div className="space-y-1">
                  <h1 className="text-lg font-medium leading-7 text-ink">{category.title}</h1>
                  <p className="text-sm leading-5 text-muted">{category.description}</p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                    {/* Search isn't in this Figma frame; same pill as the dashboard's marketplace search, before the chips. */}
                    <CatalogueSearch key={query} action={`/catalogue/${category.slug}`} query={query} className="sm:w-[260px]" />
                    <div className="flex flex-wrap gap-1.5">
                      {CATALOGUE_CHIPS.map((chip) => {
                        const active = chip === category.slug;
                        return (
                          <Link
                            key={chip}
                            href={pagedHref(`/catalogue/${chip}`, 1, query)}
                            aria-current={active ? "page" : undefined}
                            className={`flex h-6 items-center rounded-full border bg-white px-3 text-sm font-medium leading-5 ${
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
                  </div>
                  <Suspense fallback={<span className="h-4 w-44" />}>
                    <ResultCount results={results} query={query} />
                  </Suspense>
                </div>
              </div>

              <Suspense key={`${query}|${requested}`} fallback={<CoinGridSkeleton count={PAGE_SIZE} />}>
                <CategoryResults category={category} results={results} page={requested} query={query} />
              </Suspense>
            </div>
          </div>
        </section>

        <BrowseCatalogueSection
          label="Browse Catalogue"
          description="Explore popular collecting categories, from ancient Roman to rare American."
          className="bg-cream"
          categories={CATALOGUE_US_CATEGORIES}
          innerClassName=""
          cardVariant="marketplace"
          viewAllHref="/catalogue"
        />
        <WebappCTASection />
        <MobileAppSection />
      </main>
      <Footer />
    </>
  );
}
