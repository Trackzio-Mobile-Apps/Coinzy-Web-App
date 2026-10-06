import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { NavLinks } from "@/components/landing/NavLinks";
import { NAV_LINKS, PLAY_STORE_URL } from "@/lib/constants";

const LOGO = "/assets/landing-page/01-top-nav";

/** 40px AI-scan app icon: coin inside an orange scan frame, "AI" tag and price pill. */
export function LogoMark() {
  return (
    <div
      className="flex size-10 shrink-0 flex-col items-center justify-center gap-[3px] overflow-hidden rounded-[var(--radius-logo)]"
      style={{
        backgroundImage:
          "linear-gradient(-19.12deg, rgb(1, 13, 11) 57.79%, rgb(9, 115, 97) 135.46%)",
      }}
    >
      <div className="relative h-6 w-[28.8px] shrink-0">
        <Image
          src={`${LOGO}/logo-coin-icon.png`}
          alt=""
          width={21}
          height={21}
          className="absolute left-[3.95px] top-[1.41px] h-[21.18px] w-[20.97px] object-cover"
        />
        <Image
          src={`${LOGO}/logo-badge-frame.svg`}
          alt=""
          width={25}
          height={25}
          className="absolute left-[1.96px] top-[-0.3px] h-[24.6px] w-[24.95px]"
        />
        <Image
          src={`${LOGO}/logo-badge-line.svg`}
          alt=""
          width={33}
          height={5}
          className="absolute left-[-2px] top-[10.6px] h-[4.6px] w-[32.8px]"
        />
        <Image
          src={`${LOGO}/logo-badge-scanline.png`}
          alt=""
          width={29}
          height={1}
          className="absolute left-0 top-[12.56px] h-[0.665px] w-[28.8px] mix-blend-overlay"
        />
        <span className="absolute left-[18.83px] top-[17.54px] flex h-[5.54px] w-[8.86px] items-center justify-center rounded-[1px] bg-[#ee8418] text-[4px] font-semibold leading-none text-[#0c2525] shadow-[0.5px_0.5px_6px_0px_rgba(238,132,24,0.45)]">
          AI
        </span>
      </div>
      <span className="flex h-1.5 w-5 items-center justify-center rounded-lg bg-gradient-to-r from-[#081915] to-[#183d34] text-[4px] font-semibold leading-none text-[#79ddb0]">
        $&nbsp;5400
      </span>
    </div>
  );
}

export function TopNav() {
  return (
    <header className="sticky top-0 z-50 border-b-[0.5px] border-border-light bg-cream">
      <Container as="div" className="flex h-16 items-center justify-between gap-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 border-r-[0.5px] border-border-light pr-4 xl:w-[222px] xl:pr-6"
        >
          <LogoMark />
          <div>
            <p className="text-lg font-medium leading-7 text-ink">Coinzy AI</p>
            <p className="text-xs leading-4 text-muted">AI Coin Identifier</p>
          </div>
        </Link>

        <NavLinks />

        <div className="flex items-center gap-3">
          <Link
            href={PLAY_STORE_URL}
            className="hidden items-center justify-center rounded-[var(--radius-button)] border border-[#e5e5e5] bg-white px-4 py-2 text-sm font-medium leading-5 text-[#0a0a0a] transition-colors hover:bg-neutral-50 sm:inline-flex"
          >
            Get app
          </Link>
          <Link
            href="/auth"
            className="inline-flex items-center justify-center rounded-[var(--radius-button)] bg-primary-500 px-3 py-1.5 text-sm font-medium leading-5 text-[#fafafa] transition-colors hover:bg-primary-700"
          >
            Try Coinzy AI
          </Link>
          <details className="group relative lg:hidden">
            <summary
              aria-label="Open menu"
              className="flex size-9 cursor-pointer list-none items-center justify-center rounded-[var(--radius-button)] border border-[#e5e5e5] bg-white [&::-webkit-details-marker]:hidden"
            >
              <span className="flex w-4 flex-col gap-[3px]" aria-hidden>
                <span className="h-[1.5px] rounded bg-ink" />
                <span className="h-[1.5px] rounded bg-ink" />
                <span className="h-[1.5px] rounded bg-ink" />
              </span>
            </summary>
            <nav className="absolute right-0 top-11 flex w-56 flex-col rounded-xl border border-border-light bg-white p-2 shadow-lg">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium leading-5 text-ink hover:bg-black/5"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href={PLAY_STORE_URL}
                className="rounded-lg px-3 py-2 text-sm font-medium leading-5 text-ink hover:bg-black/5 sm:hidden"
              >
                Get app
              </Link>
            </nav>
          </details>
        </div>
      </Container>
    </header>
  );
}
