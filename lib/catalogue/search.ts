/**
 * Catalogue text search helpers.
 *
 * `POST /archetypes/fetchAll?search=` is documented as a case-insensitive text search on the coin `name`,
 * but verified live (6 Oct 2026, 382,598 coins) it behaves as a **case-sensitive whole-name match**:
 * `Dollar` → 362, `dollar` → 0, `Morgan Dollar` → 63, `Morgan` → 0, `Dolla` → 0; whitespace is trimmed and it
 * combines with the filter body (`Dollar` + rarity RARE/ULTRA_RARE → 18). The catalogue names coins in Title
 * Case ("Morgan Dollar"), so we also try that spelling when what the visitor typed matches nothing.
 */

const titleCase = (s: string) =>
  s.replace(/[\p{L}\p{N}][\p{L}\p{N}'’]*/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

/** Spellings to try, best first: as typed, Title Case, lower case (e.g. "1 dollar" exists as its own coin). */
export function searchVariants(query: string): string[] {
  return [...new Set([query, titleCase(query), query.toLowerCase()])];
}
