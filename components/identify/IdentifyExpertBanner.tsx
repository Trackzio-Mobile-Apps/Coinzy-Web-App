import Image from "next/image";
import Link from "next/link";

const A = "/assets/home";

/**
 * Human expert CTA on identify / collection details
 * (Figma `1828:206836`, `1348:175552`, failure `2098:158944`).
 */
export function IdentifyExpertBanner({
  title = "Want more certainty?",
  subtext,
  illustrationSrc = `${A}/icon-diploma.svg`,
  showButtonIcon = false,
}: {
  title?: string;
  subtext?: string;
  illustrationSrc?: string;
  showButtonIcon?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-[#dfdfe0] bg-[#f6e9e7] px-4 py-3">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-9">
        <div className="flex min-w-0 items-center gap-4">
          <Image
            src={illustrationSrc}
            alt=""
            width={52}
            height={52}
            className="size-[52px] shrink-0 rounded-lg object-cover opacity-85 mix-blend-multiply"
          />
          <div className="min-w-0">
            <p className="text-sm font-light leading-5 text-primary-500">Human Expert Review</p>
            <p className="mt-1 text-lg font-medium leading-7 text-ink">{title}</p>
            {subtext ? <p className="mt-2 text-sm leading-5 text-[#49494b]">{subtext}</p> : null}
          </div>
        </div>
        <Link
          href="/experts"
          className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-[10px] border border-primary-500 bg-white px-4 text-sm font-medium text-primary-500"
        >
          {showButtonIcon ? (
            <Image src={`${A}/icon-user-star.svg`} alt="" width={16} height={16} />
          ) : null}
          Get expert evaluation
        </Link>
      </div>
    </div>
  );
}
