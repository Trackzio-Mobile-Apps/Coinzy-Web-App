import Image from "next/image";
import Link from "next/link";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { fetchArchetypes } from "@/lib/api/coinzy";
import { CATALOGUE_COINS } from "@/lib/constants";

const ICONS = "/assets/catalogue";

/** `href` is only set for live API coins (the static fallbacks have no details page). */
export type GridCoin = { id: string; image: string; title: string; remote: boolean; href?: string };

/** Load one page of catalogue coins; falls back to Figma's static cards if the API is unreachable. */
export async function loadCoins({
  page,
  pageSize,
  filters = {},
}: {
  page: number;
  pageSize: number;
  filters?: Record<string, (string | boolean)[]>;
}): Promise<{ coins: GridCoin[]; totalPages: number; totalCount: number; live: boolean }> {
  try {
    const res = await fetchArchetypes({ pageNo: page - 1, pageSize, filters });
    return {
      coins: res.items.map((a) => ({
        id: a.archetypeId,
        image: a.imageUrls[0] ?? CATALOGUE_COINS[0].image,
        title: a.name,
        remote: Boolean(a.imageUrls[0]),
        href: `/catalogue/coin/${a.archetypeId}`,
      })),
      totalPages: Math.max(1, Math.ceil(res.totalCount / pageSize)),
      totalCount: res.totalCount,
      live: true,
    };
  } catch (err) {
    console.error(err);
    const coins = Array.from({ length: Math.ceil(pageSize / CATALOGUE_COINS.length) })
      .flatMap((_, row) =>
        CATALOGUE_COINS.map((c, i) => ({ id: `${row}-${i}`, image: c.image, title: c.title, remote: false })),
      )
      .slice(0, pageSize);
    return { coins, totalPages: 1, totalCount: coins.length, live: false };
  }
}

/** Figma "Coin card / Wishlist" (71:30445): 211×262.5, 136px coin, 2-line title, heart top-right. */
export function CoinCard({ image, title, remote, href, priority = false }: GridCoin & { priority?: boolean }) {
  return (
    <article className="relative flex h-[262.5px] transition-shadow has-[a]:hover:shadow-md w-full min-w-[164px] flex-col items-center gap-2 rounded-[var(--radius-inner)] border-[0.5px] border-border-neutral bg-white p-4 xl:w-[211px]">
      {/* Neutral disc behind API photos while loading; broken links (a few S3 files 404) swap to the placeholder coin. */}
      <div className={`size-[136px] shrink-0 overflow-hidden rounded-full ${remote ? "bg-coin-well" : ""}`}>
        <FallbackImage
          fallback={<CoinPlaceholder size="xl" />}
          src={image}
          alt={remote ? "" : title}
          width={136}
          height={136}
          // API photos go through the Next optimizer: resized to 136/272px and cached on our server
          // (next.config `minimumCacheTTL`), so repeat views skip the slow us-east-1 S3 round trip.
          // First row is above the fold: load eagerly with high fetch priority.
          priority={priority}
          className={`size-[136px] ${remote ? "object-cover" : "object-contain"}`}
        />
      </div>
      <p className="line-clamp-2 h-[47px] w-full text-base leading-6 text-ink">
        {href ? (
          // Stretched link: the whole card opens the details page; the heart button sits above it.
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[var(--radius-inner)]">
            {title}
          </Link>
        ) : (
          title
        )}
      </p>
      <button
        type="button"
        aria-label="Add to wishlist"
        className="absolute right-[7.5px] top-[7.5px] z-10 flex size-6 items-center justify-center"
      >
        <Image src={`${ICONS}/icon-heart.svg`} alt="" width={22} height={20} className="h-[19.5px] w-[21.5px]" />
      </button>
    </article>
  );
}

/** `from` = view-all slug, passed on so the details page breadcrumb can link back to it. */
export function CoinGrid({ coins, from }: { coins: GridCoin[]; from?: string }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(5,211px)]">
      {coins.map((coin, i) => (
        <CoinCard
          key={coin.id}
          {...coin}
          href={coin.href && from ? `${coin.href}?from=${from}` : coin.href}
          priority={i < 5}
        />
      ))}
    </div>
  );
}

/**
 * Figma pager: Previous · page numbers (current outlined) · … · Next.
 * `visible` = how many numbers to show (3 on /catalogue, 6 on view-all pages).
 */
export function Pagination({
  page,
  totalPages,
  href,
  visible = 3,
}: {
  page: number;
  totalPages: number;
  href: (n: number) => string;
  visible?: number;
}) {
  const ghost =
    "flex h-8 items-center justify-center rounded-[var(--radius-button)] text-sm font-medium leading-5 text-ink hover:bg-black/5";
  const disabled = "pointer-events-none opacity-40";
  const count = Math.min(visible, totalPages);
  const first = Math.max(1, Math.min(page - 1, totalPages - count + 1));
  const pages = Array.from({ length: count }, (_, i) => first + i);
  return (
    <nav aria-label="Pagination" className="flex items-center gap-0.5">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page === 1}
        className={`${ghost} gap-1.5 pl-1.5 pr-2.5 ${page === 1 ? disabled : ""}`}
      >
        <Image src={`${ICONS}/icon-chevron-left.svg`} alt="" width={16} height={16} />
        Previous
      </Link>
      <div className={`flex items-center ${visible > 3 ? "mx-[15.5px] gap-3" : "gap-0.5"}`}>
        {pages.map((n) =>
          n === page ? (
            <span
              key={n}
              aria-current="page"
              className="flex size-8 items-center justify-center rounded-[var(--radius-button)] border border-[#e5e5e5] bg-white text-sm font-medium leading-5 text-ink"
            >
              {n}
            </span>
          ) : (
            <Link key={n} href={href(n)} className={`${ghost} w-8`}>
              {n}
            </Link>
          ),
        )}
        {pages[pages.length - 1] < totalPages && (
          <span className="flex size-8 items-center justify-center" aria-hidden>
            <Image src={`${ICONS}/icon-ellipsis.svg`} alt="" width={16} height={16} />
          </span>
        )}
      </div>
      <Link
        href={href(Math.min(totalPages, page + 1))}
        aria-disabled={page === totalPages}
        className={`${ghost} gap-1.5 pl-2.5 pr-1.5 ${page === totalPages ? disabled : ""}`}
      >
        Next
        <Image src={`${ICONS}/icon-chevron-right.svg`} alt="" width={16} height={16} />
      </Link>
    </nav>
  );
}
