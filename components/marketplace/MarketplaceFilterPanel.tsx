"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const PILL = "rounded-md border border-[#e5e7eb] bg-white px-2 py-1 text-xs font-medium leading-4 text-ink hover:bg-neutral-50";

function toggleParam(base: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(base);
  const all = next.getAll(key);
  if (all.includes(value)) next.delete(key, value);
  else next.append(key, value);
  next.delete("page");
  const q = next.toString();
  return q ? `/marketplace?${q}` : "/marketplace";
}

/** Right filter column — Figma `1356:154252`. Issuer checkboxes toggle `?issuer=`; other groups are visual until the API exposes them. */
export function MarketplaceFilterPanel({
  issuers,
  rulerSamples,
}: {
  issuers: string[];
  rulerSamples: string[];
}) {
  const params = useSearchParams();
  const selectedIssuers = new Set(params.getAll("issuer"));
  const base = new URLSearchParams(params.toString());

  return (
    <aside className="flex w-[266px] shrink-0 flex-col gap-4 border-l border-[#e5e7eb] bg-white px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium leading-6 text-ink">Filter</h2>
        <Link href="/marketplace" className="text-xs font-medium leading-4 text-primary-500 hover:underline">
          Clear all
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium leading-5 text-ink">Issuer</h3>
        <ul className="max-h-[200px] space-y-2 overflow-y-auto pr-1">
          {issuers.slice(0, 12).map((name) => {
            const on = selectedIssuers.has(name);
            return (
              <li key={name}>
                <Link
                  href={toggleParam(base, "issuer", name)}
                  className={`flex items-center gap-2 text-sm leading-5 ${on ? "font-medium text-primary-500" : "text-ink"}`}
                >
                  <span
                    className={`flex size-4 shrink-0 items-center justify-center rounded border ${on ? "border-primary-500 bg-primary-500" : "border-[#d4d4d4] bg-white"}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">{name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {rulerSamples.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium leading-5 text-ink">Ruler</h3>
          <ul className="max-h-[120px] space-y-2 overflow-y-auto">
            {rulerSamples.slice(0, 6).map((name) => (
              <li key={name} className="text-sm leading-5 text-muted">{name}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium leading-5 text-ink">Year of Minting</h3>
        <div className="flex flex-wrap gap-2">
          {["Modern", "Ancient coins", "Medieval"].map((label) => (
            <span key={label} className={PILL}>{label}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium leading-5 text-ink">Material</h3>
        <div className="flex flex-wrap gap-2">
          {["Gold", "Silver", "Bronze", "Copper"].map((label) => (
            <span key={label} className={PILL}>{label}</span>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium leading-5 text-ink">Shape</h3>
        <span className={PILL}>Circle</span>
      </div>
    </aside>
  );
}
