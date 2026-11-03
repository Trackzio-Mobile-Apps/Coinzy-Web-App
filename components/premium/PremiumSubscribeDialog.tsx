"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { AppQrCode } from "@/components/ui/AppQrCode";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";
import { FREE_COLLECTION_LIMIT } from "@/lib/identify/collections";

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
  headerStyle = false,
  email,
  startAtDownload = false,
  scanUsage,
  catalogueDetails = false,
  collectionLimit = false,
}: {
  open: boolean;
  onClose: () => void;
  headerStyle?: boolean;
  email?: string;
  startAtDownload?: boolean;
  scanUsage?: { used: number; limit: number };
  catalogueDetails?: boolean;
  collectionLimit?: boolean;
}) {
  const titleId = useId();
  const ref = useModalDialog(open, (next) => !next && onClose());
  const router = useRouter();
  const [downloadStep, setDownloadStep] = useState(startAtDownload);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!open) { setDownloadStep(startAtDownload); setNotice(""); }
  }, [open, startAtDownload]);

  const checkPremium = async () => {
    if (checking) return;
    setChecking(true);
    setNotice("");
    try {
      const response = await fetch("/api/auth/me?soft=1", { cache: "no-store" });
      const result = await response.json() as { error?: boolean; user?: { isSubscribed?: boolean } };
      if (!response.ok || result.error) throw new Error();
      if (result.user?.isSubscribed) { onClose(); router.refresh(); }
      else setNotice("Premium isn’t active on this account yet. Try again after subscribing.");
    } catch {
      setNotice("Couldn’t check your Premium status. Please try again.");
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
      className={`m-auto ${headerStyle ? "w-[382px]" : "w-[400px]"} max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55`}
    >
      <div className={`relative flex flex-col ${headerStyle ? "gap-4 p-4" : "gap-3 p-5"}`} style={{ backgroundImage: PACK_GRADIENT }}>
        <Image src={`${A}/premium-crown.svg`} alt="" width={headerStyle ? 64 : 48} height={headerStyle ? 64 : 48} />
        <div className="space-y-1 pr-6">
          <h2 id={titleId} className="text-xl font-medium leading-7 text-white">
            {collectionLimit ? "Get unlimited collection space" : catalogueDetails ? "Get advanced coin details - Go Premium" : scanUsage ? scanUsage.used >= scanUsage.limit ? `You've used all ${scanUsage.limit} free scans!` : `You've used ${scanUsage.used} of ${scanUsage.limit} free scans!` : "Get Premium in the app"}
          </h2>
          <p className="text-sm leading-5 text-white/90">
            {downloadStep ? "Premium is available in the Coinzy mobile app. Scan the code with your phone to get it." : collectionLimit ? `Free accounts are limited to ${FREE_COLLECTION_LIMIT} collections, including the 3 default collections. Upgrade for unlimited collections.` : catalogueDetails ? "Want deeper insights? Unlock advanced coin data, history, and rarity with Premium access." : scanUsage ? "Get unlimited scans with Premium. Your collection and past results stay free to view." : "Subscribe on Android or iOS, then sign in here with the same account to unlock Premium on web."}
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

      {!downloadStep && !catalogueDetails && !collectionLimit && <div className={headerStyle ? "px-4 py-3" : "flex flex-col gap-3 p-4"}>
        {scanUsage ? <div className="flex items-center gap-3 rounded-xl bg-[#f5f5f5] p-3">
          <span aria-hidden className="flex size-5 shrink-0 items-center justify-center rounded-full border border-ink text-sm text-ink">!</span>
          <div><p className="text-sm font-medium leading-5 text-ink">You&apos;ve identified {scanUsage.used} coins so far</p><p className="text-xs leading-4 text-[#87878a]">Keep your collection growing with Premium</p></div>
        </div> : <ul className={`list-disc space-y-1 text-sm leading-5 text-muted ${headerStyle ? "rounded-xl bg-[#f5f5f5] py-2 pl-9 pr-3" : "pl-5"}`}>
          <li>Unlimited coin scans and deeper catalogue details</li>
          <li>More Coin of the Day reveals</li>
          <li>Manage or cancel in Google Play or the App Store</li>
        </ul>}
        {!headerStyle && <>
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
        </>}
      </div>}
      {headerStyle && !downloadStep && (
        <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[#fafafa] p-4">
          <button type="button" onClick={onClose} className="h-8 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink">{scanUsage || catalogueDetails || collectionLimit ? "Cancel" : "Not now"}</button>
          <button type="button" onClick={() => setDownloadStep(true)} className="inline-flex h-8 items-center justify-center rounded-[10px] bg-[linear-gradient(90deg,#6a65ed_0%,#e54a9f_100%)] px-3 text-sm font-medium text-white">{catalogueDetails || collectionLimit ? "Go Premium" : scanUsage ? "Get unlimited scans" : "Get the Coinzy app"}</button>
        </div>
      )}
      {headerStyle && downloadStep && <>
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
            <p>Use the same account in the app{email ? <>: <span className="break-all text-ink underline">{email}</span>.</> : "."}</p>
          </div>
          <ol className="list-decimal pl-5 text-sm leading-5 text-ink">
            <li>Scan the code with your phone camera.</li>
            <li>Coinzy opens. No app yet? You’ll go to the store first.</li>
            <li>Choose a Premium plan in the app.</li>
          </ol>
          {notice && <p role="status" className="text-sm text-[#7c3c3f]">{notice}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-[#e5e5e5] bg-[#fafafa] p-4">
          <button type="button" onClick={onClose} className="h-8 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink">Maybe later</button>
          <button type="button" disabled={checking} onClick={() => void checkPremium()} className="h-8 rounded-[10px] bg-primary-500 px-3 text-sm font-medium text-white disabled:opacity-50">{checking ? "Checking…" : "I’ve Premium!"}</button>
        </div>
      </>}
    </dialog>
  );
}
