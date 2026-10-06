import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ParchmentBackground } from "@/components/ui/ParchmentBackground";
import { SectionShell } from "@/components/ui/SectionShell";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { withFrom } from "@/lib/backNav";
import type { ListingCard } from "@/lib/marketplace/categories";

interface ListingRowSectionProps {
  title: string;
  variant: "plain" | "parchment";
  wellClassName: string;
  /** Live listings; each card shows the seller's front + back photos. */
  cards: ListingCard[];
  viewAllHref: string;
  /** Origin passed to listing links so the listing page can link back (see `lib/backNav.ts`). */
  from?: string;
  /** Extra control rendered before "View all" (marketplace search on the first row). */
  headerExtra?: ReactNode;
}

function CoinSlot({ src }: { src?: string }) {
  return (
    <div className="relative size-[116px] shrink-0 overflow-hidden rounded-full">
      {src ? (
        <FallbackImage
          fallback={<CoinPlaceholder size="listing" />}
          src={src}
          alt=""
          width={116}
          height={116}
          className="size-[116px] object-cover"
        />
      ) : (
        <CoinPlaceholder size="listing" />
      )}
    </div>
  );
}

/** Figma marketplace row (793:77834): title + "View all", four listing cards with a coin pair each. */
export function ListingRowSection({ title, variant, wellClassName, cards, viewAllHref, from, headerExtra }: ListingRowSectionProps) {
  if (!cards.length) return null;
  return (
    <SectionShell
      className={variant === "plain" ? "bg-cream" : ""}
      background={variant === "parchment" ? <ParchmentBackground variant="section" /> : null}
    >
      <div className="relative space-y-5">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-medium leading-8 text-ink">{title}</h2>
          <div className="flex shrink-0 items-center gap-3">
            {headerExtra}
            <Link
              href={viewAllHref}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium leading-5 text-primary-500 hover:text-primary-700"
            >
              View all
              <Image src="/assets/landing-page/icons/shared/arrow-right.svg" alt="" width={16} height={16} />
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article
              key={card.id}
              className="relative flex min-w-[164px] flex-col gap-6 rounded-[var(--radius-inner)] border-[0.5px] border-border-neutral bg-surface px-2 pb-4 pt-2 transition-shadow hover:shadow-md"
            >
              <div className={`flex items-center justify-center gap-2.5 rounded-lg px-3 py-5 ${wellClassName}`}>
                <CoinSlot src={card.images[0]} />
                <CoinSlot src={card.images[1] ?? card.images[0]} />
              </div>
              <div className="space-y-2 px-1">
                <h3 className="line-clamp-2 h-12 text-base leading-6 text-ink">
                  <Link href={withFrom(card.href, from)} className="after:absolute after:inset-0 after:rounded-[var(--radius-inner)]">
                    {card.title}
                  </Link>
                </h3>
                <p className="text-base font-medium leading-6 text-primary-500">{card.price ?? "Price on request"}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
