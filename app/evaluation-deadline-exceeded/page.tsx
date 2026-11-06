import { notFound } from "next/navigation";
import { ExpertStatusPanel } from "@/components/experts/ExpertStatusPanel";
import { ExpertsShell } from "@/components/experts/ExpertsShell";

export default function DeadlineExceededPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <ExpertsShell user={{ name: "Alex Morgan", email: "alex@example.com", isGuest: false }} premium={false}>
      <ExpertStatusPanel
        initial={{ id: "preview", displayId: "EV-000123", coinTitle: "Sample coin", status: "deadline_missed", createdAt: new Date(Date.now() - 74 * 3600000).toISOString(), updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(), deadlineAt: new Date(Date.now() - 2 * 3600000).toISOString(), payload: { media: { obverse: ["/assets/landing-page/04-marketplace/coin-morgan-dollar.webp", "/assets/landing-page/05-browse-catalogue/coin-indian-gold.webp"], reverse: ["/assets/landing-page/04-marketplace/coin-franklin-half-dollar.webp", "/assets/landing-page/05-browse-catalogue/coin-rare-indian.webp"], edge: ["/assets/landing-page/04-marketplace/coin-british-india-pice.webp", "/assets/landing-page/05-browse-catalogue/coin-commemorative.webp"], video: "/assets/experts/preview-coin.mp4" } } }}
        creditBalance={5}
        experts={[]}
        preview
      />
    </ExpertsShell>
  );
}
