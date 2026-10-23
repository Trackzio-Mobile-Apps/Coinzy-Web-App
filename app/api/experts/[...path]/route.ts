import { NextRequest, NextResponse } from "next/server";
import { expertsApiOrigin } from "@/lib/api/experts-session";
import { isAllowedAuthOrigin } from "@/lib/auth/origin";
import { getSessionToken } from "@/lib/auth/session";
import { httpLogStart } from "@/lib/dev/httpLog";

const reply = (body: object, status = 200) =>
  NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });

/** Allowlisted mobile-user Experts paths (Android `ExpertsApiService`). */
const ALLOWED = [
  /^users\/me$/,
  /^users\/me\/credits$/,
  /^users\/experts$/,
  /^users\/requests$/,
  /^users\/requests\/[^/]+$/,
  /^users\/requests\/[^/]+\/retry$/,
  /^users\/requests\/[^/]+\/report$/,
  /^users\/feedback$/,
  /^users\/uploads$/,
] as const;

function pathOk(path: string) {
  return ALLOWED.some((re) => re.test(path));
}

async function proxy(request: NextRequest, pathParts: string[]) {
  if (!isAllowedAuthOrigin(request)) return reply({ error: true, message: "Invalid request origin." }, 403);
  const token = await getSessionToken();
  if (!token) return reply({ error: true, message: "Sign in required." }, 401);

  const joined = pathParts.join("/");
  if (!pathOk(joined)) return reply({ error: true, message: "Unknown experts action." }, 404);

  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  const upstreamUrl = `${expertsApiOrigin()}/${joined}${qs ? `?${qs}` : ""}`;

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  headers.set("App-Version", "web-1.0");

  let body: BodyInit | undefined;
  const method = request.method.toUpperCase();
  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("multipart/form-data")) {
      // Preserve boundary — re-wrapping FormData can drop the original Content-Type.
      headers.set("Content-Type", contentType);
      body = await request.arrayBuffer();
    } else {
      headers.set("Content-Type", "application/json");
      body = await request.text();
    }
  }

  const logBody =
    typeof body === "string"
      ? body
      : body instanceof ArrayBuffer
        ? body
        : undefined;
  const log = httpLogStart({
    label: "experts",
    method,
    url: upstreamUrl,
    headers,
    body: logBody,
  });
  const started = Date.now();

  try {
    const upstream = await fetch(upstreamUrl, {
      method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(method === "POST" && joined === "users/uploads" ? 60000 : 20000),
    });
    const text = await upstream.text();
    const parsed = (() => {
      try {
        return JSON.parse(text) as object;
      } catch {
        return { error: true, message: "Invalid response from Experts API." };
      }
    })();
    log.done({
      status: upstream.status,
      statusText: upstream.statusText,
      ms: Date.now() - started,
      body: parsed,
    });
    return NextResponse.json(parsed, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch (e) {
    log.fail(e instanceof Error ? e.message : "Unable to reach Experts API.", Date.now() - started);
    return reply({ error: true, message: "Unable to reach Experts API." }, 502);
  }
}

type Ctx = { params: Promise<{ path: string[] }> };

export async function GET(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}

export async function POST(request: NextRequest, ctx: Ctx) {
  const { path } = await ctx.params;
  return proxy(request, path);
}
