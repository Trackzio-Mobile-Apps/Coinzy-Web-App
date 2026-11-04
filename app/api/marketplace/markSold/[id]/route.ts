import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { markListingSold } from "@/lib/api/marketplace-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Session proxy for Android's delete-listing then update-coin sold flow.
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to manage your listings." }, 401);

  const { id: rawId } = await params;
  const id = rawId?.trim();
  if (!id || id.length > 128 || /[/\\]/.test(id)) {
    return reply({ error: true, reason: "Invalid listing id." }, 400);
  }

  let result;
  try { result = await markListingSold(token, id); }
  catch { return reply({ error: true, reason: "Could not mark listing as sold. Please try again." }, 502); }
  if (result.error) {
    const status = result._status >= 500 ? 502 : result._status;
    return reply({ error: true, reason: result.reason ?? "Could not mark listing as sold." }, status);
  }
  revalidateTag("marketplace-listings");
  revalidatePath("/marketplace");
  revalidatePath("/marketplace/my-listings");
  revalidatePath("/marketplace/all");
  revalidatePath("/collection");
  return reply({ error: false, warning: result.data.warning });
}
