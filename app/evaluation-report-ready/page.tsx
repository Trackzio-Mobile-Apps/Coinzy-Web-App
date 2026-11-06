import { notFound } from "next/navigation";
import { ExpertReportPanel } from "@/components/experts/ExpertReportPanel";
import { ExpertsShell } from "@/components/experts/ExpertsShell";

export default function ReportReadyPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <ExpertsShell user={{ name: "Alex Morgan", email: "alex@example.com", isGuest: false }} premium={false}>
      <ExpertReportPanel
        request={{ id: "preview", displayId: "EV-000123", coinTitle: "Quarter Rupee Travancore Bala Rama Varma Silver Coin", status: "completed", payload: { media: { obverse: ["/assets/landing-page/04-marketplace/coin-morgan-dollar.webp", "/assets/landing-page/05-browse-catalogue/coin-indian-gold.webp"], reverse: ["/assets/landing-page/04-marketplace/coin-franklin-half-dollar.webp", "/assets/landing-page/05-browse-catalogue/coin-rare-indian.webp"], edge: ["/assets/landing-page/04-marketplace/coin-british-india-pice.webp", "/assets/landing-page/05-browse-catalogue/coin-commemorative.webp"], video: "/assets/experts/preview-coin.mp4" } } }}
        report={{ id: "preview", coinTitle: "Quarter Rupee Travancore Bala Rama Varma Silver Coin", expertDisplayName: "David", submittedAt: new Date().toISOString(), contentFields: {
          generalInfo: { coinName: "Quarter Rupee", currencyAndDenomination: "Quarter Rupee", issuer: "Travancore State", period: "1912–1924", rulerOrGovt: "Bala Rama Varma", yearOfMinting: "1912", mintLocation: "Trivandrum" },
          physicalSpecs: { material: "Silver (.917)", weight: "2.92 g", dominantColor: "Silver", mintingMethod: "Machine" },
          valueAndRarity: { rarity: "Very Rare", estimatedPriceRange: "₹8,500 – ₹12,000" },
          designDetails: { obverseDescription: "Lady Liberty facing left with stars surrounding the portrait.", reverseDescription: "Eagle with outstretched wings holding arrows and an olive branch.", history: "A collectible silver coin." },
          expertAssessment: { authenticity: "Authentic", conditionOrGrade: "VF-30 (Very Fine)", recommendation: "This coin shows good appreciation potential." }
        } }}
        creditBalance={5}
        experts={[]}
        preview
      />
    </ExpertsShell>
  );
}
