"use client";

import { useSyncExternalStore } from "react";
import { OFFLINE_MESSAGE } from "@/lib/network/offline";

function subscribeOnline(onStoreChange: () => void) {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);
  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

function readOnline() {
  return navigator.onLine;
}

/**
 * Global offline notice (ClickUp 14yn59xpkfv). Sync store so soft-nav / actions
 * while disconnected still surface a clear message without a Next error overlay.
 */
export function OfflineBanner() {
  const online = useSyncExternalStore(subscribeOnline, readOnline, () => true);
  if (online) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed inset-x-0 top-0 z-[100] border-b border-primary-800 bg-primary-900 px-4 py-3 text-center shadow-sm"
    >
      <p className="font-jakarta text-sm font-semibold text-white sm:text-[15px]">{OFFLINE_MESSAGE}</p>
    </div>
  );
}
