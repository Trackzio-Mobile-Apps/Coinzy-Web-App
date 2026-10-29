import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Plus_Jakarta_Sans } from "next/font/google";
import { JsonLd } from "@/components/seo/JsonLd";
import { absoluteUrl, SAME_AS, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: "/" },
  applicationName: SITE_NAME,
  robots: { index: true, follow: true, googleBot: { "max-snippet": -1, "max-image-preview": "large" } },
  title: "Coinzy AI — AI Coin Identifier & Collector Platform",
  description:
    "Identify coins instantly, manage collections, buy and sell with confidence, get expert evaluations, and connect with collectors worldwide.",
  openGraph: {
    title: "Coinzy AI — One Platform for Every Coin Collector",
    description:
      "AI-powered coin identification, collection management, marketplace, and expert evaluations.",
    type: "website",
    siteName: SITE_NAME,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: "Coinzy AI — AI Coin Identifier", description: SITE_DESCRIPTION },
};

const SITE_JSON_LD = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/icon.png"),
    sameAs: SAME_AS,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/catalogue?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "MobileApplication",
    name: SITE_NAME,
    operatingSystem: "Android, iOS",
    applicationCategory: "LifestyleApplication",
    description: SITE_DESCRIPTION,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${plusJakarta.variable}`}
    >
      <body className="antialiased">
        <JsonLd data={SITE_JSON_LD} />
        <OfflineBanner />
        {children}
      </body>
    </html>
  );
}
