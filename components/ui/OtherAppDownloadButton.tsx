"use client";

import Image from "next/image";
import { useId, useState, useSyncExternalStore } from "react";
import { useModalDialog } from "@/components/ui/useModalDialog";
import { appQrSourceForHostname, APP_QA_QR_SRC } from "@/components/ui/AppQrCode";

const subscribe = () => () => {};
const isQa = () => appQrSourceForHostname(window.location.hostname) === APP_QA_QR_SRC;
const serverEnvironment = () => null;

interface OtherAppDownloadButtonProps {
  app: { name: string; description: string; icon: string; qr: string; playHref: string; appStoreHref: string | null };
  className?: string;
}

export function OtherAppDownloadButton({ app, className }: OtherAppDownloadButtonProps) {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const dialog = useModalDialog(open, setOpen);
  const qa = useSyncExternalStore<boolean | null>(subscribe, isQa, serverEnvironment);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={`Try ${app.name} free`} className={className}>
        Try free
      </button>
      <dialog
        ref={dialog}
        aria-labelledby={titleId}
        onClose={() => setOpen(false)}
        onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }}
        className="m-auto max-h-[calc(100dvh-2rem)] w-[min(calc(100%-2rem),400px)] overflow-y-auto rounded-xl border-0 bg-white px-6 py-4 text-ink shadow-xl backdrop:bg-black/55"
      >
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="absolute right-6 top-4 flex size-6 items-center justify-center text-[#606062]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" /></svg>
        </button>
        <div className="flex flex-col items-center gap-8 text-center">
          <div className="flex w-full flex-col items-center gap-4 pt-5">
            <Image src={app.icon} alt="" width={50} height={50} className="size-[50px] rounded-lg" />
            <div className="flex w-full flex-col gap-2">
              <h2 id={titleId} className="text-xl font-medium leading-7">Scan to download {app.name}</h2>
              <p className="text-sm leading-5 text-[#737373]">{app.description}</p>
            </div>
          </div>
          <div className="flex w-full flex-col items-center gap-6 py-3">
            <div className="relative flex size-[255px] max-w-full items-center justify-center p-4">
              <span aria-hidden="true" className="absolute left-0 top-0 size-[42px] rounded-tl-lg border-l-[5px] border-t-[5px] border-black" />
              <span aria-hidden="true" className="absolute right-0 top-0 size-[42px] rounded-tr-lg border-r-[5px] border-t-[5px] border-black" />
              <span aria-hidden="true" className="absolute bottom-0 left-0 size-[42px] rounded-bl-lg border-b-[5px] border-l-[5px] border-black" />
              <span aria-hidden="true" className="absolute bottom-0 right-0 size-[42px] rounded-br-lg border-b-[5px] border-r-[5px] border-black" />
              {qa !== null && <Image src={qa ? app.qr.replace(/\.svg$/, "-qa.svg") : app.qr} alt={`Download QR code for ${app.name}`} width={223} height={223} className="size-full object-contain" />}
            </div>
            <div className="h-px w-full max-w-[288px] bg-[#c2c2c4]" />
            <div className="flex w-full max-w-[288px] flex-col items-center gap-3">
              <p className="text-xs font-medium leading-4 text-[#606062]">On mobile? Tap below</p>
              <div className="flex flex-col items-center gap-2.5">
                {app.appStoreHref && <a href={app.appStoreHref} target="_blank" rel="noopener noreferrer" className="flex h-14 w-[236px] items-center gap-6 rounded-md bg-[#242424] px-6 text-white">
                  <Image src="/assets/landing-page/07-mobile-app/apple-icon.svg" alt="" width={28} height={34} className="h-[34px] w-[28px] brightness-0 invert" />
                  <span className="text-left"><span className="block text-xs leading-4">Download on the</span><span className="block text-base font-medium leading-6">App Store</span></span>
                </a>}
                <a href={app.playHref} target="_blank" rel="noopener noreferrer" className="flex h-14 w-[236px] items-center gap-6 rounded-md bg-[#1e1e1f] px-6 text-white">
                  <span className="flex size-[34px] shrink-0 items-center justify-center"><Image src="/assets/landing-page/07-mobile-app/google-play-icon.svg" alt="" width={25} height={30} /></span>
                  <span className="text-left"><span className="block text-xs leading-4">Download on the</span><span className="block text-base font-medium leading-6">Google Play</span></span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </dialog>
    </>
  );
}
