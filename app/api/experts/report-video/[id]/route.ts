import { NextRequest, NextResponse } from "next/server";
import { fetchExpertReport, fetchExpertRequest } from "@/lib/api/experts-session";
import { getSessionToken } from "@/lib/auth/session";

const VIDEO_HOSTS = new Set([
  "firebasestorage.googleapis.com",
  "coinzy-26a4d.firebasestorage.app",
  "coinzy-dev.firebasestorage.app",
  "progresspal-assets.s3.us-west-2.amazonaws.com",
  "trackzio-coins-identifier.s3.us-west-2.amazonaws.com",
]);

/** Stream only the authenticated user's submitted report video, including byte ranges. */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getSessionToken();
  if (!token) return new NextResponse(null, { status: 401 });
  const { id } = await params;
  const result = await fetchExpertRequest(token, id);
  if (!result.ok || !result.body?.data?.request) return new NextResponse(null, { status: result.ok ? 404 : result.status || 502 });
  let videoUrl = result.body.data.request.payload?.media?.video;
  if (!videoUrl) {
    const report = await fetchExpertReport(token, id);
    videoUrl = report.body?.data?.report?.attachments?.find((a) =>
      a.url && (/video/i.test(a.kind || a.type || "") || /(?:\/video\/|\.(?:mp4|mov)(?:\?|$))/i.test(a.url)),
    )?.url;
  }
  if (!videoUrl) return new NextResponse(null, { status: 404 });
  let url: URL;
  try { url = new URL(videoUrl); } catch { return new NextResponse(null, { status: 400 }); }
  if (url.protocol !== "https:" || !VIDEO_HOSTS.has(url.hostname) || url.username || url.password || url.port) {
    return new NextResponse(null, { status: 403 });
  }
  try {
    const headers = new Headers();
    const range = request.headers.get("range");
    if (range && /^bytes=\d*-\d*$/.test(range)) headers.set("range", range);
    const upstream = await fetch(url, { headers, redirect: "error", cache: "no-store", signal: AbortSignal.timeout(20000) });
    if (!upstream.ok && upstream.status !== 206) return new NextResponse(null, { status: 502 });
    const responseHeaders = new Headers({ "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" });
    for (const key of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const value = upstream.headers.get(key);
      if (value) responseHeaders.set(key, value);
    }
    return new NextResponse(upstream.body, { status: upstream.status, headers: responseHeaders });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
