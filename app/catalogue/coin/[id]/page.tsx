import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { TopNav } from "@/components/landing/TopNav";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { CoinPhotos, DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";
import { CoinDetailTabs, EstimatedValueBanner, TableRow } from "@/components/catalogue/CoinDetailsInteractive";
import { fetchArchetypeDetails, isArchetypeId } from "@/lib/api/coinzy";
import { getCategory } from "@/lib/catalogue/categories";
import { coinTitle, detailTabs, gradePrices, overviewRows } from "@/lib/catalogue/coinDetails";
import { COIN_DETAILS_CATEGORIES } from "@/lib/constants";

const ICONS = "/assets/catalogue";
const DETAIL_ICONS = "/assets/coin-details";

type Params = { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const coin = await fetchArchetypeDetails((await params).id).catch(() => null);
  if (!coin) return {};
  const title = coinTitle(coin);
  return {
    title: `${title} | Global Catalogue | Coinzy AI`,
    description: coin.coinSummary ?? `${title} — specifications, history and estimated value on Coinzy.`,
  };
}

/** Breadcrumb + details: streams in after the API responds; `CoinDetailsSkeleton` shows meanwhile. */
async function CoinDetailsContent({ id, from }: { id: string; from?: string }) {
  const coin = await fetchArchetypeDetails(id);
  if (!coin) notFound();

  // Breadcrumb ancestor: the view-all page the visitor came from (`?from=slug`), if any.
  const category = from ? getCategory(from) : null;
  const title = coinTitle(coin);
  const grades = gradePrices(coin.estimatedPrice);

  return (
    <>
      {/* Breadcrumb (Figma 797:38514) */}
      <DetailsBreadcrumb
        ancestors={[
          { href: "/catalogue", label: "Global Catalogue" },
          ...(category ? [{ href: `/catalogue/${category.slug}`, label: category.crumb }] : []),
        ]}
        current={title}
      />

      {/* Details (Figma 862:29227) */}
      <div className="mt-10 flex flex-col items-start gap-4 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <div className="flex w-full flex-col gap-6 rounded-2xl bg-white p-4">
            <div className="flex min-h-8 items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold leading-8 text-ink">{title}</h1>
              <button
                type="button"
                aria-label="Add to wishlist"
                className="flex size-6 shrink-0 items-center justify-center"
              >
                <Image
                  src={`${ICONS}/icon-heart.svg`}
                  alt=""
                  width={22}
                  height={20}
                  className="h-[19.5px] w-[21.5px]"
                />
              </button>
            </div>

            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <CoinPhotos images={coin.imageUrls} title={title} />

              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <EstimatedValueBanner grades={grades} />
                <div className="flex flex-col gap-4">
                  <h2 className="text-lg font-medium leading-7 text-ink">Overview</h2>
                  <div className="flex flex-col">
                    {overviewRows(coin).map((row) => (
                      <TableRow key={row.label} {...row} gapClassName="gap-6 lg:gap-[210px]" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <CoinDetailTabs tabs={detailTabs(coin)} />
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-4 sm:flex-row lg:w-[268px] lg:flex-col">
          {grades.length > 0 && (
            <div className="flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-3">
              <h2 className="flex h-7 items-center text-sm font-medium leading-5 text-ink">Estimated Value</h2>
              <dl className="flex flex-col">
                {grades.map((g) => (
                  <div key={g.code} className="flex gap-3 py-2 text-xs leading-4 text-ink">
                    <dt className="flex-1">{g.label}</dt>
                    <dd className="shrink-0 text-right font-medium">{g.price}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Figma "OtherApps" card */}
          <div className="flex w-full flex-col items-center gap-3 self-start rounded-2xl bg-white px-4 py-3 lg:w-[268px]">
            <p className="w-full text-sm font-medium leading-5 text-ink">Scan to download Coinzy AI</p>
            <p className="w-full text-xs leading-4 text-muted">
              Identify coins instantly and sync your collection across devices.
            </p>
            <div className="flex w-full justify-center px-5 py-[7px]">
              <Image
                src={`${DETAIL_ICONS}/qr-coinzy.png`}
                alt="QR code to download the Coinzy AI app"
                width={154}
                height={142}
              />
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

/** Catalogue coin details — Figma `Landing page/CataloguePage/DetailsPage` (797:35810). */
export default async function CatalogueCoinPage({ params, searchParams }: Params) {
  const [{ id }, { from }] = await Promise.all([params, searchParams]);
  // Malformed ids 404 straight away (real status code); unknown ids 404 inside the stream.
  if (!isArchetypeId(id)) notFound();

  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <section className="mx-auto w-full max-w-[1440px] px-6 pt-20 lg:px-[160px]">
          {/* Page shell renders immediately; the key re-shows the loader when moving between coins. */}
          <Suspense key={id} fallback={<CoinDetailsSkeleton />}>
            <CoinDetailsContent id={id} from={from} />
          </Suspense>
        </section>

        <BrowseCatalogueSection
          label="Browse Catalogue"
          description="Explore popular collecting categories, from ancient Roman to rare American."
          className="bg-cream"
          categories={COIN_DETAILS_CATEGORIES}
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
