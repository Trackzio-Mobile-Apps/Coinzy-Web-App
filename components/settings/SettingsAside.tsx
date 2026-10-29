import Image from "next/image";
import { AppQrCode } from "@/components/ui/AppQrCode";
import Link from "next/link";
import { PremiumUpgradeButton } from "@/components/premium/PremiumUpgradeButton";
import { HOME_OTHER_APPS } from "@/lib/home";

/** Right rail on Settings — Figma `1368:256937` (Premium + other apps + QR). */
export function SettingsAside({ premium }: { premium: boolean }) {
  return (
    <aside className="hidden w-[268px] shrink-0 flex-col gap-4 xl:flex">
      {!premium && (
        <div
          className="relative flex flex-col gap-6 overflow-hidden min-h-[175px] rounded-xl border-[0.5px] border-border-neutral p-4"
          style={{
            backgroundImage:
              "linear-gradient(282.5deg, rgb(106, 101, 237) 10%, rgb(229, 74, 159) 99%), linear-gradient(#fff, #fff)",
          }}
        >
          <span aria-hidden="true" className="pointer-events-none absolute right-12 top-[85px] text-2xl text-white/70">✦</span>
          <span aria-hidden="true" className="pointer-events-none absolute right-4 top-[104px] text-sm text-white/40">✦</span>
          <span aria-hidden="true" className="pointer-events-none absolute right-[68px] top-[122px] text-lg text-white/40">✦</span>
          <div className="flex flex-col gap-3">
            <p className="text-lg font-bold leading-[1.2] text-white">👑  Premium Access</p>
            <p className="text-sm leading-[1.5] text-[#f2f2f3]">
              Unlock <span className="text-base font-bold text-white">200,000+</span> Coins from Around the World
            </p>
          </div>
          <PremiumUpgradeButton className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#34228f]">
            Go Premium
            <Image src="/assets/home/icon-arrow-right.svg" alt="" width={16} height={12} className="opacity-80" />
          </PremiumUpgradeButton>
        </div>
      )}

      <div className="min-h-[289.5px] rounded-2xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
        <p className="text-sm font-medium leading-5 text-ink">Our other apps</p>
        <ul className="mt-4 flex flex-col">
          {HOME_OTHER_APPS.map((app) => (
            <li key={app.name} className="flex items-center gap-2 border-b-[0.5px] border-border-neutral py-3 first:pt-0">
              <Image src={app.icon} alt="" width={38} height={38} className="size-[38px] rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-5 text-ink">{app.name}</p>
                <p className="mt-1 truncate text-xs leading-4 text-[#9e9ea1]">{app.description}</p>
              </div>
              <a
                href={app.href}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg border border-[#e5e5e5] px-2 py-1 text-xs font-medium text-ink hover:bg-black/[0.03]"
              >
                Try free
              </a>
            </li>
          ))}
        </ul>
        <Link href="/other-apps" className="mt-3 flex min-h-7 items-center justify-center gap-2 text-xs font-medium text-ink hover:underline">
          +7 more apps <Image src="/assets/catalogue/icon-chevron-right.svg" alt="" width={14} height={14} />
        </Link>
      </div>

      <div className="min-h-[257px] rounded-2xl border-[0.5px] border-border-neutral bg-white px-4 py-3">
        <p className="text-sm font-medium leading-5 text-ink">Scan to download Coinzy AI</p>
        <p className="mt-3 text-xs leading-4 text-muted">
          Identify coins instantly and sync your collection across devices.
        </p>
        <div className="mt-3 flex justify-center">
          <AppQrCode size={154} className="size-[154px]" />
        </div>
      </div>
    </aside>
  );
}
