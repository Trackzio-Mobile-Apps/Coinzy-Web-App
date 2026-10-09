import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/home/AppSidebar";
import { FeedPage } from "@/components/feed/FeedPage";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { getPremiumStatus, getSessionUser } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Feed | Coinzy AI",
  description: "Collector community feed — posts, comments, and buy/sell discussions.",
};

/** Community Feed — Figma canvas `783:15969` / hub frames under `951:87324`. Backed by Firebase (Android parity). */
export default async function FeedRoute({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/feed");
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");

  return (
    <div className="flex min-h-dvh bg-[#f7f7f7]">
      <AppSidebar user={user} active="feed" />
      <div className="flex min-w-0 flex-1 flex-col">
        <MarketplaceAppHeader user={user} premium={premium} />
        <FeedPage
          premium={premium}
          initialName={user.name}
          initialEmail={user.email}
          initialIsGuest={user.isGuest}
        />
      </div>
    </div>
  );
}
