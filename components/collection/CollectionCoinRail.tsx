import Image from "next/image";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import type { ReactNode } from "react";

const DETAIL_ICONS = "/assets/coin-details";

/** Right rail on collection coin details (Figma `1348:175552`). */
export function CollectionCoinRail({
  databaseImages,
  title,
  footer,
}: {
  databaseImages: string[];
  title: string;
  /** Add for Sale CTA or listed seller panel (Figma `1349:142237`). */
  footer?: ReactNode;
}) {
  const photos = databaseImages.slice(0, 2);
  const tile = "relative aspect-square flex-1 overflow-hidden rounded-lg border border-[#efefef] bg-coin-well";

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 sm:flex-row lg:w-[268px] lg:flex-col">
      <div className="flex w-full flex-col gap-3 rounded-2xl bg-white px-4 py-3">
        <h2 className="text-sm font-medium leading-5 text-ink">Database image</h2>
        <div className="flex gap-2">
          {photos.length ? (
            photos.map((src, i) => (
              <div key={`${src}-${i}`} className={tile}>
                <FallbackImage
                  src={src}
                  alt={`${title} — database ${i === 0 ? "obverse" : "reverse"}`}
                  fill
                  sizes="120px"
                  className="object-contain p-2"
                  fallback={<CoinPlaceholder className="size-full" />}
                />
              </div>
            ))
          ) : (
            <>
              <div className={tile}><CoinPlaceholder className="size-full" /></div>
              <div className={tile}><CoinPlaceholder className="size-full" /></div>
            </>
          )}
        </div>
        {footer}
      </div>

      <div className="flex w-full flex-col items-center gap-3 self-start rounded-2xl bg-white px-4 py-3 lg:w-[268px]">
        <p className="w-full text-sm font-medium leading-5 text-ink">Scan to download Coinzy AI</p>
        <p className="w-full text-xs leading-4 text-muted">
          Identify coins instantly and sync your collection across devices.
        </p>
        <div className="flex w-full justify-center px-5 py-[7px]">
          <Image
            src={`${DETAIL_ICONS}/qr-coinzy.png`}
            alt="QR code to download the Coinzy AI app"
            width={154}
            height={142}
          />
        </div>
      </div>
    </aside>
  );
}
