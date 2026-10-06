import Image from "next/image";
import Link from "next/link";
import { SectionShell } from "@/components/ui/SectionShell";
import { APPRAISERS } from "@/lib/constants";

const ICONS = "/assets/landing-page/09-expert-evaluation";

const REPORT_ROWS = [
  { label: "Value", value: "₹1,000 - ₹5,500+", accent: true },
  { label: "Rarity", value: "Uncommon", accent: false },
  { label: "Condition", value: "MS-63", accent: false },
];

export function ExpertEvaluationSection() {
  return (
    <SectionShell id="experts" className="bg-cream">
      <div className="space-y-12">
        <div className="flex flex-col gap-10 lg:h-[360px] lg:flex-row lg:items-center lg:justify-between lg:pr-[120px]">
          <div className="max-w-[488px] space-y-8">
            <div className="space-y-2">
              <p className="text-xs font-light uppercase leading-4 text-primary-500">
                Expert Evaluation
              </p>
              <div className="space-y-3">
                <h2 className="text-2xl font-medium leading-8 text-ink">
                  Not sure about the value?
                  <br />
                  Ask a human expert.
                </h2>
                <p className="max-w-[407px] text-sm leading-5 text-muted">
                  Upload your coin and get expert guidance on value, rarity, and
                  condition. Detailed reports in 24–48 hours.
                </p>
              </div>
            </div>
            <Link
              href="#experts"
              className="inline-flex items-center justify-center rounded-[var(--radius-button)] border border-primary-500 px-7 py-[7px] text-sm font-medium leading-5 text-primary-500 transition-colors hover:bg-primary-50"
            >
              Get Expert’s opinion?
            </Link>
          </div>

          <div className="w-full max-w-[320px] space-y-5 rounded-[var(--radius-card)] bg-[#faf7f4] p-6 font-jakarta drop-shadow-[0px_16px_24px_rgba(0,0,0,0.28)]">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold uppercase leading-[16.5px] tracking-[1.32px] text-primary-500">
                Sample report
              </p>
              <span className="flex items-center gap-1.5 rounded-3xl border border-primary-500 px-[11px] py-[5px] text-[11px] font-semibold leading-[16.5px] text-primary-500">
                <Image src={`${ICONS}/icon-human-verified.svg`} alt="" width={11} height={11} />
                Human verified
              </span>
            </div>

            <div className="flex items-center gap-4 rounded-2xl bg-[#f0e8e0] p-4">
              <Image
                src="/assets/landing-page/03-identify-demo/scan-one-rupee.png"
                alt="1954 One Rupee coin"
                width={48}
                height={48}
                className="size-12 shrink-0 rounded-full object-cover"
              />
              <div className="space-y-1">
                <p className="text-base font-bold leading-[1.2] text-ink">1954 One Rupee</p>
                <p className="text-xs leading-[1.5] text-muted">(Government of India)</p>
              </div>
            </div>

            <div>
              {REPORT_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`flex items-center justify-between pt-3 ${
                    i < REPORT_ROWS.length - 1
                      ? "border-b-[0.5px] border-border-neutral pb-[12.5px]"
                      : "pb-3"
                  }`}
                >
                  <span className="text-xs leading-[1.5] text-neutral-400">{row.label}</span>
                  <span
                    className={`text-sm font-bold leading-none ${
                      row.accent ? "text-primary-500" : "text-ink"
                    }`}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs leading-[1.5] text-muted">
              <Image src={`${ICONS}/icon-shield.svg`} alt="" width={12} height={12} />
              Powered by Coinzy AI
            </div>
          </div>
        </div>

        <div className="space-y-5 border-t border-border-neutral pt-0">
          <div className="space-y-3 pt-5">
            <div className="flex items-center justify-between">
              <p className="font-jakarta text-xs leading-none text-muted">
                Meet some of our appraisers
              </p>
              <Link
                href="#experts"
                className="inline-flex items-center gap-1.5 rounded-[var(--radius-button)] px-3 py-1.5 text-sm font-medium leading-5 text-primary-500 hover:text-primary-700"
              >
                View all
                <Image
                  src="/assets/landing-page/icons/shared/arrow-right.svg"
                  alt=""
                  width={16}
                  height={16}
                />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {APPRAISERS.map((appraiser) => (
                <div
                  key={appraiser.name}
                  className="flex items-start gap-5 rounded-2xl border-[0.5px] border-[#e3cfac] bg-[#f7f4f1] p-[12.5px]"
                >
                  <Image
                    src={appraiser.avatar}
                    alt={appraiser.name}
                    width={40}
                    height={40}
                    className="size-10 shrink-0 rounded-full object-cover"
                  />
                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-sm font-medium leading-5 text-ink">
                      {appraiser.name}
                    </p>
                    <p className="flex items-center gap-1 text-xs leading-4 text-muted-body">
                      {appraiser.specialties[0]}
                      <span aria-hidden className="flex h-4 w-[7px] items-center justify-center text-xl font-semibold leading-none">•</span>
                      {appraiser.specialties[1]}
                    </p>
                    <p className="text-xs leading-4 text-muted">{appraiser.experience}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
