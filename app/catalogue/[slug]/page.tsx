import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TopNav } from "@/components/landing/TopNav";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { CoinGrid, Pagination, loadCoins } from "@/components/catalogue/CoinGrid";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { CATALOGUE_CATEGORIES, CATALOGUE_CHIPS, buildFilters, getCategory } from "@/lib/catalogue/categories";
import { CATALOGUE_US_CATEGORIES } from "@/lib/constants";

const PAGE_SIZE = 20; // Figma 797:33107: 4 rows × 5 cards ("Showing 20 of …")
const ICONS = "/assets/catalogue";

type Params = { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const category = getCategory((await params).slug);
  return category
    ? { title: `${category.title} | Global Catalogue | Coinzy AI`, description: category.description }
    : {};
}

export default async function CatalogueCategoryPage({ params, searchParams }: Params) {
  const [{ slug }, { page }] = await Promise.all([params, searchParams]);
  const category = getCategory(slug);
  if (!category) notFound();

  const requested = Math.max(1, Number.parseInt(page ?? "1", 10) || 1);
  const filters = await buildFilters(category).catch(() => ({}));
  const { coins, totalPages, totalCount, live } = await loadCoins({ page: requested, pageSize: PAGE_SIZE, filters });
  const current = Math.min(requested, totalPages);

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
                  <div className="flex flex-wrap gap-1.5">
                    {CATALOGUE_CHIPS.map((chip) => {
                      const active = chip === category.slug;
                      return (
                        <Link
                          key={chip}
                          href={`/catalogue/${chip}`}
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
                  <p className="font-jakarta text-xs text-neutral-400">
                    Showing <span className="font-bold text-muted">{coins.length}</span> of{" "}
                    {totalCount.toLocaleString("en-US")} results
                  </p>
                </div>
              </div>

              {coins.length ? (
                <CoinGrid coins={coins} from={category.slug} />
              ) : (
                <p className="py-16 text-center text-sm text-muted">No coins found in this category yet.</p>
              )}
              {!live && (
                <p className="text-center text-xs text-neutral-400">
                  Showing sample coins — the catalogue is temporarily unavailable.
                </p>
              )}

              {totalPages > 1 && (
                <div className="flex justify-center">
                  <Pagination
                    page={current}
                    totalPages={totalPages}
                    visible={6}
                    href={(n) => `/catalogue/${category.slug}?page=${n}`}
                  />
                </div>
              )}
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
