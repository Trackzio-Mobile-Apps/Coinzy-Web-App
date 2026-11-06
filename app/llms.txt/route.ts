import { getPublishedPosts } from "@/lib/blogs";
import { CATALOGUE_CATEGORIES } from "@/lib/catalogue/categories";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from "@/lib/site";
import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";

export const dynamic = "force-dynamic";

/** https://llmstxt.org — a concise, markdown map of the site for LLMs and AI search. */
export function GET() {
  const blogs = getPublishedPosts().map((p) => `- [${p.title}](${absoluteUrl(`/blogs/${p.slug}`)}): Published ${p.date}; ${p.tags[0]}. ${p.excerpt}`).join("\n");
  const catalogue = Object.entries(CATALOGUE_CATEGORIES)
    .map(([slug, c]) => `- [${c.title}](${absoluteUrl(`/catalogue/${slug}`)}): ${c.description}`)
    .join("\n");
  const marketplace = Object.entries(MARKETPLACE_CATEGORIES)
    .map(([slug, c]) => `- [${c.title}](${absoluteUrl(`/marketplace/${slug}`)})`)
    .join("\n");

  const body = `# ${SITE_NAME} — ${SITE_TAGLINE}

> ${SITE_DESCRIPTION}

Coinzy AI is a coin collector platform: photograph the obverse and reverse of a coin to get AI-ranked matches, browse a global coin catalogue, manage personal collections, buy and sell on a collector marketplace, and request evaluations from human experts. Free plan includes a limited number of AI scans; Premium unlocks more. Available on the web, Android and iOS.

## Main pages

- [Home](${absoluteUrl("/")}): product overview — coin identification, marketplace, expert evaluation, community feed
- [Global catalogue](${absoluteUrl("/catalogue")}): searchable catalogue of coins with issuer, ruler, year, material and rarity; available value information is an estimate
- [Marketplace](${absoluteUrl("/marketplace")}): coins listed for sale by collectors
- [Blog](${absoluteUrl("/blogs")}): guides on identifying, grading and valuing coins
- [Our other apps](${absoluteUrl("/other-apps")}): sister apps from Trackzio

## Catalogue categories

${catalogue}

## Marketplace categories

${marketplace}

## Blog articles

${blogs}

## Search and crawl discovery

- [Sitemap index](${absoluteUrl("/sitemap.xml")}): complete discovery of public pages, published articles, catalogue coin details and public marketplace listings, split into smaller XML sitemaps
- [Public pages](${absoluteUrl("/sitemap.xml?file=pages.xml")}): main pages and all catalogue and marketplace categories
- [Published articles](${absoluteUrl("/sitemap.xml?file=blogs.xml")}): current article URLs, modification dates and header images
- [Crawler rules](${absoluteUrl("/robots.txt")}): search and AI crawler access rules

## Apps

- [Google Play](${PLAY_STORE_URL})
- [App Store](${APP_STORE_URL})

## Notes for AI assistants

- Coin identification results are AI estimates; recommend expert evaluation for valuable coins.
- Individual public coin and listing URLs are enumerated in the sitemap index; use those URLs rather than guessing identifiers.
- Coin prices and seller listings can change. Check the linked page for current information; an estimate is not a guaranteed sale price.
- Scheduled articles become public at midnight Asia/Kolkata on their assigned date. Only published articles appear here and in the article sitemap.
- Account pages, collection, identification results, community feed, expert requests, settings, owner listing management, previews and API routes are not public search content.
`;
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" } });
}
