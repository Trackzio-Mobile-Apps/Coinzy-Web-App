import Image from "next/image";
import { LogoMark } from "@/components/landing/TopNav";
import { sidebarNav, type SidebarActive } from "@/lib/sidebarNav";

const A = "/assets/home";

const ICONS: Record<string, string> = {
  home: `${A}/icon-home.svg`,
  identify: `${A}/icon-identify.svg`,
  expert: `${A}/icon-expert.svg`,
  marketplace: `${A}/icon-marketplace.svg`,
  collection: `${A}/icon-collection.svg`,
  feed: `${A}/icon-feed.svg`,
  catalogue: `${A}/icon-catalogue.svg`,
  settings: `${A}/icon-settings-nav.svg`,
};

/**
 * Sync loading chrome for signed-in routes — no cookies/API awaits so Next can
 * paint the title on navigate immediately; the real page replaces this shortly after.
 */
export function SignedInRouteLoading({
  active,
  title,
  children,
  mainClassName = "min-w-0 flex-1 overflow-y-auto px-8 py-6",
}: {
  active: SidebarActive;
  /** Page title shown immediately; omit when children include their own heading. */
  title?: string;
  children?: React.ReactNode;
  mainClassName?: string;
}) {
  const items = sidebarNav(active);

  return (
    <div
      className="flex h-svh overflow-hidden bg-white"
      aria-busy="true"
      aria-label={title ? `Loading ${title}` : "Loading"}
    >
      <aside className="flex h-full w-[254px] shrink-0 flex-col border-r border-[#e5e7eb] bg-white">
        <div className="flex h-[76px] items-center gap-2 border-b border-[#e5e7eb] px-4">
          <LogoMark />
          <div className="min-w-0">
            <p className="truncate text-lg font-medium leading-7 text-ink">Coinzy AI</p>
            <p className="truncate text-xs leading-4 text-muted">AI Coin Identifier</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-2 py-4" aria-label="App">
          {items.map((item) => {
            const isActive = Boolean(item.active);
            return (
              <div
                key={item.label}
                className={`flex h-9 items-center gap-2 rounded-[10px] px-3 text-sm font-medium leading-5 ${
                  isActive ? "bg-primary-50 text-primary-500" : "text-ink opacity-70"
                }`}
              >
                <Image src={ICONS[item.icon] ?? ICONS.home} alt="" width={16} height={16} />
                <span className="flex-1 truncate">{item.label}</span>
              </div>
            );
          })}
        </nav>
      </aside>
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <header className="flex h-[76px] shrink-0 items-center border-b border-[#e5e7eb] bg-white px-8">
          <div className="h-8 w-40 animate-pulse rounded bg-black/[0.06]" />
        </header>
        <main className={mainClassName}>
          {title ? <h2 className="mb-6 text-[28px] font-semibold leading-9 text-ink">{title}</h2> : null}
          {children}
        </main>
      </div>
    </div>
  );
}
