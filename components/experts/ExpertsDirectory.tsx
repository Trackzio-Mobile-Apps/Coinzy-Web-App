import Link from "next/link";
import { ExpertCard, FIGMA_EXPERTS, toExpertCard, type ExpertCardData } from "@/components/experts/ExpertCard";
import { ExpertsAside } from "@/components/experts/ExpertsAside";
import type { ExpertsDirectoryItem } from "@/lib/experts/types";

export function ExpertsDirectory({
  experts,
  creditBalance,
  preview = false,
}: {
  experts: ExpertsDirectoryItem[];
  creditBalance: number;
  preview?: boolean;
}) {
  const back = preview ? "/evaluation-hub-with-requests" : "/experts";
  const base: ExpertCardData[] = preview ? [...FIGMA_EXPERTS] : experts.map(toExpertCard);
  const cards = preview ? [...base, ...base] : base;
  return (
    <div className="mx-auto w-full max-w-[1184px] px-4 py-4 sm:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-4 text-sm">
        <Link href={back} aria-label="Back to expert analysis" className="flex size-8 items-center justify-center rounded border border-[#c8c8ca] bg-white text-xl text-[#606062]">‹</Link>
        <Link href={back} className="text-base text-primary-500 underline">Expert analysis</Link>
        <span className="text-xl text-[#606062]">›</span>
        <span className="text-lg font-medium text-ink">Meet our Experts</span>
      </nav>
      <div className="flex flex-col items-start gap-4 lg:flex-row">
        <main className="w-full min-w-0 flex-1">
          {cards.length ? (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.map((e, i) => <ExpertCard key={`${e.name}-${i}`} expert={e} />)}
            </div>
          ) : (
            <p className="rounded-xl border border-[#dfdfe0] bg-white p-5 text-sm text-[#606062]">No experts are available right now.</p>
          )}
        </main>
        <ExpertsAside creditBalance={creditBalance} creditTotal={preview ? 10 : undefined} />
      </div>
    </div>
  );
}
