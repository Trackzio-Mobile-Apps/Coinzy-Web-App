import { safeReturnPath } from "@/lib/auth/returnTo";

export async function submitAuth(action: "login" | "signup" | "guest" | "forgot" | "reset", data: Record<string, unknown> = {}) {
  const response = await fetch(`/api/auth/${action}`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...data, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, language: navigator.language }),
  });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.reason || "Authentication failed. Please try again.");
}

/**
 * Signed in: replace the auth entry with /home using a full document load. A client-side push would leave the
 * auth form one Back press away (and the router cache could redisplay it); the hard replace drops the in-memory
 * SPA cache so Back re-requests `/` or `/auth` from the server, which redirects signed-in users to /home.
 * `next` (from `/auth?next=`) returns the visitor to the page that sent them to sign in, e.g. a marketplace listing;
 * it is validated by `safeReturnPath` (same-origin relative paths only) and falls back to /home.
 */
export function goHome(next?: string | null) {
  window.location.replace(safeReturnPath(next) ?? "/home");
}
