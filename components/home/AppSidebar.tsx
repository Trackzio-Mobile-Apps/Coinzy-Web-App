import Image from "next/image";
import Link from "next/link";
import { LogoMark } from "@/components/landing/TopNav";
import type { SessionUser } from "@/lib/auth/session";
import { HOME_NAV } from "@/lib/home";

const A = "/assets/home";

const ICONS: Record<(typeof HOME_NAV)[number]["icon"], string> = {
  home: `${A}/icon-home.svg`,
  identify: `${A}/icon-identify.svg`,
  expert: `${A}/icon-expert.svg`,
  marketplace: `${A}/icon-marketplace.svg`,
  collection: `${A}/icon-collection.svg`,
  feed: `${A}/icon-feed.svg`,
  catalogue: `${A}/icon-catalogue.svg`,
  settings: `${A}/icon-settings-nav.svg`,
};

export function AppSidebar({ user }: { user: SessionUser }) {
  return (
    <aside className="flex h-full w-[254px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
      <div className="flex h-[76px] items-center gap-2 border-b border-[#e5e7eb] px-4">
        <LogoMark />
        <div className="min-w-0">
          <p className="truncate text-lg font-medium leading-7 text-ink">Coinzy AI</p>
          <p className="truncate text-xs leading-4 text-muted">AI Coin Identifier</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-2 py-4" aria-label="App">
        {HOME_NAV.map((item) => {
          const active = "active" in item && item.active;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium leading-5 ${
                active ? "bg-primary-50 text-primary-500" : "text-ink hover:bg-black/[0.03]"
              }`}
            >
              <Image
                src={ICONS[item.icon]}
                alt=""
                width={16}
                height={16}
                className={active ? "opacity-100" : "opacity-70"}
                style={active ? { filter: "invert(27%) sepia(24%) saturate(1200%) hue-rotate(314deg)" } : undefined}
              />
              <span className="flex-1 truncate">{item.label}</span>
              {"chevron" in item && item.chevron && (
                <Image src={`${A}/icon-chevron.svg`} alt="" width={16} height={16} className="opacity-40" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#e5e7eb] p-4">
        <div className="flex items-center gap-3 rounded-xl px-1 py-1">
          <div className="relative size-8 shrink-0">
            <Image src={`${A}/avatar.png`} alt="" width={32} height={32} className="size-8 rounded-full object-cover" />
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full border-2 border-white bg-[#268823]" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-5 text-ink">{user.name}</p>
            <p className="truncate text-xs leading-4 text-muted">{user.email || (user.isGuest ? "Guest session" : "")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
