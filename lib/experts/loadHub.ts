import {
  fetchExpertRequests,
  fetchExpertsCredits,
  fetchExpertsDirectory,
} from "@/lib/api/experts-session";
import type { ExpertRequest, ExpertsDirectoryItem } from "@/lib/experts/types";

export async function loadExpertsHub(token: string, country?: string) {
  const [creditsRes, requestsRes, directoryRes] = await Promise.all([
    fetchExpertsCredits(token),
    fetchExpertRequests(token),
    fetchExpertsDirectory(token, { country, available: true }),
  ]);

  const creditBalance =
    !creditsRes.body?.error && typeof creditsRes.body?.data?.creditBalance === "number"
      ? creditsRes.body.data.creditBalance
      : 0;

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
