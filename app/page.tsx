import { redirect } from "next/navigation";
import { Suspense } from "react";
import { ReloadOnRestore } from "@/components/auth/ReloadOnRestore";
import { TopNav } from "@/components/landing/TopNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { IdentifyDemoSection } from "@/components/landing/IdentifyDemoSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { RegionalBrowseCatalogueSection } from "@/components/landing/RegionalBrowseCatalogueSection";
import { MarketplaceSection } from "@/components/landing/MarketplaceSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { CollectionCTASection } from "@/components/landing/CollectionCTASection";
import { ExpertEvaluationSection } from "@/components/landing/ExpertEvaluationSection";
import { LandingAppraisers } from "@/components/landing/LandingAppraisers";
import { CommunityFeedSection } from "@/components/landing/CommunityFeedSection";
import { Footer } from "@/components/landing/Footer";
import { getSessionUser } from "@/lib/auth/session";

export default async function HomePage() {
  if (await getSessionUser()) redirect("/home");

  return (
    <>
      <ReloadOnRestore />
      <TopNav />
      <main className="bg-cream">
        <HeroSection />
        <IdentifyDemoSection />
        <StatsBar />
        <RegionalBrowseCatalogueSection />
        <MarketplaceSection />
        <MobileAppSection />
        <CollectionCTASection />
        <ExpertEvaluationSection appraisers={<Suspense fallback={<p className="text-sm text-muted">Loading appraisers…</p>}><LandingAppraisers /></Suspense>} />
        <CommunityFeedSection />
      </main>
      <Footer />
    </>
  );
}
