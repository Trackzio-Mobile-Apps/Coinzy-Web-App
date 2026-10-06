import Image from "next/image";
import Link from "next/link";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { FallbackImage } from "@/components/ui/FallbackImage";

/** Shared by the catalogue coin page (Figma 797:35810) and the marketplace listing page (843:15466). */

const ICONS = "/assets/catalogue";
const DETAIL_ICONS = "/assets/coin-details";

type Crumb = { href: string; label: string };

/**
 * Figma breadcrumb (797:38514): back button → last ancestor; ancestors, with the first collapsed to "…"
 * when there are two or more (as in Figma); current page in Plus Jakarta bold 18px.
 */
export function DetailsBreadcrumb({ ancestors, current }: { ancestors: Crumb[]; current: string }) {
  const parent = ancestors[ancestors.length - 1];
  const collapsed = ancestors.length > 1;
  const separator = (className = "") => (
    <Image src={`${ICONS}/icon-breadcrumb-separator.svg`} alt="" width={24} height={24} className={className} />
  );
  return (
    <div className="flex items-center gap-5">
      <Link
        href={parent.href}
        aria-label={`Back to ${parent.label}`}
        className="flex shrink-0 rounded border-[0.5px] border-[#c2c2c4] bg-white p-1 hover:bg-neutral-50"
      >
        <Image src={`${ICONS}/icon-breadcrumb-back.svg`} alt="" width={24} height={24} />
      </Link>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-2">
        {ancestors.map((crumb, i) =>
          collapsed && i === 0 ? (
            <span key={crumb.href} className="contents">
              <Link href={crumb.href} aria-label={crumb.label} className="shrink-0">
                <Image src={`${DETAIL_ICONS}/icon-more-horizontal.svg`} alt="" width={24} height={24} />
              </Link>
              {separator()}
            </span>
          ) : (
            <span key={crumb.href} className={collapsed ? "hidden sm:contents" : "contents"}>
              <Link href={crumb.href} className="shrink-0 text-base leading-6 text-primary-500 underline">
                {crumb.label}
              </Link>
              {separator()}
            </span>
          ),
        )}
        <span aria-current="page" className="truncate font-jakarta text-lg font-bold leading-none text-ink">
          {current}
        </span>
      </nav>
    </div>
  );
}

/** Obverse/reverse photo column: 150px tiles, placeholder coin when missing or broken. */
export function CoinPhotos({ images, title }: { images: string[]; title: string }) {
  const placeholder = (
    <div className="flex size-full items-center justify-center">
      <CoinPlaceholder size="lg" />
    </div>
  );
  const tile = "relative size-[150px] overflow-hidden rounded-lg border border-[#efefef] bg-coin-well shadow-md";
  const photos = images.slice(0, 2);
  return (
    <div className="flex shrink-0 gap-3 sm:w-[150px] sm:flex-col">
      {photos.length ? (
        photos.map((src, i) => (
          <div key={src} className={tile}>
            <FallbackImage
              fallback={placeholder}
              src={src}
              alt={`${title} — ${i === 0 ? "obverse" : "reverse"}`}
              fill
              sizes="150px"
              priority
              className="object-cover"
            />
          </div>
        ))
      ) : (
        <div className={tile}>{placeholder}</div>
      )}
    </div>
  );
}
