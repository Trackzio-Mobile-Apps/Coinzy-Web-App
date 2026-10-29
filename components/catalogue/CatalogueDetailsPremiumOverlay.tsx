"use client";

import Image from "next/image";
import { PremiumUpgradeButton } from "@/components/premium/PremiumUpgradeButton";

const A = "/assets/home";

/**
 * Inline Premium gate on catalogue coin tabs — Figma non-premium `1348:137792` (overlay on blurred tab content).
 * Premium state `1341:249499` omits this overlay.
 */
export function CatalogueDetailsPremiumOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-b-2xl bg-[linear-gradient(180deg,rgba(255,255,255,0.7)_0.82%,rgba(222,222,222,0.7)_37.58%)] p-4 backdrop-blur-[4px]"
      role="region"
      aria-label="Premium subscription"
    >
      <div
        className="flex w-full max-w-[380px] flex-col gap-4 rounded-[14px] p-4 text-white shadow-[0_0_0_1px_rgba(10,10,10,0.1)]"
        style={{ backgroundImage: "linear-gradient(282.5deg, #6a65ed 10.11%, #e54a9f 98.52%)" }}
      >
        <div className="flex items-start gap-6">
          <Image src={`${A}/premium-crown.svg`} alt="" width={44} height={44} className="size-11 shrink-0" />
          <div className="min-w-0 space-y-2">
            <p className="text-lg font-medium leading-7">Subscribe to Premium</p>
            <p className="text-sm leading-5">Unlock more coin details with Premium.</p>
          </div>
        </div>
        <PremiumUpgradeButton className="inline-flex h-8 w-full items-center justify-center rounded-[10px] bg-white px-3 text-sm font-medium leading-5 text-ink hover:opacity-95">
          Go Premium
        </PremiumUpgradeButton>
      </div>
    </div>
  );
}
