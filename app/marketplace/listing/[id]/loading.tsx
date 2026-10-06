import { TopNav } from "@/components/landing/TopNav";
import { CoinDetailsSkeleton } from "@/components/catalogue/CoinDetailsSkeleton";

/** Instant loader on client navigation (e.g. clicking a listing card) until the page shell arrives. */
export default function Loading() {
  return (
    <>
      <TopNav />
      <main className="bg-cream">
        <section className="mx-auto w-full max-w-[1440px] px-6 pb-20 pt-20 lg:px-[160px] lg:pb-[184px]">
          <CoinDetailsSkeleton sidebar="seller" />
        </section>
      </main>
    </>
  );
}
