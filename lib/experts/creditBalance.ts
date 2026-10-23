/** Experts API may send `creditBalance` as number or string (older payloads). */
export function parseCreditBalance(raw: unknown): number | null {
  if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

export function creditBalanceFromData(
  data: { creditBalance?: unknown } | null | undefined,
  fallback = 0,
): number {
  const parsed = parseCreditBalance(data?.creditBalance);
  return parsed ?? fallback;
}

/** Prefer the highest balance when credits and profile disagree (mobile parity). */
export function resolveExpertsCreditBalance(
  creditsData?: { creditBalance?: unknown } | null,
  profileUser?: { creditBalance?: unknown } | null,
  fallback = 0,
): number {
  const fromCredits = parseCreditBalance(creditsData?.creditBalance);
  const fromProfile = parseCreditBalance(profileUser?.creditBalance);
  if (fromCredits !== null && fromProfile !== null) return Math.max(fromCredits, fromProfile);
  if (fromCredits !== null) return fromCredits;
  if (fromProfile !== null) return fromProfile;
  return fallback;
}
