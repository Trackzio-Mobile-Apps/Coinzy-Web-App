"use client";

import Image from "next/image";
import Link from "next/link";
import type { IdentifyMatch } from "@/lib/identify/types";
import { FallbackImage } from "@/components/ui/FallbackImage";
import { CoinPlaceholder } from "@/components/ui/CoinPlaceholder";

function matchSubtitle(m: IdentifyMatch) {
  const year = m.yearOfMinting != null ? String(m.yearOfMinting) : "";
  const issuer = m.issuer ?? "";
  return [year, issuer].filter(Boolean).join(" • ");
}

function MatchThumbs({ urls }: { urls: string[] }) {
  const a = urls[0];
  const b = urls[1] ?? urls[0];
  return (
    <div className="flex shrink-0 items-end gap-5 pl-5 pr-3">
      {[a, b].map((src, i) => (
        <div key={`${src}-${i}`} className="relative size-[90px] shrink-0 overflow-hidden rounded-lg">
          {src ? (
            <FallbackImage
              src={src}
              alt=""
              fill
              className="object-contain"
              sizes="90px"
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

/** Figma Top 5 Matches (`14yn59xnujt`): #FAF7F5 canvas, white 12px card, 90px thumbs, 28px soft arrow. */
export function IdentifyMatchList({
  matches,
  onPick,
}: {
  matches: IdentifyMatch[];
  onPick: (match: IdentifyMatch) => void;
  onTryAgain: () => void;
  onReportNoMatches: () => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/home"
          prefetch
          aria-label="Back to Home"
          className="flex shrink-0 rounded border-[0.5px] border-[#c2c2c4] bg-white p-1 hover:bg-neutral-50"
        >
          <Image src="/assets/catalogue/icon-breadcrumb-back.svg" alt="" width={24} height={24} />
        </Link>
        <h1 className="text-2xl font-semibold leading-8 text-ink">Identify coin</h1>
      </div>

      <div className="flex flex-col gap-4 rounded-xl bg-white p-4">
        <h2 className="text-base font-medium leading-6 text-[#0a0a0a]">AI Analysis - Possible top 5 matches</h2>

        <ul className="flex flex-col gap-3">
          {matches.map((m) => {
            const imgs = m.archetypeImageUrls?.length ? m.archetypeImageUrls : [];
            return (
              <li key={m.archetypeId}>
                <button
                  type="button"
                  onClick={() => onPick(m)}
                  className="flex w-full items-center gap-6 rounded-2xl border-[0.5px] border-[#e6e9eb] bg-white p-3 text-left transition hover:bg-[#fafafa]"
                >
                  <MatchThumbs urls={imgs} />
                  <span className="h-[90px] w-px shrink-0 bg-[#e5e5e5]" aria-hidden />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium leading-5 text-ink">{m.name}</p>
                    <p className="mt-1 flex gap-2 truncate font-jakarta text-sm font-semibold leading-[150%] text-[#87878a]">
                      {matchSubtitle(m)
                        .split(" • ")
                        .flatMap((part, i) => (i ? ["•", part] : [part]))
                        .map((part, i) => (
                          <span key={i}>{part}</span>
                        ))}
                    </p>
                  </div>
                  <Image src="/assets/identify/icon-match-arrow.svg" alt="" width={28} height={28} className="shrink-0" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
