"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { IdentifyToast } from "@/components/identify/IdentifyToast";
import { useModalDialog } from "@/components/ui/useModalDialog";
import type { ListingDetails } from "@/lib/api/coinzy";
import { CollectionSellDrawer } from "@/components/collection/CollectionSellDrawer";
import { buildListingUpdate, type buildSellPayload } from "@/lib/marketplace/sellForm";

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
 * Edit → prefilled drawer and session PATCH to the owned listing.
 */
export function OwnerListingPanel({
  listing,
  listingId,
  coinId,
  variant = "card",
}: {
  listing: ListingDetails;
  listingId: string;
  /** Private collection coin id for navigation after removal. */
  coinId?: string | null;
  variant?: "card" | "rail";
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<"sold" | "remove" | "edit" | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorTitle, setErrorTitle] = useState("Could not update listing");
  const [soldWarning, setSoldWarning] = useState<string | null>(null);
  const [soldOpen, setSoldOpen] = useState(false);
  const setSoldDialogOpen = useCallback((open: boolean) => {
    if (busy !== "sold") setSoldOpen(open);
  }, [busy]);
  const soldDialogRef = useModalDialog(soldOpen, setSoldDialogOpen);
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
    try {
    const res = await fetch(`/api/marketplace/markSold/${encodeURIComponent(listingId)}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const json = (await res.json()) as { error?: boolean; reason?: string; warning?: string };
    if (!res.ok || json.error) {
      setErrorTitle("Could not mark as sold");
      setError(json.reason ?? "Could not mark this listing as sold. Please try again.");
      return;
    }
    if (json.warning) { setSoldWarning(json.warning); setSoldOpen(false); return; }
    setSoldOpen(false);
    afterGone();
    } catch {
      setErrorTitle("Could not mark as sold");
      setError("Could not mark this listing as sold. Please try again.");
    } finally { setBusy(null); }
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

  const update = async (payload: ReturnType<typeof buildSellPayload>) => {
    if (busy) return;
    const changes = buildListingUpdate(payload, listing);
    if (!Object.keys(changes).length) { setEditOpen(false); return; }
    setBusy("edit"); setError(null);
    try {
      const response = await fetch(`/api/marketplace/listing/${encodeURIComponent(listingId)}`, { method: "PATCH", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(changes) });
      const result = await response.json() as { error?: boolean; reason?: string };
      if (!response.ok || result.error) throw new Error(result.reason || "Could not update listing.");
      setEditOpen(false); router.refresh();
    } catch (error) { setErrorTitle("Could not update listing"); setError(error instanceof Error ? error.message : "Could not update listing."); }
    finally { setBusy(null); }
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

        {soldWarning && <div role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{soldWarning} <Link href="/marketplace/my-listings" className="underline">Back to your listings</Link></div>}
        <button
          type="button"
          disabled={busy !== null || !!soldWarning}
          onClick={() => { setError(null); setSoldOpen(true); }}
          className="flex h-10 w-full items-center justify-center rounded-[10px] bg-primary-500 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
        >
          {busy === "sold" ? "Marking sold…" : "Mark as sold"}
        </button>
        <button
          type="button"
          disabled={busy !== null || !!soldWarning}
          onClick={remove}
          className="flex h-10 w-full items-center justify-center rounded-[10px] border border-[#e5e5e5] bg-white text-sm font-medium text-ink hover:bg-black/[0.02] disabled:opacity-60"
        >
          {busy === "remove" ? "Removing…" : "Remove from Marketplace"}
        </button>
        <button type="button" onClick={() => setEditOpen(true)} disabled={busy !== null || !!soldWarning} className="text-center text-sm font-medium text-ink underline-offset-2 hover:underline disabled:opacity-50">Edit listing</button>
      </div>

      <dialog ref={soldDialogRef} aria-labelledby="mark-sold-title" aria-describedby="mark-sold-description" onClose={() => setSoldDialogOpen(false)} onCancel={(event) => { if (busy === "sold") event.preventDefault(); }} onClick={(event) => { if (event.target === event.currentTarget) setSoldDialogOpen(false); }} className="m-auto w-[380px] max-w-[calc(100%-32px)] overflow-hidden rounded-[14px] border-0 bg-white p-0 text-ink shadow-[0_0_0_1px_rgba(10,10,10,0.1)] backdrop:bg-black/55">
        <div className="flex h-[54px] items-center justify-between gap-3 px-4">
          <h2 id="mark-sold-title" className="text-base font-medium leading-[22px]">Mark as sold?</h2>
          <button type="button" aria-label="Close" disabled={busy === "sold"} onClick={() => setSoldDialogOpen(false)} className="flex size-5 items-center justify-center text-xl leading-none text-[#606062]">×</button>
        </div>
        <div className="px-4 pb-4">
          <p id="mark-sold-description" className="text-base leading-6 text-[#87878a]">Marking this coin as sold will remove it from the marketplace.</p>
          {error && <p role="alert" className="mt-2 text-xs text-red-700">{error}</p>}
        </div>
        <div className="flex min-h-16 items-center justify-end gap-3 border-t border-[#e5e5e5] bg-[#fafafa] px-4 py-4">
          <button type="button" disabled={busy === "sold"} onClick={() => setSoldDialogOpen(false)} className="h-8 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink disabled:opacity-50">Cancel</button>
          <button type="button" disabled={busy === "sold"} onClick={() => void markSold()} className="h-8 rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-sm font-medium text-ink disabled:opacity-50">{busy === "sold" ? "Marking sold…" : "Mark as sold"}</button>
        </div>
      </dialog>
      <CollectionSellDrawer open={editOpen} coinTitle={listing.title} sellerName={seller?.name ?? ""} defaultEmail={seller?.contactEmail ?? ""} filterOptions={{}} submitting={busy === "edit"} onClose={() => { if (!busy) setEditOpen(false); }} onSubmit={update} editListing={listing} />
      {error && !soldOpen && <IdentifyToast title={errorTitle} body={error} onClose={() => setError(null)} />}
    </>
  );
}
