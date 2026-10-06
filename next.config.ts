import type { NextConfig } from "next";

const DAY = 60 * 60 * 24;

const nextConfig: NextConfig = {
  outputFileTracingRoot: process.cwd(),
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "progresspal-assets.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "coins-api-prod.trackzio.com",
      },
      // Catalogue archetype photos (us-east-1). Some are served as binary/octet-stream;
      // the optimizer sniffs the real type from the bytes, so they still work.
      {
        protocol: "https",
        hostname: "trackzio-coinzy-archetypes-images-v3.s3.amazonaws.com",
      },
      // Marketplace listing photos (seller uploads, production backend).
      {
        protocol: "https",
        hostname: "trackzio-coins-identifier.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "en.numista.com",
        pathname: "/catalogue/photos/**",
      },
    ],
    // Coin photos never change under the same URL: keep optimized copies (.next/cache/images
    // on the server, and in browsers via Cache-Control) for 30 days instead of the 60s default.
    minimumCacheTTL: 30 * DAY,
  },
  async headers() {
    return [
      {
        // Static design assets in public/. Not `immutable`: files are sometimes replaced
        // under the same name, so allow a day fresh + a week of background revalidation.
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: `public, max-age=${DAY}, stale-while-revalidate=${7 * DAY}` }],
      },
    ];
  },
};

export default nextConfig;
