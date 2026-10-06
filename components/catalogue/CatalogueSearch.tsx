"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition, type FormEvent } from "react";
import { MAX_QUERY_LENGTH, parseQueryParam } from "@/lib/backNav";

const ICONS = "/assets/catalogue";

/**
 * Catalogue search box (the only client piece of the search flow).
 *
 * Not in the catalogue Figma frames — it reuses the search pill from the dashboard's marketplace panel
 * (`1898:205770`: 24px, rounded-lg, #e5e5e5 border, 14px magnifier, 12px text). Submit-on-Enter rather than
 * type-ahead because the API matches whole coin names (see `lib/catalogue/search.ts`), so partial words would
 * only flash "no results". Results are server-rendered from `?q=`; submitting resets to page 1 and keeps
 * `hash` so the browse section stays in view. Parent passes `key={query}` so back/forward re-syncs the field.
 */
export function CatalogueSearch({
  action,
  query,
  hash = "",
  className = "",
}: {
  /** List route the search applies to (`/catalogue`, `/catalogue/american-coins`). */
  action: string;
  /** Current `?q=` from the server. */
  query: string;
  /** Optional `#anchor` to land on after submitting. */
  hash?: string;
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [pending, startTransition] = useTransition();
  const inputId = useId();

  const go = (term: string) =>
    startTransition(() => {
      router.push(`${action}${term ? `?q=${encodeURIComponent(term)}` : ""}${hash}`);
    });

  const submit = (event: FormEvent) => {
    event.preventDefault();
    go(parseQueryParam(value));
  };

  return (
    <form
      role="search"
      action={action}
      method="get"
      onSubmit={submit}
      aria-busy={pending}
      className={`relative flex h-6 w-full max-w-[345px] items-center rounded-lg border border-[#e5e5e5] bg-white px-2 focus-within:border-primary-500 ${className}`}
    >
      <label htmlFor={inputId} className="sr-only">
        Search the catalogue by coin name
      </label>
      <Image src={`${ICONS}/icon-search.svg`} alt="" width={14} height={14} />
      <input
        id={inputId}
        name="q"
        type="search"
        value={value}
        maxLength={MAX_QUERY_LENGTH}
        autoComplete="off"
        enterKeyHint="search"
        placeholder="Search coins by name..."
        onChange={(e) => setValue(e.target.value)}
        // Explicit Enter so it also works for synthetic key events (automation); real Enter submits once.
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        className="ml-2 w-full bg-transparent text-xs leading-4 text-ink outline-none placeholder:text-[#a4a4a7] [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setValue("");
            if (query) go("");
          }}
          className="ml-1 flex size-4 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
        >
          <Image src={`${ICONS}/icon-clear.svg`} alt="" width={12} height={12} />
        </button>
      )}
    </form>
  );
}
