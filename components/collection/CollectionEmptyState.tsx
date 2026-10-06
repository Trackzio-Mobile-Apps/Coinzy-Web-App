import Link from "next/link";

/** Figma `1346:113133` — empty collection. */
export function CollectionEmptyState() {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex size-[120px] items-center justify-center rounded-full bg-[#dbeafe]" aria-hidden>
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <ellipse cx="36" cy="48" rx="22" ry="8" fill="#93c5fd" />
          <ellipse cx="36" cy="40" rx="20" ry="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="36" cy="32" rx="20" ry="8" fill="#fcd34d" stroke="#d97706" strokeWidth="1.5" />
          <ellipse cx="36" cy="24" rx="20" ry="8" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
        </svg>
      </div>
      <p className="mt-6 text-base font-medium text-ink">No coins has been added to your collection yet!</p>
      <p className="mt-2 text-sm text-[#606062]">Start your collection by adding your first coin</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/identify"
          className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[#7c3c3f] px-4 text-sm font-medium text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 3v8M5 8l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Upload image
        </Link>
        <Link
          href="/identify"
          className="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#e5e5e5] bg-white px-4 text-sm font-medium text-ink"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M3 6.5V4.5A1.5 1.5 0 0 1 4.5 3h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M9.5 3h2A1.5 1.5 0 0 1 13 4.5v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M13 9.5v2a1.5 1.5 0 0 1-1.5 1.5h-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M6.5 13h-2A1.5 1.5 0 0 1 3 11.5v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
          </svg>
          Capture image
        </Link>
      </div>
    </div>
  );
}
