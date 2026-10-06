/** Placeholder card grid shown while a catalogue page (or a new search) is fetching. Mirrors `CoinGrid`. */
export function CoinGridSkeleton({ count = 15 }: { count?: number }) {
  return (
    <div
      aria-busy="true"
      aria-label="Loading coins"
      className="grid animate-pulse grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(5,211px)]"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="flex h-[262.5px] flex-col items-center gap-2 rounded-[var(--radius-inner)] border-[0.5px] border-border-neutral bg-white p-4"
        >
          <div className="size-[136px] rounded-full bg-coin-well" />
          <div className="h-4 w-full rounded bg-black/[0.06]" />
          <div className="h-4 w-2/3 self-start rounded bg-black/[0.05]" />
        </div>
      ))}
    </div>
  );
}
