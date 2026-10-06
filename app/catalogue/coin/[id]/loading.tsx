import { TopNav } from "@/components/landing/TopNav";
import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";

/** Instant loader on client navigation (e.g. clicking a coin card) until the page shell arrives. */
export default function Loading() {
  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <section className="mx-auto w-full max-w-[1440px] px-6 pt-20 lg:px-[160px]">
          <CoinDetailsSkeleton />
        </section>
      </main>
    </>
  );
}
