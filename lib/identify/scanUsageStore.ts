"use client";

import { useSyncExternalStore } from "react";
import { parseScanUsage, type ScanUsage } from "@/lib/identify/scanUsage";

// Tiny client store (no localStorage): seeded from the server render, updated from each scan response.
let current: ScanUsage | null = null;
const listeners = new Set<() => void>();

export function setScanUsage(next: ScanUsage | null) {
  if (!next) return;
  current = next;
  listeners.forEach((l) => l());
}

export function useScanUsage(): ScanUsage | null {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => current,
    () => null,
  );
}

/** Fallback when a scan response carries no counters: re-read them from `auth/me`. */
export async function refreshScanUsage(): Promise<void> {
  try {
    const res = await fetch("/api/auth/me?soft=1", { credentials: "same-origin", cache: "no-store" });
    const json = (await res.json()) as { user?: { scanUsage?: unknown } };
    setScanUsage(parseScanUsage(json.user?.scanUsage));
  } catch {
    /* keep the last known value */
  }
}
