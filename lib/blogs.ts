import additionalPosts from "@/lib/blog-content/posts";
import thumbnailManifest from "@/lib/blog-thumbnails.json";

/**
 * Blog posts for `/blogs` (Figma 822:23268) and `/blogs/[slug]` (Figma 828:40221).
 * Static content — no CMS/API exists yet. Add a post by appending to `BLOG_POSTS`
 * (image in `public/assets/blogs/`). Body is a list of typed blocks rendered by `ArticleBody`.
 */

export const BLOG_CATEGORIES = [
  "Buy & sell",
  "Collecting",
  "Grading & appraisal",
  "Value guides",
  "Errors & varieties",
  "Trading",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogBlock =
  | { type: "faq"; items: { question: string; answer: string }[] }
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
  modifiedDate?: string;
  imageAlt?: string;
  imageCredit?: { title: string; author: string; sourceUrl: string; license: string; licenseUrl: string; modifications: string } | null;
  market?: string;
  contentType?: "reference" | "hub" | "leaf" | "roundup";
  primaryKeyword?: string;
  sources?: string[];
  scheduleNote?: string;
  image: string;
  /** Article header image (defaults to `image`). */
  heroImage?: string;
  author: BlogAuthor;
  body: BlogBlock[];
};

const COINZY_TEAM: BlogAuthor = {
  name: "Coinzy Editorial Team",
  initials: "CZ",
  bio: "The Coinzy team writes guides on identifying, grading and valuing coins, with links to the reference material used. Coin-specific authentication and grading may require an independent expert assessment.",
};

const ARTICLE_POSTS: BlogPost[] = [
  ...additionalPosts,
  {
    "slug": "sheldon-coin-grading-scale-explained",
    "title": "The Sheldon Coin Grading Scale Explained",
    "excerpt": "Understand the 1-to-70 coin grading scale, Mint State, Proof and Details grades, and how to compare coins.",
    "tags": [
      "Grading & appraisal",
      "US"
    ],
    "date": "2026-09-16",
    "image": "/assets/blogs/mint-state-explained.webp",
    "author": COINZY_TEAM,
    "body": [
      {
        "type": "p",
        "text": "The Sheldon coin grading scale is a 1-to-70 system used to describe coin condition. Understanding its grades helps you compare coins and ask better questions, but identification, authenticity and market demand also affect value."
      },
      {
        "type": "h2",
        "text": "What is the Sheldon coin grading scale?"
      },
      {
        "type": "p",
        "text": "The Sheldon scale describes a coin’s condition with a number from 1 to 70. A higher number generally represents better preservation, but a number alone does not identify a coin or guarantee a price. According to NGC, the scale is used alongside descriptions of strike type and, where applicable, other designations."
      },
      {
        "type": "p",
        "text": "A grade describes the particular coin being examined. The date, mint mark, variety, authenticity and market demand still matter when you compare it with another example. A certified grade is a professional opinion under the grading service’s standards, not a promise that the coin will sell for a particular amount."
      },
      {
        "type": "h2",
        "text": "What do circulated coin grades mean?"
      },
      {
        "type": "p",
        "text": "Circulated grades describe coins that show varying degrees of wear. NGC lists examples such as Good at 4 and 6, Fine at 12 and 15, Very Fine at 20, 25, 30 and 35, and Extremely Fine at 40 and 45. These terms help collectors communicate how much detail remains."
      },
      {
        "type": "p",
        "text": "Not every number below 60 is used as a standard grade. A coin’s design also matters: a high point may wear first on one design but look different on another. Compare the coin with reliable examples of the same type rather than applying a generic checklist to every issue."
      },
      {
        "type": "h2",
        "text": "What does About Uncirculated mean?"
      },
      {
        "type": "p",
        "text": "About Uncirculated, commonly abbreviated AU, describes a coin with limited circulation wear. NGC lists AU 50, 53, 55 and 58 within this group. The distinction between a lightly worn coin and one without circulation wear can affect comparisons with auction results."
      },
      {
        "type": "p",
        "text": "Inspect both sides in good light and look at the high points of the design. Marks and original manufacturing characteristics can be confused with wear, so a photograph or an untrained glance may not settle the grade. An expert can help when the distinction would materially affect a purchase or sale."
      },
      {
        "type": "h2",
        "text": "What does Mint State mean?"
      },
      {
        "type": "p",
        "text": "Mint State describes an uncirculated circulation-strike coin, with grades from MS 60 to MS 70. Uncirculated does not mean free from every mark: handling and contact during production or distribution can leave marks on coins that have not circulated."
      },
      {
        "type": "p",
        "text": "NGC defines a Mint State or Proof 70 as having no post-production imperfections visible at five-times magnification. That is a specific grading standard, not a claim that the coin is physically flawless under all possible examination. Read the service’s definitions when comparing labels."
      },
      {
        "type": "h2",
        "text": "Is a Proof coin the same as a Mint State coin?"
      },
      {
        "type": "p",
        "text": "No. Proof refers to a special method of manufacture and presentation, while Mint State is used for qualifying circulation-format strikes. NGC uses PF for Proof and MS for Mint State; the numeric grade describes condition within the relevant designation."
      },
      {
        "type": "p",
        "text": "A Proof coin can have signs of handling or wear. A shiny appearance by itself does not establish that a coin is a Proof, and a high grade does not establish that a coin is rare. Identify the issue and check credible references before comparing prices."
      },
      {
        "type": "h2",
        "text": "What is a Details grade?"
      },
      {
        "type": "p",
        "text": "A Details grade describes a coin whose surface problems prevent a normal numeric grade under the grading service’s rules. NGC gives examples including improper cleaning, holes and certain scratches. The label also identifies the main problem, helping a buyer understand the assessment."
      },
      {
        "type": "p",
        "text": "A Details label is not equivalent to a problem-free coin with the same amount of remaining detail. When reviewing comparable sales, compare the identified problem as well as the date, mint mark and wear. A damaged coin can still be collectible, but its value depends on the particular coin and the market."
      },
      {
        "type": "h2",
        "text": "Should you pay to have a coin graded?"
      },
      {
        "type": "p",
        "text": "Professional grading may be useful when authentication or an independent condition assessment would help a transaction. Compare the expected grading, shipping and insurance costs with the likely benefit, and read the service’s current eligibility, fee and submission rules before sending a coin."
      },
      {
        "type": "p",
        "text": "Grading does not guarantee a particular sale price, and a coin may receive a Details grade or another result you did not expect. For a common low-value coin, costs can outweigh any benefit. Preserve the coin in its existing condition while you research and avoid cleaning it before submitting."
      },
      {
        "type": "h2",
        "text": "How do you use a grade when checking value?"
      },
      {
        "type": "p",
        "text": "First identify the coin and confirm its date, mint mark and variety; then compare completed sales of similar coins with similar grade and surface characteristics. Check whether quoted auction results include the buyer’s premium, and distinguish an asking price from a completed sale."
      },
      {
        "type": "p",
        "text": "If the coin is not certified, treat your own grade as a preliminary description. Compare a range of plausible conditions rather than assuming the best one. For a valuable or unusual item, seek an independent assessment before accepting an offer."
      },
      {
        "type": "link",
        "text": "NGC: Coin Grading Scale",
        "href": "https://www.ngccoin.com/coin-grading/grading-scale/"
      },
      {
        "type": "link",
        "text": "NGC: Coin Grading Process",
        "href": "https://www.ngccoin.com/coin-grading/grading-process/ngc-grading-process.aspx"
      },
      {
        "type": "link",
        "text": "NGC: Details Grading",
        "href": "https://www.ngccoin.com/coin-grading/details-grading/"
      },
      {
        "type": "link",
        "text": "How to Store Coins Safely",
        "href": "/blogs/how-to-store-coins-safely"
      }
    ]
  },
  {
    "slug": "how-to-store-coins-safely",
    "title": "How to Store Coins Safely: A Collector’s Guide",
    "excerpt": "Protect your coin collection with suitable holders, careful handling, dry storage and a practical inventory.",
    "tags": [
      "Collecting",
      "Guide"
    ],
    "date": "2026-11-04",
    "image": "/assets/blogs/store-coin-collection.webp",
    "author": COINZY_TEAM,
    "body": [
      {
        "type": "p",
        "text": "Store coins in suitable holders in a cool, dry place, and handle them by their edges over a soft surface. The right storage protects the coin’s surfaces and keeps its identifying details and documentation together."
      },
      {
        "type": "h2",
        "text": "Why does coin storage matter?"
      },
      {
        "type": "p",
        "text": "A coin’s condition can change when it is exposed to moisture, unsuitable materials, rough handling or frequent temperature changes. Marks and corrosion can affect both its appearance and a collector’s assessment of it. Good storage cannot reverse damage that is already present, but it can reduce avoidable handling and exposure."
      },
      {
        "type": "p",
        "text": "The U.S. Mint recommends protecting coins from fingerprints, keeping them cool and dry, and retaining certificates or other documentation that came with them. Different materials react differently, so an unfamiliar or visibly deteriorating coin may need advice from a qualified conservator."
      },
      {
        "type": "h2",
        "text": "Which coin holder should you choose?"
      },
      {
        "type": "p",
        "text": "Choose a holder that fits the coin without allowing excessive movement. Common options include individual capsules, purpose-made cardboard holders, tubes for compatible coins and albums. Keep original packaging and certificates for sets when possible; they can be relevant to identification and a future sale."
      },
      {
        "type": "p",
        "text": "The U.S. Mint recommends acid-free cardboard and holders free from polyvinyl chloride, commonly called PVC. If a holder is damaged, sticky or poorly suited to the coin, seek appropriate replacement advice. Avoid forcing a coin into a holder that is too small."
      },
      {
        "type": "h2",
        "text": "How should you handle coins?"
      },
      {
        "type": "p",
        "text": "Prepare a clean, soft working surface before removing a coin from its holder. Hold the coin by its edges rather than touching the front or back, and keep drinks, food and loose tools away from the work area. Inspect and photograph it without rubbing the surfaces."
      },
      {
        "type": "p",
        "text": "A magnifier and good light can help you read the date and mint mark, but avoid metal tools that could scratch the coin. Return the coin to its holder promptly after inspection. If a valuable coin is already sealed in a professional holder, consider whether opening it is necessary before doing so."
      },
      {
        "type": "h2",
        "text": "Should you clean a coin before storing it?"
      },
      {
        "type": "p",
        "text": "Avoid polishing or cleaning a collectible coin before you understand its condition and value. The U.S. Mint cautions that cleaning or polishing can reduce value, while rubbing and brushing may scratch the surface. Natural toning can be part of a coin’s appearance; a shiny surface is not automatically more desirable."
      },
      {
        "type": "p",
        "text": "If you suspect active corrosion or a harmful residue, consult a qualified coin conservator before trying chemicals or household cleaning methods. Photograph the problem and describe the coin’s material and storage history so the specialist can advise on next steps."
      },
      {
        "type": "h2",
        "text": "Where should you keep a coin collection?"
      },
      {
        "type": "p",
        "text": "Choose a secure location with stable conditions and low humidity. Avoid places exposed to leaks, condensation or large temperature swings. Keep holders organized so you do not have to repeatedly remove coins just to identify them."
      },
      {
        "type": "p",
        "text": "For a valuable collection, consider the security and insurance arrangements that fit your circumstances. The U.S. Mint suggests checking whether home insurance provides appropriate replacement coverage and notes that a bank safe-deposit box is one possible storage option. Read the actual policy or account terms before relying on either."
      },
      {
        "type": "h2",
        "text": "What should your collection inventory include?"
      },
      {
        "type": "p",
        "text": "Record the denomination, date, mint mark, issuing authority, material where known, holder and purchase details. Keep clear images of both sides and note any existing marks without making unsupported claims about grade or authenticity. Link each record to its certificate or receipt if one exists."
      },
      {
        "type": "p",
        "text": "Review the inventory when you add, move or sell a coin. A record helps you find the correct item, compare references and explain its history to a future buyer or appraiser. Store a backup separately from the physical collection."
      },
      {
        "type": "h2",
        "text": "What should you do next?"
      },
      {
        "type": "p",
        "text": "Start with the coins you handle most often: choose appropriate holders, create a basic inventory and move the collection to a cool, dry place. If you are preparing to sell in India, read our guide to selling safely and verify the buyer before agreeing to a transaction."
      },
      {
        "type": "link",
        "text": "How to sell old coins safely in India",
        "href": "/blogs/how-to-sell-old-coins-safely-in-india"
      },
      {
        "type": "link",
        "text": "U.S. Mint: Caring for Your Coin Collection",
        "href": "https://www.usmint.gov/content/usmint/us/en/learn/collecting-basics/caring-for-your-coin-collection.html"
      },
      {
        "type": "link",
        "text": "U.S. Mint: Get Started Collecting Coins",
        "href": "https://www.usmint.gov/learn/collecting-basics/get-started-collecting-coins"
      }
    ]
  },
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

/** Generated artwork is shared by cards, article headers and social metadata. */
export const BLOG_POSTS: BlogPost[] = ARTICLE_POSTS.map((post) => {
  const thumbnail = thumbnailManifest[post.slug as keyof typeof thumbnailManifest];
  return thumbnail ? { ...post, image: thumbnail.image, heroImage: thumbnail.heroImage, imageAlt: thumbnail.imageAlt, imageCredit: thumbnail.photoCredit } : post;
});

/** Scheduled dates roll over at midnight in India, regardless of server timezone. */
export function publishedBlogDate(now = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
}

export function getPublishedPosts(now = new Date()): BlogPost[] {
  const today = publishedBlogDate(now);
  return BLOG_POSTS.filter((post) => /^\d{4}-\d{2}-\d{2}$/.test(post.date) && post.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export const getPost = (slug: string, now = new Date()) => getPublishedPosts(now).find((p) => p.slug === slug) ?? null;

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
      b.type === "faq" ? b.items.flatMap((item) => [item.question, item.answer]) : b.type === "ul" ? b.items : b.type === "table" ? [...b.head, ...b.rows.flat()] : b.type === "cta" ? [b.text] : [b.text],
    )
    .join(" ")
    .split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Up to `n` other posts, same category first. */
export function relatedPosts(post: BlogPost, n = 3): BlogPost[] {
  const others = getPublishedPosts().filter((p) => p.slug !== post.slug);
  return [...others.filter((p) => p.tags[0] === post.tags[0]), ...others.filter((p) => p.tags[0] !== post.tags[0])].slice(0, n);
}
