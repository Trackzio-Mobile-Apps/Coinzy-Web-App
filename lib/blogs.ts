/**
 * Blog posts for `/blogs` (Figma 822:23268) and `/blogs/[slug]` (Figma 828:40221).
 * Static content — no CMS/API exists yet. Add a post by appending to `BLOG_POSTS`
 * (image in `public/assets/blogs/`). Body is a list of typed blocks rendered by `ArticleBody`.
 */

export const BLOG_CATEGORIES = [
  "Identification",
  "Value guides",
  "Rare coins",
  "Collecting",
  "Expert insights",
  "News",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export type BlogBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
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

const A = "/assets/blogs";

const COINZY_TEAM: BlogAuthor = {
  name: "Coinzy Editorial Team",
  initials: "CZ",
  bio: "The Coinzy team writes guides on identifying, grading and valuing coins, drawing on the Coinzy AI catalogue of 1.5M+ items and the expert appraisers who review coins through the app.",
};

const DANIEL_CHEN: BlogAuthor = {
  name: "Daniel Chen",
  initials: "DC",
  bio: "NGC-certified appraiser specialising in ancient and American coins. 12 years appraising for auction houses and private collectors. Available for expert evaluations through Coinzy.",
};

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "how-to-identify-a-1943-copper-penny",
    title: "How to identify a 1943 copper penny",
    excerpt:
      "Learn the subtle differences between the ultra-rare 1943 copper penny and the common steel version — plus how to spot the fakes.",
    tags: ["Identification", "Analytics"],
    date: "2026-03-11",
    image: `${A}/copper-penny-1943.webp`,
    author: COINZY_TEAM,
    body: [
      {
        type: "p",
        text: "In 1943 the U.S. Mint stopped striking cents in bronze. Copper was needed for shell casings and wire, so that year's Lincoln cents were made from zinc-coated steel — the silver-grey \"steelies\" that still turn up in jars and drawers today.",
      },
      {
        type: "p",
        text: "A handful of bronze planchets left over from 1942 were caught in the presses and struck with the 1943 date. Only around twenty genuine 1943 bronze cents are known across the Philadelphia, Denver and San Francisco mints, and they are among the most valuable small coins in American numismatics — which is exactly why so many fakes exist.",
      },
      { type: "h2", text: "Start with the magnet test" },
      {
        type: "p",
        text: "The quickest check is also the most reliable first filter. Steel is magnetic; bronze is not.",
      },
      {
        type: "ul",
        items: [
          "If the coin sticks to a magnet, it is a steel cent — common, even if it looks coppery. Many fakes are simply steel cents plated with copper.",
          "If it does not stick, keep going. A non-magnetic 1943 cent is either a genuine bronze error or an altered date on a later bronze cent.",
          "Use a small, strong magnet and test gently — never scrape or clean the coin.",
        ],
      },
      { type: "h2", text: "Weigh it" },
      {
        type: "p",
        text: "A genuine bronze cent of the era weighs about 3.11 grams. A 1943 steel cent weighs about 2.70 grams. A jeweller's scale accurate to 0.01 g separates them instantly, and it also catches plated steel coins that somehow pass a weak magnet.",
      },
      {
        type: "table",
        head: ["Test", "1943 steel cent", "Genuine 1943 bronze"],
        rows: [
          ["Magnet", "Sticks", "Does not stick"],
          ["Weight", "≈ 2.70 g", "≈ 3.11 g"],
          ["Colour", "Silver-grey (may be dull or rusty)", "Copper-brown, like a 1942 cent"],
        ],
      },
      { type: "h2", text: "Check the date for alterations" },
      {
        type: "p",
        text: "The most common bronze fake is a 1948 cent with the 8 filed into a 3. Under magnification, compare the 3 with a known 1943 steel cent: on genuine coins the tail of the 3 extends below the baseline of the other digits. Altered dates often show tool marks, a flat-bottomed 3, or a 3 that sits too high.",
      },
      {
        type: "cta",
        title: "Try it with Coinzy AI",
        text: "Found a coppery 1943 cent that doesn't stick to a magnet? Take a photo with Coinzy AI to check the date style and mint mark, then request an expert evaluation before you do anything else.",
        button: "Identify your coin free",
      },
      { type: "h2", text: "If you think you have one" },
      {
        type: "p",
        text: "Don't clean it, polish it or test it with chemicals. Store it in an inert holder, note where it came from, and have it authenticated by a major third-party grading service such as PCGS or NGC. Genuine examples have sold for hundreds of thousands of dollars — and for well over a million in the case of the unique 1943-D bronze cent — so authentication is always worth the fee.",
      },
    ],
  },
  {
    slug: "january-2026-auction-highlights",
    title: "January 2026 auction highlights",
    excerpt: "Record-breaking sales, surprise finds, and what's trending in the collector market this month.",
    tags: ["Value guides"],
    date: "2026-01-13",
    image: `${A}/auction-highlights-jan-2026.webp`,
    author: COINZY_TEAM,
    body: [
      {
        type: "p",
        text: "January is traditionally the busiest month of the numismatic calendar. The FUN (Florida United Numismatists) show and its flagship auctions open the year, and the prices realised there set the tone for the market for months.",
      },
      {
        type: "p",
        text: "Rather than chase individual headline lots, this round-up looks at the patterns collectors should take away from the January sales — and how to use auction archives to value coins you already own.",
      },
      { type: "h2", text: "What moved the market" },
      {
        type: "ul",
        items: [
          "Top-population coins. Pieces graded at the very top of their census continue to pull far ahead of coins just one point lower.",
          "Eye appeal over raw grade. Attractively toned and fully lustrous coins regularly outsold technically higher-graded but duller examples.",
          "Certified key dates. Classic keys such as the 1909-S VDB cent and 1916-D dime remained in strong demand in every grade, from circulated to gem.",
          "Gold tracks bullion — mostly. Common-date gold followed the metal price, while scarce dates kept a healthy collector premium.",
        ],
      },
      { type: "h2", text: "How to read an auction result" },
      {
        type: "p",
        text: "A hammer price on its own can mislead. Before you compare a result with your own coin, check three things: the grading service and exact grade, any CAC or similar sticker, and the buyer's premium — most major houses add around 20% on top of the hammer price, and archives usually show the total \"price realised\".",
      },
      {
        type: "table",
        head: ["Check", "Why it matters", "Where to find it"],
        rows: [
          ["Grade + service", "A single point can double or halve the price", "Lot description"],
          ["Stickers / plus grades", "Signal a premium coin for the grade", "Lot photos, title"],
          ["Buyer's premium", "Hammer price understates what was paid", "Price realised"],
        ],
      },
      {
        type: "cta",
        title: "Try it with Coinzy AI",
        text: "Wondering what your coin would fetch? Scan it with Coinzy AI to see grade-by-grade estimated values based on recent market data.",
        button: "Identify your coin free",
      },
      { type: "h2", text: "What to watch next" },
      {
        type: "p",
        text: "Spring auctions will show whether January's strength holds. If you plan to sell, have coins certified early — grading turnaround times tend to lengthen ahead of the big shows.",
      },
    ],
  },
  {
    slug: "top-10-rarest-us-coins-of-the-20th-century",
    title: "Top 10 rarest US coins of the 20th century",
    excerpt:
      "From the 1913 Liberty Head nickel to the 1974 aluminum cent — the coins every serious collector dreams of finding.",
    tags: ["Rare coins"],
    date: "2025-11-11",
    image: `${A}/rarest-us-coins-20th-century.webp`,
    author: COINZY_TEAM,
    body: [
      {
        type: "p",
        text: "Rarity in American coins usually comes from one of three places: tiny mintages, mass melting, or mistakes at the Mint. The ten coins below cover all three — and most of them are known only through a handful of surviving examples.",
      },
      { type: "h2", text: "The list" },
      {
        type: "ul",
        items: [
          "1933 Saint-Gaudens double eagle. Struck but never officially released before gold was recalled; one example is legal to own privately and sold for $18.9 million in 2021.",
          "1913 Liberty Head nickel. Produced without authorisation after the design was replaced; only five are known.",
          "1907 Ultra High Relief double eagle. A sculptural pattern that took multiple press strikes per coin; only about two dozen exist.",
          "1927-D double eagle. Most of the mintage was melted in the 1930s; roughly a dozen survive.",
          "1943 bronze Lincoln cent. Struck on leftover bronze planchets in the year cents were made of steel.",
          "1944 steel Lincoln cent. The reverse error — steel planchets left over from 1943 — is similarly rare.",
          "1974 aluminum cent. Trial pieces struck during a copper shortage and never released; only a few are known.",
          "1916-D Mercury dime. The key to the series, with a mintage of just 264,000.",
          "1909-S VDB Lincoln cent. The designer's initials were removed after a short run; 484,000 were struck in San Francisco.",
          "1955 doubled die obverse cent. A dramatic die error visible to the naked eye on the date and lettering.",
        ],
      },
      { type: "h2", text: "Why some are more attainable than others" },
      {
        type: "p",
        text: "The first four coins are museum-level rarities that trade only a few times per decade. The 1916-D dime, 1909-S VDB cent and 1955 doubled die, on the other hand, exist in the thousands — they are rare relative to demand, so circulated examples come up for sale regularly.",
      },
      {
        type: "table",
        head: ["Coin", "Why it's rare", "Known / minted"],
        rows: [
          ["1913 Liberty Head nickel", "Unauthorised striking", "5 known"],
          ["1927-D double eagle", "Melted in the 1930s", "~12 known"],
          ["1916-D Mercury dime", "Low mintage", "264,000 minted"],
          ["1909-S VDB cent", "Short run, design change", "484,000 minted"],
        ],
      },
      {
        type: "cta",
        title: "Try it with Coinzy AI",
        text: "Think you've found a key date? Scan it with Coinzy AI to check the date, mint mark and variety in seconds.",
        button: "Identify your coin free",
      },
      { type: "h2", text: "Beware of counterfeits" },
      {
        type: "p",
        text: "Every coin on this list is widely counterfeited or altered — added mint marks, re-engraved dates and plated planchets are common. Buy key dates only certified by a major grading service, and treat raw \"finds\" with healthy scepticism until they're authenticated.",
      },
    ],
  },
  {
    slug: "how-to-store-your-coin-collection-safely",
    title: "How to store your coin collection safely",
    excerpt:
      "Best practices for storage — humidity, temperature, materials to avoid, and organisation systems that scale with your collection.",
    tags: ["Collecting"],
    date: "2025-11-11",
    image: `${A}/store-coin-collection.webp`,
    author: COINZY_TEAM,
    body: [
      {
        type: "p",
        text: "Most damage to coins doesn't happen in circulation — it happens in storage. Toning spots, green PVC residue and fingerprints etched into the surface are all avoidable with the right materials and a stable environment.",
      },
      { type: "h2", text: "Control the environment" },
      {
        type: "ul",
        items: [
          "Humidity. Aim for 30–50% relative humidity. Moisture drives corrosion on copper and spotting on silver.",
          "Temperature. Keep it cool and, above all, stable. Avoid attics, basements, garages and exterior walls.",
          "Air. Keep coins away from household chemicals, fresh paint, wood off-gassing and rubber bands — sulphur compounds tone silver quickly.",
          "Silica gel. Add a few packs to boxes and cases, and recharge or replace them regularly.",
        ],
      },
      { type: "h2", text: "Choose the right holders" },
      {
        type: "p",
        text: "The single most important rule: avoid soft PVC flips for anything you plan to keep. Over time PVC breaks down and leaves a sticky green film that can permanently damage a coin's surface.",
      },
      {
        type: "table",
        head: ["Holder", "Best for", "Avoid if"],
        rows: [
          ["Mylar / polyester flips", "Raw coins, everyday storage", "You need airtight protection"],
          ["Hard plastic capsules", "Proofs and high-value raw coins", "Coin size doesn't match the capsule"],
          ["Certified slabs", "Graded coins, resale value", "You want to handle the coin itself"],
          ["Soft PVC flips", "Short-term handling only", "Storage longer than a few weeks"],
        ],
      },
      { type: "h2", text: "Handle with care" },
      {
        type: "p",
        text: "Hold coins by the edge, over a soft surface, with clean dry hands or cotton/nitrile gloves. Never clean a coin to \"improve\" it — cleaning removes original surface and almost always lowers value.",
      },
      {
        type: "cta",
        title: "Try it with Coinzy AI",
        text: "Catalogue your collection as you store it: scan each coin with Coinzy AI to log its identity, grade estimate and value in one place.",
        button: "Identify your coin free",
      },
      { type: "h2", text: "Organise so it scales" },
      {
        type: "p",
        text: "Number every holder and keep a matching inventory with date, mint, grade, purchase price and source. Store high-value pieces in a safe or safe-deposit box, keep photos and the inventory in a separate place, and check whether your home insurance covers collections — most policies need a specific rider.",
      },
    ],
  },
  {
    slug: "the-complete-guide-to-morgan-dollar-values",
    title: "The complete guide to Morgan dollar values",
    excerpt:
      "Mint marks, grades, varieties and the key dates that turn a common silver dollar into a five- or six-figure coin.",
    tags: ["Value guides"],
    date: "2026-02-20",
    image: `${A}/morgan-dollar-values.webp`,
    heroImage: `${A}/rarest-us-coins-20th-century.webp`,
    author: DANIEL_CHEN,
    body: [
      {
        type: "p",
        text: "The Morgan silver dollar is one of the most collected coins in American numismatics — and understanding its value takes more than glancing at a date and mint mark.",
      },
      {
        type: "p",
        text: "Struck from 1878 to 1904 and again in 1921, Morgan dollars carried nearly 27 grams of 90% silver at a time when the U.S. Treasury was buying silver by the ton. That backstory matters — because most Morgans that survive today are common. What makes a specific coin valuable is a narrower story: which mint, which year, which grade, and whether it has any of the varieties collectors chase.",
      },
      {
        type: "p",
        text: "This guide walks through everything that determines a Morgan dollar's value, from mint marks to grading, plus the specific dates every collector should know.",
      },
      { type: "h2", text: "What determines a Morgan dollar's value" },
      {
        type: "p",
        text: "Five factors do most of the work. Get these right and you can price any Morgan within a reasonable range without looking it up.",
      },
      {
        type: "ul",
        items: [
          "Rarity. How many were minted, and how many survived. The 1893-S had the lowest business-strike mintage of the series at 100,000.",
          "Grade. Condition, on the Sheldon 70-point scale. A single grade point can double a coin's value in higher grades.",
          "Mint mark. Five mints struck Morgans — Philadelphia (no mark), San Francisco (S), Carson City (CC), New Orleans (O), and Denver (D, 1921 only).",
          "Variety. Doubled dies, misplaced dates, and other die varieties can command significant premiums over the base coin.",
          "Eye appeal. Toning, luster, and strike quality all affect what a buyer will pay above the raw grade.",
        ],
      },
      { type: "h2", text: "Understanding mint marks" },
      {
        type: "p",
        text: "The mint mark sits on the reverse (tail side) below the wreath, just above the \"D\" and \"O\" of \"DOLLAR.\" No mark means Philadelphia. Carson City coins carry the \"CC\" and are the most collected sub-series — every CC Morgan is worth a premium simply because Carson City's total output across all years was under 14 million coins.",
      },
      {
        type: "cta",
        title: "Try it with Coinzy AI",
        text: "Not sure which mint your Morgan came from? Upload a photo of the reverse and Coinzy AI identifies the mint mark, year, and estimated value in seconds.",
        button: "Identify your coin free",
      },
      { type: "h2", text: "Key dates worth knowing" },
      {
        type: "table",
        head: ["Date & mint", "Why it matters", "Value range"],
        rows: [
          ["1878 8TF", "First-year variety with 8 tail feathers", "$50 – $5,000+"],
          ["1895 (Proof)", "Only 880 proofs struck, no business strikes known", "$30K – $250K+"],
          ["1889-CC", "Rarest Carson City date", "$800 – $500K+"],
          ["1893-S", "Lowest business-strike mintage", "$3,000 – $1M+"],
        ],
      },
      {
        type: "p",
        text: "Ranges run from well-worn to top-condition examples and move with the market — use them as a guide, not a quote.",
      },
      { type: "h2", text: "How to grade a Morgan dollar" },
      {
        type: "p",
        text: "Grading Morgans is where value gets made or lost. A common-date 1881-S in MS-63 is worth $80. In MS-65, the same coin is $200. In MS-67, it's over $2,000. Same coin, same year — three grade points apart.",
      },
      {
        type: "p",
        text: "For a first pass, focus on Liberty's cheek and hair. The cheek is the highest point on the obverse and shows the first signs of contact marks or wear. Under raking light, look for hairlines, bag marks, and any breaks in the luster. Coins with clean cheeks and full luster jump grade brackets fast.",
      },
    ],
  },
  {
    slug: "expert-qa-what-makes-a-coin-mint-state",
    title: 'Expert Q&A: What makes a coin "mint state"?',
    excerpt:
      "What MS-60 through MS-70 really mean, how mint state differs from About Uncirculated, and why one grade point can swing thousands.",
    tags: ["Expert insights"],
    date: "2025-11-11",
    image: `${A}/mint-state-explained.webp`,
    author: COINZY_TEAM,
    body: [
      {
        type: "p",
        text: "\"Mint state\" is one of the most valuable phrases in numismatics — and one of the most misunderstood. We put the questions collectors ask most often to the grading side of the Coinzy team.",
      },
      { type: "h2", text: "What does \"mint state\" actually mean?" },
      {
        type: "p",
        text: "A mint state coin shows no wear from circulation. It may have bag marks, scuffs from coin-to-coin contact at the mint, or a weak strike — but nothing has rubbed metal off its high points. On the Sheldon scale, mint state covers every grade from MS-60 to MS-70.",
      },
      { type: "h2", text: "How is MS-60 different from AU-58?" },
      {
        type: "p",
        text: "An About Uncirculated 58 can look better than an MS-60 at first glance: it may have fewer marks and great eye appeal. The difference is the faint friction on the highest points of an AU coin — a slight break in luster you can see when you tilt it under a light. No friction, however many marks, means mint state.",
      },
      { type: "h2", text: "What separates the grades within mint state?" },
      {
        type: "ul",
        items: [
          "Contact marks. Their number, size and location — marks on the face or in open fields count more than marks hidden in the design.",
          "Luster. How fully the original cartwheel shine survives.",
          "Strike. How completely the design details were brought up when the coin was struck.",
          "Eye appeal. The overall impression, including toning, which can lift or sink a grade.",
        ],
      },
      {
        type: "table",
        head: ["Grade", "Common name", "What to expect"],
        rows: [
          ["MS-60 – 62", "Uncirculated", "No wear, but obvious marks or dull luster"],
          ["MS-63 – 64", "Choice", "Moderate marks, decent luster and eye appeal"],
          ["MS-65 – 66", "Gem", "Few, minor marks; strong luster"],
          ["MS-67 – 70", "Superb gem to perfect", "Virtually flawless; MS-70 shows no flaws at 5× magnification"],
        ],
      },
      { type: "h2", text: "Why can one point swing thousands?" },
      {
        type: "p",
        text: "Because supply thins out sharply at the top. For many common-date coins there are thousands graded MS-63 and only a handful graded MS-67, so collectors chasing the finest examples compete for very few coins. The same date can be worth tens of dollars in one grade and thousands in another.",
      },
      {
        type: "cta",
        title: "Try it with Coinzy AI",
        text: "Unsure whether your coin is mint state or About Uncirculated? Scan it with Coinzy AI for an instant grade estimate, then request an expert evaluation for a second opinion.",
        button: "Identify your coin free",
      },
      { type: "h2", text: "Should I get my coin professionally graded?" },
      {
        type: "p",
        text: "If a coin might grade MS-65 or higher, or it's a key date, certification by PCGS or NGC usually pays for itself — buyers pay a clear premium for a guaranteed grade. For common coins in lower mint state grades, the fee can exceed the value added.",
      },
    ],
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
