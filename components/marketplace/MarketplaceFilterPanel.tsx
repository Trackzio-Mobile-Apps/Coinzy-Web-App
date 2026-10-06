"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  clearFiltersHref,
  toggleFilterHref,
  type ListingFilterField,
  type ListingFilterValues,
} from "@/lib/marketplace/listingFilters";

const PILL =
  "inline-flex rounded-md border px-2 py-1 text-xs font-medium leading-4 transition-colors hover:bg-neutral-50";
const PILL_OFF = `${PILL} border-[#e5e7eb] bg-white text-ink`;
const PILL_ON = `${PILL} border-primary-500 bg-primary-50 text-primary-500`;

function CheckboxGroup({
  field,
  title,
  options,
  selected,
  base,
  maxHeight = "200px",
}: {
  field: ListingFilterField;
  title: string;
  options: string[];
  selected: Set<string>;
  base: URLSearchParams;
  maxHeight?: string;
}) {
  if (!options.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium leading-5 text-ink">{title}</h3>
      <ul className="space-y-2 overflow-y-auto pr-1" style={{ maxHeight }}>
        {options.map((name) => {
          const on = selected.has(name);
          return (
            <li key={name}>
              <Link
                href={toggleFilterHref(base, field, name)}
                className={`flex items-center gap-2 text-sm leading-5 ${on ? "font-medium text-primary-500" : "text-ink"}`}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded border ${on ? "border-primary-500 bg-primary-500" : "border-[#d4d4d4] bg-white"}`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate" title={name}>{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PillGroup({
  field,
  title,
  options,
  selected,
  base,
}: {
  field: ListingFilterField;
  title: string;
  options: string[];
  selected: Set<string>;
  base: URLSearchParams;
}) {
  if (!options.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium leading-5 text-ink">{title}</h3>
      <div className="flex max-h-[140px] flex-wrap gap-2 overflow-y-auto">
        {options.map((label) => {
          const on = selected.has(label);
          return (
            <Link key={label} href={toggleFilterHref(base, field, label)} className={on ? PILL_ON : PILL_OFF}>
              {label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function IssuerSearchGroup({
  options,
  selected,
  base,
}: {
  options: string[];
  selected: Set<string>;
  base: URLSearchParams;
}) {
  const [needle, setNeedle] = useState("");
  const filtered = useMemo(() => {
    const n = needle.trim().toLowerCase();
    if (!n) return options;
    return options.filter((o) => o.toLowerCase().includes(n));
  }, [needle, options]);

  if (!options.length) return null;
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium leading-5 text-ink">Issuer</h3>
      <input
        type="search"
        value={needle}
        onChange={(e) => setNeedle(e.target.value)}
        placeholder="Search issuer"
        className="h-8 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-sm leading-5 text-ink placeholder:text-[#a3a3a3] focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-500"
        aria-label="Search issuer filter options"
      />
      <ul className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
        {filtered.map((name) => {
          const on = selected.has(name);
          return (
            <li key={name}>
              <Link
                href={toggleFilterHref(base, "issuer", name)}
                className={`flex items-center gap-2 text-sm leading-5 ${on ? "font-medium text-primary-500" : "text-ink"}`}
              >
                <span
                  className={`flex size-4 shrink-0 items-center justify-center rounded border ${on ? "border-primary-500 bg-primary-500" : "border-[#d4d4d4] bg-white"}`}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 truncate" title={name}>{name}</span>
              </Link>
            </li>
          );
        })}
        {!filtered.length && <li className="text-xs leading-4 text-muted">No issuers match.</li>}
      </ul>
    </div>
  );
}

/** Right filter column — options from `GET /marketplace/listing/filterItems`; toggles update `?issuer=` etc. */
export function MarketplaceFilterPanel({ options }: { options: ListingFilterValues }) {
  const params = useSearchParams();
  const base = new URLSearchParams(params.toString());

  const selected = (field: ListingFilterField) => new Set(params.getAll(field));

  const issuers = [...options.issuer].sort((a, b) => a.localeCompare(b));
  const rulers = [...options.ruler].sort((a, b) => a.localeCompare(b));
  const years = [...options.yearOfMinting].sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
  const mints = [...options.mintLocation].sort((a, b) => a.localeCompare(b));
  const shapes = [...options.shape].sort((a, b) => a.localeCompare(b));
  const materials = [...options.material].sort((a, b) => a.localeCompare(b));

  return (
    <aside className="flex w-[266px] shrink-0 flex-col gap-4 border-l border-[#e5e7eb] bg-white px-4 py-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-medium leading-6 text-ink">Filter</h2>
        <Link href={clearFiltersHref(base)} className="text-xs font-medium leading-4 text-primary-500 hover:underline">
          Clear all
        </Link>
      </div>

      <IssuerSearchGroup options={issuers} selected={selected("issuer")} base={base} />

      <CheckboxGroup field="ruler" title="Ruler" options={rulers} selected={selected("ruler")} base={base} maxHeight="120px" />

      <PillGroup field="yearOfMinting" title="Year of Minting" options={years} selected={selected("yearOfMinting")} base={base} />

      <PillGroup field="mintLocation" title="Mint Location" options={mints} selected={selected("mintLocation")} base={base} />

      <PillGroup field="shape" title="Shape" options={shapes} selected={selected("shape")} base={base} />

      <PillGroup field="material" title="Material" options={materials} selected={selected("material")} base={base} />
    </aside>
  );
}
