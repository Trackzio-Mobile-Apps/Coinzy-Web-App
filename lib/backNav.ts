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

/** Longest catalogue search term we accept (names are short; this also bounds the cache key). */
export const MAX_QUERY_LENGTH = 80;

/**
 * Clean `?q=` / `?fromQ=`: first value only, control characters dropped, whitespace collapsed and trimmed,
 * capped at `MAX_QUERY_LENGTH`. Returns `""` when there is nothing to search for.
 */
export function parseQueryParam(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH)
    .trim();
}

/** Append `from` (+ `fromPage` past page 1, + `fromQ` for a searched list) to a details-page href. */
export function withFrom(href: string, from?: string, page?: number, query?: string): string {
  if (!from) return href;
  const qs = new URLSearchParams({ from });
  if (page && page > 1) qs.set("fromPage", String(page));
  if (query) qs.set("fromQ", query);
  return `${href}${href.includes("?") ? "&" : "?"}${qs}`;
}

/** `/base`, `/base?page=N` or `/base?q=term&page=N` (page 1 stays canonical, empty `q` is dropped). */
export function pagedHref(base: string, page: number, query?: string): string {
  const qs = new URLSearchParams();
  if (query) qs.set("q", query);
  if (page > 1) qs.set("page", String(page));
  const str = qs.toString();
  return str ? `${base}?${str}` : base;
}
