import { CoinGridSkeleton } from "@/components/catalogue/CoinGridSkeleton";
import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant Global Catalogue chrome while coin data streams in. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="catalogue" title="Global Catalogue">
      <div className="mb-6 flex flex-wrap gap-1.5">
        {[40, 120, 100, 90, 90].map((w) => (
          <div key={w} className="h-8 rounded-full border border-[#e5e5e5] bg-white" style={{ width: w }} />
        ))}
      </div>
      <CoinGridSkeleton count={20} />
    </SignedInRouteLoading>
  );
}
