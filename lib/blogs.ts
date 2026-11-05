/**
 * Blog posts for `/blogs` (Figma 822:23268) and `/blogs/[slug]` (Figma 828:40221).
 * Static content — no CMS/API exists yet. Add a post by appending to `BLOG_POSTS`
 * (image in `public/assets/blogs/`). Body is a list of typed blocks rendered by `ArticleBody`.
 */

export const BLOG_CATEGORIES = [
  "Buy & sell",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "link"; text: string; href: string }
  | { type: "ul"; items: string[] }
  | { type: "table"; head: [string, string, string]; rows: [string, string, string][] }
  | { type: "cta"; title: string; text: string; button: string };

export type BlogAuthor = { name: string; initials: string; bio: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  /** First entry drives category filtering; extra entries are display-only tags (Figma "Analytics"). */
  tags: [BlogCategory, ...string[]];
  /** ISO date (YYYY-MM-DD). */
  date: string;
  image: string;
  /** Article header image (defaults to `image`). */
  heroImage?: string;
  author: BlogAuthor;
  body: BlogBlock[];
};

const COINZY_TEAM: BlogAuthor = {
  name: "Coinzy Editorial Team",
  initials: "CZ",
  bio: "The Coinzy team writes guides on identifying, grading and valuing coins, drawing on the Coinzy AI catalogue of 1.5M+ items and the expert appraisers who review coins through the app.",
};

export const BLOG_POSTS: BlogPost[] = [
  {
    "slug": "how-to-sell-old-coins-safely-in-india",
    "title": "How to Sell Old Coins Safely in India",
    "excerpt": "Learn how to identify old coins, compare offers and avoid common scams when selling coins in India.",
    "tags": [
      "Buy & sell",
      "India"
    ],
    "date": "2026-11-05",
    "image": "/assets/blogs/auction-highlights-jan-2026.webp",
    "author": COINZY_TEAM,
    "body": [
      {
        "type": "p",
        "text": "Old coins can be sold through reputable dealers, auctions, or collector marketplaces after you identify the coin and check comparable completed sales. Take your time: an old date alone does not establish rarity or guarantee a high price."
      },
      {
        "type": "p",
        "text": "Never pay an upfront fee, registration charge, or GST fee to sell your coins. Legitimate buyers pay you, they don't ask you to pay them first."
      },
      {
        "type": "h2",
        "text": "How do you identify an old coin before selling it?"
      },
      {
        "type": "p",
        "text": "Record the denomination, date, visible mint mark, issuing authority, and any distinctive design. Photograph both sides in good light, including the edge if it has lettering or another distinguishing feature. Avoid cleaning or polishing the coin to make the design clearer: surface damage can reduce collector interest and value. The U.S. Mint's coin-care guidance recommends handling coins by their edges and warns that cleaning can reduce their value."
      },
      {
        "type": "p",
        "text": "Compare your notes with a reliable reference for the same issue. Two coins with similar dates or designs may differ in metal, mint mark, variety, or condition. If you cannot identify a mark with confidence, describe the uncertainty instead of guessing."
      },
      {
        "type": "h2",
        "text": "How can you estimate what a coin might sell for?"
      },
      {
        "type": "p",
        "text": "Look for completed sales of the same coin, preferably with clear photographs and a comparable condition. An asking price is what a seller hopes to receive; it does not show that a buyer paid that amount. Auction results can offer useful evidence, but check whether the reported price includes a buyer's premium and remember that a seller may also pay fees."
      },
      {
        "type": "p",
        "text": "Compare several relevant results when available. Unusual errors, proof issues, certification, scratches, cleaning, and authenticity can all change the comparison. If there are no close matches, avoid presenting an arbitrary figure as a reliable valuation. For a potentially valuable or unusual coin, seek an independent expert opinion before accepting an offer."
      },
      {
        "type": "h2",
        "text": "Where can you sell old coins in India?"
      },
      {
        "type": "p",
        "text": "Possible options include established coin dealers, specialist auctions, and collector marketplaces. A dealer may offer a direct purchase; an auction may expose the coin to multiple bidders but can involve a reserve, commissions, and waiting for settlement. A marketplace lets you communicate with buyers directly, which also means you must assess enquiries and arrange payment and delivery yourself."
      },
      {
        "type": "p",
        "text": "Before agreeing to a sale, check the business's identity, contact details, terms, fees, and independent reputation. Ask how the buyer evaluates coins and when you will receive payment. Compare offers on the same basis: the highest headline offer may be less attractive once commissions and other agreed costs are considered."
      },
      {
        "type": "h2",
        "text": "How do you avoid old-coin scams?"
      },
      {
        "type": "p",
        "text": "Be cautious of unsolicited offers that promise an extraordinary price from a photograph, claim a guaranteed buyer, or demand payment to release a sale. The Reserve Bank of India has warned that fraudsters misuse its name and logo while requesting charges, commissions, or taxes for old coins and banknotes; the RBI says it neither conducts those transactions nor authorises others to collect such charges on its behalf."
      },
      {
        "type": "p",
        "text": "Do not share your banking password, one-time password, or payment PIN with a supposed buyer. Verify payment using your own bank or payment app, rather than relying on a screenshot or a message forwarded by the other party. A request to enter a PIN to receive money is a warning sign; the RBI's fraud-awareness guide describes this kind of online marketplace fraud."
      },
      {
        "type": "h2",
        "text": "What should you agree before shipping or meeting?"
      },
      {
        "type": "p",
        "text": "Write down the agreed coin description, price, any fees, payment method, and who bears shipping and insurance costs. Clarify whether the buyer has an inspection or return period and what happens if the coin is disputed. Keep photographs and copies of the correspondence."
      },
      {
        "type": "p",
        "text": "For shipping, use a holder that protects the coin from movement and abrasion, then package it securely without attaching tape to the coin. Check the carrier's rules and insurance exclusions for coins before sending. For an in-person transaction, choose a suitable public location and confirm payment through your own account."
      },
      {
        "type": "h2",
        "text": "When should you ask an expert?"
      },
      {
        "type": "p",
        "text": "Ask an independent expert when a coin may be rare, appears to have an unusual error, has conflicting identification, or attracts an unusually high offer. An expert can help assess identification and condition, but an estimate is not a promise of a sale price. Understand the evaluation fee and service terms before proceeding."
      },
      {
        "type": "h2",
        "text": "What is the safest first step?"
      },
      {
        "type": "p",
        "text": "Start by identifying your coin, documenting its condition, and checking relevant completed sales. Compare reputable buyers and never send money to unlock a supposed purchase. Coinzy's identification tool can help you begin recording what you have; seek expert verification before making a significant sale."
      },
      {
        "type": "h2",
        "text": "Sources and tools"
      },
      {
        "type": "link",
        "text": "U.S. Mint's coin-care guidance",
        "href": "https://www.usmint.gov/content/usmint/us/en/learn/collecting-basics/caring-for-your-coin-collection.html"
      },
      {
        "type": "link",
        "text": "Reserve Bank of India",
        "href": "https://systemhealth.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx_prid%3D51999%281%29.html"
      },
      {
        "type": "link",
        "text": "RBI's fraud-awareness guide",
        "href": "https://systemhealth.rbi.org.in/cms.rbi.org.in/cms/assets/Documents/BEAWARE07032022.pdf"
      },
      {
        "type": "link",
        "text": "identification tool",
        "href": "/identify"
      }
    ]
  },

];

/** Display order = array order (Figma card order). Put new posts at the top of `BLOG_POSTS`. */
export const SORTED_POSTS = BLOG_POSTS;

export const getPost = (slug: string) => BLOG_POSTS.find((p) => p.slug === slug) ?? null;

/** "2026-03-11" → "Mar 11, 2026" (UTC so it never shifts a day). */
export function formatBlogDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** Reading time at ~200 words per minute (Figma shows "12 min read"). */
export function readTime(post: BlogPost): number {
  const words = post.body
    .flatMap((b) =>
      b.type === "ul" ? b.items : b.type === "table" ? [...b.head, ...b.rows.flat()] : b.type === "cta" ? [b.text] : [b.text],
    )
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Up to `n` other posts, same category first. */
export function relatedPosts(post: BlogPost, n = 3): BlogPost[] {
  const others = SORTED_POSTS.filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.tags[0] === post.tags[0]), ...others.filter((p) => p.tags[0] !== post.tags[0])].slice(0, n);
}
