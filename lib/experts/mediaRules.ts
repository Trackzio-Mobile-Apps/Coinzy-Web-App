/**
 * Port of Android `ExpertMediaRules` — media + credit product helpers.
 * Keep free of browser APIs so it can be shared by server proxies.
 */

import type { ExpertRequestMedia } from "@/lib/experts/types";

export const EXPERT_TOKEN_PRODUCT_ID = "coinzy_expert_token";
export const EXPERT_TOKEN_PRODUCT_ID_3 = "coinzy_expert_token_3";
export const EXPERT_TOKEN_PRODUCT_ID_5 = "coinzy_expert_token_5";

export const EXPERT_TOKEN_PRODUCT_IDS = [
  EXPERT_TOKEN_PRODUCT_ID,
  EXPERT_TOKEN_PRODUCT_ID_3,
  EXPERT_TOKEN_PRODUCT_ID_5,
] as const;

export const MAX_SLOT_IMAGES = 2;
export const MAX_VIDEO_DURATION_MS = 10_000;
export const MAX_VIDEO_WIDTH = 1920;
export const MAX_VIDEO_HEIGHT = 1080;

export function creditsForExpertToken(productId: string): number {
  switch (productId) {
    case EXPERT_TOKEN_PRODUCT_ID_3:
      return 3;
    case EXPERT_TOKEN_PRODUCT_ID_5:
      return 5;
    case EXPERT_TOKEN_PRODUCT_ID:
      return 1;
    default:
      return 0;
  }
}

/** Android `ExpertMediaRules.isHttpsUrl` — HTTPS only (API rejects empty / non-https). */
export function isHttpsUrl(value: string): boolean {
  return value.toLowerCase().startsWith("https://");
}

export function sanitizeMediaForApi(media: ExpertRequestMedia): ExpertRequestMedia {
  return {
    obverse: media.obverse.filter(isHttpsUrl),
    reverse: media.reverse.filter(isHttpsUrl),
    edge: media.edge.filter(isHttpsUrl),
    video: media.video && isHttpsUrl(media.video) ? media.video : null,
  };
}

export function hasRequiredHttpsSlots(media: ExpertRequestMedia): boolean {
  const m = sanitizeMediaForApi(media);
  return m.obverse.length >= 1 && m.reverse.length >= 1 && m.edge.length >= 1;
}

export function isInsufficientCreditsError(message: string | null | undefined): boolean {
  return Boolean(message?.toLowerCase().includes("insufficient credit"));
}

/** Browser locale → ISO country (Android `CommonUtils.resolveCountryIso`). */
export function resolveCountryIso(): string {
  try {
    const locale =
      typeof navigator !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().locale || navigator.language || "en-US"
        : "en-US";
    const region = locale.split(/[-_]/)[1]?.toUpperCase();
    if (region && /^[A-Z]{2}$/.test(region)) return region;
  } catch {
    /* fall through */
  }
  return "US";
}
