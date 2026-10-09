/**
 * Slick HTTP cards for the `npm run dev` terminal (server only).
 * No-ops in production. Secrets are redacted.
 */

const ENABLED = process.env.NODE_ENV !== "production" && process.env.COINZY_HTTP_LOG !== "0";

const c = {
  reset: "\x1b[0m",
  dim: "\x1b[2m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
  white: "\x1b[37m",
} as const;

let seq = 0;
const WIDTH = 58;
const MAX_BODY = 4_000;

const SENSITIVE_HEADERS = new Set([
  "authorization",
  "cookie",
  "set-cookie",
  "x-api-key",
  "proxy-authorization",
]);

export type HttpLogRequest = {
  label?: string;
  method: string;
  url: string;
  headers?: HeadersInit;
  body?: unknown;
};

export type HttpLogResponse = {
  status: number;
  statusText?: string;
  ms: number;
  body?: unknown;
  error?: string;
};

function rule(kind: string, id: number) {
  const label = ` ${kind} #${id} `;
  const fill = Math.max(0, WIDTH - 2 - label.length);
  return `┌─${label}${"─".repeat(fill)}`;
}

function footer() {
  return `└${"─".repeat(WIDTH - 1)}`;
}

function redactHeader(name: string, value: string): string {
  if (!SENSITIVE_HEADERS.has(name.toLowerCase())) return value;
  const v = value.trim();
  if (/^bearer\s+/i.test(v)) return `Bearer ••••${v.slice(-4)}`;
  return `••••${v.slice(-4)}`;
}

function headersLines(headers?: HeadersInit): string[] {
  if (!headers) return [];
  const h = headers instanceof Headers ? headers : new Headers(headers as HeadersInit);
  const out: string[] = [];
  h.forEach((value, name) => {
    out.push(`│   ${name}: ${redactHeader(name, value)}`);
  });
  return out;
}

function prettyBody(body: unknown): string[] {
  if (body == null || body === "") return ["│   body: (empty)"];
  let text: string;
  if (typeof body === "string") {
    text = body;
  } else if (body instanceof ArrayBuffer) {
    return [`│   body: binary (${body.byteLength} B)`];
  } else {
    try {
      text = JSON.stringify(body, null, 2);
    } catch {
      text = String(body);
    }
  }
  const trimmed = text.trim();
  if (
    (trimmed.startsWith("{") || trimmed.startsWith("[")) &&
    typeof body === "string"
  ) {
    try {
      text = JSON.stringify(JSON.parse(trimmed), null, 2);
    } catch {
      /* keep raw */
    }
  }
  if (text.length > MAX_BODY) {
    text = `${text.slice(0, MAX_BODY)}\n… truncated`;
  }
  return [`│   body (${text.length} chars)`, ...text.split("\n").map((l) => `│   ${l}`)];
}

function paint(line: string): string {
  if (line.startsWith("┌─ REQ")) return `${c.bold}${c.cyan}${line}${c.reset}`;
  if (line.startsWith("┌─ RES")) return `${c.bold}${c.blue}${line}${c.reset}`;
  if (line.startsWith("┌─ FAIL")) return `${c.bold}${c.red}${line}${c.reset}`;
  if (line.startsWith("│ →")) return `${c.bold}${c.white}${line}${c.reset}`;
  if (line.startsWith("│ ✓")) return `${c.bold}${c.green}${line}${c.reset}`;
  if (line.startsWith("│ ↗")) return `${c.bold}${c.yellow}${line}${c.reset}`;
  if (line.startsWith("│ ✗")) return `${c.bold}${c.red}${line}${c.reset}`;
  if (line.includes("Authorization:") || line.includes("Cookie:")) {
    return `${c.dim}${c.magenta}${line}${c.reset}`;
  }
  if (line.startsWith("└")) return `${c.dim}${c.cyan}${line}${c.reset}`;
  return `${c.dim}${line}${c.reset}`;
}

function emit(lines: string[]) {
  if (!ENABLED) return;
  for (const line of lines) {
    // eslint-disable-next-line no-console -- intentional dev terminal HTTP cards
    console.log(paint(line));
  }
}

/** Start a timed request card; call `.done()` / `.fail()` when finished. */
export function httpLogStart(req: HttpLogRequest) {
  if (!ENABLED) {
    return {
      id: 0,
      done: (_res: HttpLogResponse) => {},
      fail: (_err: string, _ms?: number) => {},
    };
  }

  const id = ++seq;
  const label = req.label ? ` [${req.label}]` : "";
  const url = (() => {
    try {
      const u = new URL(req.url);
      return `${u.origin}${u.pathname}${u.search ? `?${redactQuery(u.searchParams)}` : ""}`;
    } catch {
      return req.url;
    }
  })();

  const lines = [
    rule("REQ", id),
    `│ → ${req.method.toUpperCase()}  ${url}${label}`,
    ...headersLines(req.headers),
  ];
  if (req.body !== undefined) lines.push(...prettyBody(req.body));
  lines.push(footer());
  emit(lines);

  return {
    id,
    done(res: HttpLogResponse) {
      const mark = res.status >= 200 && res.status < 300 ? "✓" : res.status < 400 ? "↗" : "✗";
      const out = [
        rule("RES", id),
        `│ ${mark} ${res.status}${res.statusText ? ` ${res.statusText}` : ""}  ·  ${res.ms}ms`,
      ];
      if (res.body !== undefined) out.push(...prettyBody(res.body));
      out.push(footer());
      emit(out);
    },
    fail(err: string, ms = 0) {
      emit([
        rule("FAIL", id),
        `│ ✗ ${err}`,
        `│   after ${ms}ms`,
        footer(),
      ]);
    },
  };
}

function redactQuery(params: URLSearchParams): string {
  const next = new URLSearchParams(params);
  for (const key of [...next.keys()]) {
    if (/token|key|secret|password|auth/i.test(key)) next.set(key, "••••");
  }
  return next.toString();
}

/** Wrap a `fetch` with request/response cards in the dev terminal. */
export async function loggedFetch(
  input: string | URL,
  init: RequestInit & { label?: string; logBody?: unknown } = {},
): Promise<Response> {
  const url = typeof input === "string" ? input : input.toString();
  const method = (init.method || "GET").toUpperCase();
  const started = Date.now();
  const log = httpLogStart({
    label: init.label,
    method,
    url,
    headers: init.headers,
    body: init.logBody,
  });

  try {
    const { label: _l, logBody: _b, ...fetchInit } = init;
    const res = await fetch(url, fetchInit);
    const ms = Date.now() - started;
    const ct = res.headers.get("content-type") || "";
    let body: unknown;
    if (ct.includes("json")) {
      try {
        body = await res.clone().json();
      } catch {
        body = await res.clone().text();
      }
    } else {
      const text = await res.clone().text();
      body = text.length > 200 ? `${text.slice(0, 200)}…` : text;
    }
    log.done({ status: res.status, statusText: res.statusText, ms, body });
    return res;
  } catch (e) {
    log.fail(e instanceof Error ? e.message : String(e), Date.now() - started);
    throw e;
  }
}
