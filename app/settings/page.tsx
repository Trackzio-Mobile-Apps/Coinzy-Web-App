import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/home/AppSidebar";
import { MarketplaceAppHeader } from "@/components/marketplace/MarketplaceAppHeader";
import { SettingsAside } from "@/components/settings/SettingsAside";
import { SettingsPanel } from "@/components/settings/SettingsPanel";
import {
  aboutMeDisplayName,
  fetchAboutMe,
  type AboutMeUser,
} from "@/lib/api/auth-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { isSellerProfileComplete } from "@/lib/marketplace/sellerProfile";

export const metadata: Metadata = {
  title: "Settings | Coinzy AI",
  description: "Account, support, and preferences for your Coinzy account.",
};

function toPanelProfile(user: AboutMeUser, fallbackName: string, fallbackEmail: string) {
  const sellerDetails = user.sellerDetails ?? null;
  return {
    name: aboutMeDisplayName(user) || fallbackName,
    email: (typeof user.email === "string" && user.email) || fallbackEmail,
    isGuest: user.isGuest === true,
    sellerDetails: {
      name: sellerDetails?.name ?? null,
      contactEmail: sellerDetails?.contactEmail ?? null,
      location: sellerDetails?.location ?? null,
      phoneNumber: sellerDetails?.phoneNumber ?? null,
      bio: sellerDetails?.bio ?? null,
      externalLinks: sellerDetails?.externalLinks ?? [],
    },
    sellerProfileComplete: isSellerProfileComplete(sellerDetails),
  };
}

function SettingsPanelSkeleton() {
  return (
    <div className="min-w-0 flex-1 animate-pulse space-y-4" aria-busy="true" aria-label="Loading settings">
      <div className="h-7 w-28 rounded bg-black/[0.06]" />
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-16 rounded-[12px] border border-[#e5e7eb] bg-white" />
      ))}
    </div>
  );
}

async function SettingsPanelLoader({
  token,
  fallbackName,
  fallbackEmail,
  isGuest,
}: {
  token: string;
  fallbackName: string;
  fallbackEmail: string;
  isGuest: boolean;
}) {
  const about = await fetchAboutMe(token);
  const profile = about.error
    ? {
        name: fallbackName,
        email: fallbackEmail,
        isGuest,
        sellerDetails: {
          name: null,
          contactEmail: null,
          location: null,
          phoneNumber: null,
          bio: null,
          externalLinks: [] as string[],
        },
        sellerProfileComplete: false,
      }
    : toPanelProfile(about.user, fallbackName, fallbackEmail);

  return <SettingsPanel initialProfile={profile} isGuest={isGuest} />;
}

/** Settings — Figma canvas `796:17452` / hub `1368:256937`. Shell first; profile streams. */
export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/settings");
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");
  const token = await getSessionToken();
  if (!token) redirect("/auth?next=/settings");

  return (
    <div className="flex min-h-dvh bg-[#f7f7f7]">
      <AppSidebar user={user} active="settings" />
      <div className="flex min-w-0 flex-1 flex-col">
        <MarketplaceAppHeader user={user} premium={premium} />
        <div className="flex flex-1 gap-6 overflow-auto px-6 py-6 lg:px-8">
          <Suspense fallback={<SettingsPanelSkeleton />}>
            <SettingsPanelLoader
              token={token}
              fallbackName={user.name}
              fallbackEmail={user.email}
              isGuest={user.isGuest}
            />
          </Suspense>
          <SettingsAside premium={premium} />
        </div>
      </div>
    </div>
  );
}
