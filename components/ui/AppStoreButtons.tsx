import Image from "next/image";
import Link from "next/link";
import { PLAY_STORE_URL } from "@/lib/constants";

interface AppStoreButtonsProps {
  variant?: "light" | "dark";
  className?: string;
}

export function AppStoreButtons({
  variant = "light",
  className = "",
}: AppStoreButtonsProps) {
  const buttonClass =
    variant === "light"
      ? "bg-white text-ink"
      : "bg-white/10 text-primary-50 border border-white/20";

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <Link
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-6 rounded-[var(--radius-badge)] px-5 py-[7px] transition-opacity hover:opacity-90 ${buttonClass}`}
      >
        <Image
          src="/assets/landing-page/07-mobile-app/apple-icon.svg"
          alt=""
          width={28}
          height={34}
          className="h-[34px] w-[27.686px]"
        />
        <span className="text-left">
          <span className="block text-xs font-normal leading-4">Download on the</span>
          <span className="block text-base font-medium leading-6 opacity-[0.92]">App Store</span>
        </span>
      </Link>
      <Link
        href={PLAY_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-6 rounded-[var(--radius-badge)] px-5 py-[7px] transition-opacity hover:opacity-90 ${buttonClass}`}
      >
        {/* Figma: 34px icon box, artwork inset 6.18% / 13.37%. */}
        <span className="flex size-[34px] shrink-0 items-center justify-center">
          <Image
            src="/assets/landing-page/07-mobile-app/google-play-icon.svg"
            alt=""
            width={25}
            height={30}
            className="h-[29.8px] w-[24.9px]"
          />
        </span>
        <span className="text-left">
          <span className="block text-xs font-normal leading-4">Download on the</span>
          <span className="block text-base font-medium leading-6 opacity-[0.92]">Google Play</span>
        </span>
      </Link>
    </div>
  );
}
