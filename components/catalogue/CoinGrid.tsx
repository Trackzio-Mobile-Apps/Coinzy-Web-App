import Image from "next/image";
import Link from "next/link";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { CoinCardImage } from "@/components/catalogue/CoinCardImage";
import { fetchArchetypesCached } from "@/lib/api/coinzy";
import { fetchArchetypesForSession } from "@/lib/api/coinzy-session";
import { getSessionToken } from "@/lib/auth/session";
import { withFrom } from "@/lib/backNav";
import { WishlistHeart } from "@/components/catalogue/WishlistHeart";
import { searchVariants } from "@/lib/catalogue/search";
import { CATALOGUE_COINS } from "@/lib/constants";

const ICONS = "/assets/catalogue";

/** `href` is only set for live API coins (the static fallbacks have no details page). */
export type GridCoin = {
  id: string;
  image: string;
  title: string;
  remote: boolean;
  alternativeImages?: string[];
  href?: string;
  isWishlisted?: boolean;
};

/**
 * Load one page of catalogue coins. With `search`, the term is tried in a few spellings (see
 * `lib/catalogue/search.ts`) and the first one with hits wins; `query` is the spelling that matched.
 * Without `search` an unreachable API falls back to Figma's static cards; a search never fakes results
 * (`live: false` + no coins → the page shows "search unavailable").
 */
export async function loadCoins({
  page,
  pageSize,
  filters = {},
  search = "",
}: {
  page: number;
  pageSize: number;
  filters?: Record<string, (string | boolean)[]>;
  search?: string;
}): Promise<{ coins: GridCoin[]; totalPages: number; totalCount: number; live: boolean }> {
  try {
    const pageNo = page - 1;
    const sessionToken = await getSessionToken();
    const loadPage = async (term?: string) => {
      if (sessionToken) {
        return fetchArchetypesForSession({ token: sessionToken, pageNo, pageSize, search: term, filters });
      }
      return fetchArchetypesCached({ pageNo, pageSize, search: term, filters });
    };
    let res;
    if (search) {
      // Try fallbacks only after a miss; a successful lookup must not wait on
      // unrelated spelling requests (or fail because one of those requests fails).
      for (const term of searchVariants(search)) {
        res = await loadPage(term);
        if (res.totalCount > 0) break;
      }
    } else {
      res = await loadPage();
    }
    if (!res) throw new Error("No catalogue search term");
    return {
      coins: res.items.map((a) => {
        const images = [...new Set((a.imageUrls ?? []).filter((url) => typeof url === "string" && url.trim()).map((url) => url.trim()))];
        return {
          id: a.archetypeId,
          image: images[0] ?? "",
          alternativeImages: images.slice(1),
          title: a.name,
          remote: images.length > 0,
          href: `/catalogue/coin/${a.archetypeId}`,
          isWishlisted: Boolean(a.isWishlisted),
        };
      }),
      totalPages: Math.max(1, Math.ceil(res.totalCount / pageSize)),
      totalCount: res.totalCount,
      live: true,
    };
  } catch (err) {
    console.error(err);
    if (search) return { coins: [], totalPages: 1, totalCount: 0, live: false };
    const coins = Array.from({ length: Math.ceil(pageSize / CATALOGUE_COINS.length) })
      .flatMap((_, row) =>
        CATALOGUE_COINS.map((c, i) => ({ id: `${row}-${i}`, image: c.image, title: c.title, remote: false })),
      )
      .slice(0, pageSize);
    return { coins, totalPages: 1, totalCount: coins.length, live: false };
  }
}

/** Figma "Coin card / Wishlist" (71:30445): 211×262.5, 136px coin, 2-line title, heart top-right. */
export function CoinCard({
  id,
  image,
  title,
  remote,
  alternativeImages,
  href,
  isWishlisted = false,
  priority = false,
  compact = false,
}: GridCoin & { priority?: boolean; compact?: boolean }) {
  return (
    <article className={`relative flex w-full min-w-0 flex-col items-center gap-2 rounded-[var(--radius-inner)] border-[0.5px] border-border-neutral bg-white transition-shadow has-[a]:hover:shadow-md ${compact ? "min-h-[223px] p-4 max-[480px]:p-2" : "h-[262.5px] min-w-[164px] p-4 xl:w-[211px]"}`}>
      {href ? (
        <CoinCardImage key={[image, ...(alternativeImages ?? [])].join("|")} image={image} alternativeImages={alternativeImages} priority={priority} />
      ) : (
        <div className={`size-[136px] max-w-full shrink-0 overflow-hidden rounded-full ${compact ? "aspect-square !h-auto" : ""} ${remote ? "bg-coin-well" : ""}`}>
          <FallbackImage
            fallback={<CoinPlaceholder size="xl" />}
            src={image}
            alt={remote ? "" : title}
            width={136}
            height={136}
            priority={priority}
            className={`size-[136px] ${compact ? "!h-auto max-w-full" : ""} ${remote ? "object-cover" : "object-contain"}`}
          />
        </div>
      )}
      <p className={`line-clamp-2 w-full text-base leading-6 text-ink ${compact ? "min-h-12" : "h-[47px]"}`}>
        {href ? (
          // Stretched link: the whole card opens the details page; the heart button sits above it.
          <Link href={href} className="after:absolute after:inset-0 after:rounded-[var(--radius-inner)]">
            {title}
          </Link>
        ) : (
          title
        )}
      </p>
      {href ? (
        <WishlistHeart archetypeId={id} initialWishlisted={isWishlisted} />
      ) : null}
    </article>
  );
}

/**
 * `from` = origin list (view-all slug or `"catalogue"`) and `fromPage` its page number, passed on so the
 * details page breadcrumb/back button return to the exact list state.
 */
export function CoinGrid({
  coins,
  from,
  fromPage,
  fromQuery,
  compact = false,
}: {
  coins: GridCoin[];
  from?: string;
  fromPage?: number;
  /** Search term of the list the visitor came from (round-trips as `?fromQ=`). */
  fromQuery?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-4 min-[900px]:grid-cols-3 xl:grid-cols-4" : "grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(5,211px)]"}>
      {coins.map((coin, i) => (
        <CoinCard
          key={coin.id}
          {...coin}
          href={coin.href ? withFrom(coin.href, from, fromPage, fromQuery) : undefined}
          priority={i < 5}
          compact={compact}
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
