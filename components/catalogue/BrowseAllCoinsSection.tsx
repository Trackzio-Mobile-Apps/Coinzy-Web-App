import Image from "next/image";
import Link from "next/link";
import { CoinGrid, Pagination, loadCoins } from "@/components/catalogue/CoinGrid";
import { SectionShell } from "@/components/ui/SectionShell";

const PAGE_SIZE = 15; // Figma: 3 rows × 5 cards

export async function BrowseAllCoinsSection({ page = 1 }: { page?: number }) {
  const { coins, totalPages } = await loadCoins({ page, pageSize: PAGE_SIZE });
  const current = Math.min(page, totalPages);
  return (
    <SectionShell id="browse-all" className="bg-cream">
      <div className="flex flex-col items-center gap-16">
        <div className="w-full space-y-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex-1 space-y-3 font-jakarta">
              <p className="text-xs uppercase leading-[1.5] text-primary-500">Browse catalogue</p>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold leading-[1.2] text-ink">Browse all coins</h2>
                <p className="text-sm leading-[1.5] text-muted">
                  Explore popular collecting categories, from ancient Roman to rare American.
                </p>
              </div>
            </div>
            <Link
              href="/catalogue/all"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium leading-5 text-primary-500 hover:text-primary-700"
            >
              View all
              <Image src="/assets/landing-page/icons/shared/arrow-right.svg" alt="" width={16} height={16} />
            </Link>
          </div>
          <CoinGrid coins={coins} from="catalogue" fromPage={current} />
        </div>
        <Pagination page={current} totalPages={totalPages} href={(n) => `?page=${n}#browse-all`} />
      </div>
    </SectionShell>
  );
}
