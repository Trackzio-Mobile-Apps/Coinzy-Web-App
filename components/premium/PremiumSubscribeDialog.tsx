"use client";

import Image from "next/image";
import Link from "next/link";
import { useId } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { PLAY_STORE_URL } from "@/lib/constants";

const A = "/assets/home";
const PACK_GRADIENT =
  "linear-gradient(-77.5deg, rgb(106, 101, 237) 10.1%, rgb(229, 74, 159) 98.5%)";

/**
 * Premium upsell — subscriptions are purchased in the Coinzy mobile app (Play / App Store).
 * Web reads `user.isSubscribed` from `auth/me` when signed in with the same account.
 */
export function PremiumSubscribeDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[400px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex flex-col gap-3 p-5" style={{ backgroundImage: PACK_GRADIENT }}>
        <Image src={`${A}/premium-crown.svg`} alt="" width={48} height={48} />
        <div className="space-y-1 pr-6">
          <h2 id={titleId} className="text-xl font-medium leading-7 text-white">
            Get Premium in the app
          </h2>
          <p className="text-sm leading-5 text-white/90">
            Subscribe on Android or iOS, then sign in here with the same account to unlock Premium on web.
          </p>
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

      <div className="flex flex-col gap-3 p-4">
        <ul className="list-disc space-y-1 pl-5 text-sm leading-5 text-muted">
          <li>Unlimited coin scans and deeper catalogue details</li>
          <li>More Coin of the Day reveals</li>
          <li>Manage or cancel in Google Play or the App Store</li>
        </ul>
        <Link
          href={PLAY_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onClose}
          className="inline-flex h-11 items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#6a65ed_0%,#e54a9f_100%)] px-6 text-base font-medium text-white hover:opacity-95"
        >
          Get the Coinzy app
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="text-center text-sm font-medium text-muted hover:text-ink"
        >
          Not now
        </button>
      </div>
    </dialog>
  );
}
