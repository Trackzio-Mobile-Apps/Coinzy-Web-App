import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ExpertStatusPanel } from "@/components/experts/ExpertStatusPanel";
import { ExpertsShell } from "@/components/experts/ExpertsShell";
import { fetchExpertRequest, fetchExpertsCredits, fetchExpertsDirectory } from "@/lib/api/experts-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { expertRequestId } from "@/lib/experts/types";

export const metadata: Metadata = {
  title: "Evaluation status | Coinzy AI",
};

export default async function ExpertRequestStatusPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ premium?: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=/experts/request/${id}`);
  const token = await getSessionToken();
  if (!token) redirect(`/auth?next=/experts/request/${id}`);
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");

  const [reqRes, creditsRes, dirRes] = await Promise.all([
    fetchExpertRequest(token, id),
    fetchExpertsCredits(token),
    fetchExpertsDirectory(token, { available: true }),
  ]);

  const request = reqRes.body?.data?.request;
  if (reqRes.body?.error || !request || !expertRequestId(request)) notFound();

  const status = (request.status || "").toLowerCase();
  if (status === "completed") redirect(`/experts/request/${id}/report`);

  const creditBalance =
    typeof creditsRes.body?.data?.creditBalance === "number" ? creditsRes.body.data.creditBalance : 0;
  const experts = dirRes.body?.data?.experts ?? [];

  return (
    <ExpertsShell user={user} premium={premium}>
      <ExpertStatusPanel initial={request} creditBalance={creditBalance} experts={experts} />
    </ExpertsShell>
  );
}
