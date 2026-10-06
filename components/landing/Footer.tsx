import Image from "next/image";
import Link from "next/link";
import { PLAY_STORE_URL } from "@/lib/constants";

const A = "/assets/landing-page/11-footer";

const FOOTER_PAGES = [
  { label: "Marketplace", href: "/marketplace" },
  { label: "Catalogue", href: "/catalogue" },
  { label: "Blogs", href: "/blogs" },
  { label: "Other Apps", href: "/other-apps" },
];

const FOOTER_COMPANY = [
  { label: "About", href: "#" },
  { label: "Privacy Policies", href: "https://trackzio.com/privacy-policy-coinzy", external: true },
  { label: "Terms & Conditions", href: "https://trackzio.com/coinzy%3A-terms", external: true },
];

const SOCIALS = [
  { src: "social-github.svg", label: "GitHub" },
  { src: "social-facebook.svg", label: "Facebook" },
  { src: "social-twitter.svg", label: "Twitter" },
  { src: "social-google.svg", label: "Google" },
];

// Figma footer content is 1140px wide (not the 1120px page column).
const INNER = "mx-auto w-full max-w-[1140px]";

function StoreBadge({ store }: { store: "apple" | "google" }) {
  return (
    <Link
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="flex w-[220px] items-center gap-8 rounded-[var(--radius-badge)] bg-white px-5 py-[7px] text-ink hover:opacity-90"
    >
      {store === "apple" ? (
        <Image src={`${A}/apple-icon.svg`} alt="" width={28} height={34} className="h-[34px] w-[27.686px]" />
      ) : (
        <span className="flex size-[34px] shrink-0 items-center justify-center">
          <Image src={`${A}/google-play-icon.svg`} alt="" width={25} height={30} className="h-[29.8px] w-[24.9px]" />
        </span>
      )}
      <span className="whitespace-nowrap text-left">
        <span className="block text-xs leading-4">Download on the</span>
        <span className="block text-base font-medium leading-6 opacity-[0.92]">
          {store === "apple" ? "App Store" : "Google Play"}
        </span>
      </span>
    </Link>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary-700">
      <div className="px-6 py-[52px]">
        <div className={`${INNER} grid gap-10 md:grid-cols-2 lg:flex lg:items-start lg:justify-between`}>
          <div className="space-y-4 lg:w-[282px]">
            <div className="flex items-center gap-3">
              <Image src={`${A}/logo.png`} alt="Coinzy" width={32} height={32} className="size-8 rounded" />
              <span className="text-xl font-semibold leading-[26px] text-primary-50">Coinzy AI</span>
            </div>
            <p className="text-sm leading-5 text-primary-200">
              Coin valuation, identification, and marketplace platform for collectors worldwide.
            </p>
          </div>

          <div className="space-y-4 lg:w-[117px]">
            <h3 className="text-base font-bold leading-6 text-primary-50">Pages</h3>
            <ul className="space-y-3 text-base leading-6 text-primary-200">
              {FOOTER_PAGES.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="hover:text-primary-50">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold leading-6 text-primary-50">Company</h3>
            <ul className="space-y-3 text-base leading-6 text-primary-200">
              {FOOTER_COMPANY.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="whitespace-nowrap hover:text-primary-50"
                    {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-base font-bold leading-6 text-primary-50">Download Our App</h3>
            <StoreBadge store="apple" />
            <StoreBadge store="google" />
          </div>
        </div>
      </div>

      <div className="border-t border-primary-400 px-6">
        <div className={`${INNER} flex flex-col items-center gap-4 py-4 sm:h-[61px] sm:flex-row sm:gap-6 sm:py-0`}>
          <p className="flex-1 text-base leading-6 text-primary-400">©2025 Coinzy AI/Trackzio</p>
          <div className="flex items-center gap-4">
            {SOCIALS.map((social) => (
              <Link key={social.label} href="#" aria-label={social.label}>
                <Image src={`${A}/${social.src}`} alt="" width={20} height={20} className="size-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
