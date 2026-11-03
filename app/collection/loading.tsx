import { CatalogueSearch } from "@/components/catalogue/CatalogueSearch";
import { CollectionGridSkeleton } from "@/components/collection/CollectionGridSkeleton";
import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant Collections chrome while overview cards stream in. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="collection" mainClassName="min-w-0 flex-1 overflow-y-auto px-8 py-6">
      <div className="mx-auto w-full max-w-[1122px]">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold leading-8 text-ink sm:flex-1">Collection</h1>
          <CatalogueSearch action="/collection/owned" query="" placeholder="Search coins, empires, countries, years…" className="h-8 w-full max-w-none sm:min-w-0 sm:flex-1" />
          <span className="inline-flex h-8 items-center rounded-[10px] bg-[#7C3C3F]/80 px-3 text-sm font-medium text-white">Create new collection</span>
        </div>
        <div className="flex gap-4">
          <div className="min-w-0 flex-1"><CollectionGridSkeleton count={6} /></div>
          <aside className="mt-4 hidden w-[266px] shrink-0 animate-pulse flex-col gap-4 lg:flex">
            <div className="h-36 rounded-xl border border-[#efefef] bg-white" />
            <div className="h-48 rounded-xl border border-[#efefef] bg-white" />
          </aside>
        </div>
      </div>
    </SignedInRouteLoading>
  );
}
