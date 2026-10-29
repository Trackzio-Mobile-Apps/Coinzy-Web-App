import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant Identify chrome so Back from a result paints at once while the page data loads. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="identify" title="Identify coin">
      <div className="mx-auto w-full max-w-[1122px]">
        <div className="h-[420px] animate-pulse rounded-xl bg-white" />
      </div>
    </SignedInRouteLoading>
  );
}
