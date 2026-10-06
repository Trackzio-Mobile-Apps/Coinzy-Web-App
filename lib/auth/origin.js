const LOCAL = new Set(["localhost", "127.0.0.1", "[::1]"]);

function parseOrigin(value) {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

/** `localhost` and `127.0.0.1` (and IPv6 loopback) on the same port count as one site in dev. */
function devLoopbackEquivalent(a, b) {
  return (
    process.env.NODE_ENV !== "production" &&
    a.protocol === b.protocol &&
    a.port === b.port &&
    LOCAL.has(a.hostname) &&
    LOCAL.has(b.hostname)
  );
}

/**
 * CSRF guard for `POST /api/auth/*`: the `Origin` header (or `Referer` origin) must match the request URL's
 * origin. Browsers treat `http://localhost:3000` and `http://127.0.0.1:3000` as different sites, which
 * otherwise breaks login when you open the app via 127.0.0.1 while the handler compares against another host.
 *
 * @param {import('next/server').NextRequest} request
 */
function isAllowedAuthOrigin(request) {
  const expected = request.nextUrl.origin;
  const fromHeader = parseOrigin(request.headers.get("origin"));
  if (fromHeader) {
    if (fromHeader.origin === expected) return true;
    const expectedUrl = parseOrigin(expected);
    if (expectedUrl && devLoopbackEquivalent(fromHeader, expectedUrl)) return true;
    const extra = process.env.COINZY_ALLOWED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    return extra.includes(fromHeader.origin);
  }
  const referer = parseOrigin(request.headers.get("referer"));
  if (!referer) return false;
  if (referer.origin === expected) return true;
  const expectedUrl = parseOrigin(expected);
  return expectedUrl ? devLoopbackEquivalent(referer, expectedUrl) : false;
}

module.exports = { isAllowedAuthOrigin };
