import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { AppSidebar } from "@/components/home/AppSidebar";
import { CoinPhotos, DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";
import { CoinDetailTabs, EstimatedValueBanner, TableRow } from "@/components/catalogue/CoinDetailsInteractive";
import { IdentifyExpertBanner } from "@/components/identify/IdentifyExpertBanner";
import { IdentifyResultRail } from "@/components/identify/IdentifyCoinClient";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { WishlistHeart } from "@/components/catalogue/WishlistHeart";
import { fetchArchetypeDetails, isArchetypeId } from "@/lib/api/coinzy";
import { fetchArchetypeDetailsForSession } from "@/lib/api/coinzy-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { withFrom } from "@/lib/backNav";
import { coinTitle, detailTabs, gradePrices, overviewRows } from "@/lib/catalogue/coinDetails";

type Params = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ premium?: string }>;
};

async function IdentifyCoinDetails({ id, premium }: { id: string; premium: boolean }) {
  const sessionToken = await getSessionToken();
  const coin =
    (sessionToken ? await fetchArchetypeDetailsForSession(id, sessionToken) : null) ?? (await fetchArchetypeDetails(id));
  if (!coin) notFound();
  const wishlisted = Boolean(coin.isWishlisted);
  const title = coinTitle(coin);
  const grades = gradePrices(coin.estimatedPrice);
  const wishlistReturn = withFrom(`/identify/coin/${id}`, "identify");

  return (
    <>
      <DetailsBreadcrumb ancestors={[{ href: "/identify", label: "Identify coin" }]} current={title} />

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
            <IdentifyExpertBanner />
          </div>
          <CoinDetailTabs tabs={detailTabs(coin)} premium={premium} />
        </div>

        <IdentifyResultRail archetypeId={id} coin={coin} />
      </div>
    </>
  );
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const coin = await fetchArchetypeDetails((await params).id).catch(() => null);
  if (!coin) return { title: "Identify result | Coinzy AI" };
  return { title: `${coinTitle(coin)} | Identify | Coinzy AI` };
}

export default async function IdentifyCoinPage({ params, searchParams }: Params) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/identify");

  const [{ id }, sp] = await Promise.all([params, searchParams]);
  if (!isArchetypeId(id)) notFound();

  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="identify" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto w-full max-w-[1122px]">
            <Suspense key={id} fallback={<CoinDetailsSkeleton />}>
              <IdentifyCoinDetails id={id} premium={premium} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
