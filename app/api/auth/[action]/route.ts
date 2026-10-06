import { NextRequest, NextResponse } from "next/server";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const paths: Record<string, string> = { login: "login", signup: "signup", guest: "guest-login", forgot: "forgot-password", reset: "reset-password" };
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax" as const, path: "/" };
const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest, { params }: { params: Promise<{ action: string }> }) {
  const { action } = await params;
  if (!Object.hasOwn(paths, action)) return reply({ error: true, reason: "Unknown authentication action." }, 404);
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  try {
    const raw = await request.text();
    if (raw.length > 10000) return reply({ error: true, reason: "Request is too large." }, 413);
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object" || Array.isArray(data)) throw new SyntaxError();
    const email = typeof data.email === "string" ? data.email.trim() : "";
    const password = typeof data.password === "string" ? data.password : "";
    if (action !== "guest" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: true, reason: "Enter a valid email address." }, 400);
    if (["login", "signup", "reset"].includes(action) && (!password || (action !== "login" && password.length < 8))) return reply({ error: true, reason: "Enter a valid password." }, 400);
    if (action === "signup" && (typeof data.name !== "string" || !data.name.trim())) return reply({ error: true, reason: "Enter your name." }, 400);
    if (action === "reset" && (typeof data.code !== "string" || !/^\d{6}$/.test(data.code))) return reply({ error: true, reason: "Enter the 6-digit reset code." }, 400);
    const timezone = typeof data.timezone === "string" ? data.timezone.slice(0, 100) : "UTC";
    const language = typeof data.language === "string" ? data.language.slice(0, 30) : "en";
    const guestId = request.cookies.get("coinzy_guest_id")?.value;
    const payload = action === "guest" ? (guestId ? { guestId } : {})
      : action === "signup" ? { email, fullName: data.name.trim(), password, confirmPass: password, timezone, language, ...(guestId ? { guestId } : {}) }
      : action === "reset" ? { email, password, token: data.code }
      : { handle: email, ...(action === "login" ? { password } : {}) };
    const origin = process.env.COINZY_AUTH_API_ORIGIN || process.env.COINZY_API_ORIGIN || "https://coins-api.trackzio.com";
    const upstream = await fetch(`${origin.replace(/\/$/, "")}/auth/${paths[action]}`, {
      method: "POST", headers: { "Content-Type": "application/json", "App-Version": "web-1.0", "X-timezone": timezone, "X-language": language },
      body: JSON.stringify(payload), cache: "no-store", signal: AbortSignal.timeout(15000),
    });
    const result = await upstream.json().catch(() => null);
    if (!upstream.ok || !result || result.error === true) return reply({ error: true, reason: typeof result?.reason === "string" ? result.reason : "Authentication failed. Please try again." }, upstream.ok ? 400 : upstream.status >= 500 ? 502 : upstream.status);
    const session = ["login", "signup", "guest"].includes(action);
    if (session && (typeof result.token !== "string" || !result.token)) return reply({ error: true, reason: "The server did not return a session. Please try again." }, 502);
    const response = reply({ error: false });
    if (session) {
      // JWT stays server-readable only. Persistent cookies never outlive its expiry.
      let maxAge = 86400;
      try { const exp = JSON.parse(Buffer.from(result.token.split(".")[1], "base64url").toString()).exp; if (typeof exp === "number") maxAge = Math.max(0, Math.min(2592000, Math.floor(exp - Date.now() / 1000))); } catch { /* Opaque tokens use the conservative default. */ }
      response.cookies.set("coinzy_session", result.token, { ...cookieOptions, ...(data.remember === true || action === "guest" ? { maxAge } : {}) });
      if (action === "guest" && typeof result.guestId === "string" && result.guestId) response.cookies.set("coinzy_guest_id", result.guestId, { ...cookieOptions, maxAge: 2592000 });
    }
    return response;
  } catch (error) {
    return reply({ error: true, reason: error instanceof SyntaxError ? "Invalid request." : "Unable to reach Coinzy. Please try again." }, error instanceof SyntaxError ? 400 : 502);
  }
}
