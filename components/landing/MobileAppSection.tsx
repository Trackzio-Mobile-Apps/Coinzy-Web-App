import Image from "next/image";
import { AppStoreButtons } from "@/components/ui/AppStoreButtons";
import { SectionShell } from "@/components/ui/SectionShell";
import { MOBILE_STATS } from "@/lib/constants";

const A = "/assets/landing-page/07-mobile-app";

/** Phones + floating info cards, absolutely placed inside Figma's 399×348 frame. */
function PhoneMockups() {
  return (
    <div className="relative h-[348px] w-[399px] shrink-0">
      <div className="pointer-events-none absolute left-[-64.67px] top-[-116.66px] flex h-[532.55px] w-[551.87px] items-center justify-center">
        <Image
          src={`${A}/decorative-ellipse.svg`}
          alt=""
          width={469}
          height={443}
          className="h-[443.48px] w-[468.7px] max-w-none rotate-[12.21deg]"
        />
      </div>
      <Image
        src={`${A}/phone-mockup-camera.png`}
        alt="Coinzy camera identify screen"
        width={163}
        height={325}
        className="absolute left-[46px] top-[64.84px] h-[325px] w-[163px] object-cover"
      />
      <div className="absolute left-[223.28px] top-[21.84px]">
        <Image
          src={`${A}/phone-mockup-details.png`}
          alt="Coinzy coin details screen"
          width={184}
          height={366}
          className="h-[366.41px] w-[184.48px] max-w-none object-cover"
        />
        <Image
          src={`${A}/card-rarity-info.png`}
          alt=""
          width={100}
          height={62}
          className="absolute left-[145.11px] top-[141.31px] h-[62.49px] w-[99.82px] max-w-none rounded-[var(--radius-inner)] border border-[#f4f6f7] object-cover shadow-[-4px_8px_20px_10px_rgba(0,0,0,0.2)]"
        />
        <Image
          src={`${A}/card-historical-data.png`}
          alt=""
          width={105}
          height={88}
          className="absolute left-[99.66px] top-[215.16px] h-[88.05px] w-[104.86px] max-w-none rounded-[var(--radius-inner)] border border-[#f4f6f7] object-cover shadow-[-4px_18px_30px_12px_rgba(42,42,42,0.2)]"
        />
      </div>
    </div>
  );
}

export function MobileAppSection() {
  return (
    <SectionShell className="bg-cream">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-20">
        <div
          className="overflow-hidden rounded-[var(--radius-card)]"
          style={{
            backgroundImage:
              "linear-gradient(147.72deg, #3c302e 25.02%, #4a3031 64.25%)",
          }}
        >
          <div className="flex flex-col items-center gap-[60px] px-6 lg:flex-row lg:items-start lg:px-[60px]">
            <div className="hidden sm:block">
              <PhoneMockups />
            </div>
            <div className="flex min-w-[280px] flex-1 flex-col justify-center gap-6 self-stretch p-8 lg:p-14">
              <div className="space-y-2">
                <p className="text-xs font-light leading-4 text-gold">MOBILE APP</p>
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold leading-8 text-white">
                    Coinzy on the go
                  </h2>
                  <p className="text-sm leading-5 text-[#ddd2cc]">
                    Identify coins using your camera. Your collection syncs
                    across devices.
                  </p>
                </div>
              </div>
              <AppStoreButtons />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 overflow-hidden rounded-2xl bg-cream p-px text-center md:grid-cols-4">
          {MOBILE_STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex h-[107px] min-w-[112px] flex-col items-center justify-between px-8 py-5 ${
                i < MOBILE_STATS.length - 1 ? "md:border-r md:border-border" : ""
              }`}
            >
              <p className="whitespace-nowrap text-2xl font-semibold leading-8 text-primary-500">
                {stat.value}
              </p>
              <p className="whitespace-nowrap text-sm font-light leading-5 text-muted-light">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
