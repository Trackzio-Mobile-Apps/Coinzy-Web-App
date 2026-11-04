import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { deleteListing, updateListing } from "@/lib/api/marketplace-session";
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
  revalidateTag("marketplace-listings");
  revalidatePath("/marketplace");
  revalidatePath("/marketplace/my-listings");
  revalidatePath("/marketplace/all");
  return reply({ error: false });
}

/** Only editable listing fields are forwarded; upstream verifies ownership. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to manage your listings." }, 401);
  const id = (await params).id.trim();
  if (!id || id.length > 128 || /[/\\]/.test(id)) return reply({ error: true, reason: "Invalid listing id." }, 400);
  let input: unknown;
  try { input = await request.json(); } catch { return reply({ error: true, reason: "Invalid request body." }, 400); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return reply({ error: true, reason: "Invalid request body." }, 400);
  const raw = input as Record<string, unknown>;
  const fields = ["price", "title", "gradingScale", "gradeValue", "gradingAuthority", "certificationNumber", "strikerType", "cleaningAlterations", "coinCondition", "sellerDetails"];
  if (Object.keys(raw).some((key) => !fields.includes(key))) return reply({ error: true, reason: "Invalid listing field." }, 400);
  if (raw.price !== undefined && (typeof raw.price !== "number" || !Number.isFinite(raw.price) || raw.price <= 0)) return reply({ error: true, reason: "Enter a valid price." }, 400);
  for (const field of fields.slice(1, 7).concat("coinCondition")) if (raw[field] !== undefined && (typeof raw[field] !== "string" || raw[field].length > 1000)) return reply({ error: true, reason: "Invalid listing field." }, 400);
  if (raw.cleaningAlterations !== undefined && (!Array.isArray(raw.cleaningAlterations) || raw.cleaningAlterations.some((item: unknown) => typeof item !== "string"))) return reply({ error: true, reason: "Invalid cleaning details." }, 400);
  if (raw.sellerDetails !== undefined && (!raw.sellerDetails || typeof raw.sellerDetails !== "object" || Array.isArray(raw.sellerDetails))) return reply({ error: true, reason: "Invalid seller details." }, 400);
  try {
    const result = await updateListing(token, id, raw);
    if (result.error) return reply({ error: true, reason: result.reason || "Could not update listing." }, result._status >= 500 ? 502 : result._status);
    revalidateTag("marketplace-listings"); revalidateTag("listing-details");
    revalidatePath("/marketplace"); revalidatePath("/marketplace/my-listings"); revalidatePath("/marketplace/all"); revalidatePath(`/marketplace/my-listing/${id}`); revalidatePath(`/marketplace/listing/${id}`);
    return reply({ error: false });
  } catch { return reply({ error: true, reason: "Could not update listing." }, 502); }
}
