import Link from "next/link";

const btn =
  "inline-flex h-10 w-full items-center justify-center rounded-[10px] bg-primary-500 px-4 text-sm font-medium text-white hover:bg-primary-600";

/** Figma collection details — primary "Add for Sale" (sell-from-collection API not on web yet). */
export function CollectionAddForSaleButton({
  className = "",
  returnTo = "/marketplace",
}: {
  className?: string;
  returnTo?: string;
}) {
  return (
    <Link href={returnTo} className={`${btn} ${className}`}>
      Add for Sale
    </Link>
  );
}
