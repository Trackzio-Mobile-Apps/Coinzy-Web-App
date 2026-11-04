import { NextRequest, NextResponse } from "next/server";
import { resolveCatalogueOrigin } from "@/lib/api/catalogue-origin";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) => NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to delete a collection." }, 401);
  const id = (await params).id.trim();
  if (!id || id.length > 128 || /[/\\]/.test(id)) return reply({ error: true, reason: "Invalid collection ID." }, 400);
  try {
    const response = await fetch(`${resolveCatalogueOrigin()}/api/collections/delete/${encodeURIComponent(id)}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    const result = await response.json().catch(() => ({})) as { error?: boolean; reason?: string; message?: string };
    if (!response.ok || result.error) return reply({ error: true, reason: result.reason || result.message || "Could not delete collection." }, response.ok || response.status >= 500 ? 502 : response.status);
    return reply({ error: false });
  } catch { return reply({ error: true, reason: "Could not delete collection." }, 502); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to rename a collection." }, 401);
  const id = (await params).id.trim();
  if (!id || id.length > 128 || /[/\\]/.test(id)) return reply({ error: true, reason: "Invalid collection ID." }, 400);
  let body: { name?: unknown };
  try { body = await request.json() as { name?: unknown }; }
  catch { return reply({ error: true, reason: "Invalid request body." }, 400); }
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name || name.length > 80) return reply({ error: true, reason: "Enter a collection name (max 80 characters)." }, 400);
  try {
    const response = await fetch(`${resolveCatalogueOrigin()}/api/collections/update/${encodeURIComponent(id)}`, { method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ name }), cache: "no-store" });
    const result = await response.json().catch(() => ({})) as { error?: boolean; reason?: string; message?: string };
    if (!response.ok || result.error) return reply({ error: true, reason: result.reason || result.message || "Could not rename collection." }, response.ok || response.status >= 500 ? 502 : response.status);
    return reply({ error: false });
  } catch { return reply({ error: true, reason: "Could not rename collection." }, 502); }
}
