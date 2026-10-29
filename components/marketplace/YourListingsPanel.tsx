import Image from "next/image";
import Link from "next/link";
import { ListCoinButton } from "@/components/marketplace/ListCoinButton";
import { fetchMyListings } from "@/lib/api/marketplace-session";
import { getSessionToken } from "@/lib/auth/session";
import { myListingsPath } from "@/lib/marketplace/selfListing";

const A = "/assets/marketplace";

const outlineBtn =
  "shrink-0 rounded-[10px] border border-[#e5e5e5] bg-white px-3 py-1.5 text-sm font-medium leading-5 text-ink hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";

/**
 * Signed-in marketplace "Your listings" strip — Figma `1357:183164`.
 * Filled: active-count card + List a coin. Empty: CTA only (same shell).
 */
export async function YourListingsPanel() {
  const token = await getSessionToken();
  const result = token
    ? await fetchMyListings(token).catch(() => ({ listings: [], totalCount: 0 }))
    : { listings: [], totalCount: 0 };
  const count = result.totalCount || result.listings.length;

  return (
    <section className="mb-8 rounded-[16px] border-[0.5px] border-[#dfdfe0] bg-white px-4 py-3">
      <h3 className="text-base font-medium leading-6 text-ink">Your listings</h3>
      <div className={`mt-4 flex flex-col gap-4 ${count > 0 ? "sm:flex-row" : ""}`}>
        {count > 0 ? (
          <div className="flex flex-1 items-center justify-between gap-4 rounded-[12px] bg-[rgba(22,163,74,0.1)] py-3 pl-3 pr-4">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-white">
                <Image src={`${A}/icon-listings-check.svg`} alt="" width={24} height={24} />
              </div>
              <div className="min-w-0">
                <p className="text-base font-medium leading-6 text-ink">
                  {count.toLocaleString("en-US")} active listing{count === 1 ? "" : "s"}
                </p>
                <p className="pt-0.5 text-sm leading-5 text-[#87878a]">Manage listings.</p>
              </div>
            </div>
            <Link href={myListingsPath()} className={outlineBtn}>
              Manage listings
            </Link>
          </div>
        ) : null}

        <div
          className={`flex flex-1 items-center justify-between gap-4 rounded-[16px] border-[0.5px] border-[#dfdfe0] bg-[#f2f2f3] py-3 pl-3 pr-4 ${
            count === 0 ? "w-full" : ""
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[12px] bg-white">
              <Image src={`${A}/icon-sale-tag.svg`} alt="" width={24} height={24} />
            </div>
            <div className="min-w-0">
              <p className="text-base font-medium leading-6 text-ink">
                {count > 0 ? "List a coin" : "No listings yet"}
              </p>
              <p className="pt-0.5 text-sm leading-5 text-[#87878a]">
                {count > 0
                  ? "Sell more from your collection."
                  : "Turn your collection into cash — list a coin in under 2 minutes."}
              </p>
            </div>
          </div>
          <ListCoinButton buttonClassName={outlineBtn} />
        </div>
      </div>
    </section>
  );
}
