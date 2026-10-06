import Image from "next/image";
import Link from "next/link";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { CoinFacts, CoinThumb } from "@/components/home/CoinThumb";
import { PremiumCoinOfTheDay, type CotdCoin } from "@/components/home/PremiumCoinOfTheDay";
import { PremiumCountdown } from "@/components/home/PremiumCountdown";
import { CoinOfTheDayDrawer, type CoinOfTheDayDrawerCoin } from "@/components/home/CoinOfTheDayDrawer";
import {
  HOME_CATALOGUE_FALLBACK,
  HOME_MARKETPLACE_FALLBACK,
  HOME_OTHER_APPS,
  MARKETPLACE_CHIPS,
} from "@/lib/home";
import type { SessionUser } from "@/lib/auth/session";
import { FROM_HOME, withFrom } from "@/lib/backNav";

const A = "/assets/home";

type ListingRow = {
  id?: string;
  name: string;
  year: string;
  issuer: string;
  rarity: string;
  rarityTone: "muted" | "warn" | "info";
  price: string;
  image: string;
};

type Cotd = {
  id?: string;
  name: string;
  origin: string;
  year: string;
  price: string;
  images: string[];
  /** Today's other coins, hidden behind Premium for free users. */
  lockedCount: number;
  /** Content of the "Learn more" drawer (Figma 1248:123835). */
  drawer: CoinOfTheDayDrawerCoin;
};

type CatalogueRow = { id?: string; name: string; price: string; image: string | null };

const rarityClass = {
  muted: "text-muted",
  warn: "text-[#c45c16]",
  info: "text-[#3b6ea8]",
} as const;

function formatMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function HomeDashboard({
  user,
  listings,
  coinOfTheDay,
  premiumCoins,
  dayKey,
  premium = false,
  catalogue,
}: {
  user: SessionUser;
  listings: ListingRow[];
  /** Free users: the first coin of the day (+ how many are locked). */
  coinOfTheDay: Cotd | null;
  /** Premium users: all of today's coins. */
  premiumCoins: CotdCoin[];
  /** UTC day (`todayKey()`), keys the premium reveal count. */
  dayKey: string;
  /** Premium variant of the dashboard (Figma `1584:205526`): "You're Premium" badge, no subscribe banner, coin switcher. */
  premium?: boolean;
  catalogue: CatalogueRow[];
}) {
  const rows = listings.length ? listings : HOME_MARKETPLACE_FALLBACK;
  const cat = catalogue.length ? catalogue : HOME_CATALOGUE_FALLBACK;
  const cotd = coinOfTheDay;
  const greet = user.isGuest ? "Guest" : user.name.split(" ")[0] || user.name;

  return (
    <div className="flex min-h-0 flex-1 flex-col bg-[#f7f7f8]">
      <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-8">
        <h1 className="text-2xl font-medium leading-8 text-ink">Hi {greet}!</h1>
        {premium ? (
          <div className="flex items-center gap-4">
            {/* Gradient-outline pill: indigo → pink 1px border over a white fill. */}
            <span className="inline-flex h-6 items-center gap-1 rounded-full border border-transparent bg-[linear-gradient(#fff,#fff)_padding-box,linear-gradient(90deg,#6366f1,#ec4899)_border-box] px-2 py-0.5 text-xs font-medium leading-4 text-[#0a0a0a]">
              <Image src={`${A}/icon-crown-dark.svg`} alt="" width={12} height={12} />
              You’re Premium
            </span>
            <Link href="/home#settings" aria-label="Settings" className="flex size-6 items-center justify-center">
              <Image src={`${A}/icon-settings.svg`} alt="" width={24} height={24} />
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/home#premium"
              className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[linear-gradient(90deg,#6a65ed_0%,#e54a9f_100%)] px-4 text-sm font-medium leading-5 text-white shadow-[0_0_0_2px_rgba(177,85,191,0.35)]"
            >
              <Image src={`${A}/icon-crown.svg`} alt="" width={12} height={12} />
              Go Premium
            </Link>
            <Link
              href="/home#settings"
              aria-label="Settings"
              className="flex size-9 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white"
            >
              <Image src={`${A}/icon-settings.svg`} alt="" width={16} height={16} />
            </Link>
          </div>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="mx-auto flex w-full max-w-[1122px] gap-4">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <section className="grid gap-4 sm:grid-cols-2">
              <article className="relative overflow-hidden rounded-2xl border-[0.5px] border-primary-200 bg-[rgba(246,233,231,0.5)] px-[16.5px] py-[12.5px]">
                <div className="relative z-10 flex max-w-[280px] flex-col gap-4">
                  <Image src={`${A}/icon-focus.svg`} alt="" width={50} height={50} />
                  <div className="space-y-3">
                    <h2 className="text-2xl font-medium leading-8 text-ink">AI analysis</h2>
                    <p className="text-sm leading-5 text-[#49494b]">Identify your coin and get an estimated value.</p>
                    <p className="flex items-center gap-1 text-xs leading-4 text-muted">
                      <Image src={`${A}/icon-zap.svg`} alt="" width={16} height={16} />
                      Results in seconds
                    </p>
                  </div>
                  <Link
                    href="/auth"
                    className="inline-flex h-9 w-fit items-center justify-center rounded-button bg-primary-500 px-4 text-sm font-medium leading-5 text-[#fafafa] hover:bg-primary-700"
                  >
                    Analyse coin
                  </Link>
                </div>
              </article>

              <article
                id="expert"
                className="relative overflow-hidden rounded-2xl border-[0.5px] border-primary-200 bg-[rgba(246,233,231,0.5)] px-[16.5px] py-[12.5px]"
              >
                <div className="relative z-10 flex max-w-[300px] flex-col gap-4">
                  <Image src={`${A}/icon-diploma.svg`} alt="" width={50} height={50} />
                  <div className="space-y-3">
                    <h2 className="text-2xl font-medium leading-8 text-ink">Human expert evaluation</h2>
                    <p className="text-sm leading-5 text-[#49494b]">Get your coin reviewed by a certified expert.</p>
                    <p className="flex items-center gap-1 text-xs leading-4 text-muted">
                      <Image src={`${A}/icon-clock.svg`} alt="" width={16} height={16} />
                      24–48 hr delivery
                    </p>
                  </div>
                  <Link
                    href="/home#expert"
                    className="inline-flex h-9 w-fit items-center justify-center gap-1.5 rounded-button border border-primary-500 bg-white px-4 text-sm font-medium leading-5 text-primary-500"
                  >
                    <Image src={`${A}/icon-user-star.svg`} alt="" width={16} height={16} />
                    Human Expert Evaluation
                  </Link>
                </div>
              </article>
            </section>

            {!premium && (
            <section
              id="premium"
              className="flex flex-col gap-3 rounded-2xl p-5 sm:flex-row sm:items-end sm:justify-between"
              style={{
                backgroundImage:
                  "linear-gradient(-36.21deg, rgb(106, 101, 237) 10.1%, rgb(229, 74, 159) 98.5%)",
              }}
            >
              <div className="space-y-2">
                <PremiumCountdown />
                <p className="flex flex-wrap items-center gap-3 text-2xl leading-8 text-[#f2f2f3]">
                  <span className="font-medium">Unlock unlimited for less</span>
                  <span className="font-light line-through text-[#dfdfe0]">$39</span>
                  <span className="font-bold">$19/mo</span>
                </p>
                <p className="flex gap-2 text-sm leading-5 text-white">
                  <span>Billed yearly</span>
                  <span className="font-medium">•</span>
                  <span>Cancel anytime</span>
                </p>
              </div>
              <div className="flex flex-col items-center gap-3 sm:items-end">
                <Link
                  href="/home#premium"
                  className="inline-flex h-10 items-center justify-center rounded-[14px] border border-white bg-white px-6 text-base font-medium leading-6 text-primary-500 shadow-[0_0_0_2px_#b155bf]"
                >
                  Subscribe
                </Link>
                <Link href="/home#premium" className="text-sm font-medium leading-5 text-white underline">
                  See all plans
                </Link>
              </div>
            </section>
            )}

            <section className="rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-[16.5px] py-[12.5px]">
              <h2 className="text-lg font-medium leading-7 text-ink">Marketplace</h2>

              <div className="mt-5 flex flex-col gap-3 rounded-xl bg-neutral-50 py-3 pl-3 pr-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-white">
                    <Image src={`${A}/icon-sale-tag.svg`} alt="" width={24} height={24} />
                  </div>
                  <div>
                    <p className="text-base font-medium leading-6 text-ink">You haven&apos;t listed anything yet</p>
                    <p className="text-sm leading-5 text-[#87878a]">
                      Turn your collection into cash — list a coin in under 2 minutes.
                    </p>
                  </div>
                </div>
                <Link
                  href="/marketplace"
                  className="inline-flex h-8 shrink-0 items-center justify-center rounded-button border border-[#e5e5e5] bg-white px-3 text-sm font-medium leading-5 text-ink"
                >
                  List a coin
                </Link>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <h3 className="text-base font-medium leading-6 text-ink">Browse the Marketplace</h3>
                  <p className="text-sm leading-5 text-muted">Explore coins listed by other collectors</p>
                </div>

                <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                  <label className="relative flex h-6 w-full max-w-[345px] items-center rounded-lg border border-[#e5e5e5] bg-white px-2">
                    <Image src={`${A}/icon-search.svg`} alt="" width={14} height={14} />
                    <input
                      type="search"
                      placeholder="Search coins, years, countries..."
                      className="ml-2 w-full bg-transparent text-xs leading-4 text-ink outline-none placeholder:text-[#a4a4a7]"
                    />
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {MARKETPLACE_CHIPS.map((chip, i) => (
                      <Link
                        key={chip.slug}
                        href={`/marketplace/${chip.slug}`}
                        className={`inline-flex h-6 items-center rounded-full px-3 text-xs font-medium leading-4 ${
                          i === 0 ? "bg-primary-50 text-primary-500" : "bg-white text-ink ring-1 ring-[#e5e5e5]"
                        }`}
                      >
                        {chip.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <ul className="divide-y divide-[#ececec]">
                  {rows.map((row, index) => (
                    <li key={`${row.name}-${index}`} className="flex items-center justify-between gap-4 py-3.5">
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-[#f0ebe1]">
                          <FallbackImage
                            src={row.image}
                            alt=""
                            width={40}
                            height={40}
                            className="size-10 object-cover"
                            fallback={<CoinPlaceholder size="sm" />}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium leading-5 text-ink">{row.name}</p>
                          <p className="truncate text-xs leading-4 text-muted">
                            {row.year} • {row.issuer} •{" "}
                            <span className={rarityClass[row.rarityTone]}>{row.rarity}</span>
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium leading-5 text-ink">{row.price}</p>
                        <Link
                          href={row.id ? withFrom(`/marketplace/listing/${row.id}`, FROM_HOME) : "/marketplace"}
                          className="text-xs font-medium leading-4 text-primary-500"
                        >
                          Buy coin
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <aside className="hidden w-[268px] shrink-0 flex-col gap-4 xl:flex">
            {premium && premiumCoins.length > 0 ? (
              <PremiumCoinOfTheDay coins={premiumCoins} dayKey={dayKey} />
            ) : (
            <section className="rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-[16.5px] py-[12.5px]">
              <h2 className="text-sm font-medium leading-5 text-ink">Coin of the day</h2>
              {cotd ? (
                <>
                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-center gap-6">
                      {cotd.images.length ? (
                        cotd.images.slice(0, 2).map((src, i) => <CoinThumb key={`${src}-${i}`} src={src} size={60} />)
                      ) : (
                        <CoinThumb src={null} size={60} />
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="truncate text-sm font-medium leading-5 text-ink">{cotd.name}</p>
                      <CoinFacts origin={cotd.origin} year={cotd.year} price={cotd.price} />
                    </div>
                  </div>
                  <div className="my-4 h-px bg-[#ececec]" />
                  <div className="space-y-2.5">
                    <CoinOfTheDayDrawer
                      coin={cotd.drawer}
                      detailsHref={cotd.id ? withFrom(`/catalogue/coin/${cotd.id}`, FROM_HOME) : "/catalogue"}
                      lockedCount={cotd.lockedCount}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-4 text-center text-xs font-light leading-4 text-muted">
                  Coin of the day is unavailable right now
                </p>
              )}
            </section>
            )}

            <section className="rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-[16.5px] py-[12.5px]">
              <h2 className="text-sm font-medium leading-5 text-ink">Global catalogue</h2>
              <ul className="mt-3 space-y-3">
                {cat.map((item, i) => (
                  <li key={`${item.name}-${i}`}>
                    <Link
                      href={item.id ? withFrom(`/catalogue/coin/${item.id}`, FROM_HOME) : "/catalogue"}
                      className="flex items-center gap-3"
                    >
                      <CoinThumb src={item.image} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium leading-4 text-ink">{item.name}</p>
                        <p className="truncate text-xs font-light leading-4 text-[#87878a]">{item.price}</p>
                      </div>
                      <Image src={`${A}/icon-chevron.svg`} alt="" width={12} height={12} className="opacity-50" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="my-3 h-px bg-[#ececec]" />
              <Link href="/catalogue" className="flex items-center justify-center gap-1 text-xs font-medium leading-4 text-ink">
                Explore global catalogue
                <Image src={`${A}/icon-chevron.svg`} alt="" width={16} height={16} />
              </Link>
            </section>

            <section className="rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-[16.5px] py-[12.5px]">
              <h2 className="text-sm font-medium leading-5 text-ink">Our other apps</h2>
              <ul className="mt-3 space-y-3">
                {HOME_OTHER_APPS.map((app) => (
                  <li key={app.name} className="flex items-center gap-3">
                    <Image src={app.icon} alt="" width={36} height={36} className="rounded-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium leading-4 text-ink">{app.name}</p>
                      <p className="truncate text-[11px] leading-4 text-muted">{app.description}</p>
                    </div>
                    <Link
                      href={app.href}
                      className="shrink-0 rounded-lg border border-[#e5e5e5] px-2 py-1 text-[11px] font-medium text-ink"
                    >
                      Try free
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="my-3 h-px bg-[#ececec]" />
              <Link href="/other-apps" className="flex items-center justify-center gap-1 text-xs font-medium leading-4 text-ink">
                +7 more apps
                <Image src={`${A}/icon-chevron.svg`} alt="" width={16} height={16} />
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function moneyFromListingPrice(price: string | number | null | undefined): string {
  if (price == null || price === "") return "—";
  if (typeof price === "number") return formatMoney(price);
  const n = Number(price);
  if (!Number.isNaN(n) && price.trim() !== "") return formatMoney(n);
  return price.startsWith("$") ? price : `$${price}`;
}
