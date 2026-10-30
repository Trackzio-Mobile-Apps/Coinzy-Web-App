import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";
import { DualAuthRouteLoading } from "@/components/home/DualAuthRouteLoading";

/** Instant loader on client navigation (e.g. clicking a coin card) until the page shell arrives. */
export default function Loading() {
  return (
    <DualAuthRouteLoading
      active="catalogue"
      title="Global Catalogue"
      signedIn={<CoinDetailsSkeleton showBreadcrumb={false} />}
      loggedOut={<CoinDetailsSkeleton />}
    />
  );
}
