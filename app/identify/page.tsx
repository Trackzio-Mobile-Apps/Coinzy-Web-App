import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ReloadOnRestore } from "@/components/auth/ReloadOnRestore";
import { AppSidebar } from "@/components/home/AppSidebar";
import { IdentifyApp } from "@/components/identify/IdentifyApp";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { getPremiumStatus, getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Identify coin | Coinzy AI",
  description: "Upload obverse and reverse photos to identify your coin with AI.",
};

export default async function IdentifyPage({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string; debug?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/identify");

  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");
  const autoLoadDebug = process.env.NODE_ENV !== "production" && sp.debug === "1";

  return (
    <div className="flex h-svh overflow-hidden bg-white">
      <ReloadOnRestore />
      <AppSidebar user={user} active="identify" />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[#f7f7f8]">
        <MarketplaceAppHeader user={user} premium={premium} />
        <main className="min-w-0 flex-1 overflow-y-auto px-8 py-6">
          <div className="mx-auto w-full max-w-[1122px]">
            <IdentifyApp autoLoadDebug={autoLoadDebug} />
          </div>
        </main>
      </div>
    </div>
  );
}
