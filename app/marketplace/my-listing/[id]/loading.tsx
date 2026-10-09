import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";

export default function SelfListingLoading() {
  return (
    <div className="flex h-svh overflow-hidden bg-[#f7f7f8]">
      <div className="w-[254px] shrink-0 border-r border-[#e5e7eb] bg-white" />
      <div className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
        <div className="mx-auto w-full max-w-[1122px]">
          <CoinDetailsSkeleton sidebar="seller" />
        </div>
      </div>
    </div>
  );
}
