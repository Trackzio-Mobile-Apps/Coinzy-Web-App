import Image from "next/image";
import Link from "next/link";
import type { SessionUser } from "@/lib/auth/session";

const A = "/assets/home";

/** Top bar shared by signed-in `/home` and `/marketplace` (Figma webapp header). */
export function MarketplaceAppHeader({ user, premium }: { user: SessionUser; premium: boolean }) {
  const greet = user.isGuest ? "Guest" : user.name.split(" ")[0] || user.name;
  return (
    <header className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#e5e7eb] bg-white px-8">
      <h1 className="text-2xl font-medium leading-8 text-ink">Hi {greet}!</h1>
      {premium ? (
        <div className="flex items-center gap-4">
          <span className="inline-flex h-6 items-center gap-1 rounded-full border border-transparent bg-[linear-gradient(#fff,#fff)_padding-box,linear-gradient(90deg,#6366f1,#ec4899)_border-box] px-2 py-0.5 text-xs font-medium leading-4 text-[#0a0a0a]">
            <Image src={`${A}/icon-crown-dark.svg`} alt="" width={12} height={12} />
            You’re Premium
          </span>
          <Link href="/home#settings" aria-label="Settings" className="flex size-6 items-center justify-center">
            <Image src={`${A}/icon-settings.svg`} alt="" width={24} height={24} />
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link
            href="/home#premium"
            className="inline-flex h-6 items-center gap-1 rounded-full bg-[linear-gradient(90deg,#6366f1,#a855f7)] px-2 py-0.5 text-xs font-medium leading-4 text-white"
          >
            <Image src={`${A}/icon-crown-16.svg`} alt="" width={12} height={12} className="brightness-0 invert" />
            Go Premium
          </Link>
          <Link href="/home#settings" aria-label="Settings" className="flex size-6 items-center justify-center">
            <Image src={`${A}/icon-settings.svg`} alt="" width={24} height={24} />
          </Link>
        </div>
      )}
    </header>
  );
}
