import { notFound } from "next/navigation";
import { ExpertsHub } from "@/components/experts/ExpertsHub";
import { ExpertsShell } from "@/components/experts/ExpertsShell";
import type { ExpertRequest } from "@/lib/experts/types";

export default function EvaluationsPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  const media = { obverse: ["/assets/landing-page/04-marketplace/coin-morgan-dollar.png", "/assets/landing-page/05-browse-catalogue/coin-indian-gold.png"], reverse: ["/assets/landing-page/04-marketplace/coin-franklin-half-dollar.png", "/assets/landing-page/05-browse-catalogue/coin-rare-indian.png"], edge: ["/assets/landing-page/04-marketplace/coin-british-india-pice.png", "/assets/landing-page/05-browse-catalogue/coin-commemorative.png"], video: "/assets/experts/preview-coin.mp4" };
  const requests: ExpertRequest[] = [{ id: "preview-report", displayId: "EV-000123", status: "completed", createdAt: new Date().toISOString(), payload: { media } }, { id: "preview-expired", displayId: "EV-000124", status: "deadline_missed", createdAt: new Date().toISOString(), payload: { media } }];
  return <ExpertsShell user={{ name: "Alex Morgan", email: "alex@example.com", isGuest: false }} premium={false}><ExpertsHub requests={requests} creditBalance={5} experts={[]} preview /></ExpertsShell>;
}
