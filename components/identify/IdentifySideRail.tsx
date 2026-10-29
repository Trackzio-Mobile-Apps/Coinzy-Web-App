import Image from "next/image";
import { AppQrCode } from "@/components/ui/AppQrCode";
import Link from "next/link";
import { IdentifyFreePlanCard } from "@/components/identify/IdentifyFreePlanCard";
import { HOME_OTHER_APPS } from "@/lib/home";

const A = "/assets/home";

export function IdentifySideRail({
  onScanApp,
  premium = false,
}: {
  onScanApp?: () => void;
  premium?: boolean;
}) {
  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 lg:w-[268px]">
      <IdentifyFreePlanCard hidden={premium} />

      <button
        type="button"
        onClick={onScanApp}
        className="flex flex-col gap-3 rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-4 py-3 text-left"
      >
        <p className="text-sm font-medium leading-5 text-ink">Scan to download Coinzy AI</p>
        <p className="text-xs leading-4 text-[#606062]">Identify coins instantly and sync your collection.</p>
        <div className="flex h-[156px] w-full items-center justify-center">
          <AppQrCode size={142} className="object-contain" />
        </div>
      </button>

      <div className="rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-4 py-3">
        <p className="text-sm font-medium leading-5 text-ink">Our other apps</p>
        <ul className="mt-4 divide-y divide-[#ededed]">
          {HOME_OTHER_APPS.map((app, index) => (
            <li key={app.name} className="flex items-center gap-2 py-3 first:pt-0">
              <Image src={app.icon} alt="" width={38} height={38} className="shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-5 text-ink">{app.name}</p>
                <p className="mt-1 truncate text-xs leading-4 text-[#87878a]">{["Identify banknotes", "Habits & Tasks", "Identify antiques"][index]}</p>
              </div>
              <a href={app.href} target="_blank" rel="noopener noreferrer" aria-label={`Try ${app.name} free`} className="shrink-0 rounded-lg border border-[#dfdfe0] bg-white px-2 py-1 text-xs font-medium leading-4 text-ink">
                Try free
              </a>
            </li>
          ))}
        </ul>
        <Link href="/other-apps" className="mt-1 flex items-center justify-center gap-1 border-t border-[#ededed] pt-4 text-xs font-medium leading-4 text-ink">
          +7 more apps
          <Image src={`${A}/icon-chevron.svg`} alt="" width={16} height={16} />
        </Link>
      </div>
    </aside>
  );
}
