import { notFound } from "next/navigation";
import { ExpertsHub } from "@/components/experts/ExpertsHub";
import { ExpertsShell } from "@/components/experts/ExpertsShell";

export default function EvaluationHubPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ExpertsShell user={{ name: "Alex Morgan", email: "alex@example.com", isGuest: false }} premium={false}><ExpertsHub requests={[]} creditBalance={0} experts={[]} /></ExpertsShell>;
}
