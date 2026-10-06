/**
 * Return-to-page support for the sign-in wizard (`/auth?next=/marketplace/listing/…`).
 *
 * Only same-origin relative paths are ever honoured, so `next` can never become an open redirect. Safe to import from
 * server and client code (pure string handling, no browser or server APIs).
 */

const MAX_LENGTH = 400;
/** Paths that would bounce straight back into the wizard or serve JSON — never valid return targets. */
const BLOCKED = /^\/(auth|api)(\/|\?|#|$)/;

/** Returns the normalised relative path (`pathname + search + hash`) or `null` when `value` is not a safe target. */
export function safeReturnPath(value: unknown): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string" || !raw || raw.length > MAX_LENGTH) return null;
  // Must be an absolute-path reference: "/x" only. Rejects "//host", "/\host", "http://…", "javascript:…" and control chars.
  if (!raw.startsWith("/") || raw.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(raw)) return null;
  try {
    const url = new URL(raw, "http://coinzy.invalid");
    if (url.origin !== "http://coinzy.invalid") return null;
    const path = `${url.pathname}${url.search}${url.hash}`;
    return BLOCKED.test(path) ? null : path;
  } catch {
    return null;
  }
}

/** `/auth` URL for a wizard step, carrying a (validated) return path. */
export function authHref(mode?: string, next?: string | null): string {
  const params = new URLSearchParams();
  if (mode && mode !== "welcome") params.set("mode", mode);
  const safe = safeReturnPath(next);
  if (safe) params.set("next", safe);
  const query = params.toString();
  return query ? `/auth?${query}` : "/auth";
}
