/** Free-tier AI identification cap (Figma `768:46630` / identify `1828:206842`). */
export const FREE_AI_SCAN_LIMIT = 30;

export const FREE_SCAN_USAGE_STORAGE_KEY = "coinzy:identify:free-scans-used";
const STORAGE_KEY = FREE_SCAN_USAGE_STORAGE_KEY;

function readUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? Number.parseInt(raw, 10) : 0;
    if (!Number.isFinite(n) || n < 0) return 0;
    return Math.min(n, FREE_AI_SCAN_LIMIT);
  } catch {
    return 0;
  }
}

function writeUsed(n: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(Math.min(Math.max(0, n), FREE_AI_SCAN_LIMIT)));
  } catch {
    /* private mode */
  }
}

/** Client-only counter until `auth/me` (or similar) exposes usage. */
export function getFreeScansUsed(): number {
  return readUsed();
}

export function recordFreeScanUsed(): number {
  const next = Math.min(readUsed() + 1, FREE_AI_SCAN_LIMIT);
  writeUsed(next);
  return next;
}

export function notifyFreeScanUsageUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("coinzy:identify:scans-updated"));
}

export function freeScanProgressPercent(used: number): number {
  if (FREE_AI_SCAN_LIMIT <= 0) return 0;
  const ratio = used / FREE_AI_SCAN_LIMIT;
  if (used <= 0) return 0;
  return Math.min(100, Math.max((8 / 236) * 100, ratio * 100));
}
