import type { CollectionCoinStatus } from "@/lib/collection/userCoinSpec";
import { COLLECTION_STATUS_LABEL } from "@/lib/collection/userCoinSpec";

const STYLES: Record<CollectionCoinStatus, string> = {
  owned: "bg-[#ecfdf5] text-[#047857]",
  identified: "bg-[#eff6ff] text-[#1d4ed8]",
  wishlist: "bg-[#fef3c7] text-[#b45309]",
};

export function CollectionCoinStatusBadge({ status }: { status: CollectionCoinStatus }) {
  return (
    <span className={`inline-flex h-7 items-center rounded-full px-3 text-xs font-medium ${STYLES[status]}`}>
      {COLLECTION_STATUS_LABEL[status]}
    </span>
  );
}
