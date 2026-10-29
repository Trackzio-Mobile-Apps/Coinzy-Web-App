import { CoinGridSkeleton } from "@/components/catalogue/CoinGridSkeleton";
import { DualAuthRouteLoading } from "@/components/home/DualAuthRouteLoading";

/** Instant Marketplace chrome while listings / filters stream in — shell matches auth. */
export default function Loading() {
  return (
    <DualAuthRouteLoading
      active="marketplace"
      title="Marketplace"
      signedIn={
        <>
          <div className="mb-8 h-[88px] animate-pulse rounded-[12px] border border-[#e5e7eb] bg-white" />
          <div className="mb-8 h-[120px] animate-pulse rounded-[12px] bg-white/60" />
          <CoinGridSkeleton count={16} />
        </>
      }
      loggedOut={<CoinGridSkeleton count={8} />}
    />
  );
}
