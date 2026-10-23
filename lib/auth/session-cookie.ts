/** Max-Age for `coinzy_session` from JWT `exp` (capped like auth login). */
export function sessionCookieMaxAge(token: string): number {
  let maxAge = 86400;
  try {
    const exp = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).exp;
    if (typeof exp === "number") maxAge = Math.max(0, Math.min(2592000, Math.floor(exp - Date.now() / 1000)));
  } catch {
    /* Opaque tokens use the conservative default. */
  }
  return maxAge;
}
