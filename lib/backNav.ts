/**
 * Back-navigation helpers shared by list pages and details pages.
 *
 * Details pages (`/catalogue/coin/[id]`, `/marketplace/listing/[id]`) get `?from=<origin>[&fromPage=N]` on
 * their links so the breadcrumb / back button return to the exact list the visitor came from, instead of a
 * generic parent. The browser Back button already works (links push history); this keeps the *in-page* back
 * control deterministic — we never call `router.back()`.
 *
 * Pure (no server imports) so client-ish components can use it too.
 */

/** Origin used by the signed-in dashboard widgets. */
export const FROM_HOME = "home";

/** Positive integer page from a search param; `1` when missing/garbage. */
export function parsePageParam(raw: string | undefined): number {
  return Math.max(1, Number.parseInt(raw ?? "", 10) || 1);
}

/** Append `from` (+ `fromPage` when past page 1) to a details-page href. */
export function withFrom(href: string, from?: string, page?: number): string {
  if (!from) return href;
  const qs = new URLSearchParams({ from });
  if (page && page > 1) qs.set("fromPage", String(page));
  return `${href}${href.includes("?") ? "&" : "?"}${qs}`;
}

/** `/base` or `/base?page=N` (page 1 stays canonical). */
export function pagedHref(base: string, page: number): string {
  return page > 1 ? `${base}?page=${page}` : base;
}
