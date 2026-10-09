import Image from "next/image";
import { BuyCreditsButton } from "@/components/experts/BuyCreditsButton";

const A = "/assets/experts";

const TRUST = [
  {
    title: "Secure Payment",
    body: "Credits added to your wallet Instantly",
    // Inline SVG — Figma export is drawn upside-down (+ -rotate-180); file cache kept serving wrong art.
    icon: "shield" as const,
  },
  {
    title: "100% Privacy",
    body: "Your coin data & photos stay confidential",
    icon: `${A}/icon-trust-lock.svg` as const,
  },
  {
    title: "Expert analysis",
    body: "Reviewed by certified numismatists",
    icon: `${A}/icon-trust-check.svg` as const,
  },
];

/** Lucide-style shield: soft top, single point at bottom (reads upright at 20×20). */
function TrustShieldIcon({ className }: { className?: string }) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <path
        d="M20 13c0 5-3.5 7.5-8 10.5C7.5 20.5 4 18 4 13V6l8-3 8 3v7z"
        stroke="#fff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Right rail — Figma `1312:115253` side panel. */
export function ExpertsAside({
  creditBalance,
  onCreditsPurchased,
}: {
  creditBalance: number;
  experts?: unknown;
  onCreditsPurchased?: (creditBalance: number) => void;
}) {
  return (
    <aside className="hidden w-[268px] shrink-0 flex-col gap-4 lg:flex">
      <div className="rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-[16.5px] py-[12.5px]">
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-5 text-[#1e1e1f]">Credits available</p>
            <p className="text-[30px] font-medium leading-9 text-primary-500">{creditBalance}</p>
          </div>
          <div className="relative size-10 shrink-0 p-2.5">
            <Image
              src={`${A}/credit-coin.webp`}
              alt=""
              width={40}
              height={40}
              className="absolute inset-0 size-10 object-contain"
            />
          </div>
        </div>
        <BuyCreditsButton
          variant="outline"
          className="mt-3 flex h-9 w-full items-center justify-center rounded-[10px] border border-primary-500 bg-white text-sm font-medium text-primary-500 hover:bg-primary-50"
          title="Buy credits"
          subtitle="Explore our packs to get the experts evaluation"
          onPurchased={onCreditsPurchased}
        />
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border-[0.5px] border-[#dfdfe0] bg-white px-[16.5px] py-[12.5px]">
        {TRUST.map((item, i) => (
          <div key={item.title}>
            {i > 0 ? <div className="mb-3 h-px w-full bg-[#f0f0f1]" /> : null}
            <div className="flex items-start gap-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#0284c7]">
                {item.icon === "shield" ? (
                  <TrustShieldIcon />
                ) : (
                  <Image
                    src={item.icon}
                    alt=""
                    width={20}
                    height={20}
                    unoptimized
                    className="brightness-0 invert"
                  />
                )}
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-5 text-[#1e1a1a]">{item.title}</p>
                <p className="mt-1 text-xs leading-4 text-[#5c5557]">{item.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
