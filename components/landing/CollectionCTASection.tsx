import Image from "next/image";
import { ParchmentBackground } from "@/components/ui/ParchmentBackground";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SectionShell } from "@/components/ui/SectionShell";
import { COLLECTION_COINS } from "@/lib/constants";

export function CollectionCTASection() {
  return (
    <SectionShell
      id="collection"
      className="bg-cream"
      background={<ParchmentBackground variant="cta" />}
    >
      <div className="relative space-y-8">
        <SectionHeader
          label="Collection"
          title="Keep track of what you own"
          description="Track coins you own, want, or want to watch. Value updates as the market moves."
          actionLabel="Start your collection"
          actionHref="#collection"
        />

        <div className="space-y-6 rounded-[var(--radius-card)] border border-[#e8ddd5] bg-surface p-[25px]">
          <div className="flex items-center gap-2">
            <Image
              src="/assets/landing-page/08-cta/icon-status-dot.svg"
              alt=""
              width={10}
              height={10}
            />
            <span className="text-sm font-semibold leading-5 text-success">
              Example collection
            </span>
          </div>

          <div className="grid grid-cols-2 justify-items-center gap-6 sm:grid-cols-3 lg:flex lg:items-start lg:justify-between">
            {COLLECTION_COINS.map((coin) => (
              <div key={coin.name} className="flex w-[136px] flex-col items-center gap-6">
                <Image
                  src={coin.image}
                  alt={coin.name}
                  width={136}
                  height={136}
                  className="size-[136px] rounded-full object-contain"
                />
                <p className="text-center text-base leading-6 text-ink">{coin.name}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 border-t border-primary-500/[0.12] pt-[17px] sm:flex-row sm:items-center sm:justify-between">
            <p className="font-jakarta text-sm leading-[1.5] text-muted">
              {COLLECTION_COINS.length} coins tracked
            </p>
            <div className="flex flex-col items-end gap-0.5">
              <p className="font-jakarta text-[11px] leading-[16.5px] text-muted">
                Estimated value
              </p>
              <p className="text-2xl font-medium leading-8 text-primary-500">
                ₹ 7,57,496.32
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
