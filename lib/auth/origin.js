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

function allowedExtraOrigins() {
  return process.env.COINZY_ALLOWED_ORIGINS?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
}

/**
 * Public site origin (Netlify / proxies set `x-forwarded-*`; `nextUrl.origin` alone can be wrong).
 */
function requestPublicOrigin(request) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = (forwardedHost ? forwardedHost.split(",")[0] : request.headers.get("host") || "").trim();
  const proto = (request.headers.get("x-forwarded-proto") || "").split(",")[0].trim();
  if (host) {
    const scheme = proto || request.nextUrl.protocol.replace(":", "") || "https";
    return `${scheme}://${host}`;
  }
  return request.nextUrl.origin;
}

function isAllowedOriginCandidate(candidateOrigin, expected) {
  if (!candidateOrigin) return false;
  if (candidateOrigin === expected) return true;
  const expectedUrl = parseOrigin(expected);
  const candidateUrl = parseOrigin(candidateOrigin);
  if (expectedUrl && candidateUrl && devLoopbackEquivalent(candidateUrl, expectedUrl)) return true;
  return allowedExtraOrigins().includes(candidateOrigin);
}

/**
 * CSRF guard for same-origin `/api/*` mutations: `Origin` (or `Referer` origin) must match the
 * public request origin and/or `COINZY_ALLOWED_ORIGINS` (comma-separated full origins).
 *
 * @param {import('next/server').NextRequest} request
 */
function isAllowedAuthOrigin(request) {
  const expected = requestPublicOrigin(request);
  const fromHeader = parseOrigin(request.headers.get("origin"));
  if (fromHeader) {
    return isAllowedOriginCandidate(fromHeader.origin, expected);
  }
  const referer = parseOrigin(request.headers.get("referer"));
  if (referer) {
    return isAllowedOriginCandidate(referer.origin, expected);
  }
  return false;
}

module.exports = { isAllowedAuthOrigin, requestPublicOrigin };
