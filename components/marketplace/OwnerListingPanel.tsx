"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IdentifyToast } from "@/components/identify/IdentifyToast";
import type { ListingDetails } from "@/lib/api/coinzy";
import { collectionSellHref } from "@/lib/marketplace/selfListing";

const ICONS = "/assets/listing";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <dt className="text-xs font-medium leading-4 text-ink">{label}</dt>
      <dd className="break-words text-sm leading-5 text-muted">{children}</dd>
    </div>
  );
}

/**
 * Seller-owner side panel — Figma `1363:178858` (self listing) / collection listed rail `1349:142237`.
 * Mark as sold → `PATCH /api/marketplace/markSold/[id]`. Remove → `DELETE /api/marketplace/listing/[id]`.
 * Edit → collection coin with `?list=1` when `coinId` is known (PATCH edit drawer not built yet).
 */
export function OwnerListingPanel({
  listing,
  listingId,
  coinId,
  variant = "card",
}: {
  listing: ListingDetails;
  listingId: string;
  /** Private collection coin id — enables Edit → sell drawer on collection details. */
  coinId?: string | null;
  variant?: "card" | "rail";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"sold" | "remove" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState("Could not update listing");
  const seller = listing.sellerDetails;
  const links = (seller?.externalLinks ?? []).filter((l) => /^https?:\/\//i.test(l));

  const afterGone = () => {
    router.push(coinId ? `/collection/coin/${coinId}` : "/marketplace");
    router.refresh();
  };

  const markSold = async () => {
    if (busy) return;
    setBusy("sold");
    setError(null);
    const res = await fetch(`/api/marketplace/markSold/${encodeURIComponent(listingId)}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const json = (await res.json()) as { error?: boolean; reason?: string };
    setBusy(null);
    if (!res.ok || json.error) {
      setErrorTitle("Could not mark as sold");
      setError(json.reason ?? "Could not mark this listing as sold. Please try again.");
      return;
    }
    afterGone();
  };

  const remove = async () => {
    if (busy) return;
    setBusy("remove");
    setError(null);
    const res = await fetch(`/api/marketplace/listing/${encodeURIComponent(listingId)}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    const json = (await res.json()) as { error?: boolean; reason?: string };
    setBusy(null);
    if (!res.ok || json.error) {
      setErrorTitle("Could not remove listing");
      setError(json.reason ?? "Could not remove this listing. Please try again.");
      return;
    }
    afterGone();
  };

  const shell =
    variant === "card"
      ? "flex w-full flex-col gap-5 rounded-[12px] border border-[#efefef] bg-white px-[17px] py-[13px] lg:w-[266px]"
      : "flex w-full flex-col gap-4 border-t border-[#efefef] pt-3";

  return (
    <>
      <div className={shell}>
        {variant === "card" ? (
          <details open className="group">
            <summary className="flex cursor-pointer list-none items-start justify-between [&::-webkit-details-marker]:hidden">
              <h2 className="text-sm font-medium leading-5 text-ink">Seller Details</h2>
              <Image
                src={`${ICONS}/icon-chevron-up.svg`}
                alt=""
                width={16}
                height={16}
                className="rotate-180 transition-transform group-open:rotate-0"
              />
            </summary>
            <dl className="mt-3 flex flex-col gap-4">
              <Field label="Name">{seller?.name?.trim() || "--"}</Field>
              <Field label="Email">{seller?.contactEmail?.trim() || "--"}</Field>
              <Field label="Mobile no.">{seller?.phoneNumber?.trim() || "--"}</Field>
              <div className="flex flex-col gap-2">
                <dt className="text-xs font-medium leading-4 text-ink">Location</dt>
                <dd className="font-jakarta text-xs leading-[1.5] text-muted">{seller?.location?.trim() || "--"}</dd>
              </div>
            </dl>
          </details>
        ) : (
          <dl className="flex flex-col gap-4">
            <Field label="Name">{seller?.name?.trim() || "—"}</Field>
            <Field label="Email">{seller?.contactEmail?.trim() || "—"}</Field>
            <Field label="Mobile no.">{seller?.phoneNumber?.trim() || "—"}</Field>
            <Field label="Location">{seller?.location?.trim() || "—"}</Field>
          </dl>
        )}

        <div className={variant === "card" ? "border-t-[0.5px] border-border-neutral" : undefined} />

        <div className="flex flex-col gap-2">
          <h3 className={variant === "card" ? "text-xs font-medium leading-4 text-ink" : "text-sm font-medium text-ink"}>
            External links
          </h3>
          {links.length ? (
            <ul className="flex flex-col gap-2">
              {links.map((href) => (
                <li key={href} className="flex items-start gap-2">
                  {variant === "card" && <span className="size-12 shrink-0 rounded bg-border-neutral" aria-hidden />}
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className={
                      variant === "card"
                        ? "line-clamp-2 min-w-0 flex-1 break-all text-sm leading-5 text-[#007aff] underline"
                        : "block truncate text-sm text-primary-500 underline"
                    }
                  >
                    {href}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-5 text-muted">--</p>
          )}
        </div>

        <button
          type="button"
          disabled={busy !== null}
          onClick={markSold}
          className="flex h-10 w-full items-center justify-center rounded-[10px] bg-primary-500 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {busy === "sold" ? "Marking sold…" : "Mark as sold"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={remove}
          className="flex h-10 w-full items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-medium text-ink hover:bg-black/[0.02] disabled:opacity-60"
        >
          {busy === "remove" ? "Removing…" : "Remove from Marketplace"}
        </button>
        {coinId ? (
          <Link
            href={collectionSellHref(coinId)}
            className="text-center text-sm font-medium text-ink underline-offset-2 hover:underline"
          >
            Edit listing
          </Link>
        ) : (
          <span
            title="Edit listing requires the collection coin link"
            className="text-center text-sm font-medium text-ink opacity-50"
          >
            Edit listing
          </span>
        )}
      </div>

      {error && <IdentifyToast title={errorTitle} body={error} onClose={() => setError(null)} />}
    </>
  );
}
