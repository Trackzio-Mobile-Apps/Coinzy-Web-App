import { NextRequest, NextResponse } from "next/server";
import { expertsApiOrigin, fetchExpertsProfile } from "@/lib/api/experts-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";
import { getSessionToken } from "@/lib/auth/session";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/**
 * Socket.IO handshake config — Android `ExpertsSocketManager`:
 * URL = Experts REST host; auth = `{ userId }` from `GET /users/me` (Mongo `_id`, not JWT).
 */
export async function GET(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, message: "Invalid request origin." }, 403);
  const token = await getSessionToken();
  if (!token) return reply({ error: true, message: "Sign in required." }, 401);

  const profile = await fetchExpertsProfile(token);
  const user = profile.body?.data?.user;
  const userId = (user?.id || user?._id || "").trim();
  if (!profile.ok || profile.body?.error || !userId) {
    return reply(
      { error: true, message: profile.body?.message || "Could not resolve Experts user id." },
      profile.status || 502,
    );
  }

  return reply({
    error: false,
    data: {
      url: expertsApiOrigin(),
      userId,
    },
  });
}
