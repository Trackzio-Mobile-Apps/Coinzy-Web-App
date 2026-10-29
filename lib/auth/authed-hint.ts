import type { NextResponse } from "next/server";

/**
 * Client-readable session presence flag (never the JWT). Edge-safe — no Buffer /
 * Node APIs — so middleware and client DualAuth loaders can import this module.
 */
export const AUTHED_HINT_COOKIE = "coinzy_authed";

const hintOptions = {
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Set or clear the readable auth hint to match `coinzy_session` lifetime. */
export function setAuthedHintCookie(response: NextResponse, maxAge?: number) {
  response.cookies.set(AUTHED_HINT_COOKIE, "1", {
    ...hintOptions,
    ...(typeof maxAge === "number" ? { maxAge } : {}),
  });
}

export function clearAuthedHintCookie(response: NextResponse) {
  response.cookies.set(AUTHED_HINT_COOKIE, "", { ...hintOptions, maxAge: 0 });
}
