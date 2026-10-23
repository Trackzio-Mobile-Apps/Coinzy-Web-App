import {
  fetchExpertRequests,
  fetchExpertsCredits,
  fetchExpertsDirectory,
  fetchExpertsProfile,
} from "@/lib/api/experts-session";
import { resolveExpertsCreditBalance } from "@/lib/experts/creditBalance";
import type { ExpertRequest, ExpertsDirectoryItem } from "@/lib/experts/types";

export async function loadExpertsHub(token: string, country?: string) {
  const [creditsRes, profileRes, requestsRes, directoryRes] = await Promise.all([
    fetchExpertsCredits(token),
    fetchExpertsProfile(token),
    fetchExpertRequests(token),
    fetchExpertsDirectory(token, { country, available: true }),
  ]);

  const creditBalance = resolveExpertsCreditBalance(
    !creditsRes.body?.error ? creditsRes.body?.data : null,
    !profileRes.body?.error ? profileRes.body?.data?.user : null,
  );

  const requests: ExpertRequest[] =
    !requestsRes.body?.error && Array.isArray(requestsRes.body?.data?.requests)
      ? requestsRes.body!.data!.requests
      : [];

  const experts: ExpertsDirectoryItem[] =
    !directoryRes.body?.error && Array.isArray(directoryRes.body?.data?.experts)
      ? directoryRes.body!.data!.experts
      : [];

  const hubError =
    (creditsRes.body?.error && creditsRes.body.message) ||
    (requestsRes.body?.error && requestsRes.body.message) ||
    null;

  return { creditBalance, requests, experts, hubError };
}
