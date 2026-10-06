import Image from "next/image";
import Link from "next/link";
import { WEBAPP_FEATURE_BADGES } from "@/lib/constants";

const A = "/assets/marketplace";

function AiScanBadge() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-[14px] top-[2px] hidden size-[311px] items-center justify-center lg:flex"
    >
      <div className="-rotate-30 flex size-[228px] items-center justify-center">
        <div
          className="flex size-[173px] flex-col items-center justify-center gap-1.5 overflow-hidden rounded-[20px] border-b-[16px] border-l-[12px] border-[#f0cda8] px-[11px] py-[21px]"
          style={{
            backgroundImage:
              "linear-gradient(-19.12deg, rgb(1, 13, 11) 57.79%, rgb(9, 115, 97) 135.46%)",
          }}
        >
          <div className="relative h-[115px] w-[143px] shrink-0">
            <Image
              src={`${A}/webapp-badge-coin.png`}
              alt=""
              width={104}
              height={105}
              className="absolute left-[19.6px] top-[7px] h-[105px] w-[104px] object-cover"
            />
            <Image
              src={`${A}/webapp-badge-frame.svg`}
              alt=""
              width={124}
              height={122}
              className="absolute left-[9.7px] top-[-1.5px] h-[122px] w-[124px]"
            />
            <Image
              src={`${A}/webapp-badge-line.svg`}
              alt=""
              width={147}
              height={6}
              className="absolute left-[-2.1px] top-[61.6px] h-[6px] w-[147px]"
            />
            <Image
              src={`${A}/webapp-badge-scanline.png`}
              alt=""
              width={143}
              height={4}
              className="absolute left-0 top-[62.4px] h-[3.3px] w-[143px] mix-blend-overlay"
            />
            <span className="absolute left-[93.5px] top-[87px] flex h-[27.5px] w-11 items-center justify-center rounded bg-[#ee8418] text-[17px] font-semibold leading-none text-[#0c2525] shadow-[0.5px_0.5px_6px_0px_rgba(238,132,24,0.45)]">
              AI
            </span>
          </div>
          <span className="rounded-lg bg-gradient-to-r from-[#081915] to-[#183d34] px-2 py-0.5 text-xs font-semibold leading-none text-[#79ddb0]">
            $ 5400
          </span>
        </div>
      </div>
    </div>
  );
}

export function WebappCTASection() {
  return (
    <section className="relative overflow-hidden bg-[#f5f5f5] py-16">
      <Image
        src="/assets/landing-page/08-cta/background-texture.png"
        alt=""
        fill
        className="object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[354px] overflow-hidden opacity-70">
        <div className="absolute inset-x-0 top-[-140%] h-[244.24%]">
          <Image
            src={`${A}/webapp-cta-dots.png`}
            alt=""
            fill
            className="object-cover"
          />
        </div>
      </div>
      <AiScanBadge />

      <div className="relative mx-auto flex max-w-[1280px] flex-col items-center gap-10 px-8 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="space-y-3 text-ink">
            <h2 className="text-3xl font-semibold leading-10 sm:text-4xl">
              Try our Coinzy AI Webapp
            </h2>
            <p className="text-lg leading-7">
              Want to check your coins value? Get it evaluated first, then list
              to verified buyers.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {WEBAPP_FEATURE_BADGES.map((badge) => (
              <span
                key={badge}
                className="flex h-[22px] items-center rounded-[var(--radius-badge)] bg-[rgba(64,28,30,0.08)] px-2 text-xs font-medium leading-4 text-[#171717]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
        <Link
          href="/auth"
          className="relative flex h-10 items-center justify-center overflow-hidden rounded-[var(--radius-button)] border border-white bg-[#171717] px-6 text-base font-medium leading-6 text-[#fafafa] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.16),0px_9px_21.7px_3px_rgba(23,23,23,0.6),0px_0px_0px_2.5px_#171717]"
        >
          Try Coinzy webapp
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_-1px_0px_1px_rgba(255,255,255,0.18),inset_0px_0px_4.3px_3px_rgba(0,0,0,0.11),inset_0px_1px_8px_0px_rgba(255,255,255,0.07)]" />
        </Link>
      </div>
    </section>
  );
}
