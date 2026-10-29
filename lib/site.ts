import { APP_STORE_URL, PLAY_STORE_URL } from "@/lib/constants";

/** Canonical origin for SEO files. Set `NEXT_PUBLIC_SITE_URL` in prod; Netlify's `URL` is the fallback. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || process.env.URL || "http://localhost:3000").replace(/\/+$/, "");

export const SITE_NAME = "Coinzy AI";

export const SITE_TAGLINE = "AI Coin Identifier & Collector Platform";

export const SITE_DESCRIPTION =
  "Coinzy AI identifies coins from photos, tracks collections, lists coins on a collector marketplace, and connects you with expert appraisers. Catalogue of 1.5M+ coins.";

/** Public, indexable routes (everything else is behind sign-in). */
export const PUBLIC_PATHS = ["/", "/catalogue", "/marketplace", "/blogs", "/other-apps"] as const;

/** Signed-in / API areas crawlers should skip. */
export const PRIVATE_PATHS = ["/api/", "/auth", "/home", "/identify", "/collection", "/feed", "/experts", "/settings"] as const;

export const SAME_AS = [PLAY_STORE_URL, APP_STORE_URL];

export const absoluteUrl = (path = "/") => `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
