import { NextRequest, NextResponse } from "next/server";
import { COINZY_FEEDBACK_URL } from "@/lib/constants";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Settings feedback → Android `FEEDBACK_BASE_URL` Lambda.
 * Body: `{ name, email, message }` → `{ platform: "Web", domain: "Coins", ... }`.
 */
export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);

  let body: { name?: string; email?: string; message?: string };
  try {
    body = (await request.json()) as { name?: string; email?: string; message?: string };
  } catch {
    return reply({ error: true, reason: "Invalid request body." }, 400);
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";

  if (name.length < 3) return reply({ error: true, reason: "Enter a valid name." }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return reply({ error: true, reason: "Enter a valid email." }, 400);
  if (!message) return reply({ error: true, reason: "Please enter feedback." }, 400);

  try {
    const upstream = await fetch(COINZY_FEEDBACK_URL.replace(/\/?$/, "/"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message, platform: "Web", domain: "Coins" }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    if (!upstream.ok) {
      return reply({ error: true, reason: "Could not send feedback. Please try again." }, upstream.status >= 500 ? 502 : upstream.status);
    }
    return reply({ error: false, message: "Feedback Sent" });
  } catch {
    return reply({ error: true, reason: "Could not send feedback. Please try again." }, 502);
  }
}
