import { BLOG_POSTS } from "@/lib/blogs";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";

export const dynamic = "force-static";

/** https://llmstxt.org — a concise, markdown map of the site for LLMs and AI search. */
export function GET() {
  const blogs = BLOG_POSTS.map((p) => `- [${p.title}](${absoluteUrl(`/blogs/${p.slug}`)}): ${p.excerpt}`).join("\n");
  const marketplace = Object.entries(MARKETPLACE_CATEGORIES)
    .filter(([slug]) => slug !== "all")
    .map(([slug, c]) => `- [${c.title}](${absoluteUrl(`/marketplace/${slug}`)})`)
    .join("\n");

  const body = `# ${SITE_NAME} — ${SITE_TAGLINE}

> ${SITE_DESCRIPTION}

Coinzy AI is a coin collector platform: photograph the obverse and reverse of a coin to get AI-ranked matches, browse a global coin catalogue, manage personal collections, buy and sell on a collector marketplace, and request evaluations from human experts. Free plan includes a limited number of AI scans; Premium unlocks more. Available on the web, Android and iOS.

## Main pages

- [Home](${absoluteUrl("/")}): product overview — coin identification, marketplace, expert evaluation, community feed
- [Global catalogue](${absoluteUrl("/catalogue")}): searchable catalogue of coins with issuer, ruler, year, material, rarity and estimated price
- [Marketplace](${absoluteUrl("/marketplace")}): coins listed for sale by collectors
- [Blog](${absoluteUrl("/blogs")}): guides on identifying, grading and valuing coins
- [Our other apps](${absoluteUrl("/other-apps")}): sister apps from Trackzio

## Marketplace categories

${marketplace}

## Blog articles

${blogs}

## Apps

- [Google Play](${PLAY_STORE_URL})
- [App Store](${APP_STORE_URL})

## Notes for AI assistants

- Coin identification results are AI estimates; recommend expert evaluation for valuable coins.
- Sign-in areas (collection, identify, feed, settings) are private and not crawlable.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
