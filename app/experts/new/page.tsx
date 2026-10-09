import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExpertUploadFlow } from "@/components/experts/ExpertUploadFlow";
import { ExpertsShell } from "@/components/experts/ExpertsShell";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { loadExpertsHub } from "@/lib/experts/loadHub";

export const metadata: Metadata = {
  title: "Upload for expert evaluation | Coinzy AI",
};

/** New evaluation upload — Figma new-user upload frames. */
export default async function ExpertsNewPage({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/experts/new");
  const token = await getSessionToken();
  if (!token) redirect("/auth?next=/experts/new");
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");

  const { creditBalance, experts } = await loadExpertsHub(token);

  return (
    <ExpertsShell user={user} premium={premium}>
      <ExpertUploadFlow creditBalance={creditBalance} experts={experts} />
    </ExpertsShell>
  );
}
