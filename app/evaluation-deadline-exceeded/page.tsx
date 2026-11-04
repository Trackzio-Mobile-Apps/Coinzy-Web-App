import { notFound } from "next/navigation";
import { ExpertStatusPanel } from "@/components/experts/ExpertStatusPanel";
import { ExpertsShell } from "@/components/experts/ExpertsShell";

export default function DeadlineExceededPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <ExpertsShell user={{ name: "Alex Morgan", email: "alex@example.com", isGuest: false }} premium={false}>
      <ExpertStatusPanel
        initial={{ id: "preview", displayId: "EV-000123", coinTitle: "Sample coin", status: "deadline_missed", createdAt: new Date(Date.now() - 74 * 3600000).toISOString(), updatedAt: new Date(Date.now() - 2 * 3600000).toISOString(), deadlineAt: new Date(Date.now() - 2 * 3600000).toISOString(), payload: { media: { obverse: ["/assets/landing-page/04-marketplace/coin-morgan-dollar.png", "/assets/landing-page/05-browse-catalogue/coin-indian-gold.png"], reverse: ["/assets/landing-page/04-marketplace/coin-franklin-half-dollar.png", "/assets/landing-page/05-browse-catalogue/coin-rare-indian.png"], edge: ["/assets/landing-page/04-marketplace/coin-british-india-pice.png", "/assets/landing-page/05-browse-catalogue/coin-commemorative.png"], video: "/assets/experts/preview-coin.mp4" } } }}
        creditBalance={5}
        experts={[]}
        preview
      />
    </ExpertsShell>
  );
}
