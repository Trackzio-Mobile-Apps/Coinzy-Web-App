/** Server fetch logging, installed by instrumentation.ts in dev, build and start.
 * API_LOG=0 disables it; API_LOG_MAX=<chars> optionally caps printed bodies.
 */
const LOGGER = Symbol.for("coinzy.apiLogger");
const MAX = Number(process.env.API_LOG_MAX) > 0 ? Number(process.env.API_LOG_MAX) : Infinity;
const SECRET_KEY = /pass(word)?|token|authorization|credential|secret|cookie|(?:api|admin)[-_]?key|^otp$|^code$/i;
const JWT = /\beyJ[\w-]+\.[\w-]+\.[\w-]+/g;

function mask(value: unknown): unknown {
  if (typeof value === "string") return value.replace(JWT, "[REDACTED]");
  if (value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(mask);
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [
    key, SECRET_KEY.test(key) ? "[REDACTED]" : mask(entry),
  ]));
}

function pretty(value: unknown): string {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch { /* Plain text response. */ }
  }
  const text = typeof value === "string" ? String(mask(value)) : JSON.stringify(mask(value), null, 2);
  const clipped = text.length > MAX ? `${text.slice(0, MAX)}\n… (${text.length - MAX} more chars)` : text;
  return clipped.split("\n").map((line) => `    ${line}`).join("\n");
}

function safeUrl(raw: string): string {
  const url = new URL(raw);
  if (url.username) url.username = "[REDACTED]";
  if (url.password) url.password = "[REDACTED]";
  for (const key of [...url.searchParams.keys()]) {
    if (SECRET_KEY.test(key) || /signature/i.test(key)) url.searchParams.set(key, "[REDACTED]");
  }
  return String(mask(url.href));
}

async function describeBody(init: RequestInit | undefined, input: RequestInfo | URL): Promise<string | null> {
  const body = init?.body;
  if (body == null && input instanceof Request && input.body) {
    const copy = input.clone();
    const type = copy.headers.get("content-type") ?? "";
    if (/multipart\/form-data/i.test(type)) return describeBody({ body: await copy.formData() }, copy.url);
    if (/application\/x-www-form-urlencoded/i.test(type)) return describeBody({ body: new URLSearchParams(await copy.text()) }, copy.url);
    if (/json|text/i.test(type)) return pretty(await copy.text());
    return "    <stream/binary request body>";
  }
  if (body == null) return null;
  if (typeof body === "string") return pretty(body);
  if (body instanceof URLSearchParams) return pretty(Object.fromEntries(body));
  if (body instanceof FormData) {
    return pretty(Object.fromEntries([...body.entries()].map(([key, value]) => [
      key, typeof value === "string" ? value : `<file ${value.name}: ${value.type}, ${value.size} bytes>`,
    ])));
  }
  return `    <${Object.prototype.toString.call(body).slice(8, -1)}>`;
}

export function installApiLogger() {
  const state = globalThis as typeof globalThis & { [LOGGER]?: boolean };
  if (state[LOGGER] || process.env.API_LOG === "0") return;
  state[LOGGER] = true;
  const original = globalThis.fetch;
  let sequence = 0;

  globalThis.fetch = async function loggedFetch(input: RequestInfo | URL, init?: RequestInit) {
    const rawUrl = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    if (!/^https?:\/\//i.test(rawUrl) || /\/_next\//i.test(rawUrl)) return original(input, init);
    const url = safeUrl(rawUrl);
    const method = (init?.method ?? (input instanceof Request ? input.method : "GET")).toUpperCase();
    const id = ++sequence;
    const started = Date.now();
    const requestBody = await describeBody(init, input).catch(() => "    <body unavailable>");
    console.log(`[API #${id}] → ${method} ${url}${requestBody ? `\n  Request:\n${requestBody}` : ""}`);

    try {
      const response = await original(input, init);
      const elapsed = Date.now() - started;
      const type = response.headers.get("content-type") ?? "";
      let body = `    <${type || "binary/stream response"}>`;
      // Never drain event streams or binary downloads for logging.
      if (/json|^text\/(?!event-stream)|xml|x-www-form-urlencoded/i.test(type)) {
        try {
          const text = await response.clone().text();
          body = /x-www-form-urlencoded/i.test(type)
            ? pretty(Object.fromEntries(new URLSearchParams(text))) : pretty(text);
        } catch { body = "    <body unavailable>"; }
      }
      console.log(`[API #${id}] ← ${response.status} ${response.statusText} (${elapsed}ms) ${method} ${url}\n  Response:\n${body}`);
      return response;
    } catch (error) {
      console.log(`[API #${id}] ✖ ${method} ${url} (${Date.now() - started}ms)\n${pretty(error instanceof Error ? error.message : String(error))}`);
      throw error;
    }
  } as typeof fetch;
}
