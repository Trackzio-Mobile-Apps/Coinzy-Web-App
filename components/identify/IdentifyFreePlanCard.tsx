"use client";

import { PremiumUpgradeButton } from "@/components/premium/PremiumUpgradeButton";
import { DEFAULT_FREE_SCAN_LIMIT, freeScanProgressPercent, type ScanUsage } from "@/lib/identify/scanUsage";
import { useScanUsage } from "@/lib/identify/scanUsageStore";

/** Figma free-plan widget `768:46630` on identify `1828:206842`. Counts come from the server (`successCount` / `successThreshold`). */
export function IdentifyFreePlanCard({ hidden, initialUsage = null }: { hidden?: boolean; initialUsage?: ScanUsage | null }) {
  // Store value (updated after each scan) wins; the server-rendered value avoids a 0 → n flash on first paint.
  const usage = useScanUsage() ?? initialUsage;
  if (hidden) return null;

  const used = usage?.successCount ?? 0;
  const limit = usage?.successThreshold ?? DEFAULT_FREE_SCAN_LIMIT;
  const pct = freeScanProgressPercent(used, limit);

  return (
    <div className="flex w-full flex-col gap-4 rounded-xl border border-[#dfdfe0] bg-white px-4 py-3">
      <div className="flex w-full flex-col gap-1">
        <p className="text-sm font-medium leading-5 text-[#1e1e1f]">Free plan</p>
        <p className="text-xs leading-4 text-[#87878a]">
          {used} of {limit} free scans used
        </p>
      </div>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#dfdfe0]"
        role="progressbar"
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit}
        aria-label="Free AI scans used"
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full bg-[#7c3c3f] transition-[width] duration-300"
          style={{ width: used > 0 ? `${pct}%` : "8px" }}
        />
      </div>
      <PremiumUpgradeButton className="flex h-9 w-full items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-medium text-[#1e1e1f]">
        Upgrade
      </PremiumUpgradeButton>
    </div>
  );
}
