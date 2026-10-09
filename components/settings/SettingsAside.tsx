import Image from "next/image";
import Link from "next/link";
import { HOME_OTHER_APPS } from "@/lib/home";

/** Right rail on Settings — Figma `1368:256937` (Premium + other apps + QR). */
export function SettingsAside({ premium }: { premium: boolean }) {
  return (
    <aside className="hidden w-[268px] shrink-0 flex-col gap-4 xl:flex">
      {!premium && (
        <div
          className="relative flex flex-col gap-6 overflow-hidden rounded-xl border border-[#dfdfe0] p-[16.5px]"
          style={{
            backgroundImage:
              "linear-gradient(-71deg, rgb(106, 101, 237) 10%, rgb(229, 74, 159) 99%), linear-gradient(#fff, #fff)",
          }}
        >
          <div className="flex flex-col gap-3">
            <p className="text-lg font-bold leading-[1.2] text-white">👑  Premium Access</p>
            <p className="text-sm leading-[1.5] text-[#f2f2f3]">
              Unlock <span className="text-base font-bold text-white">200,000+</span> Coins from Around the World
            </p>
          </div>
          <Link
            href="/home#premium"
            className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-[#34228f]"
            title="Coming soon"
          >
            Go Premium
            <Image src="/assets/home/icon-arrow-right.svg" alt="" width={16} height={12} className="opacity-80" />
          </Link>
        </div>
      )}

      <div className="rounded-xl border border-[#efefef] bg-white p-4">
        <p className="text-sm font-medium leading-5 text-ink">Our other apps</p>
        <ul className="mt-3 flex flex-col gap-3">
          {HOME_OTHER_APPS.map((app) => (
            <li key={app.name} className="flex items-center gap-2">
              <Image src={app.icon} alt="" width={36} height={36} className="size-9 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium leading-5 text-ink">{app.name}</p>
                <p className="truncate text-xs leading-4 text-muted">{app.description}</p>
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
        <Link href="/other-apps" className="mt-3 inline-block text-sm font-medium text-primary-500 hover:underline">
          +7 more apps ›
        </Link>
      </div>

      <div className="rounded-xl border border-[#efefef] bg-white p-4">
        <p className="text-sm font-medium leading-5 text-ink">Scan to download Coinzy AI</p>
        <p className="mt-1 text-xs leading-4 text-muted">
          Identify coins instantly and sync your collection across devices.
        </p>
        <div className="mt-3 flex justify-center">
          <Image
            src="/assets/settings/qr-download.png"
            alt="QR code to download Coinzy AI"
            width={160}
            height={160}
            className="size-40 rounded-lg"
          />
        </div>
      </div>
    </aside>
  );
}
