import { TopNav } from "@/components/landing/TopNav";

/** Instant skeleton while a view-all page fetches from the catalogue API (mirrors the page layout). */
export default function Loading() {
  return (
    <>
      <TopNav />
      <main className="bg-cream" aria-busy="true" aria-label="Loading coins">
        <section className="mx-auto w-full max-w-[1440px] animate-pulse px-6 pb-5 pt-20 lg:px-[160px]">
          <div className="space-y-10">
            <div className="flex items-center gap-5">
              <div className="size-8 rounded border-[0.5px] border-[#c2c2c4] bg-white" />
              <div className="h-6 w-56 rounded bg-black/[0.06]" />
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-6 w-48 rounded bg-black/[0.06]" />
                <div className="h-4 w-72 rounded bg-black/[0.05]" />
              </div>
              <div className="flex gap-1.5">
                {[42, 125, 106, 93, 94].map((w) => (
                  <div key={w} className="h-6 rounded-full border border-[#e5e5e5] bg-white" style={{ width: w }} />
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-[repeat(5,211px)]">
              {Array.from({ length: 20 }, (_, i) => (
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
          </div>
        </section>
      </main>
    </>
  );
}
