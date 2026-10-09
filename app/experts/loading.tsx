import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

export default function Loading() {
  return (
    <SignedInRouteLoading active="expert" title="Expert evaluation">
      <div className="animate-pulse space-y-4">
        <div className="h-24 rounded-[12px] border border-[#e5e7eb] bg-white" />
        <div className="h-40 rounded-[12px] border border-[#e5e7eb] bg-white" />
        <div className="h-40 rounded-[12px] border border-[#e5e7eb] bg-white" />
      </div>
    </SignedInRouteLoading>
  );
}