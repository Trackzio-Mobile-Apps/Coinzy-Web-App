export default function MyListingsLoading() {
  return (
    <div className="flex h-svh overflow-hidden bg-[#faf7f5]">
      <div className="hidden w-[254px] shrink-0 border-r border-[#e5e7eb] bg-white sm:block" />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="h-[76px] border-b border-[#e5e7eb] bg-white" />
        <div className="flex min-h-0 flex-1">
          <div className="min-w-0 flex-1 px-8 py-4">
            <div className="h-8 w-64 animate-pulse rounded bg-[#e5e7eb]" />
            <div className="mt-4 h-[75px] animate-pulse rounded-[16px] bg-[#e5e7eb]" />
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-[280px] animate-pulse rounded-[12px] bg-[#e5e7eb]" />
              ))}
            </div>
          </div>
          <div className="hidden w-[266px] shrink-0 border-l border-[#e5e7eb] bg-white lg:block" />
        </div>
      </div>
    </div>
  );
}
