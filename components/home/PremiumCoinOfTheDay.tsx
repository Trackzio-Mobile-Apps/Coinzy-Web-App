"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { CoinFacts, CoinThumb } from "@/components/home/CoinThumb";
import { CoinOfTheDayDrawer, type CoinOfTheDayDrawerCoin } from "@/components/home/CoinOfTheDayDrawer";

const A = "/assets/home";

/** Serializable view-model for one of today's coins (built server-side in `app/home/page.tsx`). */
export type CotdCoin = {
  id?: string;
  name: string;
  origin: string;
  year: string;
  price: string;
  images: string[];
  /** Content of the "Learn more" drawer. */
  drawer: CoinOfTheDayDrawerCoin;
  /** Details page for this coin (`?from=home` already applied). */
  href: string;
};

const storageKey = (dayKey: string) => `coinzy:cotd-views:${dayKey}`;

/**
 * Premium "Coin of the day" panel — Figma `1584:205526` (home) with the drawer `1248:98330`.
 *
 * Premium members get all of today's coins (1–3, from `coins-of-the-day`): the carousel arrows step through them, the
 * soft badge counts the coins not revealed yet ("2 left"), and the drawer follows the current coin. The first coin counts as
 * viewed on load; revealing the next one (arrow or the drawer's "Show more coins") uses one view. When nothing is left,
 * "Show more coins" opens the daily-limit alert (`DailyLimitDialog`, Figma `1912:211426`).
 *
 * The reveal count is remembered in `localStorage` per UTC day. There is no server-side view tracking, so this is a
 * best-effort UI limit, not enforcement.
 */
export function PremiumCoinOfTheDay({ coins, dayKey }: { coins: CotdCoin[]; dayKey: string }) {
  const count = coins.length;
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(1);

  // Restore today's reveal count (client-only, so the first render matches the server markup).
  useEffect(() => {
    try {
      const stored = Number(window.localStorage.getItem(storageKey(dayKey)));
      if (Number.isFinite(stored) && stored > 1) setRevealed(Math.min(Math.floor(stored), count));
    } catch {
      /* storage unavailable — keep the in-memory count */
    }
  }, [dayKey, count]);

  const reveal = useCallback(
    (next: number) => {
      setRevealed((prev) => {
        const value = Math.max(prev, next + 1);
        try {
          window.localStorage.setItem(storageKey(dayKey), String(value));
        } catch {
          /* ignore */
        }
        return value;
      });
    },
    [dayKey],
  );

  const left = Math.max(0, count - revealed);
  const coin = coins[index] ?? coins[0];
  const hasPrev = index > 0;
  const hasNext = index < count - 1;

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => {
    if (!hasNext) return;
    reveal(index + 1);
    setIndex(index + 1);
  };
  const showMore = (): "advanced" | "limit" => {
    if (left <= 0) return "limit";
    // First coin not revealed yet.
    reveal(revealed);
    setIndex(revealed);
    return "advanced";
  };

  if (!coin) return null;
  const photos = coin.images.slice(0, 2);

  return (
    <section className="rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-[16.5px] py-[12.5px]">
      <div className="flex h-[18px] items-center justify-between">
        <h2 className="text-sm font-medium leading-5 text-ink">Coin of the day</h2>
        <span
          className="inline-flex h-[18px] items-center gap-2 rounded-full bg-[linear-gradient(rgba(23,23,23,0.1),rgba(23,23,23,0.1)),linear-gradient(#fff,#fff)] px-1.5 py-0.5 text-xs font-medium leading-4 text-[#171717]"
          aria-live="polite"
        >
          <Image src={`${A}/icon-refresh.svg`} alt="" width={12} height={12} />
          {left} left
        </span>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        <div className="relative flex h-[100px] items-center justify-center">
          <ArrowButton direction="left" label="Previous coin" disabled={!hasPrev} onClick={goPrev} className="left-0" />
          <div className="flex items-center justify-center gap-5">
            {photos.length ? (
              photos.map((src, i) => <CoinThumb key={`${src}-${i}`} src={src} size={60} shape="tile" />)
            ) : (
              <CoinThumb src={null} size={60} shape="tile" />
            )}
          </div>
          <ArrowButton direction="right" label="Next coin" disabled={!hasNext} onClick={goNext} className="right-0" />
        </div>
        <div className="space-y-2">
          <p aria-live="polite" className="truncate text-sm font-medium leading-5 text-ink">
            {coin.name}
          </p>
          <CoinFacts origin={coin.origin} year={coin.year} price={coin.price} />
        </div>
      </div>

      <div className="mb-[15px] mt-4 h-px bg-[#ececec]" />
      <CoinOfTheDayDrawer
        coin={coin.drawer}
        detailsHref={coin.href}
        lockedCount={0}
        pro={{ index, count, left, onPrev: goPrev, onNext: goNext, onShowMore: showMore }}
      />
    </section>
  );
}

function ArrowButton({
  direction,
  label,
  disabled,
  onClick,
  className,
}: {
  direction: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
  className: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={`absolute top-1/2 flex size-7 -translate-y-1/2 items-center justify-center rounded-full border border-[#e5e5e5] bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50 ${className}`}
    >
      <Image src={`${A}/icon-arrow-${direction}.svg`} alt="" width={16} height={16} />
    </button>
  );
}
