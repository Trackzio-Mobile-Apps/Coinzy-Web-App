/**
 * Loader for the coin details page: mirrors the breadcrumb + details layout (Figma 797:35810)
 * with the same card sizes, so nothing jumps when the real data streams in.
 */
function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded bg-black/[0.06] ${className}`} />;
}

function Rows({ count, gap }: { count: number; gap: string }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={`flex items-center border-b-[0.5px] border-border-neutral py-3 last:border-b-0 ${gap}`}
        >
          <div className="w-[120px] shrink-0 sm:w-[200px]">
            <Bar className="h-4 w-28" />
          </div>
          <Bar className="h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
}

/** `sidebar="seller"` = marketplace listing page (Seller Details panel instead of value + QR cards). */
export function CoinDetailsSkeleton({ sidebar = "coin" }: { sidebar?: "coin" | "seller" }) {
  return (
    <div className="animate-pulse" role="status" aria-label="Loading coin details">
      {/* Breadcrumb */}
      <div className="flex items-center gap-5">
        <div className="size-8 shrink-0 rounded border-[0.5px] border-[#c2c2c4] bg-white" />
        <Bar className="h-6 w-64 max-w-[60vw]" />
      </div>

      <div className="mt-10 flex flex-col items-start gap-4 lg:flex-row">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-4">
          {/* Title, photos, estimated value, overview */}
          <div className="flex w-full flex-col gap-6 rounded-2xl bg-white p-4">
            <div className="flex h-8 items-center justify-between">
              <Bar className="h-7 w-56" />
              <Bar className="size-6 rounded-full" />
            </div>
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
              <div className="flex shrink-0 gap-3 sm:w-[150px] sm:flex-col">
                {[0, 1].map((i) => (
                  <div key={i} className="size-[150px] rounded-lg border border-[#efefef] bg-coin-well shadow-md" />
                ))}
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-5">
                <div className="flex h-[76px] items-center gap-5 rounded-[12px] bg-primary-50/30 px-4 sm:px-9">
                  <div className="size-8 shrink-0 rounded-full border border-[#edd2d3]" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Bar className="h-4 w-28" />
                    <Bar className="h-3.5 w-44" />
                  </div>
                  <Bar className="hidden h-7 w-24 sm:block" />
                </div>
                <div className="flex flex-col gap-4">
                  <Bar className="h-6 w-24" />
                  <Rows count={7} gap="gap-6 lg:gap-[210px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Tabs card */}
          <div className="flex w-full flex-col gap-2 rounded-2xl bg-white p-4">
            <div className="pb-2">
              <div className="flex h-[43px] items-center gap-10 border-b border-[#efefef] px-5">
                <Bar className="h-4 w-28" />
                <Bar className="h-4 w-14" />
                <Bar className="h-4 w-12" />
              </div>
            </div>
            <div className="flex flex-col gap-5">
              {[3, 6].map((count) => (
                <div key={count} className="flex flex-col gap-2">
                  <Bar className="my-1 h-5 w-28" />
                  <Rows count={count} gap="gap-6 lg:gap-[140px]" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        {sidebar === "seller" ? (
          <div className="flex w-full shrink-0 flex-col gap-5 rounded-[12px] border border-[#efefef] bg-white px-[17px] py-[13px] lg:w-[266px]">
            <Bar className="h-4 w-24" />
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2">
                <Bar className="h-3 w-16" />
                <Bar className="h-4 w-36" />
              </div>
            ))}
            <div className="h-9 rounded-[10px] bg-primary-500/20" />
          </div>
        ) : (
        <div className="flex w-full shrink-0 flex-col gap-4 sm:flex-row lg:w-[268px] lg:flex-col">
          <div className="flex w-full flex-col gap-3 rounded-lg bg-white px-4 py-3">
            <Bar className="my-1.5 h-4 w-28" />
            {Array.from({ length: 5 }, (_, i) => (
              <div key={i} className="flex justify-between py-1">
                <Bar className="h-3 w-24" />
                <Bar className="h-3 w-12" />
              </div>
            ))}
          </div>
          <div className="flex w-full flex-col gap-3 rounded-2xl bg-white px-4 py-3 lg:w-[268px]">
            <Bar className="h-4 w-44" />
            <Bar className="h-3 w-full" />
            <div className="flex justify-center px-5 py-[7px]">
              <Bar className="h-[142px] w-[154px]" />
            </div>
          </div>
        </div>
        )}
      </div>
      <span className="sr-only">Loading coin details…</span>
    </div>
  );
}
