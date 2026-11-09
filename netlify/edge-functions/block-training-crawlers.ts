/** Keep OpenAI and Anthropic crawlers from downloading optimized images. */
export default (request: Request): Response | undefined => {
  if (new URL(request.url).pathname !== "/_next/image") return;

  const userAgent = request.headers.get("user-agent") ?? "";
  if (/\b(?:GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-SearchBot|Claude-User)\b/i.test(userAgent)) {
    return new Response(null, {
      status: 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
};

// Next.js middleware excludes /_next/image; enforce this at Netlify's edge.
export const config = { path: "/*" };
