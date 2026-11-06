const MC = "/assets/landing-page/04-marketplace/";
const MORGAN = `${MC}coin-morgan-dollar.webp`;
const FRANKLIN = `${MC}coin-franklin-half-dollar.webp`;
const HYDERABAD = `${MC}coin-hyderabad-one-pice.webp`;
const SPAIN = `${MC}coin-spain-320-reales.webp`;
const PICE = `${MC}coin-british-india-pice.webp`;

export const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.coinzy.trackzio";

/** Coinzy on the Apple App Store (iOS). */
export const APP_STORE_URL =
  "https://apps.apple.com/us/app/coinzy-coin-ai-identification/id6752857760";

export const COINZY_PRIVACY_URL = "https://trackzio.com/privacy-policy-coinzy";
export const COINZY_TERMS_URL = "https://trackzio.com/coinzy%3A-terms";
export const TRACKZIO_ABOUT_URL = "https://trackzio.com/about";

/** Footer social icons (Figma landing footer) — official Trackzio / Coinzy destinations. */
export const FOOTER_SOCIALS = [
  { src: "social-github.svg", label: "GitHub", href: "https://github.com/Trackzio-Mobile-Apps" },
  { src: "social-facebook.svg", label: "Facebook", href: "https://www.facebook.com/Trackzio" },
  { src: "social-twitter.svg", label: "X (Twitter)", href: "https://x.com/trackzio" },
  { src: "social-google.svg", label: "Google Play", href: PLAY_STORE_URL },
] as const;

/** Android `FEEDBACK_BASE_URL` — Settings feedback Lambda (override with `COINZY_FEEDBACK_URL`). */
export const COINZY_FEEDBACK_URL =
  process.env.COINZY_FEEDBACK_URL ||
  "https://msmnafgy53ptj4qqt3oqkk4gpe0pdtic.lambda-url.us-west-2.on.aws/";

export type NavLink = {
  label: string;
  href: string;
  hasDropdown?: boolean;
};

export const NAV_LINKS: NavLink[] = [
  { label: "Identify", href: "/#identify" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Blogs", href: "/blogs" },
  { label: "Our other apps", href: "/other-apps", hasDropdown: true },
];

export const HERO_STATS = [
  { value: "500K+", label: "Downloads" },
  { value: "4.3+★", label: "App rating" },
  { value: "2M+", label: "Coins identified" },
  { value: "50K+", label: "Active collectors" },
] as const;

export const MOBILE_STATS = [
  { value: "1M+", label: "Daily users" },
  { value: "4.3+★", label: "User feedback rating" },
  { value: "1.5M+", label: "Items cataloged" },
  { value: "20K+", label: "Community members" },
] as const;

export const IDENTIFY_RESULT = {
  title: "The 1862 Queen Victoria One Mohur gold coin",
  meta: ["India", "Gold", "11.62 grams"],
  tags: ["MS-63", "NGC", "British India"],
  estimatedValue: "₹ 5,00,000 - ₹ 7,00,000",
  rarity: "Rare",
  condition: "Mint state",
  match: "98% match",
  image: "/assets/landing-page/03-identify-demo/coin-mohur.webp",
} as const;

export const RECENT_SCANS = [
  {
    name: '1911 British India King George V "Pig Rupee" coin',
    value: "₹2,500 - ₹10,000",
    image: "/assets/landing-page/03-identify-demo/scan-pig-rupee.webp",
  },
  {
    name: "1996 Netaji Subhas Chandra Bose",
    value: "₹5,000 - ₹18,000",
    image: "/assets/landing-page/03-identify-demo/scan-netaji.webp",
  },
  {
    name: "1954 One Rupee (Government of India)",
    value: "₹1,000 - ₹5,500+",
    image: "/assets/landing-page/03-identify-demo/scan-one-rupee.webp",
  },
] as const;

export const CATEGORIES = [
  {
    title: "Rare American coins",
    subtitle: "14k+ coins · up to $50,000",
    illustration: "/assets/landing-page/05-browse-catalogue/category-illustration-1.webp",
  },
  {
    title: "Ancient Roman coins",
    subtitle: "8k+ coins · up to $120,000",
    illustration: "/assets/landing-page/05-browse-catalogue/category-illustration-2.webp",
  },
  {
    title: "British & European",
    subtitle: "11k+ coins · up to ₹85,000",
    illustration: "/assets/landing-page/05-browse-catalogue/category-illustration-3.webp",
  },
  {
    title: "Indian heritage coins",
    subtitle: "6k+ coins · up to ₹200,000",
    illustration: "/assets/landing-page/05-browse-catalogue/category-illustration-4.webp",
  },
] as const;

export const INDIA_CATEGORIES = [
  {
    title: "Rare Indian coins",
    subtitle: "4,100 coins · up to $65,000",
    illustration: "/assets/landing-page/05-browse-catalogue/india-rare-indian.webp",
    coin: "/assets/landing-page/05-browse-catalogue/coin-rare-indian.webp",
    href: "/catalogue/rare-indian-coins",
  },
  {
    title: "Mughal coins",
    subtitle: "14k+ coins · up to $50,000",
    illustration: "/assets/landing-page/05-browse-catalogue/india-mughal.webp",
    coin: "/assets/landing-page/05-browse-catalogue/coin-mughal.webp",
    href: "/catalogue/mughal-coins",
  },
  {
    title: "Commemorative Indian coins",
    subtitle: "1,300 coins · up to $1,500",
    illustration: "/assets/landing-page/05-browse-catalogue/india-commemorative.webp",
    coin: "/assets/landing-page/05-browse-catalogue/coin-commemorative.webp",
    href: "/catalogue/commemorative-indian-coins",
  },
  {
    title: "Indian Gold coins",
    subtitle: "2,400 coins · up to $300K",
    illustration: "/assets/landing-page/05-browse-catalogue/india-indian-gold.webp",
    coin: "/assets/landing-page/05-browse-catalogue/coin-indian-gold.webp",
    href: "/catalogue/indian-gold-coins",
  },
] as const;

export const MARKETPLACE_PAGE_CATEGORIES = [
  {
    title: "Roman coins",
    subtitle: "14k+ coins · up to $50,000",
    illustration: "/assets/marketplace/category-roman.webp",
    coin: `${MC}coin-hyderabad-one-pice.webp`,
    wellBg: "#e8d5c4",
  },
  {
    title: "American coins",
    subtitle: "4,100 coins · up to $65,000",
    illustration: "/assets/marketplace/category-american.webp",
    coin: `${MC}coin-franklin-half-dollar.webp`,
    coinClassName: "translate-y-[6.6px]",
    wellBg: "#dfd0b8",
  },
  {
    title: "Wheat pennies",
    subtitle: "1,300 coins · up to $1,500",
    illustration: "/assets/marketplace/category-wheat.webp",
    coin: `${MC}coin-spain-320-reales.webp`,
    wellBg: "#e0ceba",
  },
  {
    title: "Gold coins",
    subtitle: "2,400 coins · up to $300K",
    illustration: "/assets/marketplace/category-gold.webp",
    coin: `${MC}coin-british-india-pice.webp`,
    wellBg: "#d8ccbc",
  },
] as const;

/**
 * Design-asset reference for Figma `1526:304316` (5-up strip). Runtime landing strip uses
 * `loadRandomListings` — do not wire these as pretend-live cards.
 */
export const MARKETPLACE_COINS = [
  {
    title: "Spain 320 Reales 1812",
    price: "₹2,87,486.97",
    image: "/assets/landing-page/04-marketplace/coin-spain-320-reales.webp",
  },
  {
    title: "1958 - Franklin Half Dollar | Mint condition",
    price: "₹26,486.96",
    image: "/assets/landing-page/04-marketplace/coin-franklin-half-dollar.webp",
  },
  {
    title: "1953 One Pice Hyderabad Mint Coin | Rare Indian Bronze Coin",
    price: "₹28,480.61",
    image: "/assets/landing-page/04-marketplace/coin-hyderabad-one-pice.webp",
  },
  {
    title: "British India 1 Pice bronze coin issued in 1944 | King George VI",
    price: "₹35,601.13",
    image: "/assets/landing-page/04-marketplace/coin-british-india-pice.webp",
  },
  {
    title: "1921 United States Morgan Silver Dollar | MS65",
    price: "₹58,860.54",
    image: "/assets/landing-page/04-marketplace/coin-morgan-dollar.webp",
  },
] as const;

export const APPRAISERS = [
  {
    name: "Daniel Chen",
    specialties: ["Ancient coins", "Indian Coins"],
    experience: "12 yrs",
    avatar: "/assets/landing-page/09-expert-evaluation/avatar-daniel-chen.webp",
  },
  {
    name: "John Kim",
    specialties: ["Foreign coins", "Indian Coins"],
    experience: "15 yrs",
    avatar: "/assets/landing-page/09-expert-evaluation/avatar-john-kim.webp",
  },
  {
    name: "Maria Rodriguez",
    specialties: ["American coins", "Indian Coins"],
    experience: "8 yrs",
    avatar: "/assets/landing-page/09-expert-evaluation/avatar-maria-rodriguez.webp",
  },
  {
    name: "Jim Presley",
    specialties: ["Foreign coins", "Indian Coins"],
    experience: "15 yrs",
    avatar: "/assets/landing-page/09-expert-evaluation/avatar-jim-presley.webp",
  },
] as const;

export const FEED_POSTS = [
  {
    title: "1909 S VDB Lincoln cent",
    header: {
      bg: "#f4b183",
      layout: "pair",
      images: ["/assets/landing-page/10-community/post-lincoln-cent-obverse.webp", "/assets/landing-page/10-community/post-lincoln-cent-reverse.webp"],
    },
    excerpt:
      "Set of ten Fire-themed metal coins by Fantasy Coins LLC. These heavy-weight, finely-minted coins are crafted from zinc and nickel with high-relief 3D detailin...",
    likes: 24,
    comments: 8,
    shares: 3,
  },
  {
    title: "Found in grandpa's drawer — what's it worth?",
    header: { bg: "#ebe0db", layout: "banner", images: ["/assets/landing-page/10-community/post-grandpas-drawer.webp"] },
    excerpt:
      "Set of ten Fire-themed metal coins by Fantasy Coins LLC. These heavy-weight, finely-minted coins are crafted from zinc and nickel with high-relief 3D detailin...",
    likes: 42,
    comments: 15,
    shares: 6,
  },
  {
    title: "How to spot a 1955 doubled die penny",
    header: { bg: "#f5ecea", layout: "square", images: ["/assets/landing-page/10-community/post-doubled-die-penny.jpg"] },
    excerpt:
      "Set of ten Fire-themed metal coins by Fantasy Coins LLC. These heavy-weight, finely-minted coins are crafted from zinc and nickel with high-relief 3D detailin...",
    likes: 18,
    comments: 5,
    shares: 2,
  },
] as const;

export const COLLECTION_COINS = [
  { name: "1812 Spanish gold | 320 Reales", image: "/assets/landing-page/04-marketplace/coin-spain-320-reales.webp" },
  {
    name: "1953 One Pice Hyderabad Mint Coin | Rare Indian Bronze Coin",
    image: "/assets/landing-page/04-marketplace/coin-hyderabad-one-pice.webp",
  },
  { name: "1921 United States Morgan Silver Dollar | MS65", image: "/assets/landing-page/04-marketplace/coin-morgan-dollar.webp" },
  // Figma reuses the gold Spanish coin artwork for this entry.
  {
    name: "Roman Empire. Hadrian (AD 117-138). As Roma - Fortuna",
    image: "/assets/landing-page/04-marketplace/coin-spain-320-reales.webp",
  },
  {
    name: "British India 1 Pice bronze coin issued in 1944 | King George VI",
    image: "/assets/landing-page/04-marketplace/coin-british-india-pice.webp",
  },
  { name: "1958 - Franklin Half Dollar | Mint condition", image: "/assets/landing-page/04-marketplace/coin-franklin-half-dollar.webp" },
] as const;

/**
 * Marketplace page rows (Figma 793:77834): live listings from the production marketplace API,
 * newest first. Row 3 was "US gold coins" in Figma; only ~1 real US gold listing exists, so it shows US coins.
 */
export const MARKETPLACE_LISTING_ROWS = [
  { title: "World coins - New listing", variant: "plain", wellClassName: "bg-[#eaeaea]", slug: "world-coins" },
  { title: "Rare coins - New listing", variant: "parchment", wellClassName: "bg-coin-well", slug: "rare-coins" },
  { title: "US coins - New listings", variant: "plain", wellClassName: "bg-coin-well", slug: "us-coins" },
] as const;

export const WEBAPP_FEATURE_BADGES = [
  "🪙 Find coin value",
  "⛶ Identify with ease",
  "🛒 Buy rare coins",
  "💰 Sell rare coins",
  "✅ Get your coins evaluated",
] as const;

/** Marketplace category cards (Figma 1640:30633) → live listing pages `/marketplace/[slug]`. */
export const MARKETPLACE_BROWSE_CATEGORIES = [
  { ...MARKETPLACE_PAGE_CATEGORIES[0], href: "/marketplace/roman-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[1], href: "/marketplace/american-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[2], href: "/marketplace/wheat-pennies" },
  { ...MARKETPLACE_PAGE_CATEGORIES[3], href: "/marketplace/gold-coins" },
] as const;

// ---- Catalogue page (Figma 797:30404) ----

/** "US coins by category" — same art/coins/panels as the marketplace categories, renamed. */
export const CATALOGUE_US_CATEGORIES = [
  { ...MARKETPLACE_PAGE_CATEGORIES[0], title: "Rare American coins", href: "/catalogue/rare-american-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[1], title: "Commemorative coins", href: "/catalogue/commemorative-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[2], title: "Gold coins", href: "/catalogue/us-gold-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[3], title: "Silver coins", href: "/catalogue/us-silver-coins" },
] as const;

/** Coin details page (Figma 902:42254): marketplace art, Figma titles; each card opens its view-all page. */
export const COIN_DETAILS_CATEGORIES = [
  { ...MARKETPLACE_PAGE_CATEGORIES[0], title: "Ancient Roman coins", href: "/catalogue/ancient-roman-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[1], title: "Rare American coins", href: "/catalogue/rare-american-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[2], href: "/catalogue/american-coins" },
  { ...MARKETPLACE_PAGE_CATEGORIES[3], href: "/catalogue/gold-coins" },
] as const;

/** "Indian coins by category" — home-page India cards with per-card panel colours. */
const INDIA_WELLS = ["#dfd0b8", "#e8d5c4", "#e0ceba", "#d8ccbc"];
export const CATALOGUE_INDIA_CATEGORIES = INDIA_CATEGORIES.map((c, i) => ({
  ...c,
  wellBg: INDIA_WELLS[i],
}));

/** "Browse all coins" grid: 3 rows of these 5 coins (Figma placeholder content). */
export const CATALOGUE_COINS = [SPAIN, FRANKLIN, HYDERABAD, PICE, MORGAN].map((image) => ({
  image,
  title: "Roman Empire. Hadrian (AD 117-138). As Roma - Fortuna",
}));
