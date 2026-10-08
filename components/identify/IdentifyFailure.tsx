"use client";

import Image from "next/image";
import { IdentifyExpertBanner } from "@/components/identify/IdentifyExpertBanner";

/** Figma Copy `2098:158944` — identify “not found” / failure after analyse. */
export function IdentifyFailure({
  frontPreview,
  backPreview,
  title = "We couldn't identify this coin",
  body = "Coinzy AI can’t tell if this is a coin or not. Try taking a close photo of a single coin, front and back, and we'll try again.",
  onTryAgain,
  onUploadNew,
}: {
  frontPreview: string;
  backPreview: string;
  title?: string;
  body?: string;
  onTryAgain: () => void;
  onUploadNew: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold leading-8 text-ink">Identify coin</h1>

      <div className="overflow-hidden rounded-xl bg-white p-4">
        <h2 className="text-base font-medium leading-6 text-ink">AI Analysis in progress.</h2>
        <div className="mt-3 flex flex-col items-center gap-8 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:px-[94px] sm:py-16">
          <div className="flex shrink-0 flex-col gap-3">
            <div className="relative size-[120px] overflow-hidden rounded-lg bg-[#f5f5f5]">
              <Image src={frontPreview} alt="Obverse" fill className="object-cover" unoptimized />
            </div>
            <div className="relative size-[120px] overflow-hidden rounded-lg bg-[#f5f5f5]">
              <Image src={backPreview} alt="Reverse" fill className="object-cover" unoptimized />
            </div>
          </div>

          <div className="hidden h-[200px] w-px shrink-0 self-stretch bg-[#e5e5e5] sm:block" aria-hidden />

          <div className="flex w-full max-w-[412px] flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-medium leading-7 text-ink">{title}</p>
              <p className="text-sm leading-5 text-[#606062]">{body}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onTryAgain}
                className="inline-flex h-9 w-full items-center justify-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-700 sm:w-[176px]"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={onUploadNew}
                className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-ink"
              >
                Upload new images
              </button>
            </div>
          </div>
        </div>
      </div>

      <IdentifyExpertBanner
        illustrationSrc="/assets/identify/expert-review-thumb.png"
        title="Want more certainty?"
        subtext="Have your coin reviewed by an human expert, not AI"
        showButtonIcon
      />
    </div>
  );
}
