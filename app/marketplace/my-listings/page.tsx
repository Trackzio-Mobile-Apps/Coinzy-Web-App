import type { Metadata } from "next";
import Image from "next/image";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";
import { AppSidebar } from "@/components/home/AppSidebar";
import { ListCoinButton } from "@/components/marketplace/ListCoinButton";
import { ListingGrid } from "@/components/marketplace/ListingGrid";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { MarketplaceFilterPanel } from "@/components/marketplace/MarketplaceFilterPanel";
import { fetchListingFilterValues } from "@/lib/api/coinzy";
import { fetchMyListings } from "@/lib/api/marketplace-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { listingToCard } from "@/lib/marketplace/categories";
import {
  LISTING_FILTER_FIELDS,
  parseListingFilterParams,
  type ListingFilterValues,
} from "@/lib/marketplace/listingFilters";

export const metadata: Metadata = {
  title: "Your listings | Marketplace | Coinzy AI",
  description: "Manage the coins you have listed for sale on Coinzy.",
};

const A = "/assets/marketplace";

const outlineBtn =
  "shrink-0 rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium leading-5 text-ink hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

function emptyOptions(): ListingFilterValues {
  return {
    issuer: [],
    ruler: [],
    material: [],
    shape: [],
    yearOfMinting: [],
    mintLocation: [],
    rarity: [],
  };
}

async function MyListingsFilters() {
  const filterRaw = await fetchListingFilterValues([...LISTING_FILTER_FIELDS]).catch(() => null);
  const filterOptions: ListingFilterValues = filterRaw
    ? {
        issuer: filterRaw.issuer ?? [],
        ruler: filterRaw.ruler ?? [],
        material: filterRaw.material ?? [],
        shape: filterRaw.shape ?? [],
        yearOfMinting: filterRaw.yearOfMinting ?? [],
        mintLocation: filterRaw.mintLocation ?? [],
        rarity: filterRaw.rarity ?? [],
      }
    : emptyOptions();
  return <MarketplaceFilterPanel options={filterOptions} />;
}

/**
 * Owner listing manage page — Figma `1357:189273` / Android `MarketListScreen`.
 * Linked from marketplace "Manage listings" and sidebar "Your listing".
 */
export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined> & { premium?: string }>;
}) {
  const sp = await searchParams;
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/marketplace/my-listings");

  const premium =
    (await getPremiumStatus(user)) ||
    (process.env.NODE_ENV !== "production" && sp.premium === "1");

  const userFilters = parseListingFilterParams(sp);
  const filtersBody: Record<string, string[]> = {};
  for (const [k, v] of Object.entries(userFilters)) {
    if (v?.length) filtersBody[k] = v;
  }

  const token = await getSessionToken();
  const result = token
    ? await fetchMyListings(token, filtersBody).catch(() => ({ listings: [], totalCount: 0 }))
    : { listings: [], totalCount: 0 };
  const cards = result.listings.map((l) => listingToCard(l, { self: true }));
  const count = result.totalCount;
  const showing = cards.length;

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="marketplace" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#faf7f5]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <div className="flex min-h-0 flex-1">
          <main className="min-w-0 flex-1 overflow-y-auto px-8 py-4">
            <DetailsBreadcrumb ancestors={[{ href: "/marketplace", label: "Marketplace" }]} current="Your listings" />

            <section className="mt-4 flex items-center justify-between gap-4 rounded-[16px] border-[0.5px] border-[#dfdfe0] bg-[#f2f2f3] py-3 pl-3 pr-4">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-white">
                  <Image src={`${A}/icon-sale-tag.svg`} alt="" width={24} height={24} />
                </div>
                <div className="min-w-0">
                  <p className="text-base font-medium leading-6 text-ink">
                    {count > 0
                      ? `You have listed ${count.toLocaleString("en-US")} coin${count === 1 ? "" : "s"}`
                      : "You haven’t listed any coins yet"}
                  </p>
                  <p className="pt-0.5 text-sm leading-5 text-[#87878a]">
                    Turn your collection into cash — list a coin in under 2 minutes.
                  </p>
                </div>
              </div>
              <ListCoinButton buttonClassName={outlineBtn} />
            </section>

            <div className="mt-4 flex items-end justify-end">
              <p className="text-xs leading-4 text-[#87878a]">
                Showing{" "}
                <span className="font-bold text-[#606062]">{showing.toLocaleString("en-US")}</span>
                {` of ${count.toLocaleString("en-US")} results`}
              </p>
            </div>

            <div className="mt-3">
              {cards.length ? (
                <ListingGrid cards={cards} from="my-listings" columns={4} />
              ) : (
                <p className="rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-10 text-center text-sm leading-5 text-muted">
                  {Object.keys(filtersBody).length
                    ? "No listings match your filters. Try clearing filters."
                    : "No active listings. Use List a coin to sell from your collection."}
                </p>
              )}
            </div>
          </main>

          <Suspense fallback={<div className="w-[266px] shrink-0 border-l border-[#e5e7eb] bg-white" />}>
            <MyListingsFilters />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
