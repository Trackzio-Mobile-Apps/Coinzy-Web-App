import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AppSidebar } from "@/components/home/AppSidebar";
import { TopNav } from "@/components/landing/TopNav";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { getPremiumStatus, getSessionUser } from "@/lib/auth/session";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { Footer } from "@/components/landing/Footer";
import { WebappCTASection } from "@/components/marketplace/WebappCTASection";
import { CoinPhotos, DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";
import { CoinDetailTabs, EstimatedValueBanner, TableRow } from "@/components/catalogue/CoinDetailsInteractive";
import { fetchArchetypeDetails, isArchetypeId } from "@/lib/api/coinzy";
import { fetchArchetypeDetailsForSession } from "@/lib/api/coinzy-session";
import { getSessionToken } from "@/lib/auth/session";
import { WishlistHeart } from "@/components/catalogue/WishlistHeart";
import { withFrom } from "@/lib/backNav";
import { FROM_HOME, pagedHref, parsePageParam, parseQueryParam } from "@/lib/backNav";
import { getCategory } from "@/lib/catalogue/categories";
import { coinTitle, detailTabs, gradePrices, overviewRows } from "@/lib/catalogue/coinDetails";
import { COIN_DETAILS_CATEGORIES } from "@/lib/constants";

const DETAIL_ICONS = "/assets/coin-details";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string; fromPage?: string; fromQ?: string | string[]; premium?: string }>;
};

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
async function CoinDetailsContent({
  id,
  from,
  fromPage,
  fromQuery,
  premium,
}: {
  id: string;
  from?: string;
  fromPage: number;
  /** Search term of the list the visitor came from. */
  fromQuery: string;
  premium: boolean;
}) {
  const sessionToken = await getSessionToken();
  const coin =
    (sessionToken ? await fetchArchetypeDetailsForSession(id, sessionToken) : null) ?? (await fetchArchetypeDetails(id));
  if (!coin) notFound();
  const wishlisted = Boolean(coin.isWishlisted);
  const wishlistReturn = withFrom(`/catalogue/coin/${id}`, from, fromPage, fromQuery);

  // Breadcrumb trail = where the visitor came from (`?from=` + `?fromPage=`, see `lib/backNav.ts`):
  // the dashboard, the /catalogue browse-all pager, or a view-all category page — each at its exact page.
  const category = from ? getCategory(from) : null;
  const ancestors =
    from === FROM_HOME
      ? [{ href: "/home", label: "Home" }]
      : from === "identify"
        ? [{ href: "/identify", label: "Identify" }]
      : from === "catalogue"
        ? [{ href: `${pagedHref("/catalogue", fromPage, fromQuery)}#browse-all`, label: "Global Catalogue" }]
        : [
            { href: "/catalogue", label: "Global Catalogue" },
            ...(category ? [{ href: pagedHref(`/catalogue/${category.slug}`, fromPage, fromQuery), label: category.crumb }] : []),
          ];
  const title = coinTitle(coin);
  const grades = gradePrices(coin.estimatedPrice);

  return (
    <>
      {/* Breadcrumb (Figma 797:38514) */}
      <DetailsBreadcrumb
        ancestors={ancestors}
        current={title}
      />

      {/* Details (Figma 862:29227) */}
      <div className="mt-10 flex flex-col items-start gap-4 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          <div className="flex w-full flex-col gap-6 rounded-2xl bg-white p-4">
            <div className="flex min-h-8 items-center justify-between gap-4">
              <h1 className="text-2xl font-semibold leading-8 text-ink">{title}</h1>
              <WishlistHeart
                archetypeId={id}
                initialWishlisted={wishlisted}
                returnTo={wishlistReturn}
                className="flex size-6 shrink-0 items-center justify-center"
              />
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

          <CoinDetailTabs tabs={detailTabs(coin)} premium={premium} />
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

/** Catalogue coin details — marketing `797:35810`; signed-in free/premium `1348:137792` / `1341:249499`. */
export default async function CatalogueCoinPage({ params, searchParams }: Params) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { from, fromPage, fromQ } = sp;
  // Malformed ids 404 straight away (real status code); unknown ids 404 inside the stream.
  if (!isArchetypeId(id)) notFound();

  const user = await getSessionUser();
  const premium =
    !!user &&
    ((await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1"));

  const details = (
    <Suspense key={id} fallback={<CoinDetailsSkeleton />}>
      <CoinDetailsContent
        id={id}
        from={from}
        fromPage={parsePageParam(fromPage)}
        fromQuery={parseQueryParam(fromQ)}
        premium={premium}
      />
    </Suspense>
  );

  if (user) {
    return (
      <div className="flex h-svh overflow-hidden bg-white">
        <AppSidebar user={user} active="catalogue" />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
          <MarketplaceAppHeader user={user} premium={premium} />
          <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
            <div className="mx-auto w-full max-w-[1122px]">{details}</div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <section className="mx-auto w-full max-w-[1440px] px-6 pt-20 lg:px-[160px]">{details}</section>

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
