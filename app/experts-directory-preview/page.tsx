import { notFound } from "next/navigation";
import { ExpertsShell } from "@/components/experts/ExpertsShell";
import { ExpertsDirectory } from "@/components/experts/ExpertsDirectory";

export default function ExpertsDirectoryPreview() {
  if (process.env.NODE_ENV === "production") notFound();
  return <ExpertsShell user={{ name: "Alex Morgan", email: "alex@example.com", isGuest: false }} premium={false}><ExpertsDirectory experts={[]} creditBalance={0} preview /></ExpertsShell>;
}
