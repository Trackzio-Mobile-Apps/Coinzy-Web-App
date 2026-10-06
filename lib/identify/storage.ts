import type { IdentifySessionPayload } from "@/lib/identify/types";

const KEY = "coinzy:identify:last";

export function saveIdentifySession(payload: IdentifySessionPayload): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

export function readIdentifySession(): IdentifySessionPayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as IdentifySessionPayload;
  } catch {
    return null;
  }
}

export function clearIdentifySession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
