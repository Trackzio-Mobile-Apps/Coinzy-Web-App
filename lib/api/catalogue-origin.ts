/**
 * Catalogue + auth API host (login, auth/me, private coins, session marketplace).
 * Netlify/Next runtimes may not inject `netlify.toml` [build.environment] at request time;
 * when unset, production builds must not fall back to QA `coins-api.trackzio.com`.
 */
export function resolveCatalogueOrigin(): string {
  const explicit =
    process.env.COINZY_AUTH_API_ORIGIN?.trim() || process.env.COINZY_API_ORIGIN?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return process.env.NODE_ENV === "production"
    ? "https://coins-api-prod.trackzio.com"
    : "https://coins-api.trackzio.com";
}
