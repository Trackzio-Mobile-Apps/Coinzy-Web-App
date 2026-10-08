import Image from "next/image";
import Link from "next/link";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { collectionCardSubtitle } from "@/lib/collection/recentLabel";

const CLOCK = "/assets/home/icon-clock.svg";

export type CollectionHomeCardProps = {
  href: string;
  title: string;
  count: number;
  images: string[];
  /** Latest activity timestamp for the footer line. */
  lastUpdatedAt?: string | null;
  /** Empty private-style stack (Figma muted placeholders). */
  muted?: boolean;
};

/** Overview tile on `/collection` (Figma `768:100034` / `1341:262557`). */
export function CollectionHomeCard({
  href,
  title,
  count,
  images,
  lastUpdatedAt,
  muted = false,
}: CollectionHomeCardProps) {
  const subtitle = collectionCardSubtitle(count, lastUpdatedAt);
  const visible = images.slice(0, 4);
  const overflow = count > visible.length ? count - visible.length : 0;
  const tile = "relative size-[84px] shrink-0 overflow-hidden rounded-full border-2 border-white bg-[#d9d9d9]";

  return (
    <Link
      href={href}
      className={`flex w-full min-w-0 max-w-[411px] flex-col items-center gap-8 rounded-xl border border-[#e7e7e7] bg-white px-4 py-3 transition-colors hover:border-[#dfdfe0] ${muted ? "opacity-100" : ""}`}
    >
      <div className={`flex items-start ${muted && count === 0 ? "opacity-30" : ""}`}>
        {count === 0 ? (
          <>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`${tile} ${i > 0 ? "-ml-9" : ""}`} />
            ))}
            <span className="-ml-9 flex size-[84px] shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#989898] text-sm font-medium text-white">
              0
            </span>
          </>
        ) : (
          <>
            {visible.map((src, i) => (
              <span key={`${src}-${i}`} className={`${tile} ${i > 0 ? "-ml-9" : ""}`}>
                <FallbackImage src={src} alt="" fill className="object-cover" sizes="84px" fallback={<CoinPlaceholder className="size-full" />} />
              </span>
            ))}
            {overflow > 0 && (
              <span className="-ml-9 flex size-[84px] shrink-0 items-center justify-center rounded-full border-2 border-white bg-[#989898] text-sm font-medium text-white">
                {overflow}
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex w-full items-center justify-between gap-3">
        <p className="text-base font-medium leading-6 text-ink">{title}</p>
        <div className="flex shrink-0 items-center gap-1">
          <Image src={CLOCK} alt="" width={16} height={16} className="size-4 shrink-0" />
          <p className="whitespace-nowrap text-xs leading-4 text-[#606062]">{subtitle}</p>
        </div>
      </div>
    </Link>
  );
}
