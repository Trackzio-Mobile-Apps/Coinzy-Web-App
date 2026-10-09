/**
 * Server-only Experts admin client (`x-admin-key`).
 * Never import into client components.
 */

import { expertsApiOrigin } from "@/lib/api/experts-session";
import type { ExpertsEnvelope } from "@/lib/experts/types";
import { httpLogStart } from "@/lib/dev/httpLog";

function adminKey(): string | null {
  const key = (process.env.COINZY_EXPERTS_ADMIN_API_KEY || "").trim();
  return key || null;
}

export function hasExpertsAdminKey(): boolean {
  return Boolean(adminKey());
}

async function expertsAdminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ ok: boolean; status: number; body: ExpertsEnvelope<T> | null; configError?: string }> {
  const key = adminKey();
  if (!key) {
    return {
      ok: false,
      status: 503,
      body: null,
      configError: "Experts admin key is not configured (COINZY_EXPERTS_ADMIN_API_KEY).",
    };
  }

  const headers = new Headers(init?.headers);
  headers.set("x-admin-key", key);
  headers.set("App-Version", "web-1.0");
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = `${expertsApiOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
  const method = (init?.method || "GET").toUpperCase();
  const log = httpLogStart({
    label: "experts-admin",
    method,
    url,
    headers,
    body: typeof init?.body === "string" ? init.body : undefined,
  });
  const started = Date.now();

  try {
    const res = await fetch(url, {
      ...init,
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
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

export type ExpertsAdminCreditAdjustData = {
  creditBalance: number;
  ledger?: unknown;
};

/** `POST /admin/users/:userId/credits/adjust` */
export async function adminAdjustUserCredits(
  userId: string,
  body: { amount: number; reason: string },
) {
  return expertsAdminFetch<ExpertsAdminCreditAdjustData>(
    `/admin/users/${encodeURIComponent(userId)}/credits/adjust`,
    { method: "POST", body: JSON.stringify(body) },
  );
}
