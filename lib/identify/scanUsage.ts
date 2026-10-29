/** Server-owned AI scan counters (`successCount`/`errorCount` + thresholds on `ai/identify-v2` and `auth/me`). */
export type ScanUsage = {
  successCount: number;
  errorCount: number;
  successThreshold: number;
  errorThreshold: number;
};

/** Shown only until the first server value arrives (Figma `768:46630`). */
export const DEFAULT_FREE_SCAN_LIMIT = 30;

const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? v : null);

/** Reads the four counters from a top-level API JSON body; null when the backend did not send them. */
export function parseScanUsage(json: unknown): ScanUsage | null {
  if (!json || typeof json !== "object") return null;
  const j = json as Record<string, unknown>;
  const successCount = num(j.successCount);
  const errorCount = num(j.errorCount);
  const successThreshold = num(j.successThreshold);
  const errorThreshold = num(j.errorThreshold);
  if (successCount === null || successThreshold === null) return null;
  return { successCount, errorCount: errorCount ?? 0, successThreshold, errorThreshold: errorThreshold ?? successThreshold };
}

export function freeScanProgressPercent(used: number, limit: number): number {
  if (limit <= 0 || used <= 0) return 0;
  return Math.min(100, Math.max((8 / 236) * 100, (used / limit) * 100));
}
