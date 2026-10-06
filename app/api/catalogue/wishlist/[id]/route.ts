import { NextRequest, NextResponse } from "next/server";
import { CoinzyApiError, isArchetypeId } from "@/lib/api/coinzy";
import { addArchetypeToWishlist, removeArchetypeFromWishlist } from "@/lib/api/coinzy-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return mutate(request, await params, "add");
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return mutate(request, await params, "remove");
}

async function mutate(request: NextRequest, { id }: { id: string }, action: "add" | "remove") {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  if (!isArchetypeId(id)) return reply({ error: true, reason: "Invalid coin id." }, 400);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to use your wishlist." }, 401);
  try {
    if (action === "add") await addArchetypeToWishlist(id, token);
    else await removeArchetypeFromWishlist(id, token);
    return reply({ error: false, isWishlisted: action === "add" });
  } catch (error) {
    if (error instanceof CoinzyApiError) {
      const match = error.message.match(/failed \(\d+\): (.+)$/);
      const status = error.status >= 500 ? 502 : error.status;
      return reply({ error: true, reason: match?.[1] ?? "Wishlist update failed." }, status);
    }
    return reply({ error: true, reason: "Wishlist update failed." }, 502);
  }
}
