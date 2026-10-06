import Image from "next/image";
import Link from "next/link";
import { authHref } from "@/lib/auth/returnTo";

/**
 * "Want to sell your coin?" bar (Figma 1715:31687; same on home 1526:304316): 24px radius,
 * 12% wine border, tag badge, fixed 260.586px text block + 240px gap, outline "List a coin".
 * Logged-out visitors go to sign-in (pop-up flow pending Figma 905:38801).
 */
export function SellBar({
  className = "",
  /** Where to send the user after sign-in; defaults to `/marketplace`. */
  returnAfterAuth = "/marketplace",
}: {
  className?: string;
  returnAfterAuth?: string;
}) {
  const listHref = authHref(undefined, returnAfterAuth);
  return (
    <div
      className={`flex flex-col items-start gap-6 rounded-[var(--radius-card)] border border-primary-500/[0.12] bg-white px-6 py-5 lg:flex-row lg:gap-[240px] ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-inner)] bg-neutral-50">
          <Image
            src="/assets/landing-page/04-marketplace/icon-tag.svg"
            alt=""
            width={22}
            height={22}
            className="size-[21.5px]"
          />
        </div>
        {/* Figma fixes this block at 260.586px; the subtext overflows it, which sets the bar width. */}
        <div className="space-y-1 lg:w-[260.586px]">
          <p className="text-base font-medium leading-6 text-ink">Want to sell your coin?</p>
          <p className="pt-0.5 text-sm leading-5 text-muted lg:whitespace-nowrap">
            Turn your collection into cash — list a coin in under 2 minutes.
          </p>
        </div>
      </div>
      <Link
        href={listHref}
        className="shrink-0 rounded-[var(--radius-button)] border border-primary-500 bg-white px-3 py-1.5 text-sm font-medium leading-5 text-primary-500 hover:bg-primary-50"
      >
        List a coin
      </Link>
    </div>
  );
}
