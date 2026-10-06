import Image from "next/image";
import Link from "next/link";
import { ParchmentBackground } from "@/components/ui/ParchmentBackground";
import { SectionShell } from "@/components/ui/SectionShell";
import { PLAY_STORE_URL } from "@/lib/constants";

const ICONS = "/assets/landing-page/02-hero";

export function HeroSection() {
  return (
    <SectionShell
      className="bg-white"
      innerClassName="flex min-h-[810px] items-center"
      background={
        <>
          <ParchmentBackground variant="hero" />
          {/* Tracks the centre of the ring baked into the cover-scaled background (2752×1536 cover-fit in a left-pinned, 100%+16px × 813px box, like Figma's 1456px rect). */}
          <Image
            src={`${ICONS}/hero-coin.png`}
            alt="Gold coin with a crab emblem"
            width={200}
            height={200}
            priority
            className="absolute left-[max(calc(50%+231px),calc(65.316%+10.45px))] top-[min(384px,calc(406.5px-1.5456vw))] size-[max(200px,13.736vw)] max-w-none -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </>
      }
    >
      <div className="relative w-full">
        <div className="max-w-[439px] space-y-8">
          <div className="space-y-4">
            {/* Figma sets both lines in one 169px text box; offsets reproduce its baselines. */}
            <h1 className="h-[169px] pt-[39px]">
              <span className="block text-[36px] font-light leading-10 text-headline">
                One Platform for Every
              </span>
              <span className="mt-[15px] block text-[60px] font-bold leading-[69.12px] text-primary-500">
                Coin Collector
              </span>
            </h1>
            <p className="text-lg leading-7 text-muted-warm">
              Identify coins instantly, manage collections, buy and sell with
              confidence, get expert evaluations, and connect with collectors -
              all in one platform.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/auth"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[var(--radius-button)] bg-primary-500 px-4 text-sm font-medium leading-5 text-primary-50 transition-colors hover:bg-primary-700 sm:flex-[196.5_1_0%]"
            >
              <Image src={`${ICONS}/icon-computer.svg`} alt="" width={16} height={16} />
              Try Coinzy AI
            </Link>
            <Link
              href={PLAY_STORE_URL}
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-[var(--radius-button)] border border-primary-200 bg-outline-bg px-4 text-sm font-medium leading-5 text-primary-500 transition-colors hover:bg-primary-50 sm:flex-[230.5_1_0%]"
            >
              <Image src={`${ICONS}/icon-download.svg`} alt="" width={16} height={16} />
              Get the app
            </Link>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
