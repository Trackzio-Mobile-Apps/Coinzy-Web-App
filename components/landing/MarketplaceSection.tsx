import Link from "next/link";
import { ListingCard } from "@/components/marketplace/ListingGrid";
import { SellBar } from "@/components/marketplace/SellBar";
import { ParchmentBackground } from "@/components/ui/ParchmentBackground";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { FROM_LANDING } from "@/lib/backNav";
import {
  LANDING_MARKETPLACE_STRIP_SIZE,
  loadRandomListings,
} from "@/lib/marketplace/categories";

export async function MarketplaceSection() {
  let cards: Awaited<ReturnType<typeof loadRandomListings>> = [];
  let unavailable = false;
  try {
    cards = await loadRandomListings(LANDING_MARKETPLACE_STRIP_SIZE);
  } catch (err) {
    console.error(err);
    unavailable = true;
  }

  return (
    <SectionShell
      id="marketplace"
      className="bg-cream"
      background={<ParchmentBackground variant="section" />}
    >
      <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-20">
        <div className="w-full space-y-8">
          <SectionHeader
            label="Marketplace"
            labelClassName="font-jakarta !font-normal !leading-[1.5] text-primary-500"
            title="Buy and sell collectible coins"
            description="Browse listings, check demand, and connect with sellers or buyers."
            actionLabel="View all"
            actionHref="/marketplace"
          />

          {unavailable ? (
            <p className="text-base leading-6 text-muted">
              Marketplace listings are unavailable right now. Try again later, or{" "}
              <Link href="/marketplace" className="font-medium text-primary-500 underline-offset-2 hover:underline">
                browse the marketplace
              </Link>
              .
            </p>
          ) : cards.length === 0 ? (
            <p className="text-base leading-6 text-muted">
              No marketplace listings yet.{" "}
              <Link href="/marketplace" className="font-medium text-primary-500 underline-offset-2 hover:underline">
                Check back soon
              </Link>
              .
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 xl:overflow-visible xl:pb-0">
              {cards.map((card, i) => (
                <div key={card.id} className="w-[211px] min-w-[164px] shrink-0">
                  <ListingCard card={card} priority={i < 2} from={FROM_LANDING} />
                </div>
              ))}
            </div>
          )}
        </div>

        <SellBar />
      </div>
    </SectionShell>
  );
}
