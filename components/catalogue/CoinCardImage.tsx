"use client";

import { useState } from "react";
import { FallbackImage } from "@/components/ui/FallbackImage";

function ImagePlaceholder({ unavailable = false }: { unavailable?: boolean }) {
  return (
    <div role="img" aria-label={unavailable ? "Coin image unavailable" : "Loading coin image"} className={`absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full bg-coin-well text-muted ${unavailable ? "" : "animate-pulse"}`}>
      <svg aria-hidden="true" width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="13" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="18" cy="18" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" />
      </svg>
      <span className="text-center text-[10px] leading-3">{unavailable ? "Image unavailable" : "Loading image…"}</span>
    </div>
  );
}

/** Keep a visible placeholder until a real photo loads; never substitute another coin. */
export function CoinCardImage({ image, alternativeImages = [], priority = false }: { image: string; alternativeImages?: string[]; priority?: boolean }) {
  const [settled, setSettled] = useState(false);
  return (
    <div className="relative aspect-square w-[136px] max-w-full shrink-0 overflow-hidden rounded-full">
      {!image ? <ImagePlaceholder unavailable /> : (
        <>
          {!settled && <ImagePlaceholder />}
          <FallbackImage
            fallback={<ImagePlaceholder unavailable />}
            fallbackSources={alternativeImages}
            src={image}
            alt=""
            width={136}
            height={136}
            priority={priority}
            onLoad={() => setSettled(true)}
            onError={() => setSettled(true)}
            className={`relative aspect-square h-auto w-full object-cover ${settled ? "" : "opacity-0"}`}
          />
        </>
      )}
    </div>
  );
}
