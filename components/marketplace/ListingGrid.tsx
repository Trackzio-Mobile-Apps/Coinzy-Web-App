import Link from "next/link";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { withFrom } from "@/lib/backNav";
import type { ListingCard as ListingCardData } from "@/lib/marketplace/categories";

/**
 * Figma "Coin card" (346:12169, used in 793:77612): 211px, 0.5px border, 12px radius, 8px padding;
 * #f0ebe1 well with a 136px round photo; 2-line title; wine price.
 */
export function ListingCard({
  card,
  priority = false,
  from,
  fromPage,
  fromQuery,
}: {
  card: ListingCardData;
  priority?: boolean;
  /** Origin list, so the listing page can link back to it (see `lib/backNav.ts`). */
  from?: string;
  fromPage?: number;
  /** Search term of that list (round-trips as `?fromQ=`). */
  fromQuery?: string;
}) {
  return (
    <article className="relative flex w-full min-w-[164px] flex-col items-center gap-6 rounded-[12px] border-[0.5px] border-border-neutral bg-white px-2 pb-4 pt-2 transition-shadow hover:shadow-md xl:w-[211px]">
      <div className="flex w-full items-center justify-center rounded-lg bg-coin-well py-5">
        <div className="size-[136px] overflow-hidden rounded-full">
          {card.images[0] ? (
            <FallbackImage
              fallback={<CoinPlaceholder size="xl" />}
              src={card.images[0]}
              alt=""
              width={136}
              height={136}
              priority={priority}
              className="size-[136px] object-cover"
            />
          ) : (
            <CoinPlaceholder size="xl" />
          )}
        </div>
      </div>
      <div className="flex w-full flex-col gap-2 px-1">
        <h3 className="line-clamp-2 h-[47px] text-base leading-6 text-ink">
          {/* Stretched link: whole card opens the listing. */}
          <Link href={withFrom(card.href, from, fromPage, fromQuery)} className="after:absolute after:inset-0 after:rounded-[12px]">
            {card.title}
          </Link>
        </h3>
        <p className="text-base font-medium leading-6 text-primary-500">{card.price ?? "Price on request"}</p>
      </div>
    </article>
  );
}

/** 5-up grid (Figma: 211px cards, 16px column gap, 32px row gap). */
export function ListingGrid({
  cards,
  from,
  fromPage,
  fromQuery,
  columns = 5,
}: {
  cards: ListingCardData[];
  from?: string;
  fromPage?: number;
  fromQuery?: string;
  /** Signed-in marketplace browse uses 4 columns (Figma `1356:154252`). */
  columns?: 4 | 5;
}) {
  const gridClass =
    columns === 4
      ? "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4"
      : "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(5,211px)] xl:justify-between";
  return (
    <div className={gridClass}>
      {cards.map((card, i) => (
        <ListingCard key={card.id} card={card} priority={i < 5} from={from} fromPage={fromPage} fromQuery={fromQuery} />
      ))}
    </div>
  );
}
