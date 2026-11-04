import Link from "next/link";

/** Figma `1346:113133` — empty collection. */
export function CollectionEmptyState({ privateCollection = false }: { privateCollection?: boolean }) {
  return (
    <div className={`flex flex-col items-center px-6 text-center ${privateCollection ? "w-full max-w-[836px] pt-[180px] pb-16" : "py-16"}`}>
      <svg width="150" height="150" viewBox="0 0 150 150" fill="none" aria-hidden="true">
        <defs><clipPath id="empty-coin-circle"><circle cx="75" cy="75" r="75" /></clipPath></defs><circle cx="75" cy="75" r="75" fill="#80a9e2"/><g clipPath="url(#empty-coin-circle)"><path d="M53 53L151 151H93L50 108Z" fill="#000" opacity=".12"/><path d="M44 96v12c0 7 15 13 32 13s32-6 32-13V96" fill="#ffc875"/><ellipse cx="76" cy="96" rx="32" ry="13" fill="#ffe18a"/><path d="M36 70v14c0 8 15 14 33 14s33-6 33-14V70" fill="#ffca7d"/><ellipse cx="69" cy="70" rx="33" ry="14" fill="#ffe28c"/><path d="M44 48v14c0 8 15 14 32 14s32-6 32-14V48" fill="#ffca7d"/><ellipse cx="76" cy="48" rx="32" ry="14" fill="#ffe28c"/><ellipse cx="76" cy="46" rx="24" ry="11" fill="#fff"/><path d="M76 35a24 11 0 0 1 0 22Z" fill="#e8e8e8"/></g>
      </svg>
      <p className="mt-5 text-xl font-medium text-ink">No coins has been added to your collection yet!</p>
      <p className="mt-2 text-sm text-[#606062]">Start your collection by adding your first coin</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/identify"
          className="inline-flex h-9 items-center gap-2 rounded-[10px] bg-[#7c3c3f] px-4 text-sm font-medium text-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <path d="M8 11V3M5 6l3-3 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
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
