/** Stop the high-volume crawlers before serving pages, optimized images or static assets. */
export default (request: Request): Response | undefined => {
  // Let crawlers discover the disallow rules even when other requests are blocked.
  if (new URL(request.url).pathname === "/robots.txt") return;

  const userAgent = request.headers.get("user-agent") ?? "";
  if (/\b(?:GPTBot|ClaudeBot)\b/i.test(userAgent)) {
    return new Response(null, {
      status: 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
};

// Next.js middleware excludes /_next/image and static assets; enforce this at Netlify's edge.
export const config = { path: "/*" };
