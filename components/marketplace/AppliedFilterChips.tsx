"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { LISTING_FILTER_FIELDS, type ListingFilterField } from "@/lib/marketplace/listingFilters";

/** Applied filters are reflected in the URL; removing one retains the other browse state. */
export function AppliedFilterChips() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const base = new URLSearchParams(searchParams.toString());
  const chips = LISTING_FILTER_FIELDS.flatMap((field) => [...new Set(base.getAll(field).map((value) => value.trim()).filter(Boolean))].map((value) => ({ field, value })));
  if (!chips.length) return null;
  const removeHref = (field: ListingFilterField, value: string) => {
    const next = new URLSearchParams(base);
    const remaining = next.getAll(field).filter((entry) => entry.trim() !== value);
    next.delete(field);
    remaining.forEach((entry) => next.append(field, entry));
    next.delete("page");
    const query = next.toString();
    return query ? `${pathname}?${query}` : pathname;
  };
  return <div aria-label="Applied filters" className="mt-3 flex flex-wrap items-center gap-1.5">{chips.map(({ field, value }) => <Link key={`${field}:${value}`} href={removeHref(field, value)} prefetch={false} aria-label={`Remove ${field.replace(/([A-Z])/g, " $1")} filter ${value}`} className="inline-flex min-h-6 max-w-full items-center gap-1 rounded-full border border-[#e5e5e5] bg-[#f7e7e8] px-3 py-0.5 text-sm font-medium leading-5 text-ink hover:bg-[#f2d9db]"><span className="break-words">{value}</span><svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" className="shrink-0"><path d="M2.5 2.5l7 7m0-7-7 7" stroke="#606062" strokeWidth="1.2" strokeLinecap="round" /></svg></Link>)}</div>;
}
