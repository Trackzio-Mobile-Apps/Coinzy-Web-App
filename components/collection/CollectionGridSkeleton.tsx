/** Placeholder cards while collection coins / overview cards load. */
export function CollectionGridSkeleton({
  count = 8,
  columns = "grid-cols-2 sm:grid-cols-2",
}: {
  count?: number;
  columns?: string;
}) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading collection"
      className={`mt-4 grid animate-pulse gap-4 ${columns}`}
    >
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-[#efefef] bg-white">
          <div className="aspect-[16/10] bg-[#f0f0f1]" />
          <div className="space-y-2 p-3">
            <div className="h-4 w-3/4 rounded bg-black/[0.06]" />
            <div className="h-3 w-1/3 rounded bg-black/[0.05]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CollectionCoinTileSkeleton({ count = 16 }: { count?: number }) {
  return (
    <ul
      aria-busy="true"
      aria-label="Loading coins"
      className="mt-3 grid animate-pulse grid-cols-2 gap-3 lg:grid-cols-4"
    >
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-xl border border-[#efefef] bg-white">
          <div className="aspect-square bg-[#f7f7f8]" />
          <div className="space-y-2 px-3 py-3">
            <div className="h-3.5 w-full rounded bg-black/[0.06]" />
            <div className="h-3.5 w-2/3 rounded bg-black/[0.05]" />
          </div>
        </li>
      ))}
    </ul>
  );
}
