"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  FREE_AI_SCAN_LIMIT,
  FREE_SCAN_USAGE_STORAGE_KEY,
  freeScanProgressPercent,
  getFreeScansUsed,
} from "@/lib/identify/scanUsage";

function subscribe(onStoreChange: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === FREE_SCAN_USAGE_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("coinzy:identify:scans-updated", onStoreChange);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("coinzy:identify:scans-updated", onStoreChange);
  };
}

/** Figma free-plan widget `768:46630` on identify `1828:206842`. */
export function IdentifyFreePlanCard({ hidden }: { hidden?: boolean }) {
  const used = useSyncExternalStore(subscribe, getFreeScansUsed, () => 0);
  if (hidden) return null;

  const pct = freeScanProgressPercent(used);

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-[#dfdfe0] bg-white px-[17px] py-[13px]">
      <div className="flex w-full flex-col gap-1">
        <p className="text-sm font-medium leading-5 text-[#1e1e1f]">Free plan</p>
        <p className="text-xs leading-4 text-[#87878a]">
          {used} of {FREE_AI_SCAN_LIMIT} free scans used
        </p>
      </div>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#dfdfe0]"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={FREE_AI_SCAN_LIMIT}
        aria-label="Free AI scans used"
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#7c3c3f] transition-[width] duration-300"
          style={{ width: used > 0 ? `${pct}%` : "8px" }}
        />
      </div>
      <Link
        href="/home#premium"
        className="flex h-8 w-full items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-medium text-[#1e1e1f]"
      >
        Upgrade
      </Link>
    </div>
  );
}
