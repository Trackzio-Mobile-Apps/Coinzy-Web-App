"use client";

import Image from "next/image";
import { useId } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";

const A = "/assets/home";

/**
 * "Oops! You've hit your daily limit of 3 views." alert — Figma `1912:211426` (AlertDialog on a 55% black overlay):
 * 382px card, crown tile + title + copy + corner close, light footer with a single primary "Okay".
 *
 * It is the end state of the Premium Coin of the Day flow: a premium user presses "Show more coins" after every one of
 * today's coins has been revealed. Okay / close / Esc / backdrop all just dismiss it — nothing is purchased or stored.
 */
export function DailyLimitDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
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
      <div className="relative flex items-start gap-4 p-4">
        <div className="flex items-center pb-2">
          <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]">
            <Image src={`${A}/premium-limit-crown.svg`} alt="" width={24} height={24} />
          </div>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h2 id={titleId} className="text-base font-medium leading-6 text-ink">
            Oops!
          </h2>
          <p className="text-sm leading-5 text-muted">You’ve hit your daily limit of 3 views. Come back tomorrow for more!</p>
        </div>
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute right-2 top-2 size-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          <Image src={`${A}/icon-close-dark.svg`} alt="" width={16} height={16} />
        </button>
      </div>
      <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[linear-gradient(rgba(255,255,255,0.5),rgba(255,255,255,0.5)),linear-gradient(#f5f5f5,#f5f5f5)] p-4">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center justify-center rounded-button bg-primary-500 px-3 py-1.5 text-sm font-medium leading-5 text-[#fafafa] hover:bg-primary-700"
        >
          Okay
        </button>
      </div>
    </dialog>
  );
}
