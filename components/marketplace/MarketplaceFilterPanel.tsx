"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition, type MouseEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  clearFiltersHref,
  toggleFilterHref,
  type ListingFilterField,
  type ListingFilterValues,
} from "@/lib/marketplace/listingFilters";

/** Figma filter colors (`14yn59xp2px`): checked #171717, unchecked #E5E5E5 border, label #606062. */
const PILL =
  "inline-flex items-center rounded-full border border-[#e5e5e5] px-1.5 py-0.5 text-xs font-medium leading-4 transition-colors";
const PILL_OFF = `${PILL} bg-white text-[#606062] hover:bg-neutral-50`;
const PILL_ON = `${PILL} bg-[#1e1e1f] text-white`;
const DIVIDER = <hr className="border-t-[0.5px] border-[#dfdfe0]" />;

type Toggle = (field: ListingFilterField, value: string) => void;

/** Left-click toggles instantly (optimistic) and navigates in the background; modified clicks keep native link behaviour. */
function clickHandler(toggle: Toggle, field: ListingFilterField, value: string) {
  return (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    toggle(field, value);
  };
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-xs font-medium leading-4 text-[#1e1e1f]">{children}</h3>;
}

function Checkbox({ on }: { on: boolean }) {
  return (
    <span
      className={`flex size-4 shrink-0 items-center justify-center rounded border shadow-[0_1px_2px_rgba(0,0,0,0.05)] ${
        on ? "border-[#171717] bg-[#171717]" : "border-[#e5e5e5] bg-white"
      }`}
      aria-hidden
    >
      {on && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="size-3">
          <path d="M2.5 6.25L5 8.75L9.5 3.5" stroke="#FAFAFA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

function CheckboxList({
  field,
  names,
  selected,
  base,
  pathname,
  toggle,
}: {
  field: ListingFilterField;
  names: string[];
  selected: Set<string>;
  base: URLSearchParams;
  pathname: string;
  toggle: Toggle;
}) {
  return (
    <>
      {names.map((name) => {
        const on = selected.has(name);
        return (
          <li key={name}>
            <Link
              prefetch={false}
              href={toggleFilterHref(base, field, name, pathname)}
              onClick={clickHandler(toggle, field, name)}
              role="checkbox"
              aria-checked={on}
              className="flex items-center gap-2 py-[7px] text-sm leading-5 text-[#606062]"
            >
              <Checkbox on={on} />
              <span className="min-w-0 flex-1 truncate" title={name}>{name}</span>
            </Link>
          </li>
        );
      })}
    </>
  );
}

const OPTIONS_PER_PAGE = 40;
const numericCompare = new Intl.Collator(undefined, { numeric: true }).compare;

/** Keep large catalogue facets out of the DOM while retaining access to every option. */
function useOptionWindow(options: string[], title: string, alwaysSearch = false) {
  const [needle, setNeedle] = useState("");
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => {
    const term = needle.trim().toLowerCase();
    return term ? options.filter((option) => option.toLowerCase().includes(term)) : options;
  }, [options, needle]);
  const pages = Math.max(1, Math.ceil(filtered.length / OPTIONS_PER_PAGE));
  const current = Math.min(page, pages - 1);
  return {
    visible: filtered.slice(current * OPTIONS_PER_PAGE, (current + 1) * OPTIONS_PER_PAGE),
    search: (alwaysSearch || options.length > OPTIONS_PER_PAGE) && (
      <input type="search" value={needle} onChange={(event) => { setNeedle(event.target.value); setPage(0); }} placeholder={`Search ${title.toLowerCase()}`} aria-label={`Search ${title.toLowerCase()} filter options`} className="h-8 w-full min-w-0 rounded-[10px] border border-[#e5e5e5] bg-white px-2 text-sm text-ink outline-none focus:border-ink" />
    ),
    pager: filtered.length === 0 ? <p className="text-xs text-muted">No options match.</p> : pages > 1 && (
      <div className="flex items-center justify-between gap-2 text-xs text-muted">
        <button type="button" disabled={current === 0} onClick={() => setPage(current - 1)} className="py-1 disabled:opacity-40" aria-label={`Previous ${title.toLowerCase()} options`}>Previous</button>
        <span>{current + 1} / {pages}</span>
        <button type="button" disabled={current === pages - 1} onClick={() => setPage(current + 1)} className="py-1 disabled:opacity-40" aria-label={`Next ${title.toLowerCase()} options`}>Next</button>
      </div>
    ),
  };
}

function CheckboxGroup({
  field,
  title,
  options,
  selected,
  base,
  pathname,
  toggle,
  maxHeight = "200px",
  alwaysSearch = false,
}: {
  field: ListingFilterField;
  title: string;
  options: string[];
  selected: Set<string>;
  base: URLSearchParams;
  pathname: string;
  toggle: Toggle;
  maxHeight?: string;
  alwaysSearch?: boolean;
}) {
  const window = useOptionWindow(options, title, alwaysSearch);
  if (!options.length) return null;
  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>{title}</SectionTitle>
      {window.search}
      <ul className="overflow-y-auto pr-1" style={{ maxHeight }}>
        <CheckboxList field={field} names={window.visible} selected={selected} base={base} pathname={pathname} toggle={toggle} />
      </ul>
      {window.pager}
    </div>
  );
}

function PillGroup({
  field,
  title,
  options,
  selected,
  base,
  pathname,
  toggle,
}: {
  field: ListingFilterField;
  title: string;
  options: string[];
  selected: Set<string>;
  base: URLSearchParams;
  pathname: string;
  toggle: Toggle;
}) {
  const window = useOptionWindow(options, title);
  if (!options.length) return null;
  return (
    <div className="flex flex-col gap-3">
      <SectionTitle>{title}</SectionTitle>
      {window.search}
      <div className="flex max-h-[140px] flex-wrap gap-2 overflow-y-auto">
        {window.visible.map((label) => {
          const on = selected.has(label);
          return (
            <Link
              prefetch={false}
              key={label}
              href={toggleFilterHref(base, field, label, pathname)}
              onClick={clickHandler(toggle, field, label)}
              aria-pressed={on}
              className={on ? PILL_ON : PILL_OFF}
            >
              {label}
            </Link>
          );
        })}
      </div>
      {window.pager}
    </div>
  );
}

function IssuerSearchGroup({
  options,
  selected,
  base,
  pathname,
  toggle,
}: {
  options: string[];
  selected: Set<string>;
  base: URLSearchParams;
  pathname: string;
  toggle: Toggle;
}) {
  return <CheckboxGroup field="issuer" title="Issuer" options={options} selected={selected} base={base} pathname={pathname} toggle={toggle} maxHeight="180px" alwaysSearch />;
}

/** Right filter column — options from `GET /marketplace/listing/filterItems`; toggles update `?issuer=` etc. */
export function MarketplaceFilterPanel({ options, wrapperClassName = "min-h-0 shrink-0 overflow-y-auto py-6 pr-8", collapsible = false }: { options: ListingFilterValues; wrapperClassName?: string; collapsible?: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname() || "/marketplace";
  const [pending, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Optimistic copy of the query so the tapped option flips instantly while the results load.
  const [optimistic, setOptimistic] = useState<string | null>(null);
  const paramsString = params.toString();
  useEffect(() => {
    if (!pending) setOptimistic(null);
  }, [paramsString, pending]);

  // While a filter change loads, dim/lock the results (CSS keys off html[data-filtering]) so the grid can
  // never show data for a different filter set than the panel (ClickUp 14yn59xp2re).
  useEffect(() => {
    const root = document.documentElement;
    if (pending) root.setAttribute("data-filtering", "");
    else root.removeAttribute("data-filtering");
    return () => root.removeAttribute("data-filtering");
  }, [pending]);

  const effective = optimistic ?? paramsString;
  const base = new URLSearchParams(effective);
  const selected = (field: ListingFilterField) => new Set(base.getAll(field));

  const go = (href: string) => {
    if (pending) return; // updates are disabled until the in-flight request finishes
    setOptimistic(new URL(href, "http://x").searchParams.toString());
    startTransition(() => router.push(href, { scroll: false }));
  };
  const toggle: Toggle = (field, value) => go(toggleFilterHref(base, field, value, pathname));

  const sorted = useMemo(() => {
    const unique = (values: string[]) => [...new Set(values.map(String).filter((value) => value.trim()))];
    const alphabetic = (values: string[]) => unique(values).sort((a, b) => a.localeCompare(b));
    return {
      issuers: alphabetic(options.issuer),
      rulers: alphabetic(options.ruler),
      years: unique(options.yearOfMinting).sort((a, b) => numericCompare(b, a)),
      mints: alphabetic(options.mintLocation),
      shapes: alphabetic(options.shape),
      materials: alphabetic(options.material),
    };
  }, [options]);
  const { issuers, rulers, years, mints, shapes, materials } = sorted;

  return (
    <div className={wrapperClassName}>
    {collapsible && (
      <button type="button" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="mb-3 w-full rounded-xl border border-border-neutral bg-white px-4 py-3 text-left text-sm font-medium lg:hidden">
        {mobileOpen ? "Hide filters" : "Filter coins"}
      </button>
    )}
    <aside
      className={`${collapsible && !mobileOpen ? "hidden lg:flex" : "flex"} w-[268px] shrink-0 flex-col gap-4 rounded-2xl border-[0.5px] border-[#c2c2c4] bg-white px-4 py-3 transition-opacity ${pending ? "pointer-events-none opacity-70" : ""}`}
      aria-busy={pending}
    >
      <div className="flex h-6 items-center justify-between">
        <h2 className="flex items-center gap-2 font-jakarta text-sm font-bold leading-[120%] text-[#0a0a0a]">
          Filter
          {pending && (
            <span
              className="size-3.5 animate-spin rounded-full border-2 border-[#e5e5e5] border-t-[#1e1e1f]"
              role="status"
              aria-label="Updating results"
            />
          )}
        </h2>
        <Link
          prefetch={false}
          href={clearFiltersHref(base, pathname)}
          onClick={(e) => {
            if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
            e.preventDefault();
            go(clearFiltersHref(base, pathname));
          }}
          className="rounded-lg px-2 py-1 text-xs font-medium leading-4 text-[#1e1e1f] hover:bg-neutral-50"
        >
          Clear all
        </Link>
      </div>

      <IssuerSearchGroup options={issuers} selected={selected("issuer")} base={base} pathname={pathname} toggle={toggle} />
      {DIVIDER}

      <CheckboxGroup
        field="ruler"
        title="Ruler"
        options={rulers}
        selected={selected("ruler")}
        base={base}
        pathname={pathname}
        toggle={toggle}
        maxHeight="120px"
      />
      {DIVIDER}

      <PillGroup
        field="yearOfMinting"
        title="Year of Minting"
        options={years}
        selected={selected("yearOfMinting")}
        base={base}
        pathname={pathname}
        toggle={toggle}
      />
      {DIVIDER}

      <PillGroup
        field="mintLocation"
        title="Mint Location"
        options={mints}
        selected={selected("mintLocation")}
        base={base}
        pathname={pathname}
        toggle={toggle}
      />
      {DIVIDER}

      <PillGroup
        field="shape"
        title="Shape"
        options={shapes}
        selected={selected("shape")}
        base={base}
        pathname={pathname}
        toggle={toggle}
      />
      {DIVIDER}

      <PillGroup
        field="material"
        title="Material"
        options={materials}
        selected={selected("material")}
        base={base}
        pathname={pathname}
        toggle={toggle}
      />
    </aside>
    </div>
  );
}
