import type { MetadataRoute } from "next";
import { absoluteUrl, PRIVATE_PATHS, SITE_URL } from "@/lib/site";

/** Public pages are crawlable; OpenAI and Anthropic bots cannot access optimized images. */
const IMAGE_BLOCKED_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",
  "ClaudeBot", "Claude-User", "Claude-SearchBot",
];

const AI_BOTS = [
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "Meta-ExternalAgent",
  "cohere-ai",
  "Amazonbot",
  "DuckAssistBot",
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  const disallow = [...PRIVATE_PATHS];
  return {
    rules: [
      { userAgent: IMAGE_BLOCKED_BOTS, allow: ["/", "/llms.txt", "/sitemap.xml"], disallow: [...disallow, "/_next/image"] },
      { userAgent: "*", allow: "/", disallow },
      { userAgent: AI_BOTS, allow: ["/", "/llms.txt", "/sitemap.xml"], disallow },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
