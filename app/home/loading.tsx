import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant Home chrome while the dashboard data streams in. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="home" title="Home">
      <div className="mb-6 h-[160px] animate-pulse rounded-[12px] bg-[#f5f5f5]" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="h-[210px] animate-pulse rounded-[12px] bg-[#f5f5f5]" />
        <div className="h-[210px] animate-pulse rounded-[12px] bg-[#f5f5f5]" />
      </div>
    </SignedInRouteLoading>
  );
}
