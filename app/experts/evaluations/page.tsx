import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ExpertsShell } from "@/components/experts/ExpertsShell";
import { EvaluationsList } from "@/components/experts/EvaluationsList";
import { getPremiumStatus, getSessionToken, getSessionUser } from "@/lib/auth/session";
import { loadExpertsHub } from "@/lib/experts/loadHub";

export const metadata: Metadata = { title: "Your evaluations | Coinzy AI" };
export default async function EvaluationsPage() {
  const user = await getSessionUser();
  const token = await getSessionToken();
  if (!user || !token) redirect("/auth?next=/experts/evaluations");
  const [{ requests, creditBalance, hubError }, premium] = await Promise.all([loadExpertsHub(token), getPremiumStatus(user)]);
  return <ExpertsShell user={user} premium={premium}>{hubError ? <p role="alert" className="m-8 rounded-xl border border-[#fecaca] bg-[#fef2f2] p-4 text-sm text-[#991b1b]">{hubError}</p> : <EvaluationsList requests={requests} creditBalance={creditBalance} />}</ExpertsShell>;
}
