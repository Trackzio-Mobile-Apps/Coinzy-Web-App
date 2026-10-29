/** User-facing copy for ClickUp 14yn59xpkfv — keep in sync with OfflineBanner. */
export const OFFLINE_MESSAGE =
  "No internet connection. Please check your network and try again.";

export function isBrowserOffline(): boolean {
  return typeof navigator !== "undefined" && navigator.onLine === false;
}

/** Map fetch/network failures (and offline) to a clear message; pass through other Errors. */
export function networkErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isBrowserOffline()) return OFFLINE_MESSAGE;
  if (error instanceof TypeError) {
    const msg = error.message.toLowerCase();
    if (msg.includes("failed to fetch") || msg.includes("networkerror") || msg.includes("load failed")) {
      return OFFLINE_MESSAGE;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
