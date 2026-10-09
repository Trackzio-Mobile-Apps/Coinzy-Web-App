import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant Settings chrome while profile (`auth/me`) loads. */
export default function Loading() {
  return (
    <SignedInRouteLoading
      active="settings"
      mainClassName="flex min-w-0 flex-1 gap-6 overflow-auto px-6 py-6 lg:px-8"
    >
      <div className="min-w-0 flex-1 animate-pulse space-y-4">
        <div className="h-7 w-28 rounded bg-black/[0.06]" />
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-16 rounded-[12px] border border-[#e5e7eb] bg-white" />
        ))}
      </div>
      <div className="hidden w-[280px] shrink-0 animate-pulse space-y-3 lg:block">
        <div className="h-40 rounded-[12px] border border-[#e5e7eb] bg-white" />
        <div className="h-24 rounded-[12px] border border-[#e5e7eb] bg-white" />
      </div>
    </SignedInRouteLoading>
  );
}
