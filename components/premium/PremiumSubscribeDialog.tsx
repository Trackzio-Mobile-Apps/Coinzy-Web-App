"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { AppQrCode } from "@/components/ui/AppQrCode";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";
import { getExpertsCredits } from "@/lib/experts/client";
import { parseCreditBalance } from "@/lib/experts/creditBalance";

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
  email,
  scanUsage,
  catalogueDetails = false,
  collectionLimit = false,
  credits = false,
  onCreditsChecked,
}: {
  open: boolean;
  onClose: () => void;
  headerStyle?: boolean;
  email?: string;
  startAtDownload?: boolean;
  scanUsage?: { used: number; limit: number };
  catalogueDetails?: boolean;
  collectionLimit?: boolean;
  credits?: boolean;
  onCreditsChecked?: (balance: number) => void;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open) setNotice("");
  }, [open]);

  const checkPremium = async () => {
    if (checking) return;
    setChecking(true);
    setNotice("");
    try {
      if (credits) {
        const result = await getExpertsCredits();
        const balance = parseCreditBalance(result.data?.creditBalance);
        if (result.error || balance === null) throw new Error();
        onCreditsChecked?.(balance);
        if (balance > 0) { onClose(); router.refresh(); }
        else setNotice("No credits are available on this account yet. Try again after purchasing credits.");
        return;
      }
      const response = await fetch("/api/auth/me?soft=1", { cache: "no-store" });
      const result = await response.json() as { error?: boolean; user?: { isSubscribed?: boolean } };
      if (!response.ok || result.error) throw new Error();
      if (result.user?.isSubscribed) { onClose(); router.refresh(); }
      else setNotice("Premium isn’t active on this account yet. Try again after subscribing.");
    } catch {
      setNotice(credits ? "Couldn’t check your credits. Please try again." : "Couldn’t check your Premium status. Please try again.");
    } finally {
      setChecking(false);
    }
  };

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="m-auto w-[382px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55"
    >
      <div className="relative flex flex-col gap-4 p-4" style={{ backgroundImage: PACK_GRADIENT }}>
        <Image src={`${A}/premium-crown.svg`} alt="" width={64} height={64} />
        <div className="space-y-1 pr-6">
          <h2 id={titleId} className="text-xl font-medium leading-7 text-white">
            {credits ? "Buy credits in the Coinzy app" : collectionLimit ? "Get unlimited collection space" : catalogueDetails ? "Get advanced coin details - Go Premium" : scanUsage ? scanUsage.used >= scanUsage.limit ? `You've used all ${scanUsage.limit} free scans!` : `You've used ${scanUsage.used} of ${scanUsage.limit} free scans!` : "Get Premium in the app"}
          </h2>
          <p className="text-sm leading-5 text-white/90">
            {credits ? "Scan the code with your phone. Pick a credit pack in the app, then come back here to upload your coin." : "Premium is available in the Coinzy mobile app. Scan the code with your phone to get it."}
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

        <div className="flex flex-col gap-6 p-4">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-between">
            <AppQrCode size={156} className="max-w-[45%] shrink-0 object-contain" />
            <div className="flex min-w-0 flex-col gap-6">
              {([
                { href: PLAY_STORE_URL, icon: "google-play-icon.svg", name: "Google Play" },
                { href: APP_STORE_URL, icon: "apple-icon.svg", name: "App Store" },
              ] as const).map((store) => <Link key={store.name} href={store.href} target="_blank" rel="noopener noreferrer" className={`flex h-[50px] w-[162px] shrink-0 items-center gap-3 rounded-md pl-4 pr-3 text-white ${store.name === "App Store" ? "bg-[#262626]" : "bg-[#1e1e1f]"}`}>
                <Image src={`/assets/landing-page/07-mobile-app/${store.icon}`} alt="" width={28} height={28} className={`h-7 shrink-0 ${store.name === "App Store" ? "w-[23px] brightness-0 invert opacity-[0.92]" : "w-7"}`} />
                <span className="w-[94px] shrink-0 text-left"><span className="block whitespace-nowrap text-xs font-normal leading-4">Download on the</span><span className="block whitespace-nowrap text-sm font-medium leading-5 opacity-[0.92]">{store.name}</span></span>
              </Link>)}
            </div>
          </div>
          <div className="flex gap-3 rounded-xl bg-[#f5f5f5] p-3 text-xs leading-4 text-[#87878a]">
            <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#141b34] text-sm text-[#141b34]">!</span>
            <p>Use the same account in the app{email ? <>: <span className="break-all text-ink underline">{email}</span>.</> : "."}{credits && " Credits go to that account."}</p>
          </div>
          <ol className="list-decimal pl-5 text-sm leading-5 text-ink">
            <li>Scan the code with your phone camera.</li>
            <li>Coinzy opens. No app yet? You’ll go to the store first.</li>
            <li>{credits ? "Choose a credit pack in the app." : "Choose a Premium plan in the app."}</li>
          </ol>
          {notice && <p role="status" className="text-sm text-[#7c3c3f]">{notice}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[#fafafa] p-4">
          <button type="button" onClick={onClose} className="h-8 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink">Maybe later</button>
          <button type="button" disabled={checking} onClick={() => void checkPremium()} className="h-8 rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50">{checking ? "Checking…" : credits ? "I’ve purchased credits" : "I’ve Premium!"}</button>
        </div>
    </dialog>
  );
}
