import Image from "next/image";
import { SectionShell } from "@/components/ui/SectionShell";
import { IDENTIFY_RESULT, RECENT_SCANS } from "@/lib/constants";

function OutlineAction({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="rounded-[var(--radius-button)] border border-primary-500 bg-white px-4 py-2 text-sm font-medium leading-5 text-primary-500 transition-colors hover:bg-primary-50"
    >
      {children}
    </button>
  );
}

function ResultStat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-light leading-4 text-outline-bg">{label}</p>
      <p className={`whitespace-nowrap text-sm leading-5 ${valueClassName}`}>{value}</p>
    </div>
  );
}

export function IdentifyDemoSection() {
  return (
    <SectionShell id="identify" className="bg-cream" innerClassName="lg:!py-[125px]">
      <div className="flex flex-col items-stretch justify-between gap-12 lg:flex-row lg:items-center">
        <div className="max-w-[468px] space-y-5">
          <div className="space-y-3">
            {/* Figma: one text box, "normal" line height of the 60px run = 78px per line. */}
            <h2>
              <span className="block text-[48px] font-light leading-[78px] text-ink">
                Know what your coin
              </span>
              <span className="block text-[60px] font-semibold leading-[78px] text-primary-500">
                is worth.
              </span>
            </h2>
            <p className="font-jakarta text-base leading-[1.5] text-muted-body">
              Upload a photo or take a picture — the most accurate way to
              identify and value your coin. Or get it evaluated by a human
              expert
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <OutlineAction>AI Evaluation</OutlineAction>
            <OutlineAction>Human Expert Evaluation</OutlineAction>
          </div>
        </div>

        <div className="w-full max-w-[532px] shrink-0 space-y-8 rounded-[var(--radius-card)] border border-white/[0.08] bg-primary-800 px-[17px] pb-[41px] pt-[25px] drop-shadow-[10px_14px_12px_rgba(103,54,56,0.2)]">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="font-jakarta text-[11px] font-semibold uppercase leading-[16.5px] tracking-[1.32px] text-outline-bg">
                Identification result
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-3xl border border-primary-500 bg-gold-light px-[11px] py-[5px] font-jakarta text-[11px] font-semibold leading-[16.5px] text-primary-800">
                <Image
                  src="/assets/landing-page/03-identify-demo/icon-match.svg"
                  alt=""
                  width={11}
                  height={11}
                />
                {IDENTIFY_RESULT.match}
              </span>
            </div>

            <div className="space-y-6 rounded-[var(--radius-inner)] bg-primary-900 p-4">
              <div className="flex items-center gap-5">
                <Image
                  src={IDENTIFY_RESULT.image}
                  alt={IDENTIFY_RESULT.title}
                  width={96}
                  height={96}
                  className="size-24 shrink-0 object-cover"
                />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-lg font-medium leading-7 text-outline-bg">
                    {IDENTIFY_RESULT.title}
                  </p>
                  <p className="flex flex-wrap gap-1 text-xs font-light leading-4 text-outline-bg">
                    {IDENTIFY_RESULT.meta.map((item, i) => (
                      <span key={item} className="inline-flex items-center gap-1">
                        {i > 0 && <span aria-hidden>•</span>}
                        {item}
                      </span>
                    ))}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {IDENTIFY_RESULT.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-white/[0.06] px-2 py-[3px] text-xs leading-4 text-outline-bg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex rounded-lg border-[0.5px] border-white/[0.55] bg-primary-900 p-[16.5px]">
                <div className="pr-8">
                  <div className="h-full border-r border-white/[0.08] pr-[17px]">
                    <ResultStat
                      label="Estimated value"
                      value={IDENTIFY_RESULT.estimatedValue}
                      valueClassName="font-bold text-gold-light"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-[175.672_0_0] pr-8">
                  <div className="h-full border-r border-white/[0.08] pr-[17px]">
                    <ResultStat
                      label="Rarity"
                      value={IDENTIFY_RESULT.rarity}
                      valueClassName="font-medium text-outline-bg"
                    />
                  </div>
                </div>
                <div className="min-w-0 flex-[142.664_0_0] pr-8">
                  <ResultStat
                    label="Condition"
                    value={IDENTIFY_RESULT.condition}
                    valueClassName="font-medium text-outline-bg"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-jakarta text-[11px] font-semibold uppercase leading-[16.5px] tracking-[1.1px] text-outline-bg">
              Recent scans
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {RECENT_SCANS.map((scan) => (
                <div
                  key={scan.name}
                  className="flex flex-col gap-[15px] rounded-[var(--radius-inner)] border-[0.5px] border-white/[0.45] bg-black/[0.04] px-[12.5px] py-[8.5px]"
                >
                  <Image
                    src={scan.image}
                    alt={scan.name}
                    width={36}
                    height={36}
                    className="size-9 rounded-full object-cover"
                  />
                  <p className="flex-1 text-xs leading-4 text-outline-bg">{scan.name}</p>
                  <p className="text-xs font-semibold leading-4 text-outline-bg">
                    {scan.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
