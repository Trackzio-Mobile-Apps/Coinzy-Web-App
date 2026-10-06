import Image from "next/image";
import Link from "next/link";
import { IdentifyFreePlanCard } from "@/components/identify/IdentifyFreePlanCard";
import { HOME_OTHER_APPS } from "@/lib/home";

const A = "/assets/home";
const QR = "/assets/coin-details/qr-coinzy.png";

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
        className="rounded-2xl border border-[#e5e7eb] bg-white p-4 text-left"
      >
        <p className="text-sm font-medium leading-5 text-ink">Scan to download Coinzy AI</p>
        <p className="mt-1 text-xs leading-4 text-muted">Identify coins in real-time with your phone camera</p>
        <div className="mt-3 flex justify-center">
          <Image src={QR} alt="" width={120} height={110} className="opacity-90" />
        </div>
      </button>

      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
        <p className="text-sm font-medium leading-5 text-ink">Our other apps</p>
        <ul className="mt-3 space-y-3">
          {HOME_OTHER_APPS.slice(0, 2).map((app) => (
            <li key={app.name} className="flex items-center gap-3">
              <Image src={app.icon} alt="" width={36} height={36} className="rounded-lg" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-ink">{app.name}</p>
                <p className="truncate text-[11px] text-muted">{app.description}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/other-apps" className="mt-3 flex items-center justify-center gap-1 text-xs font-medium text-ink">
          +7 more apps
          <Image src={`${A}/icon-chevron.svg`} alt="" width={16} height={16} />
        </Link>
      </div>
    </aside>
  );
}
