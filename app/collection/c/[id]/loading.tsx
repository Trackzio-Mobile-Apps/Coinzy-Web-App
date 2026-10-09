import Link from "next/link";
import { CollectionCoinTileSkeleton } from "@/components/collection/CollectionGridSkeleton";
import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant private collection chrome while coins load. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="collection" mainClassName="min-w-0 flex-1 overflow-y-auto px-8 py-6">
      <div className="mx-auto w-full max-w-[1122px]">
        <p className="text-sm text-muted">
          <Link href="/collection" className="text-primary-500">
            Collections
          </Link>
          <span className="mx-2">/</span>
          <span className="inline-block h-4 w-32 animate-pulse rounded bg-black/[0.06] align-middle" />
        </p>
        <CollectionCoinTileSkeleton count={16} />
      </div>
    </SignedInRouteLoading>
  );
}