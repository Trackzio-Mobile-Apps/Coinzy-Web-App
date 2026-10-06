import Image from "next/image";
import Link from "next/link";

const A = "/assets/home";

/** Human expert CTA on identify / collection details (Figma `1828:206836`, `1348:175552`). */
export function IdentifyExpertBanner({ subtext = "Want more certainty?" }: { subtext?: string }) {
  return (
    <div className="rounded-xl border border-primary-200 bg-[rgba(246,233,231,0.5)] px-4 py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Image src={`${A}/icon-diploma.svg`} alt="" width={40} height={40} className="shrink-0" />
          <div>
            <p className="text-sm font-medium text-ink">Human Expert Review</p>
            <p className="mt-1 text-sm text-[#49494b]">{subtext}</p>
          </div>
        </div>
        <Link
          href="/home#expert"
          className="inline-flex h-9 shrink-0 items-center justify-center rounded-[10px] border border-primary-500 bg-white px-4 text-sm font-medium text-primary-500"
        >
          Get expert evaluation
        </Link>
      </div>
    </div>
  );
}
