import Link from "next/link";
import { CollectionCoinTileSkeleton } from "@/components/collection/CollectionGridSkeleton";
import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant bucket chrome (Owned / Identified / Wishlist) while coins load. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="collection" mainClassName="min-w-0 flex-1 overflow-y-auto px-8 py-6">
      <div className="mx-auto w-full max-w-[1122px]">
        <p className="text-sm text-muted">
          <Link href="/collection" className="text-primary-500">
            Collections
          </Link>
          <span className="mx-2">/</span>
          <span className="inline-block h-4 w-40 animate-pulse rounded bg-black/[0.06] align-middle" />
        </p>
        <div className="mt-4 flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-right text-xs text-muted">Loading results…</p>
            <CollectionCoinTileSkeleton count={16} />
          </div>
          <aside className="hidden h-[320px] w-[240px] shrink-0 animate-pulse rounded-xl border border-[#efefef] bg-white lg:block" />
        </div>
      </div>
    </SignedInRouteLoading>
  );
}
