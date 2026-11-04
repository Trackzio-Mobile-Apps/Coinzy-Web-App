import { notFound } from "next/navigation";
import { ExpertsShell } from "@/components/experts/ExpertsShell";
import { EvaluationsList } from "@/components/experts/EvaluationsList";
import type { ExpertRequest } from "@/lib/experts/types";

export default function AllEvaluationsPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  const media = { obverse: ["/assets/landing-page/04-marketplace/coin-morgan-dollar.png", "/assets/landing-page/05-browse-catalogue/coin-indian-gold.png"], reverse: ["/assets/landing-page/04-marketplace/coin-franklin-half-dollar.png", "/assets/landing-page/05-browse-catalogue/coin-rare-indian.png"], edge: ["/assets/landing-page/04-marketplace/coin-british-india-pice.png", "/assets/landing-page/05-browse-catalogue/coin-commemorative.png"], video: "/assets/experts/preview-coin.mp4" };
  const requests: ExpertRequest[] = ["completed", "deadline_missed", "completed", "accepted", "offered"].map((status, i) => ({ id: `preview-${i}`, displayId: `EV-00012${i}`, status, createdAt: new Date(Date.now() - i * 86400000).toISOString(), completedAt: status === "completed" ? new Date().toISOString() : null, deadlineAt: new Date(Date.now() + 15 * 3600000).toISOString(), payload: { media } }));
  return <ExpertsShell user={{ name: "Alex Morgan", email: "alex@example.com", isGuest: false }} premium={false}><EvaluationsList requests={requests} creditBalance={5} preview /></ExpertsShell>;
}
