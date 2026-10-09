"use client";

import type {
  ExpertReportData,
  ExpertRequestData,
  ExpertRequestsData,
  ExpertsCreditBalanceData,
  ExpertsDirectoryData,
  ExpertsEnvelope,
  ExpertsProfileData,
  ExpertRequestMedia,
} from "@/lib/experts/types";

async function expertsApi<T>(path: string, init?: RequestInit): Promise<ExpertsEnvelope<T>> {
  const res = await fetch(`/api/experts/${path.replace(/^\//, "")}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as ExpertsEnvelope<T> | null;
  if (!body) return { error: true, message: "Invalid response." };
  if (!res.ok && body.error !== true) {
    return { error: true, message: body.message || "Request failed.", data: body.data };
  }
  return body;
}

export function getExpertsProfile() {
  return expertsApi<ExpertsProfileData>("users/me");
}

export function getExpertsCredits() {
  return expertsApi<ExpertsCreditBalanceData>("users/me/credits");
}

export function getExpertsDirectory(country?: string) {
  const q = country ? `?country=${encodeURIComponent(country)}` : "";
  return expertsApi<ExpertsDirectoryData>(`users/experts${q}`);
}

export function listExpertRequests() {
  return expertsApi<ExpertRequestsData>("users/requests");
}

export function getExpertRequest(id: string) {
  return expertsApi<ExpertRequestData>(`users/requests/${encodeURIComponent(id)}`);
}

export function createExpertRequest(body: {
  country: string;
  payload: { media: ExpertRequestMedia; notes?: string };
}) {
  return expertsApi<ExpertRequestData>("users/requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function retryExpertRequest(id: string) {
  return expertsApi<ExpertRequestData>(`users/requests/${encodeURIComponent(id)}/retry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
  });
}

export function getExpertReport(requestId: string) {
  return expertsApi<ExpertReportData>(`users/requests/${encodeURIComponent(requestId)}/report`);
}

export function submitExpertFeedback(body: {
  reportId: string;
  rating: number;
  sentiment?: string;
  comment?: string;
}) {
  return expertsApi("users/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, platform: "Web" }),
  });
}

/** Multipart upload → public HTTPS URLs (docs `POST /users/uploads`). */
export async function uploadExpertFiles(files: File[]): Promise<ExpertsEnvelope<{ urls: string[] }>> {
  const form = new FormData();
  for (const file of files) form.append("files", file);
  return expertsApi<{ urls: string[] }>("users/uploads", { method: "POST", body: form });
}

/** Trackzio staff-only dummy credit grant (`POST /api/experts/payments/dummy`). */
export function purchaseDummyCredits(packId: string) {
  return expertsApi<{
    creditBalance: number;
    creditsGranted: number;
    packId: string;
    dummy: true;
  }>("payments/dummy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ packId }),
  });
}
