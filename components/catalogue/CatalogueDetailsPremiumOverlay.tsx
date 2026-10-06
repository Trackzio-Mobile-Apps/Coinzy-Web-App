import Image from "next/image";
import Link from "next/link";

const A = "/assets/home";

/**
 * Inline Premium gate on catalogue coin tabs — Figma non-premium `1348:137792` (overlay on blurred tab content).
 * Premium state `1341:249499` omits this overlay.
 */
export function CatalogueDetailsPremiumOverlay() {
  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/40 p-4 backdrop-blur-[2px]"
      role="region"
      aria-label="Premium subscription"
    >
      <div
        className="flex w-full max-w-[382px] flex-col items-center gap-4 rounded-[14px] px-6 py-8 text-center text-white shadow-[0_4px_24px_rgba(42,42,42,0.12)]"
        style={{ backgroundImage: "linear-gradient(-64.92deg, #6a65ed 10.107%, #e54a9f 98.516%)" }}
      >
        <Image src={`${A}/premium-crown.svg`} alt="" width={64} height={64} className="size-16" />
        <div className="space-y-2">
          <p className="text-xl font-medium leading-7">Subscribe to Premium</p>
          <p className="text-sm leading-5">Unlock more coin details with Premium.</p>
        </div>
        <Link
          href="/home#premium"
          className="inline-flex h-10 items-center justify-center rounded-[14px] border border-white bg-white px-6 text-base font-medium leading-6 text-primary-500 shadow-[0_0_0_2px_#b155bf] hover:opacity-95"
        >
          Go Premium
        </Link>
      </div>
    </div>
  );
}
