import { NextRequest, NextResponse } from "next/server";
import { deleteListing } from "@/lib/api/marketplace-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Session proxy — `DELETE /marketplace/listing/delete/:id` on the marketplace host. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to manage your listings." }, 401);

  const { id: rawId } = await params;
  const id = rawId?.trim();
  if (!id || id.length > 128 || /[/\\]/.test(id)) {
    return reply({ error: true, reason: "Invalid listing id." }, 400);
  }

  const result = await deleteListing(token, id);
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not remove listing." }, status);
  }
  return reply({ error: false });
}
