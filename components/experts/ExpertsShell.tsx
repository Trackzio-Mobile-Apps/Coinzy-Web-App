import { ExpertsDummyPayProvider } from "@/components/experts/ExpertsPayContext";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import type { SessionUser } from "@/lib/auth/session";
import { isTrackzioStaffEmail } from "@/lib/experts/staffAccess";

/** Shared signed-in chrome for Experts routes (Figma Webapp shell). */
export function ExpertsShell({
  user,
  premium,
  children,
}: {
  user: SessionUser;
  premium: boolean;
  children: React.ReactNode;
}) {
  const allowDummyPay = !user.isGuest && isTrackzioStaffEmail(user.email);

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <AppSidebar user={user} active="expert" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#faf7f5]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <ExpertsDummyPayProvider allow={allowDummyPay}>{children}</ExpertsDummyPayProvider>
        </div>
      </div>
    </div>
  );
}
