/** Restrict known AI bots to the site's llms.txt. */
export default (request: Request): Response | undefined => {
  const userAgent = request.headers.get("user-agent") ?? "";
  const aiBot = /(?:GPTBot|OAI-SearchBot|ChatGPT-User|ClaudeBot|Claude-SearchBot|Claude-User|Claude-Web|anthropic-ai|PerplexityBot|Perplexity-User|Google-Extended|Applebot-Extended|Bytespider|CCBot|Meta-ExternalAgent|cohere-ai|Amazonbot|DuckAssistBot|MistralAI-User)/i.test(userAgent);
  if (aiBot && new URL(request.url).pathname === "/llms.txt") return;
  if (aiBot) {
    return new Response(null, {
      status: 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }
};

export const config = { path: "/*" };
