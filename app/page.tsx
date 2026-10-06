import { redirect } from "next/navigation";
import { ReloadOnRestore } from "@/components/auth/ReloadOnRestore";
import { TopNav } from "@/components/landing/TopNav";
import { HeroSection } from "@/components/landing/HeroSection";
import { IdentifyDemoSection } from "@/components/landing/IdentifyDemoSection";
import { StatsBar } from "@/components/landing/StatsBar";
import { BrowseCatalogueSection } from "@/components/landing/BrowseCatalogueSection";
import { MarketplaceSection } from "@/components/landing/MarketplaceSection";
import { MobileAppSection } from "@/components/landing/MobileAppSection";
import { CollectionCTASection } from "@/components/landing/CollectionCTASection";
import { ExpertEvaluationSection } from "@/components/landing/ExpertEvaluationSection";
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
        <BrowseCatalogueSection />
        <MarketplaceSection />
        <MobileAppSection />
        <CollectionCTASection />
        <ExpertEvaluationSection />
        <CommunityFeedSection />
      </main>
      <Footer />
    </>
  );
}
