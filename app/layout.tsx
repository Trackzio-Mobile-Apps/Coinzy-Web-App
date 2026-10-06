import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Coinzy AI — AI Coin Identifier & Collector Platform",
  description:
    "Identify coins instantly, manage collections, buy and sell with confidence, get expert evaluations, and connect with collectors worldwide.",
  openGraph: {
    title: "Coinzy AI — One Platform for Every Coin Collector",
    description:
      "AI-powered coin identification, collection management, marketplace, and expert evaluations.",
    type: "website",
  },
};

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
        {children}
      </body>
    </html>
  );
}
