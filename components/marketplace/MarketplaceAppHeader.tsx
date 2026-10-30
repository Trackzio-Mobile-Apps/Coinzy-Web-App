import Image from "next/image";
import Link from "next/link";
import { PremiumUpgradeButton } from "@/components/premium/PremiumUpgradeButton";
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
          <Link href="/settings" aria-label="Settings" className="flex size-6 items-center justify-center">
            <Image src={`${A}/icon-settings.svg`} alt="" width={24} height={24} />
          </Link>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <PremiumUpgradeButton className="inline-flex h-[22px] w-[101px] shrink-0 items-center justify-center gap-1 rounded-full bg-[linear-gradient(89.84deg,#6366f1_9.34%,#ec4899_90.16%)] px-2 py-0.5 font-sans text-xs font-medium leading-4 text-[#fafafa]">
            <Image src={`${A}/icon-crown.svg`} alt="" width={12} height={12} className="shrink-0" />
            <span className="w-[69px] whitespace-nowrap text-center">Go Premium</span>
          </PremiumUpgradeButton>
          <Link href="/settings" aria-label="Settings" className="flex size-6 items-center justify-center">
            <Image src={`${A}/icon-settings.svg`} alt="" width={24} height={24} />
          </Link>
        </div>
      )}
    </header>
  );
}
