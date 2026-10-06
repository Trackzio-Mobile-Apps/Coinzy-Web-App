import { FallbackImage } from "@/components/ui/FallbackImage";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";

/** Coin photo thumbnail; `null`/broken sources fall back to the placeholder coin. `round` is a circle, `tile` an 8px-radius square. */
export function CoinThumb({
  src,
  size,
  shape = "round",
}: {
  src: string | null;
  size: 40 | 60;
  shape?: "round" | "tile";
}) {
  return (
    <div
      className={`relative shrink-0 overflow-hidden bg-[#f0ebe1] ${shape === "tile" ? "rounded-lg" : "rounded-full"} ${
        size === 60 ? "size-[60px]" : "size-10"
      }`}
    >
      {src ? (
        <FallbackImage
          src={src}
          alt=""
          width={size}
          height={size}
          className={size === 60 ? "size-[60px] object-cover" : "size-10 object-cover"}
          fallback={<CoinPlaceholder size="sm" />}
        />
      ) : (
        <CoinPlaceholder size="sm" />
      )}
    </div>
  );
}

/** Origin / year / estimated price lines under the Coin of the day name (shared by the free and premium panels). */
export function CoinFacts({ origin, year, price }: { origin: string; year: string; price: string }) {
  return (
    <div className="space-y-1 text-xs leading-4 text-muted">
      <p>
        <span className="font-medium">Origin: </span>
        <span className="font-light">{origin}</span>
      </p>
      <p>
        <span className="font-medium">Year of Minting: </span>
        <span className="font-light">{year}</span>
      </p>
      <p>
        <span className="font-medium">Estimated price: </span>
        <span className="font-light">{price}</span>
      </p>
    </div>
  );
}
