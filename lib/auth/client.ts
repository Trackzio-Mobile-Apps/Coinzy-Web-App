import { safeReturnPath } from "@/lib/auth/returnTo";
import { googleAuthErrorMessage, obtainGoogleIdCredential } from "@/lib/auth/google";
import { ensureFirebaseSession } from "@/lib/firebase/authBridge";

type AuthAction = "login" | "signup" | "guest" | "forgot" | "reset" | "google";

export async function submitAuth(action: AuthAction, data: Record<string, unknown> = {}) {
  const response = await fetch(`/api/auth/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
    }),
  });
  const result = await response.json();
  if (!response.ok || result.error) throw new Error(result.reason || "Authentication failed. Please try again.");

  // Mirror Android: link Firebase Auth after Coinzy session is set (feed / Firestore rules).
  if (action === "login" || action === "signup" || action === "guest" || action === "google") {
    try {
      const email =
        (typeof result.email === "string" && result.email) ||
        (typeof data.email === "string" && data.email) ||
        (typeof data.handle === "string" && data.handle) ||
        "";
      await ensureFirebaseSession({ email, isGuest: action === "guest" || !email });
    } catch {
      // Non-fatal — Feed will retry ensureFirebaseSession on mount.
    }
  }

  return result as { error: false; email?: string };
}

/**
 * Firebase Google popup → Coinzy `auth/social-login/google` → session cookie + Feed bridge.
 */
export async function submitGoogleAuth() {
  try {
    const { credential, fullName, email } = await obtainGoogleIdCredential();
    return await submitAuth("google", { credential, fullName, email });
  } catch (error) {
    throw new Error(googleAuthErrorMessage(error));
  }
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
