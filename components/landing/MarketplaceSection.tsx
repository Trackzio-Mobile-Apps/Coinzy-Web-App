import Image from "next/image";
import { SellBar } from "@/components/marketplace/SellBar";
import { ParchmentBackground } from "@/components/ui/ParchmentBackground";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { MARKETPLACE_COINS } from "@/lib/constants";

export function MarketplaceSection() {
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

          <div className="flex gap-4 overflow-x-auto pb-2 xl:overflow-visible xl:pb-0">
            {MARKETPLACE_COINS.map((coin) => (
              <article
                key={coin.title}
                className="flex w-[211px] min-w-[164px] shrink-0 flex-col gap-6 rounded-[var(--radius-inner)] border-[0.5px] border-border-neutral bg-white px-2 pb-4 pt-2"
              >
                <div className="flex items-center justify-center rounded-lg bg-coin-well py-5">
                  <Image
                    src={coin.image}
                    alt={coin.title}
                    width={136}
                    height={136}
                    className="size-[136px] rounded-full object-contain"
                  />
                </div>
                <div className="space-y-2 px-1">
                  <p className="line-clamp-2 h-[47px] text-base leading-6 text-ink">
                    {coin.title}
                  </p>
                  <p className="text-base font-medium leading-6 text-primary-500">
                    {coin.price}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <SellBar />
      </div>
    </SectionShell>
  );
}
