import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExpertsHub } from "@/components/experts/ExpertsHub";
import { ExpertsShell } from "@/components/experts/ExpertsShell";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { loadExpertsHub } from "@/lib/experts/loadHub";

export const metadata: Metadata = {
  title: "Expert analysis | Coinzy AI",
  description: "Get a certified expert evaluation of your coin.",
};

/** Experts hub — Figma Copy `1049:167922` (new) / `1045:166659` (existing). */
export default async function ExpertsPage({
  searchParams,
}: {
  searchParams: Promise<{ premium?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) redirect("/auth?next=/experts");
  const token = await getSessionToken();
  if (!token) redirect("/auth?next=/experts");
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");

  const { creditBalance, requests, experts, hubError } = await loadExpertsHub(token);

  return (
    <ExpertsShell user={user} premium={premium}>
      {hubError ? (
        <div className="px-8 py-10">
          <p className="rounded-[12px] border border-[#fecaca] bg-[#fef2f2] px-4 py-3 text-sm text-[#991b1b]">
            {hubError}
          </p>
        </div>
      ) : (
        <ExpertsHub requests={requests} creditBalance={creditBalance} experts={experts} />
      )}
    </ExpertsShell>
  );
}
