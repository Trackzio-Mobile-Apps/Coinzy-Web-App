import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ExpertReportPanel } from "@/components/experts/ExpertReportPanel";
import { ExpertsShell } from "@/components/experts/ExpertsShell";
import {
  fetchExpertReport,
  fetchExpertRequest,
  fetchExpertsCredits,
  fetchExpertsDirectory,
} from "@/lib/api/experts-session";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { expertRequestId } from "@/lib/experts/types";

export const metadata: Metadata = {
  title: "Expert report | Coinzy AI",
};

export default async function ExpertReportPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ premium?: string }>;
}) {
  const { id } = await params;
  const user = await getSessionUser();
  if (!user) redirect(`/auth?next=/experts/request/${id}/report`);
  const token = await getSessionToken();
  if (!token) redirect(`/auth?next=/experts/request/${id}/report`);
  const sp = await searchParams;
  const premium =
    (await getPremiumStatus(user)) || (process.env.NODE_ENV !== "production" && sp.premium === "1");

  const [reqRes, reportRes, creditsRes, dirRes] = await Promise.all([
    fetchExpertRequest(token, id),
    fetchExpertReport(token, id),
    fetchExpertsCredits(token),
    fetchExpertsDirectory(token, { available: true }),
  ]);

  const request = reqRes.body?.data?.request;
  const report = reportRes.body?.data?.report;
  if (!request || !expertRequestId(request)) notFound();
  if (reportRes.body?.error || !report) {
    // Not ready yet — send back to status
    redirect(`/experts/request/${id}`);
  }

  const creditBalance =
    typeof creditsRes.body?.data?.creditBalance === "number" ? creditsRes.body.data.creditBalance : 0;
  const experts = dirRes.body?.data?.experts ?? [];

  return (
    <ExpertsShell user={user} premium={premium}>
      <ExpertReportPanel
        request={request}
        report={report}
        creditBalance={creditBalance}
        experts={experts}
      />
    </ExpertsShell>
  );
}
