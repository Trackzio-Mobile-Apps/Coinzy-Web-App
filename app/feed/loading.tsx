import { SignedInRouteLoading } from "@/components/home/SignedInRouteLoading";

/** Instant Feed chrome while Firestore posts hydrate. */
export default function Loading() {
  return (
    <SignedInRouteLoading active="feed" title="Feed">
      <div className="mx-auto max-w-[680px] animate-pulse space-y-4">
        <div className="h-14 rounded-[12px] border border-[#e5e7eb] bg-white" />
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-40 rounded-[12px] border border-[#e5e7eb] bg-white" />
        ))}
      </div>
    </SignedInRouteLoading>
  );
}