import { PremiumUpgradeButton } from "@/components/premium/PremiumUpgradeButton";
import { FREE_COLLECTION_LIMIT } from "@/lib/identify/collections";

/** Free plan rail on collections home (Figma `1341:262554` / `768:46633`). */
export function CollectionFreePlanCard({ used }: { used: number | null }) {
  const pct = used === null ? 0 : Math.min(100, (used / FREE_COLLECTION_LIMIT) * 100);

  return (
    <div className="w-[268px] rounded-xl border border-[#dfdfe0] bg-white px-[17px] py-[13px]">
      <p className="text-sm font-medium leading-5 text-ink">Free plan</p>
      <p className="mt-1 text-xs leading-4 text-[#87878a]">
        {used === null ? "Collection count unavailable" : `${used} of ${FREE_COLLECTION_LIMIT} collections used`}
      </p>
      <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#dfdfe0]">
        <div className="absolute left-0 top-0 h-full rounded-full bg-[#7c3c3f]" style={{ width: `${pct}%` }} />
      </div>
      <PremiumUpgradeButton headerStyle collectionLimit className="mt-4 flex h-9 w-full items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-medium text-ink">
        Upgrade
      </PremiumUpgradeButton>
    </div>
  );
}
