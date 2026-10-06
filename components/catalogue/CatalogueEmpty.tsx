import Link from "next/link";

/**
 * No-results / search-unavailable state. Not in Figma (the catalogue frames only show populated grids), so it
 * stays deliberately plain: ink/muted text on the cream page, one primary-500 link back to the full list.
 */
export function CatalogueEmpty({
  query,
  scope,
  clearHref,
  unavailable = false,
}: {
  query: string;
  /** Category name when searching inside a view-all page, e.g. "American coins". */
  scope?: string;
  clearHref: string;
  /** The API failed (as opposed to a genuine zero-hit search). */
  unavailable?: boolean;
}) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-center">
      {unavailable ? (
        <>
          <p className="text-base font-medium leading-6 text-ink">Search is temporarily unavailable</p>
          <p className="max-w-[420px] text-sm leading-5 text-muted">
            We couldn’t reach the catalogue just now. Please try again in a moment.
          </p>
        </>
      ) : (
        <>
          <p className="text-base font-medium leading-6 text-ink">
            {query ? (
              <>
                No coins found for “{query}”{scope ? ` in ${scope}` : ""}
              </>
            ) : (
              <>No coins found{scope ? ` in ${scope}` : ""} yet</>
            )}
          </p>
          {query && (
            <p className="max-w-[420px] text-sm leading-5 text-muted">
              Search matches whole coin names, such as “Dollar”, “Denarius” or “Morgan Dollar”. Check the spelling or try a
              broader name.
            </p>
          )}
        </>
      )}
      {query && (
        <Link href={clearHref} className="text-sm font-medium leading-5 text-primary-500 underline hover:text-primary-700">
          Clear search
        </Link>
      )}
    </div>
  );
}
