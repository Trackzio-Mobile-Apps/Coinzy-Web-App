"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { MAX_QUERY_LENGTH, parseQueryParam } from "@/lib/backNav";
import { requestCoinSuggestions } from "@/lib/catalogue/suggestionsClient";

const ICONS = "/assets/catalogue";
const LOOKUP_DEBOUNCE_MS = 300;

function waitForLookup(signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const abort = () => {
      window.clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timer = window.setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, LOOKUP_DEBOUNCE_MS);
    signal.addEventListener("abort", abort, { once: true });
  });
}

/**
 * Catalogue / marketplace search box (the only client piece of the search flow).
 *
 * Not in the catalogue Figma frames — it reuses the search pill from the dashboard's marketplace panel
 * (`1898:205770`: 24px, rounded-lg, #e5e5e5 border, 14px magnifier, 12px text).
 * Typing is debounced 300ms before local lookup; selecting a match loads catalogue results.
 * A no-match bar offers direct catalogue search for the submitted text.
 * Results are server-rendered from `?q=`; submitting resets to page 1 and keeps
 * `hash` so the browse section stays in view. Parent passes `key={query}` so back/forward re-syncs the field.
 */
export function CatalogueSearch({
  action,
  query,
  hash = "",
  className = "",
  placeholder = "Search coins by name...",
  label = "Search the catalogue by coin name",
  keepParams,
  variant = "compact",
}: {
  /** List route the search applies to (`/catalogue`, `/catalogue/american-coins`). */
  action: string;
  /** Current `?q=` from the server. */
  query: string;
  /** Optional `#anchor` to land on after submitting. */
  hash?: string;
  className?: string;
  placeholder?: string;
  /** Accessible name for the input (no visible label in the designs). */
  label?: string;
  /** Extra query params preserved on submit (e.g. signed-in `category=`). */
  keepParams?: Record<string, string | string[]>;
  variant?: "compact" | "toolbar";
}) {
  const router = useRouter();
  const [value, setValue] = useState(query);
  const [pending, startTransition] = useTransition();
  const inputId = useId();
  const localSearch = action.startsWith("/catalogue");
  const [lookup, setLookup] = useState<{ query: string; matches: string[]; unavailable?: boolean } | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [active, setActive] = useState(-1);
  const currentLookup = useRef<AbortController | null>(null);

  useEffect(() => () => currentLookup.current?.abort(), []);

  const resetLookup = () => {
    currentLookup.current?.abort();
    setLookup(null);
    setLookingUp(false);
    setActive(-1);
  };

  const go = (term: string) => {
    resetLookup();
    startTransition(() => {
      const p = new URLSearchParams();
      for (const [name, values] of Object.entries(keepParams ?? {})) {
        for (const value of Array.isArray(values) ? values : [values]) p.append(name, value);
      }
      if (term) p.set("q", term);
      const qs = p.toString();
      router.push(`${action}${qs ? `?${qs}` : ""}${hash}`);
    });
  };

  const lookupNames = async (term: string) => {
    resetLookup();
    const controller = new AbortController();
    currentLookup.current = controller;
    setLookingUp(true);
    try {
      await waitForLookup(controller.signal);
      const matches = await requestCoinSuggestions(term, controller.signal);
      if (!controller.signal.aborted) setLookup({ query: term, matches });
    } catch {
      if (!controller.signal.aborted) setLookup({ query: term, matches: [], unavailable: true });
    } finally {
      if (!controller.signal.aborted) setLookingUp(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const term = parseQueryParam(value);
    if (!localSearch || !term) { go(term); return; }
    if (lookup && active >= 0 && lookup.matches[active]) {
      go(lookup.matches[active]);
      return;
    }
    await lookupNames(term);
  };

  return (
    <form
      role="search"
      action={action}
      method="get"
      onSubmit={submit}
      aria-busy={pending || lookingUp}
      className={`relative flex w-full items-center border border-[#e5e5e5] bg-white focus-within:border-primary-500 ${variant === "toolbar" ? "h-8 min-w-0 max-w-[695px] rounded-[10px] px-4" : "h-6 max-w-[345px] rounded-lg px-2"} ${className}`}
    >
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>
      {keepParams &&
        Object.entries(keepParams).flatMap(([name, values]) =>
          (Array.isArray(values) ? values : [values]).map((value, index) => (
            <input key={`${name}-${index}`} type="hidden" name={name} value={value} />
          )),
        )}
      <button type="submit" aria-label="Search" disabled={pending || lookingUp} className="shrink-0 disabled:opacity-50">
        <Image src={`${ICONS}/icon-search.svg`} alt="" width={variant === "toolbar" ? 16 : 14} height={variant === "toolbar" ? 16 : 14} />
      </button>
      <input
        id={inputId}
        name="q"
        type="search"
        value={value}
        maxLength={MAX_QUERY_LENGTH}
        autoComplete="off"
        role={localSearch ? "combobox" : undefined}
        aria-autocomplete={localSearch ? "list" : undefined}
        aria-expanded={localSearch ? Boolean(lookup?.matches.length) : undefined}
        aria-controls={lookup?.matches.length ? `${inputId}-matches` : undefined}
        aria-activedescendant={lookup?.matches.length && active >= 0 ? `${inputId}-match-${active}` : undefined}
        enterKeyHint="search"
        placeholder={placeholder}
        onChange={(e) => {
          const next = e.target.value;
          resetLookup();
          setValue(next);
          const term = parseQueryParam(next);
          if (localSearch && term) void lookupNames(term);
        }}
        // Explicit Enter so it also works for synthetic key events (automation); real Enter submits once.
        onKeyDown={(e) => {
          if (e.nativeEvent.isComposing) return;
          if (lookup?.matches.length && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setActive((index) => e.key === "ArrowDown" ? (index + 1) % lookup.matches.length : index <= 0 ? lookup.matches.length - 1 : index - 1);
          }
          if (e.key === "Escape") resetLookup();
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        className={`ml-2 min-w-0 w-full bg-transparent text-ink outline-none placeholder:text-[#a4a4a7] [&::-webkit-search-cancel-button]:hidden ${variant === "toolbar" ? "text-sm leading-5" : "text-xs leading-4"}`}
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            resetLookup();
            setValue("");
          }}
          className="ml-1 flex size-4 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
        >
          <Image src={`${ICONS}/icon-clear.svg`} alt="" width={12} height={12} />
        </button>
      )}
      {lookingUp && <div role="status" className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-border-neutral bg-white px-3 py-2 text-sm text-muted shadow-lg">Searching local names…</div>}
      {pending && <div role="status" className="absolute left-0 right-0 top-full z-30 mt-1 rounded-xl border border-border-neutral bg-white px-3 py-2 text-sm text-muted shadow-lg">Searching catalogue…</div>}
      {lookup && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-border-neutral bg-white shadow-lg">
          {lookup.matches.length ? (
            <ul id={`${inputId}-matches`} role="listbox" aria-label="Local coin name matches" className="max-h-72 overflow-y-auto py-1">
              {lookup.matches.map((name, index) => (
                <li key={name} role="presentation">
                  <button type="button" role="option" id={`${inputId}-match-${index}`} aria-selected={active === index} onClick={() => { setValue(name); go(name); }} className={`block w-full px-3 py-2 text-left text-sm leading-5 text-ink hover:bg-primary-50 ${active === index ? "bg-primary-50" : ""}`}>
                    {name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <>
              <p role="status" className="px-3 pt-3 text-sm font-medium text-ink">{lookup.unavailable ? "Local search unavailable" : "Not found in local names"}</p>
              <button type="button" onClick={() => go(lookup.query)} className="block w-full px-3 py-3 text-left text-sm font-medium text-primary-500 hover:bg-primary-50">
                Search catalogue for “{lookup.query}”
              </button>
            </>
          )}
        </div>
      )}
    </form>
  );
}
