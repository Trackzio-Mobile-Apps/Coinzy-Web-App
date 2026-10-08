import Link from "next/link";
import type { ListingDetails } from "@/lib/api/coinzy";

const rowLabel = "text-xs text-[#606062]";
const rowValue = "text-sm text-ink";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className={rowLabel}>{label}</span>
      <span className={rowValue}>{value || "—"}</span>
    </div>
  );
}

/** Listed coin seller rail — Figma `1349:142237`. */
export function CollectionListedSellerRail({
  listing,
  listingId,
}: {
  listing: ListingDetails;
  listingId: string;
}) {
  const seller = listing.sellerDetails;
  const links = seller?.externalLinks?.filter(Boolean) ?? [];

  return (
    <div className="flex w-full flex-col gap-4 border-t border-[#efefef] pt-3">
      <DetailRow label="Name" value={seller?.name ?? "—"} />
      <DetailRow label="Email" value={seller?.contactEmail ?? "—"} />
      <DetailRow label="Mobile no." value={seller?.phoneNumber ?? "—"} />
      <DetailRow label="Location" value={seller?.location ?? "—"} />

      {links.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium text-ink">External links</span>
          <ul className="flex flex-col gap-2">
            {links.map((href) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-500 underline truncate block">
                  {href}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        disabled
        title="Mark as sold is not available on web yet"
        className="flex h-10 w-full items-center justify-center rounded-[10px] bg-primary-500 text-sm font-medium text-white opacity-60"
      >
        Mark as Sold
      </button>
      <button
        type="button"
        disabled
        title="Remove from marketplace is not available on web yet"
        className="flex h-10 w-full items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-medium text-ink opacity-60"
      >
        Remove from Marketplace
      </button>
      <Link
        href={`/marketplace/listing/${listingId}?from=collection`}
        className="text-center text-sm font-medium text-ink underline-offset-2 hover:underline"
      >
        Edit listing
      </Link>
    </div>
  );
}
