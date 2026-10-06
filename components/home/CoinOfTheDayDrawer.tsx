"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { DailyLimitDialog } from "@/components/home/DailyLimitDialog";
import { PremiumUpsellDialog } from "@/components/home/PremiumUpsellDialog";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { useModalDialog } from "@/components/ui/useModalDialog";
import type { DrawerSection } from "@/lib/catalogue/coinDetails";

const A = "/assets/home";

export type CoinOfTheDayDrawerCoin = {
  /** Coin name (API `name`). */
  title: string;
  /** Obverse / reverse photos, up to two. */
  images: string[];
  sections: DrawerSection[];
};

/**
 * Premium variant (Figma `1248:98330`): the drawer follows the coin picked in the home panel and gets prev/next arrows
 * around the name plus a "Show more coins" footer that reveals the next of today's coins.
 */
export type ProDrawerControls = {
  /** Current coin (0-based) and how many coins exist today. */
  index: number;
  count: number;
  /** Coins not revealed yet. */
  left: number;
  onPrev: () => void;
  onNext: () => void;
  /** Reveal the next coin (`"advanced"`), or `"limit"` when none are left — the drawer then shows the daily-limit alert. */
  onShowMore: () => "advanced" | "limit";
};

/** Tab strip sits above the scrolling content; a section counts as "current" once it reaches this offset. */
const SPY_OFFSET = 24;

/**
 * "Coin of the day" side drawer — Figma `1248:123835` (Modal `1247:87327`): 585px panel on a 55% black overlay,
 * grey 48px title bar, two coin photos, name, section tabs, scrolling tables, and (free users) the
 * "Show more coins" Premium footer. With `pro` it is the premium drawer (see `ProDrawerControls`).
 *
 * Native `<dialog>`: `showModal()` gives the focus trap, Esc, inert page, and returns focus to the trigger on close.
 * The trigger is a real link to the coin's details page, so modified clicks / no-JS still reach it.
 * Opening it never touches history (it is not a route).
 */
export function CoinOfTheDayDrawer({
  coin,
  detailsHref,
  lockedCount,
  pro,
}: {
  coin: CoinOfTheDayDrawerCoin;
  detailsHref: string;
  lockedCount: number;
  pro?: ProDrawerControls;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [upsellOpen, setUpsellOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const learnMoreRef = useRef<HTMLAnchorElement>(null);
  const upsellFromDrawer = useRef(false);
  const dialogRef = useModalDialog(open, setOpen);
  const [active, setActive] = useState(coin.sections[0]?.id);

  // Switching coins in the premium drawer starts the new coin at the top / first tab.
  const proIndex = pro?.index;
  useEffect(() => {
    if (proIndex === undefined) return;
    scrollRef.current?.scrollTo({ top: 0 });
    setActive(coin.sections[0]?.id);
  }, [proIndex, coin.sections]);

  function openFromLink(event: MouseEvent<HTMLAnchorElement>) {
    // Let ctrl/cmd/shift/middle clicks open the details page normally.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setActive(coin.sections[0]?.id);
    setOpen(true);
  }

  function jumpTo(id: string) {
    const scroller = scrollRef.current;
    const target = scroller?.querySelector<HTMLElement>(`[data-section="${id}"]`);
    if (!scroller || !target) return;
    setActive(id as DrawerSection["id"]);
    scroller.scrollTo({ top: target.offsetTop - scroller.offsetTop - SPY_OFFSET + 12, behavior: "smooth" });
  }

  function onScroll() {
    const scroller = scrollRef.current;
    if (!scroller) return;
    let current = coin.sections[0]?.id;
    // Bottom reached → last section, even when it is too short to reach the top.
    if (scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) {
      current = coin.sections[coin.sections.length - 1]?.id;
    } else {
      for (const section of coin.sections) {
        const el = scroller.querySelector<HTMLElement>(`[data-section="${section.id}"]`);
        if (el && el.offsetTop - scroller.offsetTop - scroller.scrollTop <= SPY_OFFSET) current = section.id;
      }
    }
    if (current && current !== active) setActive(current);
  }

  const photos = coin.images.slice(0, 2);

  return (
    <>
      {!pro && lockedCount > 0 && (
        <button
          type="button"
          aria-haspopup="dialog"
          onClick={() => {
            upsellFromDrawer.current = false;
            setUpsellOpen(true);
          }}
          className="flex w-full items-center justify-center gap-1 text-xs font-light leading-4 text-muted"
        >
          <Image src={`${A}/icon-lock.svg`} alt="" width={16} height={16} />
          {`Unlock ${lockedCount} more with Premium`}
        </button>
      )}
      <Link
        ref={learnMoreRef}
        href={detailsHref}
        onClick={openFromLink}
        aria-haspopup="dialog"
        // Premium panel (Figma 1584:205526) makes the link a 24px-tall button (px-2 py-1).
        className={`flex items-center justify-center gap-1 text-xs font-medium leading-4 text-ink ${pro ? "px-2 py-1" : ""}`}
      >
        Learn more
        <Image src={`${A}/icon-chevron.svg`} alt="" width={16} height={16} />
      </Link>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        // Clicks on the backdrop land on the <dialog> itself (the panel fills it entirely).
        onClick={(event) => {
          if (event.target === event.currentTarget) setOpen(false);
        }}
        className="m-0 ml-auto h-dvh max-h-none w-[585px] max-w-full overflow-hidden border-0 bg-transparent p-0 text-ink backdrop:bg-black/55"
      >
        <div className="flex h-full flex-col overflow-hidden rounded-l-xl border-l border-[#e5e5e5] bg-white">
          {/* Title bar */}
          <div className="flex h-12 shrink-0 items-center gap-2.5 bg-neutral-50 px-8">
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center rounded-lg bg-white p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              <Image src={`${A}/icon-close.svg`} alt="" width={12} height={12} />
            </button>
            <h2 id={titleId} className="text-sm font-medium leading-5 text-ink">
              Coin of the day
            </h2>
          </div>

          {/* Drawer header: photos + name */}
          <div className={`flex shrink-0 flex-col gap-2 px-8 pt-4 ${pro ? "pb-4" : "pb-8"}`}>
            <div className="flex items-center justify-center gap-5 px-[77px]">
              {photos.length ? (
                photos.map((src, i) => <DrawerPhoto key={`${src}-${i}`} src={src} />)
              ) : (
                <DrawerPhoto src={null} />
              )}
            </div>
            {pro ? (
              <div className="flex items-center gap-2">
                <ArrowButton direction="left" label="Previous coin" disabled={pro.index <= 0} onClick={pro.onPrev} />
                <p aria-live="polite" className="min-w-0 flex-1 text-center text-base font-medium leading-6 text-ink">
                  {coin.title}
                </p>
                <ArrowButton direction="right" label="Next coin" disabled={pro.index >= pro.count - 1} onClick={pro.onNext} />
              </div>
            ) : (
              <p className="text-center text-base font-medium leading-6 text-ink">{coin.title}</p>
            )}
          </div>

          {/* Section tabs */}
          <nav aria-label="Coin details sections" className="flex shrink-0 border-b border-border-neutral px-8">
            <div className="-mb-px flex items-center gap-1">
              {coin.sections.map((section) => {
                const on = section.id === active;
                return (
                  <button
                    key={section.id}
                    type="button"
                    aria-current={on ? "true" : undefined}
                    onClick={() => jumpTo(section.id)}
                    className={`flex h-[26px] items-center justify-center whitespace-nowrap px-1.5 pb-1 pt-0.5 text-sm font-medium leading-5 ${
                      on ? "border-b-2 border-primary-500 bg-white text-primary-500" : "text-ink opacity-60 hover:opacity-100"
                    }`}
                  >
                    {section.heading}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Scrolling content */}
          <div
            ref={scrollRef}
            onScroll={onScroll}
            tabIndex={0}
            aria-label={`${coin.title} details`}
            className="relative flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-8 py-3 [scrollbar-color:#c2c2c4_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-xl [&::-webkit-scrollbar-thumb]:bg-[#c2c2c4]"
          >
            {coin.sections.map((section) => (
              <section key={section.id} data-section={section.id} className="flex shrink-0 flex-col gap-3">
                <h3 className="text-lg font-medium leading-7 text-ink">{section.heading}</h3>
                {section.groups.map((group, gi) => (
                  <div key={group.heading ?? gi} className="flex flex-col">
                    {group.heading && (
                      <p className="flex h-7 items-center px-5 py-2 text-sm font-medium leading-5 text-ink">{group.heading}</p>
                    )}
                    {group.rows.map((row, ri) => {
                      // Figma gives the long first label ("Name or Denominations") a 150px column + 130px gap.
                      const wide = section.id === "overview" && ri === 0;
                      return (
                      <div
                        key={row.label}
                        className={`flex items-center border-b-[0.5px] border-border-neutral px-5 py-2 text-xs leading-4 last:border-b-0 ${
                          // Premium Figma (1248:98330) also tightens the Estimated price row to a 30px gap.
                          section.id === "history" || (pro && row.label === "Estimated price ($)")
                            ? "gap-[30px]"
                            : wide
                              ? "gap-[130px]"
                              : "gap-[170px]"
                        }`}
                      >
                        <p className={`shrink-0 font-medium text-ink ${wide ? "w-[150px]" : "w-[110px] max-w-[130px]"}`}>{row.label}</p>
                        <p
                          className={`min-w-0 flex-1 break-words text-muted ${
                            // Figma sets the estimated price value one size up (14/20).
                            row.label === "Estimated price ($)" ? "text-sm leading-5" : ""
                          }`}
                        >
                          {row.value}
                        </p>
                      </div>
                      );
                    })}
                  </div>
                ))}
              </section>
            ))}
          </div>

          {/* Premium footer: reveal the next coin, or hit the daily limit */}
          {pro && (
            <div className="flex shrink-0 flex-col items-center justify-center gap-2.5 border-t border-border-neutral bg-white px-14 py-4">
              <button
                type="button"
                onClick={() => {
                  if (pro.onShowMore() === "limit") {
                    // One dialog at a time: the drawer closes, then the alert opens (Figma 1912:211426).
                    setOpen(false);
                    setLimitOpen(true);
                  }
                }}
                className="flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-button bg-primary-500 px-4 py-2 text-sm font-medium leading-5 text-[#fafafa] hover:bg-primary-700"
              >
                Show more coins
              </button>
              <p className="text-xs leading-4 text-muted">
                {pro.left} more {pro.left === 1 ? "coin" : "coins"} for today
              </p>
            </div>
          )}

          {/* Free-plan footer */}
          {!pro && lockedCount > 0 && (
            <div className="flex shrink-0 flex-col items-center justify-center gap-2.5 border-t border-border-neutral bg-white px-14 py-4">
              <button
                type="button"
                onClick={() => {
                  // Free plan: "Show more coins" is the Premium upsell (Figma 1248:114479). One dialog at a time.
                  upsellFromDrawer.current = true;
                  setOpen(false);
                  setUpsellOpen(true);
                }}
                className="flex w-full items-center justify-center gap-1.5 overflow-hidden rounded-button bg-primary-500 px-4 py-2 text-sm font-medium leading-5 text-[#fafafa] hover:bg-primary-700"
              >
                Show more coins
                <Image src={`${A}/icon-crown-16.svg`} alt="" width={16} height={16} />
              </button>
              <p className="text-xs leading-4 text-muted">Free members get one coin a day</p>
            </div>
          )}
        </div>
      </dialog>

      {pro && (
        <DailyLimitDialog
          open={limitOpen}
          onClose={() => {
            setLimitOpen(false);
            // It opened from inside the (now closed) drawer → hand focus back to the page trigger.
            learnMoreRef.current?.focus();
          }}
        />
      )}

      <PremiumUpsellDialog
        open={upsellOpen}
        onClose={() => {
          setUpsellOpen(false);
          // Opened from inside the (now closed) drawer → hand focus back to the page trigger; otherwise the browser
          // already returns it to the lock button.
          if (upsellFromDrawer.current) learnMoreRef.current?.focus();
        }}
      />
    </>
  );
}

/** 28px round outline arrow used by the premium drawer's coin switcher (disabled = 50% opacity, as in Figma). */
function ArrowButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "left" | "right";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white p-1.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50"
    >
      <Image src={`${A}/icon-arrow-${direction}.svg`} alt="" width={16} height={16} />
    </button>
  );
}

/** 90×90 rounded photo tile; placeholder coin for missing/broken images. */
function DrawerPhoto({ src }: { src: string | null }) {
  return (
    <div className="relative size-[90px] shrink-0 overflow-hidden rounded-lg bg-coin-well">
      {src ? (
        <FallbackImage
          src={src}
          alt=""
          width={90}
          height={90}
          className="size-[90px] object-cover"
          fallback={
            <div className="flex size-full items-center justify-center">
              <CoinPlaceholder size="lg" className="!size-[64px]" />
            </div>
          }
        />
      ) : (
        <div className="flex size-full items-center justify-center">
          <CoinPlaceholder size="lg" className="!size-[64px]" />
        </div>
      )}
    </div>
  );
}
