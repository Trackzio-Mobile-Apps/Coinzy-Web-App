import { CoinGridSkeleton } from "@/components/catalogue/CoinGridSkeleton";
import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant Marketplace chrome while listings / filters stream in. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="marketplace" title="Marketplace">
      <div className="mb-8 h-[88px] animate-pulse rounded-[12px] border border-[#e5e7eb] bg-white" />
      <div className="mb-8 h-[120px] animate-pulse rounded-[12px] bg-white/60" />
      <CoinGridSkeleton count={16} />
    </SignedInRouteLoading>
  );
}
