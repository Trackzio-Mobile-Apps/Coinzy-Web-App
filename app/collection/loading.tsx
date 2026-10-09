import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { CollectionGridSkeleton } from "@/components/collection/CollectionGridSkeleton";
import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant Collections chrome while overview cards stream in. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="collection" mainClassName="min-w-0 flex-1 overflow-y-auto px-8 py-6">
      <div className="mx-auto flex w-full max-w-[1122px] gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex max-w-[695px] flex-col gap-4">
            <h1 className="text-2xl font-semibold leading-8 text-ink">Collections</h1>
            <CatalogueSearch
              action="/collection/owned"
              query=""
              placeholder="Search coins, empires, countries, years…"
              className="h-8 max-w-none w-full"
            />
          </div>
          <CollectionGridSkeleton count={6} />
        </div>
        <aside className="hidden w-[266px] shrink-0 animate-pulse flex-col gap-4 lg:flex">
          <div className="h-36 rounded-xl border border-[#efefef] bg-white" />
          <div className="h-48 rounded-xl border border-[#efefef] bg-white" />
        </aside>
      </div>
    </SignedInRouteLoading>
  );
}
