"use client";

import Image from "next/image";
import Link from "next/link";
import type { IdentifyMatch } from "@/lib/identify/types";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";
import { DetailsBreadcrumb } from "@/components/catalogue/DetailsParts";

function matchSubtitle(m: IdentifyMatch) {
  const year = m.yearOfMinting != null ? String(m.yearOfMinting) : "";
  const issuer = m.issuer ?? "";
  return [year, issuer].filter(Boolean).join(" • ");
}

function MatchThumbs({ urls }: { urls: string[] }) {
  const a = urls[0];
  const b = urls[1] ?? urls[0];
  const tile = "relative size-[72px] shrink-0 overflow-hidden rounded-lg border border-[#efefef] bg-white";
  return (
    <div className="flex gap-2">
      {[a, b].map((src, i) => (
        <div key={`${src}-${i}`} className={tile}>
          {src ? (
            <FallbackImage
              src={src}
              alt=""
              fill
              className="object-cover"
              sizes="72px"
              fallback={<CoinPlaceholder className="size-full" />}
            />
          ) : (
            <CoinPlaceholder className="size-full" />
          )}
        </div>
      ))}
    </div>
  );
}

export function IdentifyMatchList({
  matches,
  onPick,
  onTryAgain,
  onReportNoMatches,
}: {
  matches: IdentifyMatch[];
  onPick: (match: IdentifyMatch) => void;
  onTryAgain: () => void;
  onReportNoMatches: () => void;
}) {
  const crumbCurrent = "AI Analysis - Possible top 5 matches";

  return (
    <div className="flex flex-col gap-4">
      <DetailsBreadcrumb ancestors={[{ href: "/identify", label: "Identify coin" }]} current={crumbCurrent} />

      <div className="rounded-2xl border border-[#efefef] bg-white p-4">
        <h2 className="text-lg font-semibold leading-7 text-ink">{crumbCurrent}</h2>

        <ul className="mt-4 flex flex-col gap-3">
          {matches.map((m) => {
            const imgs = m.archetypeImageUrls?.length ? m.archetypeImageUrls : [];
            return (
              <li key={m.archetypeId}>
                <button
                  type="button"
                  onClick={() => onPick(m)}
                  className="flex w-full items-center gap-4 rounded-xl border border-[#efefef] bg-[#fafafa] px-3 py-3 text-left transition hover:border-[#edd2d3] hover:bg-white"
                >
                  <MatchThumbs urls={imgs} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-medium text-ink">{m.name}</p>
                    <p className="mt-0.5 truncate text-sm text-[#87878a]">{matchSubtitle(m)}</p>
                  </div>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#e5e5e5] bg-white">
                    <Image src="/assets/landing-page/icons/shared/arrow-right.svg" alt="" width={16} height={16} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="mt-6 rounded-xl bg-[#f7f1eb] px-4 py-4">
          <h3 className="text-base font-medium text-ink">Still can&apos;t find your coin?</h3>
          <p className="mt-2 text-sm leading-5 text-[#49494b]">
            Let Coinzy AI know. The coin you&apos;re seeing may not be in our database yet — try another photo or tell us
            so we can improve matches.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onTryAgain}
              className="inline-flex h-9 items-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white"
            >
              Try again
            </button>
            <button
              type="button"
              onClick={onReportNoMatches}
              className="inline-flex h-9 items-center rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-ink"
            >
              Report no matches
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-muted">
        <Link href="/catalogue" className="font-medium text-primary-500 hover:underline">
          Browse global catalogue
        </Link>
      </p>
    </div>
  );
}
