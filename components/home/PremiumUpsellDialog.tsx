"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";

const A = "/assets/home";

/**
 * "More knowledge, more fun!" Premium upsell — Figma `1248:114479` (Modal `1248:119042`): 382px dialog on a 55% black
 * overlay with a pink→indigo gradient header (crown, title, copy, close) and a light footer (Cancel · Go Premium).
 * "Go Premium" goes to the existing `/home#premium` banner; no purchase flow here.
 */
export function PremiumUpsellDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="m-auto w-[382px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div
        className="relative flex flex-col gap-4 overflow-hidden p-4"
        style={{ backgroundImage: "linear-gradient(-64.92deg, #6a65ed 10.107%, #e54a9f 98.516%)" }}
      >
        <div className="flex w-[350px] max-w-full flex-col gap-2">
          <Image src={`${A}/premium-crown.svg`} alt="" width={64} height={64} />
          <h2 id={titleId} className="text-xl font-medium leading-7 text-white">
            More knowledge, more fun!
          </h2>
          <p className="text-sm leading-5 text-white">Premium members enjoy multiple Coin of the Day reveals daily.</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-4 top-4 size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Image src={`${A}/icon-close-white.svg`} alt="" width={16} height={16} />
        </button>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)),linear-gradient(#f5f5f5,#f5f5f5)] p-4">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center rounded-button border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium leading-5 text-[#0a0a0a] hover:bg-neutral-50"
        >
          Cancel
        </button>
        <Link
          href="/home#premium"
          onClick={onClose}
          className="flex items-center justify-center overflow-hidden rounded-button bg-gradient-to-r from-[#6366f1] to-[#ec4899] px-3 py-1.5 text-sm font-medium leading-5 text-[#fafafa] hover:opacity-90"
        >
          Go Premium
        </Link>
      </div>
    </dialog>
  );
}
