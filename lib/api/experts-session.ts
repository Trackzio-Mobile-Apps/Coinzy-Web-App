/**
 * Server-only Experts API client (Android `ExpertsApiService`).
 * Uses `coinzy_session` JWT — same shared secret as mobile-user Bearer.
 * Never import into client components.
 *
 * Android `gradle.properties` (app `build.gradle.kts` flavors):
 * - QA / `dev` flavor → `EXPERTS_BASE_URL_QA` = https://api.coinzy-experts-qa.trackzio.com/
 * - Prod / `prod` flavor → `EXPERTS_BASE_URL` = https://coinzy-experts-api.trackzio.com/
 *
 * Web default matches Android `dev` (catalogue host is also QA `coins-api.trackzio.com`).
 * Override with `COINZY_EXPERTS_API_ORIGIN` for production deploys.
 */

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
import { httpLogStart } from "@/lib/dev/httpLog";

/** Android `EXPERTS_BASE_URL_QA` — `dev` flavor. */
export const EXPERTS_API_ORIGIN_QA = "https://api.coinzy-experts-qa.trackzio.com";

/** Android `EXPERTS_BASE_URL` — `prod` flavor / `PRODUCTION_EXPERTS_HOST`. */
export const EXPERTS_API_ORIGIN_PROD = "https://coinzy-experts-api.trackzio.com";

const DEFAULT_ORIGIN = EXPERTS_API_ORIGIN_QA;

export function expertsApiOrigin(): string {
  return (process.env.COINZY_EXPERTS_API_ORIGIN || DEFAULT_ORIGIN).replace(/\/$/, "");
}

async function expertsFetch<T>(
  token: string,
  path: string,
  init?: RequestInit & { timeoutMs?: number },
): Promise<{ ok: boolean; status: number; body: ExpertsEnvelope<T> | null }> {
  const { timeoutMs = 20000, ...rest } = init ?? {};
  const headers = new Headers(rest.headers);
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("App-Version", "web-1.0");
  if (rest.body && !(rest.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const url = `${expertsApiOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
  const method = (rest.method || "GET").toUpperCase();
  const log = httpLogStart({
    label: "experts-ssr",
    method,
    url,
    headers,
    body: typeof rest.body === "string" ? rest.body : undefined,
  });
  const started = Date.now();
  try {
    const res = await fetch(url, {
      ...rest,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = (await res.json().catch(() => null)) as ExpertsEnvelope<T> | null;
    log.done({
      status: res.status,
      statusText: res.statusText,
      ms: Date.now() - started,
      body,
    });
    return { ok: res.ok, status: res.status, body };
  } catch (e) {
    log.fail(e instanceof Error ? e.message : "Unable to reach Experts API.", Date.now() - started);
    return { ok: false, status: 502, body: { error: true, message: "Unable to reach Experts API." } };
  }
}

export async function fetchExpertsProfile(token: string) {
  return expertsFetch<ExpertsProfileData>(token, "/users/me");
}

export async function fetchExpertsCredits(token: string) {
  return expertsFetch<ExpertsCreditBalanceData>(token, "/users/me/credits");
}

export async function fetchExpertsDirectory(
  token: string,
  opts?: { country?: string; available?: boolean; includeInternal?: boolean },
) {
  const q = new URLSearchParams();
  if (opts?.country) q.set("country", opts.country);
  if (opts?.available != null) q.set("available", String(opts.available));
  if (opts?.includeInternal != null) q.set("includeInternal", String(opts.includeInternal));
  const qs = q.toString();
  return expertsFetch<ExpertsDirectoryData>(token, `/users/experts${qs ? `?${qs}` : ""}`);
}

export async function fetchExpertRequests(token: string) {
  return expertsFetch<ExpertRequestsData>(token, "/users/requests");
}

export async function fetchExpertRequest(token: string, id: string) {
  return expertsFetch<ExpertRequestData>(token, `/users/requests/${encodeURIComponent(id)}`);
}

export async function createExpertRequest(
  token: string,
  body: { country: string; payload: { media: ExpertRequestMedia; notes?: string } },
) {
  return expertsFetch<ExpertRequestData>(token, "/users/requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function retryExpertRequest(token: string, id: string) {
  return expertsFetch<ExpertRequestData>(token, `/users/requests/${encodeURIComponent(id)}/retry`, {
    method: "POST",
    body: "{}",
  });
}

export async function fetchExpertReport(token: string, requestId: string) {
  return expertsFetch<ExpertReportData>(
    token,
    `/users/requests/${encodeURIComponent(requestId)}/report`,
  );
}

export async function submitExpertFeedback(
  token: string,
  body: {
    reportId: string;
    rating: number;
    sentiment?: string;
    comment?: string;
    platform?: string;
  },
) {
  return expertsFetch(token, "/users/feedback", {
    method: "POST",
    body: JSON.stringify({ ...body, platform: body.platform ?? "Web" }),
  });
}

export async function uploadExpertMedia(token: string, form: FormData) {
  return expertsFetch<{ urls: string[] }>(token, "/users/uploads", {
    method: "POST",
    body: form,
    timeoutMs: 60000,
  });
}
