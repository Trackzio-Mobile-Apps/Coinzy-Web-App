import Link from "next/link";
import { COLLECTION_COIN_LIMIT } from "@/components/collection/collectionNav";

/** Free plan rail on collections home (Figma `1341:262554` / `768:46633`). */
export function CollectionFreePlanCard({ used }: { used: number }) {
  const pct = Math.min(100, (used / COLLECTION_COIN_LIMIT) * 100);

  return (
    <div className="w-[268px] rounded-xl border border-[#dfdfe0] bg-white px-[17px] py-[13px]">
      <p className="text-sm font-medium leading-5 text-ink">Free plan</p>
      <p className="mt-1 text-xs leading-4 text-[#87878a]">
        {used} of {COLLECTION_COIN_LIMIT} coins added to collections
      </p>
      <div className="relative mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#dfdfe0]">
        <div className="absolute left-0 top-0 h-full rounded-full bg-[#7c3c3f]" style={{ width: `${pct}%` }} />
      </div>
      <Link
        href="/home#premium"
        className="mt-4 flex h-9 w-full items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-medium text-ink"
      >
        Upgrade
      </Link>
    </div>
  );
}
