import type { ListingDetails } from "@/lib/api/coinzy";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:gap-6">
      <span className="w-full shrink-0 text-sm text-[#606062] sm:w-[210px]">{label}</span>
      <span className="text-sm text-ink">{value || "—"}</span>
    </div>
  );
}

/** Grading rows after listing — Figma `1349:142237`. */
export function CollectionCoinGradingBlock({ listing }: { listing: ListingDetails }) {
  const cleaning = listing.cleaningAlterations?.filter(Boolean).join(", ") ?? "—";
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-white p-4">
      <h2 className="text-lg font-medium leading-7 text-ink">Coin grading details</h2>
      <div className="flex flex-col gap-4">
        <Row label="Grading Scale (select one)" value={listing.gradingScale ?? "—"} />
        <Row label="Grading authority" value={listing.gradingAuthority ?? "—"} />
        <Row label="Strike type" value={listing.strikerType ?? "—"} />
        <Row label="Cleaning/Alteration" value={cleaning} />
        <Row label="Coin condition notes" value={listing.coinCondition ?? "—"} />
      </div>
    </div>
  );
}
