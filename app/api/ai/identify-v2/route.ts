import { NextRequest, NextResponse } from "next/server";
import { identifyCoinV2 } from "@/lib/api/coinzy-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: NextRequest) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, reason: "Invalid request origin." }, 403);
  const token = request.cookies.get("coinzy_session")?.value;
  if (!token) return reply({ error: true, reason: "Sign in to identify coins." }, 401);

  const matchRaw = request.nextUrl.searchParams.get("matchCount");
  const matchCount = Math.min(10, Math.max(1, Number.parseInt(matchRaw ?? "5", 10) || 5));

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply({ error: true, reason: "Invalid upload." }, 400);
  }

  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length !== 2) {
    return reply({ error: true, reason: "Upload exactly two images (obverse and reverse)." }, 400);
  }
  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return reply({ error: true, reason: "File must be an image (jpeg, png, gif)." }, 400);
    }
    if (file.size > 12 * 1024 * 1024) {
      return reply({ error: true, reason: "Each image must be under 12 MB." }, 400);
    }
  }

  const json = await identifyCoinV2(token, files, matchCount);
  if (json.error) {
    const status = json._status >= 500 ? 502 : json._status;
    return reply(
      { error: true, reason: json.reason, aiErrorCode: json.aiErrorCode, resetsAt: json.resetsAt },
      status,
    );
  }
  return reply({ error: false, data: json.data });
}
