"use client";

import { useEffect } from "react";
import { OFFLINE_MESSAGE, isBrowserOffline } from "@/lib/network/offline";

/**
 * Soft-nav / RSC failures while offline used to surface as a Next.js error overlay
 * with no actionable copy (ClickUp 14yn59xpkfv). Prefer the offline message when
 * the browser reports no connectivity.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const offline = isBrowserOffline();

  useEffect(() => {
    if (!offline) console.error(error);
  }, [error, offline]);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-cream px-6 text-center">
      <p className="font-jakarta max-w-md text-lg font-semibold text-ink">
        {offline ? OFFLINE_MESSAGE : "Something went wrong loading this page."}
      </p>
      {!offline && error?.digest ? (
        <p className="mt-2 text-sm text-muted">Reference: {error.digest}</p>
      ) : null}
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-[10px] bg-primary-500 px-5 py-2.5 font-jakarta text-sm font-semibold text-white hover:bg-primary-700"
      >
        Try again
      </button>
    </main>
  );
}
