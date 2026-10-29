import { CoinGridSkeleton } from "@/components/catalogue/CoinGridSkeleton";
import { DualAuthRouteLoading } from "@/components/home/DualAuthRouteLoading";

/** Instant Global Catalogue chrome while coin data streams in — shell matches auth. */
export default function Loading() {
  return (
    <DualAuthRouteLoading
      active="catalogue"
      title="Global Catalogue"
      signedIn={
        <>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {[40, 120, 100, 90, 90].map((w) => (
              <div key={w} className="h-8 rounded-full border border-[#e5e5e5] bg-white" style={{ width: w }} />
            ))}
          </div>
          <CoinGridSkeleton count={20} />
        </>
      }
      loggedOut={
        <>
          <div className="mb-6 flex flex-wrap gap-1.5">
            {[40, 120, 100, 90, 90].map((w) => (
              <div key={w} className="h-8 rounded-full border border-[#e5e5e5] bg-white" style={{ width: w }} />
            ))}
          </div>
          <CoinGridSkeleton count={12} />
        </>
      }
    />
  );
}
