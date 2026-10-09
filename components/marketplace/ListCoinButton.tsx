"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  SelectOwnedCoinDialog,
  type OwnedCoinPick,
} from "@/components/marketplace/SelectOwnedCoinDialog";

const A = "/assets/marketplace";

const defaultTriggerClass =
  "shrink-0 rounded-[10px] border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-medium leading-5 text-ink hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

/**
 * Signed-in "List a coin" entry — Figma Copy `1362:168657` (menu) + `1362:171575` (From Owned).
 *
 * - **Select from owned collection** → owned picker → default navigates to
 *   `/collection/coin/[id]?from=marketplace&list=1` (opens sell drawer). Override with `onSelectOwned`.
 * - **Add new coin** → `onAddNewCoin` if provided; else `/identify` interim until Self-listing ships.
 */
export function ListCoinButton({
  className = "",
  buttonClassName = defaultTriggerClass,
  label = "List a coin",
  onSelectOwned,
  onAddNewCoin,
}: {
  className?: string;
  buttonClassName?: string;
  label?: string;
  /** Handoff after picking an owned coin. Default: collection coin details with `?list=1`. */
  onSelectOwned?: (coin: OwnedCoinPick) => void;
  /**
   * Handoff for "Add new coin" (Self-listing / identify agents).
   * Default: navigate to `/identify`.
   */
  onAddNewCoin?: () => void;
}) {
  const router = useRouter();
  const menuId = useId();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ownedOpen, setOwnedOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const openOwned = () => {
    setMenuOpen(false);
    setOwnedOpen(true);
  };

  const addNew = () => {
    setMenuOpen(false);
    if (onAddNewCoin) {
      onAddNewCoin();
      return;
    }
    // Interim until Self-listing / Add-to-sale agents wire identify → list.
    router.push("/identify");
  };

  const confirmOwned = (coin: OwnedCoinPick) => {
    setOwnedOpen(false);
    if (onSelectOwned) {
      onSelectOwned(coin);
      return;
    }
    router.push(`/collection/coin/${encodeURIComponent(coin.coinId)}?from=marketplace&list=1`);
  };

  return (
    <div ref={wrapRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        onClick={() => setMenuOpen((v) => !v)}
        className={buttonClassName}
      >
        {label}
      </button>

      {menuOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label="List a coin options"
          className="absolute right-0 top-[calc(100%+6px)] z-40 w-[209px] overflow-hidden rounded-lg border border-[#dfdfe0] bg-white shadow-[0_0_1px_rgba(0,0,0,0.2),0_26px_80px_rgba(0,0,0,0.2)]"
        >
          <button
            type="button"
            role="menuitem"
            onClick={openOwned}
            className="flex h-[34px] w-full items-center gap-2 px-2 text-left text-xs leading-[18px] text-[#1e1e1f] hover:bg-[#f2f2f3] focus-visible:bg-[#f2f2f3] focus-visible:outline-none"
          >
            <Image src={`${A}/icon-owned-grid.svg`} alt="" width={16} height={16} className="size-4 shrink-0" />
            <span className="min-w-0 flex-1">Select from owned collection</span>
          </button>
          <div className="h-px bg-[#dfdfe0]" aria-hidden />
          <button
            type="button"
            role="menuitem"
            onClick={addNew}
            className="flex h-[34px] w-full items-center gap-2 px-2 text-left text-xs leading-[18px] text-[#1e1e1f] hover:bg-[#f2f2f3] focus-visible:bg-[#f2f2f3] focus-visible:outline-none"
          >
            <Image src={`${A}/icon-camera.svg`} alt="" width={16} height={16} className="size-4 shrink-0" />
            <span className="min-w-0 flex-1">Add new coin</span>
            <Image
              src="/assets/catalogue/icon-chevron-right.svg"
              alt=""
              width={16}
              height={16}
              className="size-4 shrink-0"
            />
          </button>
        </div>
      ) : null}

      <SelectOwnedCoinDialog open={ownedOpen} onClose={() => setOwnedOpen(false)} onConfirm={confirmOwned} />
    </div>
  );
}
